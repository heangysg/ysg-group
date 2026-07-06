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
      const { rows } = await pgClient.query(`SELECT "totalAmount", status FROM "Order" WHERE id = $1`, [orderId]);
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

router.post('/check-status', pollingLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { md5, orderId } = req.body;
    
    if (process.env.BAKONG_MOCK === "true") {
      console.log("Bakong Mock Mode: Simulating successful payment for MD5:", md5);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (orderId) {
        const pgClient = await getPgClient();
        try {
          await pgClient.query(`UPDATE "Order" SET status = 'paid' WHERE id = $1`, [orderId]);
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

    const response = await fetch("https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ md5 })
    });

    const result = await response.json();

    if (result.responseCode === 0 && orderId) {
      const pgClient = await getPgClient();
      try {
        const { rows } = await pgClient.query(`SELECT "bakongMd5" FROM "Order" WHERE id = $1`, [orderId]);
        
        if (rows.length === 0) {
          console.error("Order not found:", orderId);
          res.status(404).json({ error: "Order not found" });
          return;
        }

        const dbMd5 = rows[0].bakongMd5;
        
        if (!dbMd5) {
          console.error("Order has no generated MD5 hash:", orderId);
          res.status(400).json({ error: "Order payment not initialized" });
          return;
        }

        if (dbMd5 !== md5) {
          console.error(`🚨 Payment Spoofing Attempt! Order ${orderId} expected MD5 ${dbMd5} but received ${md5}`);
          res.status(403).json({ error: "Invalid payment hash for this order" });
          return;
        }

        await pgClient.query(`UPDATE "Order" SET status = 'paid' WHERE id = $1`, [orderId]);
      } catch (err) {
        console.error("Failed to update order status:", err);
      } finally {
        await pgClient.release();
      }
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
