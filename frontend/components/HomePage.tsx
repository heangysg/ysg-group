"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingBag, ChevronRight, Star, ShieldCheck, ArrowRight, TrendingUp, Sparkles, X, LayoutGrid } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useRouter } from "next/navigation"
import ProductCard from "./ProductCard"

export default function HomePage() {
  const [topCategories, setTopCategories] = useState<any[]>([])
  const [hotProducts, setHotProducts] = useState<any[]>([])
  const [popularProducts, setPopularProducts] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [displayLimit, setDisplayLimit] = useState(12)

  const { t, language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    async function fetchHomeData() {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      try {
        const [catRes, prodRes, bannerRes] = await Promise.all([
          fetch(`${API_URL}/api/public/categories`, { cache: 'no-store' }),
          fetch(`${API_URL}/api/public/products`, { cache: 'no-store' }),
          fetch(`${API_URL}/api/public/banners`, { cache: 'no-store' })
        ])

        const catData = catRes.ok ? await catRes.json() : { data: [] }
        const prodData = prodRes.ok ? await prodRes.json() : { data: [] }
        const bannerData = bannerRes.ok ? await bannerRes.json() : { data: [] }

        if (catData.data) {
          const mainCats = catData.data.filter((c: any) => !c.parentId)
          setTopCategories(mainCats)
        }

        if (prodData.data) {
          const prods = prodData.data
          setHotProducts(prods.filter((p: any) => p.isFeatured === true))
          setPopularProducts(prods)
        }

        if (bannerData.data && bannerData.data.length > 0) {
          setBanners(bannerData.data)
        } else {
          setBanners([
            { id: 1, image: "", title: "Yeung Shi Group - Quality Equipment" }
          ])
        }
      } catch (err) {
        console.error("Home Data Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeData()
  }, [])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  return (
    <div className="bg-white min-h-screen pb-24 font-sans selection:bg-[#004691]/20">
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6 relative z-20 space-y-6 md:space-y-10">

        {/* Hero Banner Showcase */}
        <section className="relative rounded-lg md:rounded-xl overflow-hidden bg-slate-900 h-[180px] sm:h-[240px] md:h-[380px] shadow-2xs group border border-slate-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {banners[currentSlide]?.image ? (
                <img 
                  src={banners[currentSlide].image}
                  alt="Promotion"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#004691] flex flex-col items-center justify-center p-6 text-white text-center">
                  <img src="/logo/ysg-logo.png" alt="YSG Logo" className="h-12 md:h-16 w-auto object-contain mb-3 brightness-0 invert" />
                  <h2 className="text-lg md:text-2xl font-bold tracking-wide">
                    {banners[currentSlide]?.title || "Yeung Shi Group - Quality Equipment"}
                  </h2>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Carousel Indicators */}
          {banners.length > 1 && (
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
          )}
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{t("categories")}</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-3 md:gap-6 pb-4 snap-x">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="snap-start min-w-[88px] sm:min-w-[110px] md:min-w-[130px] flex flex-col items-center gap-2">
                  <div className="w-[76px] h-[76px] sm:w-[90px] sm:h-[90px] md:w-[120px] md:h-[120px] bg-slate-100 rounded-xl md:rounded-2xl animate-pulse" />
                  <div className="w-16 h-3 bg-slate-100 rounded animate-pulse" />
                </div>
              ))
            ) : (
              topCategories.map((cat, idx) => (
                <motion.div 
                  key={cat.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="snap-start min-w-[88px] sm:min-w-[110px] md:min-w-[130px]"
                >
                  <Link 
                    href={`/products/category/${cat.slug}`}
                    className="flex flex-col items-center gap-2 md:gap-3 group"
                  >
                    <div className="w-[76px] h-[76px] sm:w-[90px] sm:h-[90px] md:w-[120px] md:h-[120px] bg-white rounded-xl md:rounded-2xl shadow-2xs border border-slate-200 flex items-center justify-center p-3 md:p-4 group-hover:border-[#004691] transition-all duration-300 overflow-hidden relative">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-100 relative z-10 flex items-center justify-center text-slate-300 font-bold">
                          {cat.name ? cat.name[0] : "C"}
                        </div>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 text-center leading-tight line-clamp-2 w-full group-hover:text-[#004691] transition-colors">
                      {language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Featured Products Showcase */}
        {(loading || hotProducts.length > 0) && (
          <section className="pt-2 md:pt-4 mb-4 md:mb-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="h-6 md:h-8 w-1.5 md:w-2 bg-[#004691] rounded-full"></div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {language === "kh" ? "ផលិតផលពិសេស" : "Featured Machines"}
                </h2>
              </div>
              <Link href="/products/featured" className="flex items-center gap-1 md:gap-2 text-xs sm:text-sm md:text-base font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors">
                {language === "kh" ? "មើលទាំងអស់" : "View All"}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <div key={n} className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
                ))
              ) : (
                hotProducts.slice(0, 8).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </section>
        )}

        {/* Discover All Products Grid (Limited Initial Count) */}
        <section className="pt-2 md:pt-4">
          <div className="flex items-center justify-between mb-4 md:mb-6 px-1 sm:px-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-[#004691] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {language === "kh" ? "រុករកផលិតផល" : "Discover More"}
              </h2>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-400">
              {loading ? "" : `${Math.min(displayLimit, popularProducts.length)} / ${popularProducts.length} ${language === "kh" ? "ផលិតផល" : "items"}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
            {loading ? (
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <div key={n} className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
              ))
            ) : (
              popularProducts.slice(0, displayLimit).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Load More Action Button */}
          {!loading && popularProducts.length > displayLimit && (
            <div className="mt-10 flex justify-center pb-8">
              <button 
                onClick={() => setDisplayLimit(prev => prev + 12)}
                className="group bg-white border border-slate-200 text-slate-900 px-8 py-3.5 rounded-full text-sm sm:text-base font-bold hover:border-[#004691] hover:text-[#004691] hover:bg-blue-50/50 transition-all flex items-center gap-2 shadow-2xs active:scale-95"
              >
                <span>{language === "kh" ? "មើលផលិតផលបន្ថែម" : "Load More Products"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#004691]" />
              </button>
            </div>
          )}

          {!loading && popularProducts.length <= displayLimit && popularProducts.length > 0 && (
            <div className="mt-10 flex justify-center pb-8">
              <Link 
                href="/products"
                className="group bg-slate-100 text-slate-700 px-8 py-3.5 rounded-full text-sm sm:text-base font-bold hover:bg-[#004691] hover:text-white transition-all flex items-center gap-2 shadow-2xs"
              >
                <span>{language === "kh" ? "ទស្សនាផលិតផលទាំងអស់" : "View All Products Catalog"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
