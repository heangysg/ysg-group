"use client"

import { useEffect, useState } from "react"
import { createClient } from "../lib/supabase/client"
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

  // Sync state with URL
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory)
    }
  }, [urlCategory])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()
      
      // Fetch Categories
      const { data: catData } = await supabase
        .from("Category")
        .select("*")
        .eq("isActive", true)
        .order("sortOrder", { ascending: true })
      setCategories(catData || [])

      // Fetch Products
      let query = supabase
        .from("Product")
        .select("*")
        .eq("isPublished", true)

      if (selectedCategory !== "all") {
        const cat = catData?.find(c => c.slug === selectedCategory)
        if (cat) {
          if (!cat.parentId) {
            // Main category selected: include all subcategories
            const subCatIds = catData?.filter(c => c.parentId === cat.id).map(c => c.id) || []
            query = query.in("categoryId", [cat.id, ...subCatIds])
          } else {
            // Subcategory selected
            query = query.eq("categoryId", cat.id)
          }
        }
      }

      const { data: prodData } = await query.order("createdAt", { ascending: false })
      setProducts(prodData || [])
      setLoading(false)
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

  const filteredProducts = products.filter(p => {
    const name = (language === "kh" && p.nameKhmer ? p.nameKhmer : p.name).toLowerCase()
    return name.includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <PublicLayout>
      <main className="pb-24 pt-12 md:pt-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{t("ourCollection")}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-2 tracking-tight">
                {(() => {
                  if (selectedCategory === "all") return t("allProducts")
                  const cat = categories.find(c => c.slug === selectedCategory)
                  if (!cat) return t("allProducts")
                  return language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name
                })()}
              </h1>
              <p className="text-slate-500 font-medium">{t("discoverPopular")}</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t("searchProducts")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl border transition-all md:hidden ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-600'}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar Filters - Clean Professional */}
            <aside className={`lg:w-64 space-y-8 ${showFilters ? "block" : "hidden lg:block"}`}>
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">{t("categories")}</h3>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      selectedCategory === "all" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{t("allProducts")}</span>
                    <span className="text-[10px] opacity-60 font-medium">{products.length}</span>
                  </button>
                  {categories.filter(c => !c.parentId).map(cat => (
                    <div key={cat.id} className="space-y-1">
                      <button
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          selectedCategory === cat.slug ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-50"
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
                            className={`w-full text-left px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                              selectedCategory === sub.slug ? "text-primary bg-primary/5" : "text-slate-500 hover:text-slate-800"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <div key={n} className="aspect-[4/5] bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-24 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900">{t("noProductsFound")}</h3>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
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
