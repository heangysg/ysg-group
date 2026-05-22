import { createClient } from "../../../lib/supabase/client"
import ProductDetailClient from "../../../components/ProductDetailClient"
import type { Metadata } from "next"
import { Suspense } from "react"
import PublicLayout from "../../../components/PublicLayout"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = createClient()
  
  const { data: product } = await supabase
    .from("Product")
    .select("name, shortDescription, images")
    .eq("slug", slug)
    .single()

  if (product) {
    return {
      title: `${product.name} | YSG Machinery`,
      description: product.shortDescription,
      openGraph: {
        title: product.name,
        description: product.shortDescription,
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      },
    }
  }

  return { title: "Product Not Found | YSG Machinery" }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()
  
  const { data: product } = await supabase
    .from("Product")
    .select(`
      *,
      Category (
        id,
        name,
        nameKhmer
      )
    `)
    .eq("slug", slug)
    .single()

  if (product) {
    return <ProductDetailClient initialProduct={product} />
  }

  // If not found, show 404
  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-6">🏗️</div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8">We couldn't find the product you're looking for.</p>
        <a href="/products" className="bg-primary text-white px-8 py-4 rounded-2xl font-semibold">
          Back to Products
        </a>
      </div>
    </PublicLayout>
  )
}
