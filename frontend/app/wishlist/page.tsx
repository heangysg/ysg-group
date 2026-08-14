"use client"

import { useWishlist } from "../../contexts/WishlistContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PublicLayout from "../../components/PublicLayout"
import ProductCard from "../../components/ProductCard"
import { Heart, ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"

export default function WishlistPage() {
 const { wishlistItems, isLoaded, clearWishlist } = useWishlist()
 const { t, language } = useLanguage()

 if (!isLoaded) {
 return (
 <PublicLayout>
 <div className="min-h-[70vh] flex items-center justify-center bg-white">
 <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#004691]" />
 </div>
 </PublicLayout>
 )
 }

 return (
 <PublicLayout>
 <main className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
 <div className="max-w-5xl mx-auto px-4 md:px-8">
 
 {/* 🍞 Mobile Responsive Breadcrumbs */}
 <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
 <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
 <span className="shrink-0 text-slate-400">/</span>
 <span className="text-slate-900 font-bold truncate min-w-0">{t("wishlist")}</span>
 </div>

 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
 <div>
 <div className="flex items-center gap-3">
 <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#004691] ">
 {t("wishlist")}
 </h1>
 </div>
 <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
 {language === "kh" ? "ទំនិញដែលបានរក្សាទុកសម្រាប់ទិញពេលក្រោយ" : "Saved items for future purchase"}
 </p>
 </div>
 
 {wishlistItems.length > 0 && (
 <button 
 onClick={clearWishlist}
 className="text-xs sm:text-sm font-bold text-slate-600 hover:text-red-600 transition-colors bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-md shadow-2xs flex items-center gap-2 self-start sm:self-center"
 >
 <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
 <span>{language === "kh" ? "សម្អាតបញ្ជីបំណង" : "Clear Wishlist"}</span>
 </button>
 )}
 </div>

 {/* Product Grid / Empty State */}
 {wishlistItems.length === 0 ? (
 <div className="py-24 text-center bg-white rounded-md border border-slate-200 shadow-2xs flex flex-col items-center justify-center my-8">
 <div className="w-20 h-20 bg-blue-50 text-[#004691] rounded-md flex items-center justify-center mb-4">
 <Heart className="w-10 h-10" />
 </div>
 <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">{t("emptyWishlist")}</h3>
 <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-sm mb-6">{t("emptyWishlistDesc")}</p>
 
 <Link 
 href="/products" 
 className="inline-flex items-center gap-2 bg-[#004691] hover:bg-[#003366] text-white px-8 py-3.5 rounded-md font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>{t("browseEquipment")}</span>
 </Link>
 </div>
 ) : (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
 {wishlistItems.map(product => (
 <ProductCard key={product.id} product={product} />
 ))}
 </div>
 )}

 </div>
 </main>
 </PublicLayout>
 )
}
