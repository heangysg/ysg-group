import ProductDetailClient from "../../../components/ProductDetailClient"
import type { Metadata } from "next"
import { Suspense } from "react"
import PublicLayout from "../../../components/PublicLayout"
import { PackageX } from "lucide-react"

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
      <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        {/* Big Error Icon */}
        <div className="relative select-none mb-6">
          <div className="text-[7rem] sm:text-[10rem] md:text-[14rem] font-black text-slate-100 leading-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="inline-flex p-3 sm:p-5 bg-white border-4 border-slate-900 shadow-hard">
              <PackageX className="w-10 h-10 sm:w-16 sm:h-16 text-slate-900" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight text-center mb-3 px-4">
          Product Not Found
        </h1>
        <p className="text-slate-500 font-medium text-center max-w-sm text-sm mb-8 px-4">
          We couldn't find the machinery or part you're looking for. It may have been removed or is no longer available.
        </p>

        {/* Actions */}
        <div className="flex flex-col w-full max-w-xs gap-3">
          <a
            href="/products"
            className="flex items-center justify-center gap-3 px-6 py-4 bg-primary border-2 border-slate-900 shadow-hard text-slate-900 font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all"
          >
            Back to Products
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}
