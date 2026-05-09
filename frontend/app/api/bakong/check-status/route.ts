import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { md5 } = await request.json()
    const token = process.env.BAKONG_TOKEN || process.env.NEXT_PUBLIC_BAKONG_TOKEN
    
    // We default to production as per user env
    const baseUrl = "https://api-bakong.nbc.gov.kh"

    if (!token) {
      return NextResponse.json({ error: "Bakong Token missing on server" }, { status: 500 })
    }

    const response = await fetch(`${baseUrl}/v1/check_transaction_by_md5`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
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
