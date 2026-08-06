"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import PublicLayout from "./PublicLayout"
import ProductCard from "./ProductCard"
import { useLanguage } from "../contexts/LanguageContext"
import { Search, SlidersHorizontal, X, Filter, Package, ChevronRight } from "lucide-react"
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
      <main className="pb-24 pt-4 md:pt-6 px-4 md:px-8 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* 🍞 Breadcrumbs (Matching Image 1 & 2) */}
          <div className="flex items-center gap-2 text-[11px] md:text-[12px] text-slate-500 font-medium mb-4">
            <Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary transition-colors">{t("allProducts")}</Link>
            {selectedCategory !== "all" && (
              <>
                <span>/</span>
                <span className="text-slate-900 font-bold">
                  {(() => {
                    const cat = categories.find(c => c.slug === selectedCategory)
                    return cat ? (language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name) : selectedCategory
                  })()}
                </span>
              </>
            )}
          </div>

          {/* Header Bar: Category Title + Count + Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-6 border-b border-slate-200 gap-4">
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">
                {(() => {
                  if (searchQuery) return language === "kh" ? `លទ្ធផលស្វែងរក: "${searchQuery}"` : `Search results: "${searchQuery}"`
                  if (isFeatured) return language === "kh" ? "ផលិតផលពិសេសេ" : "Featured Machines"
                  if (selectedCategory === "all") return t("allProducts")
                  const cat = categories.find(c => c.slug === selectedCategory)
                  if (!cat) return t("allProducts")
                  return language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name
                })()}
              </h1>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto text-[12px] font-medium text-slate-600">
              <span>
                {language === "kh" ? `បង្ហាញ ${filteredProducts.length} លទ្ធផល` : `Showing ${filteredProducts.length} results`}
              </span>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-semibold">{t("sortBy") || "Sort by"}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-1.5 px-3 bg-slate-100 border border-slate-200 rounded-md outline-none text-[12px] font-semibold text-slate-800 cursor-pointer focus:border-[#004691]"
                >
                  <option value="newest">{language === "kh" ? "ថ្មីបំផុត" : "Newest"}</option>
                  <option value="price_asc">{language === "kh" ? "តម្លៃ (ទាប ទៅ ខ្ពស់)" : "Price (Low to High)"}</option>
                  <option value="price_desc">{language === "kh" ? "តម្លៃ (ខ្ពស់ ទៅ ទាប)" : "Price (High to Low)"}</option>
                  <option value="name_az">{language === "kh" ? "ឈ្មោះ A-Z" : "Name A-Z"}</option>
                </select>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 lg:hidden rounded-md border text-xs font-bold ${showFilters ? 'bg-[#004691] text-white border-[#004691]' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Accordion Filters (Matching Image 2) */}
            <aside className={`lg:w-64 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
              <div className="bg-white rounded-lg border border-slate-200 p-4 sticky top-28">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">
                  {t("categories")}
                </h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`flex items-center justify-between px-3 py-2 text-[12px] font-bold rounded-md transition-all ${
                      selectedCategory === "all" ? "bg-[#004691] text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{t("allProducts")}</span>
                    <span className="text-[10px] opacity-80">({products.length})</span>
                  </button>
                  
                  {categories.filter(c => !c.parentId).map(cat => {
                    const isSelected = selectedCategory === cat.slug
                    const subCats = categories.filter(sub => sub.parentId === cat.id)
                    const hasSubs = subCats.length > 0

                    return (
                      <div key={cat.id} className="flex flex-col">
                        <button
                          onClick={() => handleCategorySelect(cat.slug)}
                          className={`flex items-center justify-between px-3 py-2 text-[12px] font-semibold rounded-md transition-all ${
                            isSelected ? "bg-slate-100 text-[#004691] font-bold" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}</span>
                          {hasSubs && <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-[#004691]' : 'text-slate-400'}`} />}
                        </button>

                        {/* Nested Subcategories */}
                        {hasSubs && (isSelected || subCats.some(s => s.slug === selectedCategory)) && (
                          <div className="ml-3 pl-3 border-l border-slate-200 flex flex-col gap-1 my-1">
                            {subCats.map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => handleCategorySelect(sub.slug)}
                                className={`text-left px-2 py-1.5 text-[11px] rounded-md transition-all ${
                                  selectedCategory === sub.slug ? "text-[#004691] font-bold bg-blue-50" : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
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
