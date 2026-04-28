"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../../lib/supabase/client"

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase
        .from("Category")
        .select("*")
        .eq("isActive", true)
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

  return (
    <main className="pb-20 px-4">
      <h1 className="text-3xl font-bold py-4">Categories</h1>
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat: any) => (
          <Link key={cat.id} href={`/products?category=${cat.slug}`}>
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <span className="text-4xl">{cat.icon || "??"}</span>
              <h3 className="font-semibold mt-2">{cat.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
