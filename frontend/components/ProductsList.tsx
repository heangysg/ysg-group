"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import PublicLayout from "./PublicLayout"
import ProductCard from "./ProductCard"
import { useLanguage } from "../contexts/LanguageContext"
import { Search, SlidersHorizontal, X, Filter, Package, ChevronRight, ChevronDown, Check } from "lucide-react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function ProductsList({ initialCategory = "all", initialFeatured = false, initialSearch = "" }: { initialCategory?: string, initialFeatured?: boolean, initialSearch?: string }) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const urlCategory = (params?.slug as string) || searchParams.get("category") || initialCategory
  const isFeatured = initialFeatured || searchParams.get("featured") === "true"
  const urlSearch = (params?.query as string) || searchParams.get("search") || initialSearch

  const [allProducts, setAllProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(urlSearch)
  const [selectedCategory, setSelectedCategory] = useState(urlCategory)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [sortOpen, setSortOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory)
    }
  }, [urlCategory])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/api/public/categories`, { cache: 'no-store' }).then(r => r.json()),
          fetch(`${API_URL}/api/public/products${isFeatured ? '?featured=true' : ''}`, { cache: 'no-store' }).then(r => r.json())
        ])
        
        setCategories(catRes.data || [])
        setAllProducts(prodRes.data || [])
      } catch (e) {
        console.error("Failed to fetch products page data", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isFeatured])

  const toggleCategoryExpand = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setExpandedCategories(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const handleCategorySelect = (slug: string, isMobile: boolean = false) => {
    setSelectedCategory(slug)
    if (isMobile) {
      setShowFilters(false)
    }

    const targetUrl = slug === "all" ? "/products" : `/products/category/${slug}`
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", targetUrl)
    }
  }

  // ⚡ Instant Client-Side Category & Search Filtering (Zero Flash / Glitch)
  let filteredProducts = allProducts.filter(p => {
    // 1. Category Filter
    if (selectedCategory !== "all") {
      const mainCat = categories.find((c: any) => c.slug === selectedCategory)
      if (mainCat) {
        const childCategoryIds = categories.filter((c: any) => c.parentId === mainCat.id).map((c: any) => c.id)
        const targetIds = [mainCat.id, ...childCategoryIds]
        if (!targetIds.includes(p.categoryId) && p.categorySlug !== selectedCategory && p.category?.slug !== selectedCategory) {
          return false
        }
      } else {
        if (p.categorySlug !== selectedCategory && p.category?.slug !== selectedCategory) {
          return false
        }
      }
    }

    // 2. Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchName = p.name.toLowerCase().includes(q) || (p.nameKhmer && p.nameKhmer.toLowerCase().includes(q))
      const matchDesc = (p.description && p.description.toLowerCase().includes(q)) || (p.descriptionKhmer && p.descriptionKhmer.toLowerCase().includes(q))
      if (!matchName && !matchDesc) return false
    }

    return true
  })

  // Sort Filter
  filteredProducts.sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price
    if (sortBy === "price_desc") return b.price - a.price
    if (sortBy === "name_az") return a.name.localeCompare(b.name)
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  })

  const renderCategoryFilters = (isMobile: boolean = false) => (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => handleCategorySelect("all", isMobile)}
        className={`flex items-center justify-between px-3.5 py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all ${
          selectedCategory === "all" ? "bg-[#004691] text-white shadow-2xs" : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        <span>{t("allProducts")}</span>
        <span className="text-xs opacity-80">({allProducts.length})</span>
      </button>
      
      {categories.filter(c => !c.parentId).map(cat => {
        const isSelected = selectedCategory === cat.slug
        const subCats = categories.filter(sub => sub.parentId === cat.id)
        const hasSubs = subCats.length > 0
        const isExpanded = expandedCategories.includes(cat.slug) || isSelected || subCats.some(s => s.slug === selectedCategory)

        return (
          <div key={cat.id} className="flex flex-col">
            <div className={`flex items-center justify-between rounded-lg transition-all ${
              isSelected ? "bg-[#004691]/10 text-[#004691]" : "text-slate-800 hover:bg-slate-50"
            }`}>
              <button
                onClick={(e) => {
                  if (hasSubs) {
                    toggleCategoryExpand(cat.slug, e)
                  } else {
                    handleCategorySelect(cat.slug, isMobile)
                  }
                }}
                className="flex-1 text-left px-3.5 py-2.5 text-sm md:text-base font-bold flex items-center justify-between"
              >
                <span>{language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}</span>
                {hasSubs && (
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90 text-[#004691]' : 'text-slate-400'}`} />
                )}
              </button>
            </div>

            {/* Smooth Animated Accordion for Nested Subcategories */}
            <AnimatePresence initial={false}>
              {hasSubs && isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden ml-3 pl-3 border-l-2 border-[#004691]/20 flex flex-col gap-1 my-1"
                >
                  {/* Option to view all products under this main category */}
                  <button
                    onClick={() => handleCategorySelect(cat.slug, isMobile)}
                    className={`text-left px-2.5 py-2 text-xs md:text-sm font-bold rounded-md transition-all ${
                      selectedCategory === cat.slug ? "text-[#004691] bg-blue-50" : "text-slate-500 hover:text-[#004691] hover:bg-slate-50"
                    }`}
                  >
                    {language === "kh" ? `ទំនិញទាំងអស់ក្នុង ${cat.nameKhmer || cat.name}` : `All ${cat.name}`}
                  </button>

                  {subCats.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleCategorySelect(sub.slug, isMobile)}
                      className={`text-left px-2.5 py-2 text-xs md:text-sm rounded-md transition-all ${
                        selectedCategory === sub.slug ? "text-[#004691] font-bold bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )

  return (
    <PublicLayout>
      <main className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* 🍞 Mobile Responsive Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
            <span className="shrink-0 text-slate-400">/</span>
            <Link href="/products" className="hover:text-[#004691] shrink-0 transition-colors">{t("allProducts")}</Link>
            {selectedCategory !== "all" && (
              <>
                <span className="shrink-0 text-slate-400">/</span>
                <span className="text-slate-900 font-bold truncate min-w-0">
                  {(() => {
                    const cat = categories.find(c => c.slug === selectedCategory)
                    return cat ? (language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name) : selectedCategory
                  })()}
                </span>
              </>
            )}
          </div>

          {/* Header Bar: Category Title + Count + Custom Sort & Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b border-slate-200 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#004691] tracking-tight">
                {(() => {
                  if (searchQuery) return language === "kh" ? `លទ្ធផលស្វែងរក: "${searchQuery}"` : `Search results: "${searchQuery}"`
                  if (isFeatured) return language === "kh" ? "ផលិតផលពិសេស" : "Featured Machines"
                  if (selectedCategory === "all") return t("allProducts")
                  const cat = categories.find(c => c.slug === selectedCategory)
                  if (!cat) return t("allProducts")
                  return language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name
                })()}
              </h1>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto text-sm font-semibold text-slate-700">
              <span className="text-slate-600 font-semibold text-sm sm:text-base">
                {language === "kh" ? `បង្ហាញ ${filteredProducts.length} លទ្ធផល` : `Showing ${filteredProducts.length} results`}
              </span>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-bold text-sm sm:text-base text-slate-800">{t("sortBy") || "Sort by"}:</span>
                
                {/* 🤍 Custom White Dropdown Popover */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 py-2 px-4 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition-all"
                  >
                    <span>
                      {sortBy === "newest" && (language === "kh" ? "ថ្មីបំផុត" : "Newest")}
                      {sortBy === "price_asc" && (language === "kh" ? "តម្លៃ (ទាប ទៅ ខ្ពស់)" : "Price (Low to High)")}
                      {sortBy === "price_desc" && (language === "kh" ? "តម្លៃ (ខ្ពស់ ទៅ ទាប)" : "Price (High to Low)")}
                      {sortBy === "name_az" && (language === "kh" ? "ឈ្មោះ A-Z" : "Name A-Z")}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${sortOpen ? "rotate-180 text-[#004691]" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {sortOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-1.5 overflow-hidden"
                        >
                          {[
                            { value: "newest", label: language === "kh" ? "ថ្មីបំផុត" : "Newest" },
                            { value: "price_asc", label: language === "kh" ? "តម្លៃ (ទាប ទៅ ខ្ពស់)" : "Price (Low to High)" },
                            { value: "price_desc", label: language === "kh" ? "តម្លៃ (ខ្ពស់ ទៅ ទាប)" : "Price (High to Low)" },
                            { value: "name_az", label: language === "kh" ? "ឈ្មោះ A-Z" : "Name A-Z" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value)
                                setSortOpen(false)
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left font-semibold transition-colors ${
                                sortBy === option.value ? "bg-blue-50 text-[#004691] font-bold" : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{option.label}</span>
                              {sortBy === option.value && <Check className="w-4 h-4 text-[#004691]" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Filter Button */}
                <button 
                  onClick={() => setShowFilters(true)}
                  className="p-2 lg:hidden rounded-lg border bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200 transition-all flex items-center gap-1.5 text-xs sm:text-sm font-bold"
                >
                  <Filter className="w-4 h-4 text-[#004691]" />
                  <span className="hidden xs:inline">{t("filter") || "Filter"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar Accordion Filters */}
            <aside className="hidden lg:block lg:w-64 shrink-0">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-28 shadow-2xs">
                <h3 className="text-sm font-bold text-[#004691] uppercase tracking-wider mb-3 px-2">
                  {t("categories")}
                </h3>
                {renderCategoryFilters(false)}
              </div>
            </aside>

            {/* Mobile Filter Side Drawer (Slides from Left) */}
            <AnimatePresence>
              {showFilters && (
                <div className="fixed inset-0 z-[150] lg:hidden">
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
                    onClick={() => setShowFilters(false)}
                  />

                  {/* Sliding Side Drawer */}
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="absolute top-0 left-0 bottom-0 w-[290px] bg-white shadow-2xl flex flex-col z-[160]"
                  >
                    {/* Drawer Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4.5 h-4.5 text-[#004691]" />
                        <h3 className="text-sm font-bold text-slate-900">
                          {t("categories")}
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Categories Accordion */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {renderCategoryFilters(true)}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <div key={n} className="aspect-[4/5] bg-white rounded-3xl border border-slate-100 animate-pulse shadow-sm" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-32 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t("noProductsFound")}</h3>
                  <p className="text-slate-400 text-sm max-w-sm">{t("noProductsDescription")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
