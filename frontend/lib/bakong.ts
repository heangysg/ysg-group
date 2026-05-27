export const generateBakongQR = async (amount: number, orderId: string, expiresAtTimestamp?: number) => {
  try {
    const response = await fetch("/api/bakong/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount, orderId, expiresAtTimestamp })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Bakong QR Generation Failed:", errorData.error);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Bakong QR Generation Error:", error);
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
