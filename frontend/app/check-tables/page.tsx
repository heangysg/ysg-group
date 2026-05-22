"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"

export default function CheckTables() {
  const [tables, setTables] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      
      // Try different possible table names from your schema
      const tableNames = ["Product", "products", "product", "Products", "Category", "categories", "Inquiry", "inquiries", "ContactMessage", "contact_messages"]
      const results: any = {}
      
      for (const name of tableNames) {
        const { data, error } = await supabase.from(name).select("*").limit(1)
        results[name] = error ? `? ${error.message}` : `? Found ${data?.length || 0} rows`
      }
      
      setTables(results)
      setLoading(false)
    }
    
    check()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-medium mb-4">Checking Database Tables</h1>
      <div className="space-y-2">
        {Object.entries(tables).map(([name, status]) => (
          <div key={name} className="p-2 border rounded">
            <strong>{name}:</strong> {status as string}
          </div>
        ))}
      </div>
    </div>
  )
}
