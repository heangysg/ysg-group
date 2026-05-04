"use client"

import { useEffect, useState } from "react"

export default function DebugPage() {
  const [envStatus, setEnvStatus] = useState<any>({})
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    // Check if environment variables are loaded
    setEnvStatus({
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
    })

    async function testConnection() {
      try {
        const { createClient } = await import("../../lib/supabase/client")
        const supabase = createClient()
        
        // Try to get the schema info
        const { data, error } = await supabase
          .from("Product")
          .select("*")
          .limit(1)
        
        setTestResult({
          success: !error,
          error: error ? { message: error.message, details: error.details, hint: error.hint } : null,
          data: data,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL
        })
      } catch (err: any) {
        setTestResult({
          success: false,
          error: { message: err.message, stack: err.stack },
          data: null
        })
      }
    }
    
    testConnection()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase Debug Information</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
        <pre className="text-sm">{JSON.stringify(envStatus, null, 2)}</pre>
      </div>

      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Connection Test Result</h2>
        {testResult ? (
          <pre className="text-sm overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
        ) : (
          <p>Testing...</p>
        )}
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg">
        <h2 className="font-semibold mb-2">Next Steps:</h2>
        <ol className="list-decimal ml-4 space-y-1">
          <li>Make sure your .env.local file exists in the project root</li>
          <li>Verify it has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>Restart the dev server after changing .env.local</li>
          <li>Check that your Supabase project has the "Product" table</li>
        </ol>
      </div>
    </div>
  )
}
