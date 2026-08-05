import ProductsList from "../../../components/ProductsList"
import type { Metadata } from "next"
import { Suspense } from "react"
import PublicLayout from "../../../components/PublicLayout"
import CategorySubgrid from "../../../components/CategorySubgrid"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  
  try {
    const res = await fetch(`${API_URL}/api/public/categories`, { next: { revalidate: 300 } })
    if (res.ok) {
      const { data: categories } = await res.json()
      const category = categories?.find((c: any) => c.slug === slug)

      if (category) {
        const title = `${category.name} | YSG Machinery`
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
  } catch (error) {
    console.error("Error fetching category meta", error)
  }

  return { title: "Category Not Found | YSG Machinery" }
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  
  let category = null
  let subcategories: any[] = []
  try {
    const res = await fetch(`${API_URL}/api/public/categories`, { next: { revalidate: 300 } })
    if (res.ok) {
      const { data: categories } = await res.json()
      category = categories?.find((c: any) => c.slug === slug)
      if (category) {
        subcategories = categories.filter((c: any) => c.parentId === category.id).sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      }
    }
  } catch (error) {
    console.error("Error fetching category", error)
  }

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
      {subcategories && subcategories.length > 0 ? (
        <PublicLayout>
          <CategorySubgrid category={category} subcategories={subcategories} />
        </PublicLayout>
      ) : (
        <ProductsList initialCategory={slug} />
      )}
    </Suspense>
  )
}
