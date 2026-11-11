import { Router, Request, Response } from 'express';
// @ts-expect-error missing type definitions for bakong-khqr
import { BakongKHQR, MerchantInfo } from 'bakong-khqr';
import { getPgClient } from '../lib/db';
import { sendTelegramNotification } from '../services/telegram';
import rateLimit from 'express-rate-limit';

const router = Router();

const CUTLUY_API_BASE = 'https://cutluy.com/v1/payments';

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
      const items = Array.isArray(order.items) ? order.items : [];
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
      sendTelegramNotification(
        `✅ *ទូទាត់ប្រាក់ជោគជ័យ (PAYMENT PAID)*\n\n*Order ID:* \`${order.id}\`\n*Customer:* ${order.customerName}\n*Phone:* ${order.customerPhone}\n*Amount:* $${total}`
      ).catch(() => {});
    }
  } catch (err) {
    console.error("Failed to update order status:", err);
  } finally {
    await pgClient.release();
  }
}

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, expiresAtTimestamp } = req.body;

    if (!orderId) {
      res.status(400).json({ error: "orderId is required to generate payment QR" });
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

    // 1. CutLuy Gateway Mode (Bypasses NBC foreign-IP geo-blocking on cloud hosts like Render)
    const cutluyKey = process.env.CUTLUY_API_KEY?.trim();
    if (cutluyKey && process.env.BAKONG_MOCK !== 'true') {
      const cutluyRes = await fetch(CUTLUY_API_BASE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cutluyKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: secureAmount,
          currency: 'USD',
          reference_id: String(orderId)
        })
      });

      const cutluyData: any = await cutluyRes.json();

      if (!cutluyRes.ok || !cutluyData?.qr_string || !cutluyData?.id) {
        console.error("CutLuy QR Generation Failed:", cutluyRes.status, cutluyData);
        res.status(cutluyRes.status >= 400 ? cutluyRes.status : 502).json({
          error: cutluyData?.message || cutluyData?.error || "Failed to generate CutLuy KHQR"
        });
        return;
      }

      const saveClient = await getPgClient();
      try {
        // Store CutLuy payment ID in bakongMd5 so /check-status can poll CutLuy directly
        await saveClient.query(`UPDATE "Order" SET "bakongMd5" = $1 WHERE id = $2`, [cutluyData.id, orderId]);
      } catch (err) {
        console.error("Failed to save CutLuy payment ID to order:", err);
      } finally {
        await saveClient.release();
      }

      res.json({
        qrString: cutluyData.qr_string,
        md5: cutluyData.id,
        checkoutUrl: cutluyData.checkout_url
      });
      return;
    }

    // 2. Direct NBC Bakong KHQR Fallback (Local / Mock / Non-CutLuy)
    const merchantInfo = new MerchantInfo();
    merchantInfo.bakongAccountID = process.env.NEXT_PUBLIC_BAKONG_ACCOUNT_ID || process.env.BAKONG_ACCOUNT_ID || "";
    merchantInfo.merchantName = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_NAME || process.env.BAKONG_MERCHANT_NAME || "YSG";
    merchantInfo.merchantCity = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_CITY || process.env.BAKONG_MERCHANT_CITY || "Phnom Penh";
    merchantInfo.merchantID = "123456";
    merchantInfo.acquiringBank = "YSG Machinery";
    merchantInfo.currency = 840;
    merchantInfo.amount = secureAmount;
    merchantInfo.billNumber = orderId.slice(0, 20);
    merchantInfo.storeLabel = process.env.NEXT_PUBLIC_BAKONG_STORE_LABEL || process.env.BAKONG_STORE_LABEL || "SITE-D";
    merchantInfo.terminalLabel = process.env.NEXT_PUBLIC_BAKONG_TERMINAL_LABEL || process.env.BAKONG_TERMINAL_LABEL || "WEB-D";
    merchantInfo.expirationTimestamp = expiresAtTimestamp || (Date.now() + 5 * 60 * 1000);

    if (!merchantInfo.bakongAccountID) {
      console.error("Bakong QR Generation Failed: Bakong Account ID is missing in .env");
      res.status(500).json({ error: "Configuration Error: Missing Account ID" });
      return;
    }

    const khqr = new BakongKHQR();
    const response = khqr.generateMerchant(merchantInfo);

    if (response.status.code === 0) {
      const saveClient = await getPgClient();
      try {
        await saveClient.query(`UPDATE "Order" SET "bakongMd5" = $1 WHERE id = $2`, [response.data.md5, orderId]);
      } catch (err) {
        console.error("Failed to save MD5 to order:", err);
      } finally {
        await saveClient.release();
      }

      res.json({
        qrString: response.data.qr,
        md5: response.data.md5
      });
      return;
    }

    console.error("Bakong QR Generation Failed:", response.status.message);
    res.status(400).json({ error: response.status.message });
    return;
  } catch (error) {
    console.error("Server-side Bakong Generate Error:", error);
    res.status(500).json({ error: "Failed to generate QR" });
    return;
  }
});

// In-memory short-lived status cache to prevent redundant API hits
const statusCache = new Map<string, { result: any; timestamp: number }>();

router.post('/check-status', pollingLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { md5, orderId } = req.body;
    let savedPaymentRef: string | undefined;

    // 1. Check local Database first (instant return if already paid)
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

    // 2. Short-lived cache (3.5 seconds TTL)
    const cacheKey = md5 || savedPaymentRef;
    if (cacheKey && statusCache.has(cacheKey)) {
      const cached = statusCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 3500) {
        res.json(cached.result);
        return;
      }
    }

    // 3. Mock Simulation Mode
    if (process.env.BAKONG_MOCK === "true") {
      console.log("Bakong Mock Mode: Simulating successful payment for ref:", cacheKey);
      await new Promise(resolve => setTimeout(resolve, 800));
      if (orderId) await markOrderAsPaid(orderId);
      res.json({ responseCode: 0, responseMessage: "Success", data: { status: "SUCCESS" } });
      return;
    }

    // 4. CutLuy Gateway Mode
    const cutluyKey = process.env.CUTLUY_API_KEY?.trim();
    if (cutluyKey) {
      const paymentId = md5 || savedPaymentRef;
      if (!paymentId) {
        res.status(400).json({ error: "CutLuy payment ID is required" });
        return;
      }

      const cutluyRes = await fetch(`${CUTLUY_API_BASE}/${encodeURIComponent(paymentId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cutluyKey}`
        }
      });

      const cutluyData: any = await cutluyRes.json();
      console.log(`[CutLuy Check] Order: ${orderId} | Payment: ${paymentId} | Status: ${cutluyData?.status}`);

      const isPaid = cutluyRes.ok && cutluyData?.status === 'paid';
      const formattedResult = isPaid
        ? { responseCode: 0, responseMessage: "Success", data: { status: "SUCCESS", cutluy: cutluyData } }
        : { responseCode: 1, responseMessage: cutluyData?.status || "Pending", data: { status: cutluyData?.status || "PENDING" } };

      if (isPaid && orderId) {
        await markOrderAsPaid(orderId);
      }

      statusCache.set(paymentId, { result: formattedResult, timestamp: Date.now() });
      res.json(formattedResult);
      return;
    }

    // 5. Direct NBC Bakong Open API Fallback
    const token = process.env.BAKONG_TOKEN;
    if (!token) {
      res.status(500).json({ error: "Bakong Token missing on server" });
      return;
    }

    const isSandbox = (process.env.BAKONG_ACCOUNT_ID || '').includes('@bkrt') || process.env.BAKONG_ENV === 'testnet';
    const primaryUrl = isSandbox
      ? 'https://api-bakong-sandbox.nbc.gov.kh/v1/check_transaction_by_md5'
      : 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5';

    let result: any = null;
    try {
      const response = await fetch(primaryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ md5 })
      });
      result = await response.json();
    } catch (err) {
      console.warn(`[Bakong Check] Primary API (${primaryUrl}) failed:`, err instanceof Error ? err.message : 'Unknown error');
      result = { responseCode: 1, responseMessage: "Primary API error" };
    }

    // Dual-gateway verification fallback
    if (result?.responseCode !== 0 && result?.errorCode !== 17) {
      try {
        const secondaryUrl = isSandbox
          ? 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5'
          : 'https://api-bakong-sandbox.nbc.gov.kh/v1/check_transaction_by_md5';
        const secRes = await fetch(secondaryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ md5 })
        });
        const secResult = await secRes.json();
        if (secResult && secResult.responseCode === 0) {
          result = secResult;
        }
      } catch {}
    }

    console.log(`[Bakong Check] Order: ${orderId} | MD5: ${md5} | ResponseCode: ${result?.responseCode} | Msg: ${result?.responseMessage}`);

    if (result && result.responseCode === 0 && orderId) {
      await markOrderAsPaid(orderId);
    }

    if (md5 && result) {
      statusCache.set(md5, { result, timestamp: Date.now() });
    }

    res.json(result);
    return;
  } catch (error) {
    console.error("Server-side Bakong Check Error:", error);
    res.status(500).json({ error: "Failed to check transaction" });
    return;
  }
});

export default router;
