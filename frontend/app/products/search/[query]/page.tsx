import { Suspense } from "react"
import ProductsList from "../../../../components/ProductsList"
import PublicLayout from "../../../../components/PublicLayout"

export default async function SearchProductsPage({ params }: { params: Promise<{ query: string }> }) {
  const { query } = await params
  const decodedQuery = decodeURIComponent(query)

  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#004691]" />
        </div>
      </PublicLayout>
    }>
      <ProductsList initialSearch={decodedQuery} />
    </Suspense>
  )
}
