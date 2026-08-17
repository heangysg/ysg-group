"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { ChevronRight, Package, ArrowRight, LayoutGrid } from "lucide-react"

export default function CategoriesPage() {
 const [categories, setCategories] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const { t, language } = useLanguage()

 useEffect(() => {
 async function fetchCategories() {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 try {
 const res = await fetch(`${API_URL}/api/public/categories`, { cache: 'no-store' })
 if (res.ok) {
 const data = await res.json()
 setCategories(data.data || [])
 }
 } catch {
 // Quietly fallback on network error
 } finally {
 setLoading(false)
 }
 }
 fetchCategories()
 }, [])

 const mainCategories = categories.filter(c => !c.parentId)

 return (
 <PublicLayout>
 <main className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
 <div className="max-w-5xl mx-auto px-4 md:px-8">
 
 {/* 🍞 Mobile Responsive Breadcrumbs */}
 <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
 <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
 <span className="shrink-0 text-slate-400">/</span>
 <span className="text-slate-900 font-bold truncate min-w-0">{t("categories")}</span>
 </div>

 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
 <div>
 <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004691]">
 {t("categories")}
 </h1>
 </div>
 </div>

 {loading ? (
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
 {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
 <div key={n} className="aspect-square bg-slate-50 rounded-md animate-pulse border border-slate-100" />
 ))}
 </div>
 ) : (
 <div className="space-y-10">
 {mainCategories.map((mainCat: any) => {
 const subCats = categories.filter(c => c.parentId === mainCat.id)

 return (
 <div key={mainCat.id} className="space-y-4">
 {/* Main Category Banner Header */}
 <div className="flex items-center justify-between pb-3 border-b border-slate-200">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-blue-50 text-[#004691] rounded-md flex items-center justify-center font-bold">
 <LayoutGrid className="w-5 h-5" />
 </div>
 <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 ">
 {language === "kh" && mainCat.nameKhmer ? mainCat.nameKhmer : mainCat.name}
 </h2>
 </div>

 <Link 
 href={`/products/category/${mainCat.slug}`}
 className="text-xs sm:text-sm md:text-base font-bold text-[#004691] hover:underline flex items-center gap-1.5"
 >
 <span>{language === "kh" ? "មើលទាំងអស់" : "View All"}</span>
 <ChevronRight className="w-4 h-4" />
 </Link>
 </div>

 {/* Subcategories & Main Category Cards Grid */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
 {/* Main Category Card */}
 <Link 
 href={`/products/category/${mainCat.slug}`}
 className="group bg-blue-50/30 p-4 sm:p-5 rounded-md border border-blue-100 hover:border-[#004691] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
 >
 <div className="w-full aspect-square bg-white rounded-md border border-blue-50 flex items-center justify-center p-3 mb-3 overflow-hidden relative">
 <div className="absolute top-2 right-2 bg-blue-50 text-[#004691] p-1.5 rounded-md z-10 shadow-sm border border-blue-100">
 <LayoutGrid className="w-4 h-4" />
 </div>
 {mainCat.image && !mainCat.image.includes('no.png') ? (
 <img src={mainCat.image} alt={mainCat.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 relative z-0 opacity-90 group-hover:opacity-100" />
 ) : (
 <LayoutGrid className="w-10 h-10 text-[#004691]/40" />
 )}
 </div>

 <div className="space-y-1">
 <h3 className="text-sm sm:text-base font-bold text-[#004691] transition-colors truncate">
 {language === "kh" ? `ទំនិញទាំងអស់ក្នុង ${mainCat.nameKhmer || mainCat.name}` : `All ${mainCat.name}`}
 </h3>
 <p className="text-xs text-[#004691]/70 font-semibold flex items-center gap-1">
 <span>{language === "kh" ? "មើលបណ្តុំផលិតផល" : "Browse collection"}</span>
 <ArrowRight className="w-3.5 h-3.5 text-[#004691] group-hover:translate-x-1 transition-transform" />
 </p>
 </div>
 </Link>

 {/* Subcategory Cards */}
 {subCats.map((sub: any) => (
 <Link 
 key={sub.id}
 href={`/products/category/${sub.slug}`}
 className="group bg-white p-4 sm:p-5 rounded-md border border-slate-200 hover:border-[#004691] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
 >
 <div className="w-full aspect-square bg-slate-50 rounded-md border border-slate-100 flex items-center justify-center p-3 mb-3 overflow-hidden relative">
 {sub.image && !sub.image.includes('no.png') ? (
 <img src={sub.image} alt={sub.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
 ) : (
 <Package className="w-10 h-10 text-slate-300" />
 )}
 </div>

 <div className="space-y-1">
 <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#004691] transition-colors truncate">
 {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
 </h3>
 <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
 <span>{language === "kh" ? "មើលផលិតផល" : "View products"}</span>
 <ArrowRight className="w-3.5 h-3.5 text-[#004691] group-hover:translate-x-1 transition-transform" />
 </p>
 </div>
 </Link>
 ))}
 </div>
 </div>
 )
 })}
 </div>
 )}

 </div>
 </main>
 </PublicLayout>
 )
}
