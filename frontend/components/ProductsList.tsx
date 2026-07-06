"use client"

import { useEffect, useState } from "react"

import PublicLayout from "./PublicLayout"
import ProductCard from "./ProductCard"
import { useLanguage } from "../contexts/LanguageContext"
import { Search, SlidersHorizontal, X, Filter, Package } from "lucide-react"
import { useRouter, useParams, useSearchParams } from "next/navigation"

export default function ProductsList({ initialCategory = "all" }: { initialCategory?: string }) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const urlCategory = (params?.slug as string) || searchParams.get("category") || initialCategory

  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
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
          fetch(`${API_URL}/api/public/categories`).then(r => r.json()),
          fetch(`${API_URL}/api/public/products`).then(r => r.json())
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
    setSelectedCategory(slug)
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
      <main className="pb-24 pt-8 md:pt-12 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-primary" />
                <span className="text-[10px] font-medium text-primary uppercase tracking-[0.2em]">{t("ourCollection")}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-medium text-slate-900 mb-4 tracking-tight leading-tight">
                {(() => {
                  if (selectedCategory === "all") return t("allProducts")
                  const cat = categories.find(c => c.slug === selectedCategory)
                  if (!cat) return t("allProducts")
                  return language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name
                })()}
              </h1>
              <p className="text-slate-500 font-medium">{t("discoverPopular")}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t("searchProducts")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-900 focus:border-primary outline-none transition-all font-bold text-slate-900 text-sm"
                />
              </div>
              {/* Sort Dropdown — visible on all screen sizes */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-3 px-3 bg-white border-2 border-slate-900 outline-none font-bold text-xs text-slate-900 uppercase tracking-wide cursor-pointer flex-shrink-0"
              >
                <option value="newest">{language === "kh" ? "ថ្មីបំផុត" : "Newest"}</option>
                <option value="price_asc">{language === "kh" ? "តម្លៃ↑" : "Price ↑"}</option>
                <option value="price_desc">{language === "kh" ? "តម្លៃ↓" : "Price ↓"}</option>
                <option value="name_az">{language === "kh" ? "ឈ្មោះ A-Z" : "Name A-Z"}</option>
              </select>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 border-2 transition-all md:hidden shrink-0 ${showFilters ? 'bg-slate-900 text-white border-slate-900 shadow-hard' : 'bg-white border-slate-900 text-slate-900 hover:bg-slate-50'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Filters - Clean Professional */}
            <aside className={`lg:w-64 space-y-8 ${showFilters ? "block" : "hidden lg:block"}`}>
              <div>
                <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4 ml-1">{t("categories")}</h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-2 ${
                      selectedCategory === "all" ? "bg-slate-900 text-white border-slate-900 shadow-hard" : "border-transparent text-slate-600 hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{t("allProducts")}</span>
                    <span className="text-[10px] opacity-60 font-medium">{products.length}</span>
                  </button>
                  {categories.filter(c => !c.parentId).map(cat => (
                    <div key={cat.id} className="space-y-1">
                      <button
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 border-2 ${
                          selectedCategory === cat.slug ? "bg-slate-900 text-white border-slate-900 shadow-hard" : "border-transparent text-slate-600 hover:border-slate-900 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}</span>
                      </button>
                      {/* Subcategories */}
                      <div className="pl-4 space-y-1">
                        {categories.filter(sub => sub.parentId === cat.id).map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => handleCategorySelect(sub.slug)}
                            className={`w-full text-left px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all border-l-4 ${
                              selectedCategory === sub.slug ? "border-primary text-slate-900 bg-slate-100" : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                            }`}
                          >
                            • {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
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
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <div key={n} className="aspect-[4/5] bg-slate-50 border-2 border-slate-200 animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-24 text-center bg-slate-50 border-[4px] border-dashed border-slate-300">
                  <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">{t("noProductsFound")}</h3>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
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
