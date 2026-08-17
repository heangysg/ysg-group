import { Router, Request, Response } from 'express';
// @ts-expect-error missing type definitions for bakong-khqr
import { BakongKHQR, MerchantInfo } from 'bakong-khqr';
import { getPgClient } from '../lib/db';
import rateLimit from 'express-rate-limit';

const router = Router();

const pollingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: "Polling limit reached. Please refresh the page." }
});

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
      const { rows } = await pgClient.query(`SELECT id, "totalAmount", status FROM "Order" WHERE UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1`, [orderId]);
      if (rows.length === 0) {
        res.status(404).json({ error: "Order not found" });
        return;
      }
      
      if (rows[0].status !== 'pending') {
        res.status(400).json({ error: "Cannot generate payment QR for an order that is already paid or cancelled" });
        return;
      }
      
      secureAmount = rows[0].totalAmount;
    } finally {
      await pgClient.release();
    }

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
    
    if (expiresAtTimestamp) {
      merchantInfo.expirationTimestamp = expiresAtTimestamp;
    } else {
      merchantInfo.expirationTimestamp = Date.now() + (5 * 60 * 1000);
    }

    if (!merchantInfo.bakongAccountID) {
      console.error("Bakong QR Generation Failed: Bakong Account ID is missing in .env");
      res.status(500).json({ error: "Configuration Error: Missing Account ID" });
      return;
    }

    const khqr = new BakongKHQR();
    const response = khqr.generateMerchant(merchantInfo);
    
    if (response.status.code === 0) {
      if (orderId) {
        const pgClient = await getPgClient();
        try {
          await pgClient.query(`UPDATE "Order" SET "bakongMd5" = $1 WHERE id = $2`, [response.data.md5, orderId]);
        } catch (err) {
          console.error("Failed to save MD5 to order:", err);
        } finally {
          await pgClient.release();
        }
      }

      res.json({
        qrString: response.data.qr,
        md5: response.data.md5
      });
      return;
    } else {
      console.error("Bakong QR Generation Failed:", response.status.message);
      res.status(400).json({ error: response.status.message });
      return;
    }
  } catch (error) {
    console.error("Server-side Bakong Generate Error:", error);
    res.status(500).json({ error: "Failed to generate QR" });
    return;
  }
});

// In-memory short-lived status cache to prevent redundant NBC API hits
const statusCache = new Map<string, { result: any; timestamp: number }>();

router.post('/check-status', pollingLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { md5, orderId } = req.body;
    
    // 1. Check local Database first (saves API quota and instant return if already paid)
    if (orderId) {
      const pgClient = await getPgClient();
      try {
        const { rows } = await pgClient.query(
          `SELECT id, status, "bakongMd5" FROM "Order" WHERE UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1`,
          [orderId]
        );
        if (rows.length > 0 && rows[0].status === 'paid') {
          res.json({ responseCode: 0, responseMessage: "Success", data: { status: "SUCCESS" } });
          return;
        }
      } catch (dbErr) {
        console.error("DB pre-check error:", dbErr);
      } finally {
        pgClient.release();
      }
    }

    // 2. Check in-memory short-lived cache (3.5 seconds TTL)
    if (md5 && statusCache.has(md5)) {
      const cached = statusCache.get(md5)!;
      if (Date.now() - cached.timestamp < 3500) {
        res.json(cached.result);
        return;
      }
    }

    if (process.env.BAKONG_MOCK === "true") {
      console.log("Bakong Mock Mode: Simulating successful payment for MD5:", md5);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (orderId) {
        const pgClient = await getPgClient();
        try {
          await pgClient.query(`UPDATE "Order" SET status = 'paid' WHERE UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1`, [orderId]);
        } finally {
          await pgClient.release();
        }
      }

      res.json({ responseCode: 0, responseMessage: "Success", data: { status: "SUCCESS" } });
      return;
    }

    const token = process.env.BAKONG_TOKEN;

    if (!token) {
      res.status(500).json({ error: "Bakong Token missing on server" });
      return;
    }

    const isSandbox = (process.env.BAKONG_ACCOUNT_ID || '').includes('@bkrt') || process.env.BAKONG_ENV === 'testnet';
    const primaryUrl = isSandbox 
      ? 'https://api-bakong-sandbox.nbc.gov.kh/v1/check_transaction_by_md5'
      : 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5';

    let response;
    let result: any = null;
    
    try {
      response = await fetch(primaryUrl, {
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
      const pgClient = await getPgClient();
      try {
        const { rows } = await pgClient.query(`SELECT id, "bakongMd5" FROM "Order" WHERE UPPER(TRIM(id)) = UPPER(TRIM($1)) OR id = $1`, [orderId]);
        
        if (rows.length > 0) {
          const actualId = rows[0].id;
          await pgClient.query(`UPDATE "Order" SET status = 'paid' WHERE id = $1`, [actualId]);
          console.log(`✅ Order ${actualId} marked as PAID via Bakong MD5 check!`);
        }
      } catch (err) {
        console.error("Failed to update order status:", err);
      } finally {
        await pgClient.release();
      }
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
