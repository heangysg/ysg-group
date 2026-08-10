import ProductsList from "../../../../components/ProductsList"
import type { Metadata } from "next"
import { Suspense } from "react"
import PublicLayout from "../../../../components/PublicLayout"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  
  try {
    const res = await fetch(`${API_URL}/api/public/categories`, { cache: 'no-store' })
    if (res.ok) {
      const { data: categories } = await res.json()
      const category = categories?.find((c: any) => c.slug === slug)

      if (category) {
        const title = `${category.name} | Yeung Shi Group`
        const description = category.description || `Browse our collection of ${category.name}`
        const imageUrl = category.image || null
        const images = imageUrl ? [{ url: imageUrl, width: 800, height: 600, alt: category.name }] : []

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: "website",
            images,
          }
        }
      }
    }
  } catch (e) {
    console.error(e)
  }

  return { title: "Products Category | Yeung Shi Group" }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="h-8 bg-slate-200 rounded-md w-48 animate-pulse mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </PublicLayout>
    }>
      <ProductsList initialCategory={slug} />
    </Suspense>
  )
}
