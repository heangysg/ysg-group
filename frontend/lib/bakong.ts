// @ts-expect-error missing type definitions for bakong-khqr
import { BakongKHQR, MerchantInfo } from 'bakong-khqr';

export const generateBakongQR = (amount: number, orderId: string, expiresAtTimestamp?: number) => {
  const merchantInfo = new MerchantInfo();
  
  // Use environment variables for security
  merchantInfo.bakongAccountID = process.env.NEXT_PUBLIC_BAKONG_ACCOUNT_ID || "";
  merchantInfo.merchantName = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_NAME || "YSG";
  merchantInfo.merchantCity = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_CITY || "Phnom Penh";
  merchantInfo.merchantID = "123456"; // Optional
  merchantInfo.acquiringBank = "YSG Machinery";
  merchantInfo.currency = 840; // USD numeric code
  merchantInfo.amount = amount;
  merchantInfo.billNumber = orderId.slice(0, 20); // Bakong limit
  merchantInfo.storeLabel = process.env.NEXT_PUBLIC_BAKONG_STORE_LABEL || "SITE-D";
  merchantInfo.terminalLabel = process.env.NEXT_PUBLIC_BAKONG_TERMINAL_LABEL || "WEB-D";
  
  // Deterministic expiration or default to 5 mins from now
  if (expiresAtTimestamp) {
    (merchantInfo as any).expirationTimestamp = expiresAtTimestamp;
  } else {
    (merchantInfo as any).expirationTimestamp = Date.now() + (5 * 60 * 1000);
  }

  if (!merchantInfo.bakongAccountID) {
    console.error("Bakong QR Generation Failed: Bakong Account ID is missing in .env");
    return null;
  }

  const khqr = new BakongKHQR();
  const response = khqr.generateMerchant(merchantInfo);
  
  if (response.status.code === 0) {
    return {
      qrString: response.data.qr,
      md5: response.data.md5
    };
  } else {
    console.error("Bakong QR Generation Failed:", response.status.message);
    return null;
  }
};

/**
 * Real-time transaction status checker using Bakong API
 * @param md5 The MD5 hash of the generated KHQR
 * @returns boolean indicating if payment was successful
 */
export const checkBakongTransaction = async (md5: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/bakong/check-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ md5 })
    });

    const result = await response.json();
    
    // responseCode 0 means transaction found and successful
    return result.responseCode === 0;
  } catch (error) {
    console.error("Bakong Status Check Error:", error);
    return false;
  }
};
