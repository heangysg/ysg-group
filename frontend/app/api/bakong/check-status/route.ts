import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { md5 } = await request.json()
    const token = process.env.BAKONG_TOKEN || process.env.NEXT_PUBLIC_BAKONG_TOKEN
    const relayToken = process.env.BAKONG_RELAY_TOKEN

    if (!relayToken) {
      return NextResponse.json({ error: "Bakong Relay Token missing on server" }, { status: 500 })
    }

    const response = await fetch("https://api.bakongrelay.com/v1/check_transaction_by_md5", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${relayToken}`
      },
      body: JSON.stringify({ md5 })
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Server-side Bakong Check Error:", error)
    return NextResponse.json({ error: "Failed to check transaction" }, { status: 500 })
  }
}
