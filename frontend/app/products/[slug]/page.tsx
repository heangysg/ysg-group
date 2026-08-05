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
      const title = `${product.name} | YSG Machinery`
      const description = product.shortDescription || product.description || `Buy ${product.name} at YSG Machinery`
      const imageUrl = product.images?.[0] || product.thumbnail || null
      const images = imageUrl ? [{ url: imageUrl, width: 800, height: 600, alt: product.name }] : []

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: "article",
          images,
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images,
        }
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
