import { Suspense } from "react"
import ProductsList from "../../../components/ProductsList"
import PublicLayout from "../../../components/PublicLayout"

export default function FeaturedProductsPage() {
  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    }>
      <ProductsList initialFeatured={true} />
    </Suspense>
  )
}
