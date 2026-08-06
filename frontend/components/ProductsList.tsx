"use client"

import { useEffect, useState } from "react"

import PublicLayout from "./PublicLayout"
import ProductCard from "./ProductCard"
import { useLanguage } from "../contexts/LanguageContext"
import { Search, SlidersHorizontal, X, Filter, Package } from "lucide-react"
import { useRouter, useParams, useSearchParams } from "next/navigation"

export default function ProductsList({ initialCategory = "all", initialFeatured = false }: { initialCategory?: string, initialFeatured?: boolean }) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const urlCategory = (params?.slug as string) || searchParams.get("category") || initialCategory
  const isFeatured = initialFeatured || searchParams.get("featured") === "true"
  const urlSearch = searchParams.get("search") || ""

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(urlSearch)
  const [selectedCategory, setSelectedCategory] = useState(urlCategory)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

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
        
        const catData = catRes.data || []
        let prodData = prodRes.data || []

        setCategories(catData)

        if (selectedCategory !== "all") {
          const cat = catData.find((c: any) => c.slug === selectedCategory)
          if (cat) {
            if (!cat.parentId) {
              const subCatIds = catData.filter((c: any) => c.parentId === cat.id).map((c: any) => c.id)
              prodData = prodData.filter((p: any) => p.categoryId === cat.id || subCatIds.includes(p.categoryId))
            } else {
              prodData = prodData.filter((p: any) => p.categoryId === cat.id)
            }
          }
        }

        if (isFeatured) {
          prodData = prodData.filter((p: any) => p.isFeatured === true)
        }

        setProducts(prodData)
      } catch (err) {
        console.error("ProductsList Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedCategory])

  const handleCategorySelect = (slug: string) => {
    setShowFilters(false)
    if (slug === "all") {
      router.push("/products")
    } else {
      router.push(`/categories/${slug}`)
    }
  }

  const filteredProducts = products
    .filter(p => {
      const name = (language === "kh" && p.nameKhmer ? p.nameKhmer : p.name).toLowerCase()
      return name.includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0)
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0)
      if (sortBy === "name_az") return (a.name || "").localeCompare(b.name || "")
      // newest (default)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

  return (
    <PublicLayout>
      <main className="pb-24 pt-8 md:pt-12 px-2.5 sm:px-4 md:px-8 bg-[#F8FAFC] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 md:mb-10 gap-3 md:gap-6 md:bg-white md:p-8 md:rounded-2xl md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-slate-100 mx-0">
            <div className="max-w-2xl w-full">
              <div className="hidden md:flex items-center gap-3 mb-3">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-widest">{t("ourCollection")}</span>
              </div>
              <h1 className="text-xl md:text-5xl font-black text-slate-900 mb-0 md:mb-3 tracking-tight leading-tight">
                {(() => {
                  if (searchQuery) return language === "kh" ? `លទ្ធផលស្វែងរក: "${searchQuery}"` : `Search results: "${searchQuery}"`
                  if (isFeatured) return language === "kh" ? "ផលិតផលពិសេសេ" : "Featured Machines"
                  if (selectedCategory === "all") return t("allProducts")
                  const cat = categories.find(c => c.slug === selectedCategory)
                  if (!cat) return t("allProducts")
                  return language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name
                })()}
              </h1>
              <p className="hidden md:block text-slate-500 font-medium text-sm md:text-base">{t("discoverPopular")}</p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t("searchProducts")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 md:py-3.5 bg-white md:bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 text-[12px] md:text-[13px] shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      router.push("/products")
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full flex items-center justify-center transition-colors"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2.5 md:py-3.5 px-2 md:px-4 bg-white border border-slate-200 rounded-xl outline-none font-bold text-[11px] md:text-[12px] text-slate-700 cursor-pointer flex-shrink-0 shadow-sm focus:border-primary transition-all max-w-[90px] md:max-w-none truncate"
              >
                <option value="newest">{language === "kh" ? "ថ្មីបំផុត" : "Newest"}</option>
                <option value="price_asc">{language === "kh" ? "តម្លៃ (ទាប ទៅ ខ្ពស់)" : "Price (Low to High)"}</option>
                <option value="price_desc">{language === "kh" ? "តម្លៃ (ខ្ពស់ ទៅ ទាប)" : "Price (High to Low)"}</option>
                <option value="name_az">{language === "kh" ? "ឈ្មោះ A-Z" : "Name A-Z"}</option>
              </select>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 md:p-3.5 transition-all md:hidden shrink-0 rounded-xl border shadow-sm ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Clean Professional */}
            <aside className={`lg:w-72 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
              <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sticky top-28 mx-1.5 md:mx-0 max-h-[calc(100vh-120px)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">{t("categories")}</h3>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`flex items-center justify-between px-4 py-3 text-[13px] font-bold transition-all duration-300 rounded-xl ${
                      selectedCategory === "all" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <span>{t("allProducts")}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedCategory === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>{products.length}</span>
                  </button>
                  {categories.filter(c => !c.parentId).map(cat => (
                    <div key={cat.id} className="space-y-1">
                      <button
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-[13px] font-bold transition-all duration-300 rounded-xl ${
                          selectedCategory === cat.slug ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                        }`}
                      >
                        <span>{language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}</span>
                      </button>
                      {/* Subcategories */}
                      <div className="pl-3 space-y-1 mt-1">
                        {categories.filter(sub => sub.parentId === cat.id).map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => handleCategorySelect(sub.slug)}
                            className={`w-full text-left px-4 py-2 text-[12px] font-medium transition-all rounded-lg flex items-center gap-2 ${
                              selectedCategory === sub.slug ? "text-primary bg-primary/5 font-bold" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${selectedCategory === sub.slug ? "bg-primary" : "bg-slate-300"}`} />
                            {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
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
