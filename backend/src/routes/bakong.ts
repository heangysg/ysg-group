import { Router, Request, Response } from 'express';
// @ts-expect-error missing type definitions for bakong-khqr
import { BakongKHQR, MerchantInfo } from 'bakong-khqr';

const router = Router();

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, orderId, expiresAtTimestamp } = req.body;

    const merchantInfo = new MerchantInfo();
    
    merchantInfo.bakongAccountID = process.env.NEXT_PUBLIC_BAKONG_ACCOUNT_ID || process.env.BAKONG_ACCOUNT_ID || "";
    merchantInfo.merchantName = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_NAME || process.env.BAKONG_MERCHANT_NAME || "YSG";
    merchantInfo.merchantCity = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_CITY || process.env.BAKONG_MERCHANT_CITY || "Phnom Penh";
    merchantInfo.merchantID = "123456"; 
    merchantInfo.acquiringBank = "YSG Machinery";
    merchantInfo.currency = 840; 
    merchantInfo.amount = amount;
    merchantInfo.billNumber = orderId ? orderId.slice(0, 20) : "ORDER"; 
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

router.post('/check-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { md5 } = req.body;
    const relayToken = process.env.BAKONG_RELAY_TOKEN;

    if (!relayToken) {
      res.status(500).json({ error: "Bakong Relay Token missing on server" });
      return;
    }

    const response = await fetch("https://api.bakongrelay.com/v1/check_transaction_by_md5", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${relayToken}`
      },
      body: JSON.stringify({ md5 })
    });

    const result = await response.json();
    res.json(result);
    return;
  } catch (error) {
    console.error("Server-side Bakong Check Error:", error);
    res.status(500).json({ error: "Failed to check transaction" });
    return;
  }
});

export default router;
