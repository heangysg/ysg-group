"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../../../lib/supabase/client"
import { logActivity } from "../../../lib/audit"
import { Plus, Eye, Edit, Trash2, Search, Filter, Package, ChevronRight, MoreHorizontal, X } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { t, language } = useLanguage()

  useEffect(() => {
    async function initialFetch() {
      setLoading(true)
      const supabase = createClient()
      try {
        const [catRes, prodRes] = await Promise.all([
          supabase.from("Category").select("*").order("sortOrder", { ascending: true }),
          supabase.from("Product").select("*").order("createdAt", { ascending: false }).limit(50)
        ])
        setCategories(catRes.data || [])
        setProducts(prodRes.data || [])
      } catch (err) {
        console.error("Initial Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }
    initialFetch()
  }, [])

  useEffect(() => {
    // Reset to page 1 when search or filter changes
    setCurrentPage(1)
    if (!loading) {
      fetchProducts(1)
    }
  }, [search, selectedCategory])

  useEffect(() => {
    if (!loading) {
      fetchProducts(currentPage)
    }
  }, [currentPage])

  async function fetchProducts(page: number) {
    const supabase = createClient()
    const pageSize = 10
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    let query = supabase
      .from("Product")
      .select("*", { count: "exact" })
      .order("createdAt", { ascending: false })
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,nameKhmer.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`)
    }
    if (selectedCategory) {
      query = query.eq("categoryId", selectedCategory)
    }
    
    query = query.range(start, end)
    
    const { data, count } = await query
    setProducts(data || [])
    if (count !== null) {
      setTotalPages(Math.ceil(count / pageSize) || 1)
    }
  }

  async function deleteProduct(id: string, name: string) {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const supabase = createClient()
      const { error } = await supabase
        .from("Product")
        .delete()
        .eq("id", id)
      
      if (error) {
        toast.error("Failed to delete product")
      } else {
        await logActivity({
          action: "delete",
          entityType: "product",
          entityId: id,
          details: { name }
        })
        toast.success("Product deleted successfully")
        fetchProducts(currentPage)
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{t("products")}</h1>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{t("manageProductInventory")}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-primary px-6 py-3 flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          {t("addProduct")}
        </Link>
      </div>

      {/* Filters bar */}
      <div className="solid-card bg-white p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("search") || "Search..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-900 uppercase tracking-widest text-xs"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-900 hover:text-red-600 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-slate-900 uppercase tracking-widest text-xs appearance-none"
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {language === "kh" ? cat.nameKhmer || cat.name : cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="solid-card bg-white overflow-hidden p-0 flex flex-col">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary border-b-2 border-slate-900">
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("productInfo")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("category")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("price")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("status")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-900">
                {products.map((product) => (
                  <tr key={product.id} className="group hover:bg-primary/5 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-900 shadow-hard transition-transform">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-900">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase">
                            {language === "kh" ? product.nameKhmer || product.name : product.name}
                          </h4>
                          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">#{product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-900 bg-white border-2 border-slate-900 px-3 py-1.5 uppercase tracking-widest shadow-hard">
                        {(() => {
                          const cat = categories.find(c => c.id === product.categoryId);
                          if (!cat) return t("general");
                          return language === "kh" ? cat.nameKhmer || cat.name : cat.name;
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 tracking-wider">{formatPrice(product.price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 border-2 border-slate-900 bg-emerald-500 shadow-hard" />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t("inStock")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-2 bg-white text-slate-900 border-2 border-transparent hover:border-slate-900 hover:shadow-hard transition-all"
                          title="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product.slug}`}
                          className="p-2 bg-white text-blue-600 border-2 border-transparent hover:border-slate-900 hover:shadow-hard transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id, product.name)}
                          className="p-2 bg-white text-red-600 border-2 border-transparent hover:border-slate-900 hover:shadow-hard-red transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-slate-200 mb-4" />
                        <p className="text-slate-400 font-medium italic">No products found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-between">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border-2 border-slate-900 font-bold text-xs uppercase tracking-widest shadow-hard hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {t("previous") || "Previous"}
            </button>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border-2 border-slate-900 font-bold text-xs uppercase tracking-widest shadow-hard hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {t("next") || "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
