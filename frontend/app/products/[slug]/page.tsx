import ProductDetailClient from "../../../components/ProductDetailClient"
import type { Metadata } from "next"
import { Suspense } from "react"
import PublicLayout from "../../../components/PublicLayout"
import ProductNotFound from "../../../components/ProductNotFound"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const res = await fetch(`${API_URL}/api/public/products/${slug}`)
  
  if (res.ok) {
    const { data: product } = await res.json()

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
  }

  return { title: "Product Not Found | YSG Machinery" }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const res = await fetch(`${API_URL}/api/public/products/${slug}`)
  
  if (res.ok) {
    const { data: product } = await res.json()
    if (product) {
      return <ProductDetailClient initialProduct={product} />
    }
  }

  return (
    <PublicLayout>
      <ProductNotFound />
    </PublicLayout>
  )
}
