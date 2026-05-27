import { NextResponse } from 'next/server'
// @ts-expect-error missing type definitions for bakong-khqr
import { BakongKHQR, MerchantInfo } from 'bakong-khqr'

export async function POST(request: Request) {
  try {
    const { amount, orderId, expiresAtTimestamp } = await request.json()

    const merchantInfo = new MerchantInfo()
    
    // Use environment variables for security
    merchantInfo.bakongAccountID = process.env.NEXT_PUBLIC_BAKONG_ACCOUNT_ID || process.env.BAKONG_ACCOUNT_ID || ""
    merchantInfo.merchantName = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_NAME || process.env.BAKONG_MERCHANT_NAME || "YSG"
    merchantInfo.merchantCity = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_CITY || process.env.BAKONG_MERCHANT_CITY || "Phnom Penh"
    merchantInfo.merchantID = "123456" // Optional
    merchantInfo.acquiringBank = "YSG Machinery"
    merchantInfo.currency = 840 // USD numeric code
    merchantInfo.amount = amount
    merchantInfo.billNumber = orderId.slice(0, 20) // Bakong limit
    merchantInfo.storeLabel = process.env.NEXT_PUBLIC_BAKONG_STORE_LABEL || process.env.BAKONG_STORE_LABEL || "SITE-D"
    merchantInfo.terminalLabel = process.env.NEXT_PUBLIC_BAKONG_TERMINAL_LABEL || process.env.BAKONG_TERMINAL_LABEL || "WEB-D"
    
    // Deterministic expiration
    if (expiresAtTimestamp) {
      merchantInfo.expirationTimestamp = expiresAtTimestamp
    } else {
      merchantInfo.expirationTimestamp = Date.now() + (5 * 60 * 1000)
    }

    if (!merchantInfo.bakongAccountID) {
      console.error("Bakong QR Generation Failed: Bakong Account ID is missing in .env")
      return NextResponse.json({ error: "Configuration Error: Missing Account ID" }, { status: 500 })
    }

    const khqr = new BakongKHQR()
    const response = khqr.generateMerchant(merchantInfo)
    
    if (response.status.code === 0) {
      return NextResponse.json({
        qrString: response.data.qr,
        md5: response.data.md5
      })
    } else {
      console.error("Bakong QR Generation Failed:", response.status.message)
      return NextResponse.json({ error: response.status.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Server-side Bakong Generate Error:", error)
    return NextResponse.json({ error: "Failed to generate QR" }, { status: 500 })
  }
}
