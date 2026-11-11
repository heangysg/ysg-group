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
    
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.qrString) {
      return { error: data?.error || `Failed to generate QR (${response.status})` };
    }
    return data;
  } catch (err: any) {
    return { error: err?.message || "Network error generating QR" };
  }
};

/**
 * Real-time transaction status checker using Bakong API
 * @param md5 The MD5 hash of the generated KHQR
 * @returns boolean indicating if payment was successful
 */
export interface BakongCheckResult {
  paid: boolean;
  error?: string;
  status?: string;
}

export const checkBakongTransactionDetailed = async (
  md5: string,
  orderId: string
): Promise<BakongCheckResult> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/bakong/check-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ md5, orderId })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        paid: false,
        error: payload?.error || payload?.message || `Verification error (HTTP ${response.status})`
      };
    }

    return {
      paid: payload?.responseCode === 0,
      status: payload?.data?.status || payload?.responseMessage
    };
  } catch (err) {
    return {
      paid: false,
      error: err instanceof Error ? err.message : "Network error while checking payment"
    };
  }
};

export const checkBakongTransaction = async (md5: string, orderId: string): Promise<boolean> => {
  const result = await checkBakongTransactionDetailed(md5, orderId);
  return result.paid;
};
