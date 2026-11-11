import { Router, Request, Response } from 'express';
import { getPgClient } from '../lib/db';
import { sendTelegramNotification } from '../services/telegram';
import rateLimit from 'express-rate-limit';

const router = Router();

const CUTLUY_API_BASE = 'https://cutluy.com/v1/payments';
const PAID_STATUS_VALUES = new Set(['paid', 'completed', 'succeeded', 'success']);

/**
 * Extracts payment status and paid boolean across flat or nested CutLuy API/webhook payloads.
 */
function parseCutluyPaymentStatus(payload: any): { rawStatus: string; isPaid: boolean } {
  const rawStatus = String(
    payload?.status ??
    payload?.data?.status ??
    payload?.payment?.status ??
    payload?.data?.payment?.status ??
    ''
  ).trim();
  const normalized = rawStatus.toLowerCase();
  const explicitPaidFlag =
    payload?.paid === true ||
    payload?.data?.paid === true ||
    payload?.payment?.paid === true ||
    payload?.data?.payment?.paid === true;

  return {
    rawStatus,
    isPaid: explicitPaidFlag || PAID_STATUS_VALUES.has(normalized),
  };
}

async function parseJsonSafe(res: globalThis.Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
}

/**
 * Verifies a CutLuy payment by paymentId, with fallback lookup by merchant order reference_id.
 */
async function checkCutluyPayment(
  cutluyKey: string,
  paymentId?: string,
  orderId?: string
): Promise<{
  ok: boolean;
  httpStatus: number;
  isPaid: boolean;
  rawStatus: string;
  data: any;
}> {
  let lastHttpStatus = 200;
  let lastData: any = {};
  let lastRawStatus = '';
  let lastOk = false;

  if (paymentId) {
    const res = await fetch(`${CUTLUY_API_BASE}/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${cutluyKey}` },
    });
    lastHttpStatus = res.status;
    lastOk = res.ok;
    lastData = await parseJsonSafe(res);
    const parsed = parseCutluyPaymentStatus(lastData);
    lastRawStatus = parsed.rawStatus;

    if (res.ok && parsed.isPaid) {
      return { ok: true, httpStatus: res.status, isPaid: true, rawStatus: parsed.rawStatus, data: lastData };
    }
  }

  if (orderId) {
    try {
      const listRes = await fetch(
        `${CUTLUY_API_BASE}?reference_id=${encodeURIComponent(orderId)}`,
        { method: 'GET', headers: { Authorization: `Bearer ${cutluyKey}` } }
      );
      if (listRes.ok) {
        const listData = await parseJsonSafe(listRes);
        const candidates = Array.isArray(listData)
          ? listData
          : Array.isArray(listData?.data)
            ? listData.data
            : Array.isArray(listData?.payments)
              ? listData.payments
              : Array.isArray(listData?.data?.payments)
                ? listData.data.payments
                : [listData?.payment, listData?.data?.payment, listData].filter(Boolean);

        for (const candidate of candidates) {
          const candidateRef = String(candidate?.reference_id ?? candidate?.referenceId ?? '').trim();
          if (candidateRef && candidateRef.toUpperCase() !== orderId.trim().toUpperCase()) {
            continue;
          }
          const parsed = parseCutluyPaymentStatus(candidate);
          if (parsed.isPaid) {
            return { ok: true, httpStatus: listRes.status, isPaid: true, rawStatus: parsed.rawStatus, data: candidate };
          }
        }
      }
    } catch (err) {
      console.warn(`[CutLuy Lookup Fallback] Failed reference_id check for ${orderId}:`, err);
    }
  }

  return { ok: lastOk, httpStatus: lastHttpStatus, isPaid: false, rawStatus: lastRawStatus, data: lastData };
}

const pollingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: "Polling limit reached. Please refresh the page." }
});

/**
 * Marks an unpaid order as 'paid' in PostgreSQL and dispatches a Telegram confirmation
 * once (idempotent if the order was already marked paid).
 */
async function markOrderAsPaid(orderId: string): Promise<void> {
  const pgClient = await getPgClient();
  try {
    const { rows } = await pgClient.query(
      `UPDATE "Order"
       SET status = 'paid'
       WHERE (UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1)
         AND status <> 'paid'
       RETURNING id, "customerName", "customerPhone", "totalAmount", items`,
      [orderId]
    );

    if (rows.length > 0) {
      const order = rows[0];
      console.log(`✅ Order ${order.id} marked as PAID!`);

      // Deduct product stock atomically once payment is confirmed
      let parsedItems = order.items;
      if (typeof parsedItems === 'string') {
        try {
          parsedItems = JSON.parse(parsedItems);
        } catch {
          parsedItems = [];
        }
      }
      const items = Array.isArray(parsedItems) ? parsedItems : [];
      for (const item of items) {
        const qty = Math.max(1, parseInt(item?.quantity) || 1);
        const identifier = item?.id || item?.slug;
        if (!identifier) continue;
        try {
          await pgClient.query(
            'UPDATE "Product" SET stock = GREATEST(stock - $1, 0) WHERE id = $2 OR slug = $2',
            [qty, identifier]
          );
        } catch (stockErr) {
          console.error("Stock deduction failed for paid order item:", item, stockErr);
        }
      }

      const total = Number(order.totalAmount || 0).toFixed(2);
      const safeMd = (v: unknown) => String(v || '').replace(/[*_`[\]]/g, '');
      const itemsText = items
        .map((i: any) => `- ${safeMd(i?.name || 'Item')} (x${Math.max(1, parseInt(i?.quantity) || 1)}) - $${((Number(i?.price) || 0) * Math.max(1, parseInt(i?.quantity) || 1)).toFixed(2)}`)
        .join('\n');
      const itemsSection = itemsText ? `\n\n*Items:*\n${itemsText}` : '';
      sendTelegramNotification(
        `✅ *ទូទាត់ប្រាក់ជោគជ័យ (PAYMENT PAID)*\n\n*Order ID:* \`${order.id}\`\n*Customer:* ${safeMd(order.customerName)}\n*Phone:* ${safeMd(order.customerPhone)}\n*Payment:* Bakong (KHQR)\n*Total:* $${total}${itemsSection}`
      ).catch((err) => console.error("Telegram Payment Alert Error:", err));
    }
  } catch (err) {
    console.error("Failed to update order status:", err);
  } finally {
    await pgClient.release();
  }
}

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ error: "orderId is required to generate payment QR" });
      return;
    }

    const cutluyKey = process.env.CUTLUY_API_KEY?.trim();
    if (!cutluyKey) {
      console.error("CutLuy QR Generation Failed: CUTLUY_API_KEY is missing on server");
      res.status(500).json({ error: "Payment gateway is not configured on server (missing CUTLUY_API_KEY)" });
      return;
    }

    let secureAmount = 0;
    const pgClient = await getPgClient();
    try {
      const { rows } = await pgClient.query(
        `SELECT id, "totalAmount", status FROM "Order" WHERE UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1`,
        [orderId]
      );
      if (rows.length === 0) {
        res.status(404).json({ error: "Order not found" });
        return;
      }

      if (rows[0].status !== 'pending') {
        res.status(400).json({ error: "Cannot generate payment QR for an order that is already paid or cancelled" });
        return;
      }

      secureAmount = Number(rows[0].totalAmount);
    } finally {
      await pgClient.release();
    }

    if (!Number.isFinite(secureAmount) || secureAmount <= 0) {
      res.status(400).json({ error: "Invalid order amount" });
      return;
    }

    const cutluyRes = await fetch(CUTLUY_API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cutluyKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Number(secureAmount.toFixed(2)),
        currency: 'USD',
        reference_id: String(orderId)
      })
    });

    const cutluyData = await parseJsonSafe(cutluyRes);
    const paymentId = String(cutluyData?.id ?? cutluyData?.data?.id ?? '').trim();
    const qrString = String(cutluyData?.qr_string ?? cutluyData?.data?.qr_string ?? '').trim();
    const checkoutUrl = cutluyData?.checkout_url ?? cutluyData?.data?.checkout_url;

    if (!cutluyRes.ok || !qrString || !paymentId) {
      const cutluyErrorMsg =
        cutluyData?.message ||
        cutluyData?.error ||
        `CutLuy QR generation failed (HTTP ${cutluyRes.status})`;
      console.error("CutLuy QR Generation Failed:", cutluyRes.status, cutluyData);
      res.status(cutluyRes.status >= 400 ? cutluyRes.status : 502).json({ error: cutluyErrorMsg });
      return;
    }

    const saveClient = await getPgClient();
    try {
      await saveClient.query(`UPDATE "Order" SET "bakongMd5" = $1 WHERE id = $2`, [paymentId, orderId]);
    } catch (err) {
      console.error("Failed to save CutLuy payment ID to order:", err);
    } finally {
      await saveClient.release();
    }

    res.json({
      qrString,
      md5: paymentId,
      checkoutUrl
    });
  } catch (error) {
    console.error("Server-side CutLuy Generate Error:", error);
    res.status(500).json({ error: "Failed to generate CutLuy QR" });
  }
});

// In-memory short-lived status cache for confirmed paid responses
const statusCache = new Map<string, { result: any; timestamp: number }>();

router.post('/check-status', pollingLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { md5, orderId } = req.body;
    let savedPaymentRef: string | undefined;

    // 1. Check local Database first (instant return if webhook or earlier check already marked paid)
    if (orderId) {
      const pgClient = await getPgClient();
      try {
        const { rows } = await pgClient.query(
          `SELECT id, status, "bakongMd5" FROM "Order" WHERE UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1`,
          [orderId]
        );
        if (rows.length > 0) {
          savedPaymentRef = rows[0].bakongMd5;
          if (rows[0].status === 'paid') {
            res.json({ responseCode: 0, responseMessage: "Success", data: { status: "SUCCESS" } });
            return;
          }
        }
      } catch (dbErr) {
        console.error("DB pre-check error:", dbErr);
      } finally {
        await pgClient.release();
      }
    }

    // 2. Short-lived cache for confirmed SUCCESS responses only
    const cacheKey = md5 || savedPaymentRef;
    if (cacheKey && statusCache.has(cacheKey)) {
      const cached = statusCache.get(cacheKey)!;
      if (cached.result?.responseCode === 0 && Date.now() - cached.timestamp < 30000) {
        if (orderId) await markOrderAsPaid(orderId);
        res.json(cached.result);
        return;
      }
    }

    // 3. CutLuy Gateway Verification
    const cutluyKey = process.env.CUTLUY_API_KEY?.trim();
    if (!cutluyKey) {
      res.status(500).json({ error: "Payment gateway verification is not configured on server (missing CUTLUY_API_KEY)" });
      return;
    }

    const paymentId = String(md5 || savedPaymentRef || '').trim() || undefined;
    if (!paymentId && !orderId) {
      res.status(400).json({ error: "CutLuy payment ID or orderId is required" });
      return;
    }

    const cutluyCheck = await checkCutluyPayment(cutluyKey, paymentId, orderId);

    console.log(
      `[CutLuy Check] Order: ${orderId} | Payment: ${paymentId} | HTTP: ${cutluyCheck.httpStatus} | Paid: ${cutluyCheck.isPaid} | Status: ${cutluyCheck.rawStatus}`
    );

    if (cutluyCheck.isPaid) {
      const formattedResult = {
        responseCode: 0,
        responseMessage: "Success",
        data: { status: "SUCCESS", cutluy: cutluyCheck.data },
      };
      if (orderId) await markOrderAsPaid(orderId);
      if (paymentId) statusCache.set(paymentId, { result: formattedResult, timestamp: Date.now() });
      res.json(formattedResult);
      return;
    }

    if (!cutluyCheck.ok) {
      const errMsg =
        cutluyCheck.data?.message ||
        cutluyCheck.data?.error ||
        `CutLuy verification failed (HTTP ${cutluyCheck.httpStatus})`;
      res.status(cutluyCheck.httpStatus >= 400 ? cutluyCheck.httpStatus : 502).json({ error: errMsg });
      return;
    }

    res.json({
      responseCode: 1,
      responseMessage: cutluyCheck.rawStatus || "Pending",
      data: { status: cutluyCheck.rawStatus || "PENDING" },
    });
  } catch (error) {
    console.error("Server-side CutLuy Check Error:", error);
    res.status(500).json({ error: "Failed to check transaction" });
  }
});

/**
 * CutLuy Webhook Endpoint (`POST /api/bakong/webhook`)
 * Receives payment events (e.g. `payment.completed`) and authoritatively verifies
 * against CutLuy API before marking the order paid and firing Telegram alerts.
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const cutluyKey = process.env.CUTLUY_API_KEY?.trim();
    if (!cutluyKey) {
      res.status(503).json({ error: "CUTLUY_API_KEY not configured on server" });
      return;
    }

    const paymentObj = req.body?.data?.payment ?? req.body?.payment ?? req.body?.data ?? req.body ?? {};
    const paymentId = String(paymentObj?.id ?? req.body?.payment_id ?? '').trim();
    const referenceId = String(paymentObj?.reference_id ?? paymentObj?.referenceId ?? req.body?.reference_id ?? '').trim();

    if (!paymentId && !referenceId) {
      res.status(400).json({ error: "Missing payment id or reference_id in webhook payload" });
      return;
    }

    // Always verify authoritatively with CutLuy API before updating DB state
    const verified = await checkCutluyPayment(cutluyKey, paymentId || undefined, referenceId || undefined);
    const resolvedOrderId =
      referenceId ||
      String(
        verified.data?.reference_id ??
        verified.data?.data?.reference_id ??
        verified.data?.payment?.reference_id ??
        ''
      ).trim();

    console.log(
      `[CutLuy Webhook] Event: ${req.body?.type || req.body?.event || 'unknown'} | Payment: ${paymentId} | Order: ${resolvedOrderId} | VerifiedPaid: ${verified.isPaid}`
    );

    if (verified.isPaid && resolvedOrderId) {
      await markOrderAsPaid(resolvedOrderId);
      const cachedResult = {
        responseCode: 0,
        responseMessage: "Success",
        data: { status: "SUCCESS", cutluy: verified.data },
      };
      if (paymentId) {
        statusCache.set(paymentId, { result: cachedResult, timestamp: Date.now() });
      }
    }

    res.status(200).json({ received: true, verified: verified.isPaid, orderId: resolvedOrderId || null });
  } catch (error) {
    console.error("[CutLuy Webhook] Processing error:", error);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

export default router;
