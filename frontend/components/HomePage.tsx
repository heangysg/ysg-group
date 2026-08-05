"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight, Search, TrendingUp, LayoutGrid, X } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import ProductCard from "./ProductCard"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()
  const [categories, setCategories] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  useEffect(() => {
    async function initialFetch() {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      try {
        const [featRes, allRes, catRes] = await Promise.all([
          fetch(`${API_URL}/api/public/products?featured=true&limit=8`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`${API_URL}/api/public/products?limit=16`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`${API_URL}/api/public/categories`, { cache: 'no-store' }).then(r => r.json())
        ])

        setFeaturedProducts(featRes.data || [])
        setAllProducts(allRes.data || [])
        setCategories(catRes.data || [])
      } catch (err) {
        console.error("Home Data Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }
    initialFetch()
  }, [])

  // Auto-advance banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const topCategories = categories.filter(c => !c.parentId).slice(0, 10)
  const hotProducts = featuredProducts.slice(0, 8)
  const popularProducts = allProducts.slice(0, 16)

  const banners = [
    {
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200",
      title: language === "kh" ? "ប្រូម៉ូសិនពិសេស" : "Super Sale",
      subtitle: language === "kh" ? "បញ្ចុះតម្លៃរហូតដល់ ២០% លើគ្រឿងចក្រធុនធ្ងន់" : "Up to 20% Off Heavy Machinery",
      color: "from-blue-900/90"
    },
    {
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200",
      title: language === "kh" ? "ទំនិញថ្មី" : "New Arrivals",
      subtitle: language === "kh" ? "គ្រឿងចក្របច្ចេកវិទ្យាចុងក្រោយបង្អស់" : "Next-Generation Industrial Tech",
      color: "from-slate-900/90"
    },
    {
      image: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?auto=format&fit=crop&q=80&w=1200",
      title: language === "kh" ? "គុណភាពស្តង់ដារ" : "Premium Quality",
      subtitle: language === "kh" ? "ធានាគុណភាពកម្រិតអន្តរជាតិ ISO 9001" : "ISO 9001 Certified Excellence",
      color: "from-indigo-900/90"
    }
  ]

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 font-sans selection:bg-primary/20">
      
      {/* 🔍 Native App Style Search Header */}
      <div className="bg-gradient-to-b from-primary to-primary-dark pt-8 md:pt-12 pb-8 md:pb-24 px-4 md:px-8 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4" />
        
        <div className="max-w-7xl mx-auto relative z-10 mt-2 md:-mt-4">

          <div className="relative group max-w-3xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/0 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 overflow-hidden">
              <div className="pl-5">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "kh" ? "ស្វែងរកផលិតផល ឬម៉ូដែល..." : "Search for premium machinery, brands, or models..."}
                className="w-full pl-3 pr-4 py-4 md:py-5 bg-transparent border-none text-slate-900 focus:outline-none focus:ring-0 text-[14px] font-medium placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-2 mr-1 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="pr-2 hidden md:block">
                <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[13px] font-bold hover:bg-slate-800 hover:shadow-md transition-all active:scale-95">
                  {language === "kh" ? "ស្វែងរក" : "Search"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 md:-mt-16 relative z-20 space-y-8 md:space-y-12">

        {/* 🎫 Animated Dynamic Banner Carousel */}
        <section className="relative rounded-xl md:rounded-2xl overflow-hidden bg-slate-900 h-[180px] md:h-[400px] shadow-[0_20px_50px_rgb(0,0,0,0.15)] group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={banners[currentSlide].image}
                alt="Promotion"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 md:bottom-8 left-5 md:left-16 flex gap-1.5 md:gap-2 z-20">
            {banners.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full h-1.5 ${
                  currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </section>

        {/* 📂 Modern Categories Pill Scroller */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{t("categories")}</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-3 md:gap-6 pb-4 snap-x">
            {topCategories.map((cat, idx) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="snap-start min-w-[76px] md:min-w-[120px]"
              >
                <Link 
                  href={`/categories/${cat.slug}`}
                  className="flex flex-col items-center gap-2 md:gap-3 group"
                >
                  <div className="w-[64px] h-[64px] md:w-[110px] md:h-[110px] bg-white rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center justify-center p-3 md:p-4 group-hover:border-primary/30 group-hover:shadow-[0_8px_30px_rgb(37,99,235,0.12)] transition-all duration-300 group-hover:-translate-y-1 overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 z-0" />
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                    ) : (
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-100 relative z-10" />
                    )}
                  </div>
                  <span className="text-[10px] md:text-[13px] font-semibold text-slate-700 text-center leading-tight line-clamp-2 w-full group-hover:text-primary transition-colors">
                    {language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>


        {/* ⭐ Featured Machines (Clean Showcase) */}
        {hotProducts.length > 0 && (
          <section className="pt-2 md:pt-4 mb-4 md:mb-8">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="h-6 md:h-8 w-1.5 md:w-2 bg-primary rounded-full"></div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {language === "kh" ? "ផលិតផលពិសេសេ" : "Featured Machines"}
                </h2>
              </div>
              <Link href="/products/featured" className="flex items-center gap-1 md:gap-2 text-[12px] md:text-[13px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-colors">
                {language === "kh" ? "មើលទាំងអស់" : "View All"}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
              {loading ? (
                [...Array(8)].map((_, n) => <div key={n} className={`aspect-[3/4] bg-white border border-slate-100 rounded-xl md:rounded-2xl animate-pulse shadow-sm ${n >= 6 ? 'hidden md:block' : ''}`} />)
              ) : (
                hotProducts.map((product, n) => (
                  <div key={product.id} className={n >= 6 ? 'hidden md:block' : ''}>
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* 🛍️ Just For You (Main Discovery Grid) */}
        <section className="pt-2 md:pt-4">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-10 h-10 bg-blue-100 text-primary rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {language === "kh" ? "រុករកផលិតផល" : "Discover More"}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
            {loading ? (
              [...Array(16)].map((_, n) => <div key={n} className="aspect-[3/4] bg-white border border-slate-100 rounded-xl md:rounded-2xl animate-pulse shadow-sm" />)
            ) : (
              popularProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <div className="mt-12 flex justify-center pb-8">
            <Link href="/products" className="group bg-white border border-slate-200 text-slate-900 px-10 py-4 rounded-2xl text-[14px] font-bold hover:border-primary hover:text-primary hover:shadow-[0_8px_30px_rgb(37,99,235,0.12)] transition-all flex items-center gap-2">
              {language === "kh" ? "មើលផលិតផលជាច្រើនទៀត" : "Load More Products"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
