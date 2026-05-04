"use client"

import { useSearchParams } from "next/navigation"
import PublicLayout from "../../../components/PublicLayout"
import { useLanguage } from "../../../contexts/LanguageContext"
import { CheckCircle2, Package, ArrowRight, Home, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const { t } = useLanguage()

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      
      <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Order Placed!</h1>
      <p className="text-xl text-gray-500 mb-10 max-w-lg mx-auto">
        Thank you for your purchase. Your order <span className="font-black text-primary">#{orderId?.slice(-6).toUpperCase()}</span> has been received and is being processed.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
        <Link href="/products" className="flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-900 py-4 px-6 rounded-2xl font-black hover:border-primary transition-all">
          <ShoppingBag className="w-5 h-5" />
          Continue Shopping
        </Link>
        <Link href="/" className="flex items-center justify-center gap-3 bg-primary text-white py-4 px-6 rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-2xl transition-all">
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      <div className="mt-20 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center gap-8 text-left">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm flex-shrink-0">
          <Package className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900 mb-1">What happens next?</h3>
          <p className="text-sm text-gray-500">Our sales team will contact you within 24 hours to confirm the shipping details and payment. You can also contact us via Telegram for faster support.</p>
        </div>
        <Link href="/contact" className="ml-auto p-4 bg-white rounded-2xl text-primary hover:bg-primary hover:text-white transition-all">
          <ArrowRight className="w-6 h-6" />
        </Link>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <PublicLayout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </PublicLayout>
  )
}
