"use client"

import { useWishlist } from "../../contexts/WishlistContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PublicLayout from "../../components/PublicLayout"
import ProductCard from "../../components/ProductCard"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
  const { wishlistItems, isLoaded, clearWishlist } = useWishlist()
  const { t, language } = useLanguage()

  if (!isLoaded) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-[#F8FAFC]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="bg-[#F8FAFC] min-h-screen py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {t("wishlist")}
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold tracking-wide">
                  {wishlistItems.length}
                </span>
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                {language === "kh" ? "ទំនិញដែលបានរក្សាទុកសម្រាប់ទិញពេលក្រោយ" : "Saved items for future purchase"}
              </p>
            </div>
            
            {wishlistItems.length > 0 && (
              <button 
                onClick={clearWishlist}
                className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg"
              >
                {language === "kh" ? "លុបទាំងអស់" : "Clear All"}
              </button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t("emptyWishlist")}</h3>
              <p className="text-slate-400 text-sm max-w-sm mb-8">{t("emptyWishlistDesc")}</p>
              
              <Link href="/products" className="inline-flex items-center gap-2 bg-slate-950 text-white px-6 py-3.5 rounded-xl font-medium text-[13px] transition-all hover:bg-primary shadow-lg">
                <ArrowLeft className="w-4 h-4" />
                {t("browseEquipment")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {wishlistItems.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  )
}
