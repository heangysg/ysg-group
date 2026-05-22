"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"

export default function TestDB() {
  const [status, setStatus] = useState("Testing...")
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        
        const { data: products, error, count } = await supabase
          .from("Product")
          .select("*", { count: "exact" })
          .limit(5)
        
        if (error) {
          setStatus(`Error: ${error.message}`)
        } else {
          setStatus(`? Connected! Found ${count || products?.length || 0} products`)
          setData(products)
        }
      } catch (err: any) {
        setStatus(`? Connection failed: ${err.message}`)
      }
    }
    
    testConnection()
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-2xl font-medium mb-4">Database Connection Test</h1>
      <div className={`p-4 rounded-lg ${status.includes("?") ? "bg-green-100" : status.includes("?") ? "bg-red-100" : "bg-yellow-100"}`}>
        <p className="font-medium">{status}</p>
      </div>
      {data && (
        <pre className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  )
}
