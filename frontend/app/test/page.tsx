"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"

export default function TestPage() {
  const [result, setResult] = useState("Testing...")
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    async function test() {
      try {
        const supabase = createClient()
        
        // First, check if we can connect at all
        const { data, error: testError } = await supabase
          .from("Product")
          .select("*")
          .limit(1)
        
        if (testError) {
          setResult(`Error: ${testError.message}`)
          setError(testError)
          console.error("Supabase error details:", testError)
        } else {
          setResult(`Success! Connected to Supabase. Found ${data?.length || 0} products.`)
          console.log("Data:", data)
        }
      } catch (err: any) {
        setResult(`Failed: ${err.message}`)
        setError(err)
      }
    }
    
    test()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium mb-4">Supabase Connection Test</h1>
      <div className={`p-4 rounded-lg ${result.includes("Success") ? "bg-green-100" : result.includes("Error") ? "bg-red-100" : "bg-yellow-100"}`}>
        <p className="font-medium">{result}</p>
      </div>
      {error && (
        <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto text-sm">
          {JSON.stringify(error, null, 2)}
        </pre>
      )}
      <div className="mt-4 text-sm text-gray-600">
        <p>Make sure your .env.local has:</p>
        <ul className="list-disc ml-4 mt-2">
          <li>NEXT_PUBLIC_SUPABASE_URL (your project URL)</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY (your anon public key)</li>
        </ul>
      </div>
    </div>
  )
}
