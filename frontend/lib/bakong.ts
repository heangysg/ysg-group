export const generateBakongQR = async (amount: number, orderId: string, expiresAtTimestamp?: number) => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/bakong/generate`, {
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
export const checkBakongTransaction = async (md5: string, orderId: string): Promise<boolean> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/bakong/check-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ md5, orderId })
    });

    const result = await response.json();
    
    return result.responseCode === 0;
  } catch (error) {
    console.error("Bakong Status Check Error:", error);
    return false;
  }
};
