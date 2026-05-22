import { createClient } from "../../../lib/supabase/client"
import ProductsList from "../../../components/ProductsList"
import type { Metadata } from "next"
import { Suspense } from "react"
import PublicLayout from "../../../components/PublicLayout"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  
  const { data: category } = await supabase
    .from("Category")
    .select("name, description")
    .eq("slug", slug)
    .single()

  if (category) {
    return {
      title: `${category.name} | YSG Machinery`,
      description: category.description || `Browse our collection of ${category.name}`,
    }
  }

  return { title: "Category Not Found | YSG Machinery" }
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()
  
  const { data: category } = await supabase
    .from("Category")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (!category) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-6xl mb-6">🏗️</div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-500 mb-8">We couldn't find the category you're looking for.</p>
          <a href="/categories" className="bg-primary text-white px-8 py-4 rounded-2xl font-semibold">
            Back to Categories
          </a>
        </div>
      </PublicLayout>
    )
  }

  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    }>
      <ProductsList initialCategory={slug} />
    </Suspense>
  )
}
