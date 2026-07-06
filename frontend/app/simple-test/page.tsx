"use client"

import { useEffect, useState } from "react"

export default function SimpleTest() {
  const [result, setResult] = useState("Loading...")

  useEffect(() => {
    async function test() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        setResult(`
          URL exists: ${!!url}
          URL value: ${url}
          Key exists: ${!!key}
          Key starts with: ${key?.substring(0, 20)}...
        `)
      } catch (err: any) {
        setResult(`Error: ${err.message}`)
      }
    }
    
    test()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium mb-4">Simple Environment Test</h1>
      <pre className="p-4 bg-gray-100 rounded-lg whitespace-pre-wrap">
        {result}
      </pre>
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="font-medium">Your URL should NOT have /rest/v1/ at the end</p>
        <p className="text-sm mt-2">Correct: https://sbxuheaelotoqcdtzrkl.supabase.co</p>
        <p className="text-sm text-red-600">Wrong: https://sbxuheaelotoqcdtzrkl.supabase.co/rest/v1/</p>
      </div>
    </div>
  )
}
