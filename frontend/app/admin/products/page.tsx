"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../../../lib/supabase/client"
import { logActivity } from "../../../lib/audit"
import { Plus, Eye, Edit, Trash2, Search, Filter, Package, ChevronRight, MoreHorizontal } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [search, selectedCategory])

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await supabase
      .from("Category")
      .select("*")
      .order("sortOrder", { ascending: true })
    setCategories(data || [])
  }

  async function fetchProducts() {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from("Product")
      .select("*")
      .order("createdAt", { ascending: false })
    
    if (search) {
      query = query.ilike("name", `%${search}%`)
    }
    if (selectedCategory) {
      query = query.eq("categoryId", selectedCategory)
    }
    
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
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
        fetchProducts()
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("products")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("manageProductInventory")}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t("addProduct")}
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchProducts")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700 text-sm outline-none"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-700 text-sm appearance-none outline-none"
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t("productInfo")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t("category")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t("price")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{t("status")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="group hover:bg-slate-50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 shadow-sm transition-transform">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : product.thumbnail ? (
                            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {language === "kh" ? product.nameKhmer || product.name : product.name}
                          </h4>
                          <p className="text-[10px] font-medium text-slate-400 mt-0.5 tracking-tight">#{product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                        {(() => {
                          const cat = categories.find(c => c.id === product.categoryId);
                          if (!cat) return t("general");
                          return language === "kh" ? cat.nameKhmer || cat.name : cat.name;
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{formatPrice(product.price)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-slate-600">{t("inStock")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                          title="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product.slug}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id, product.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
      </div>
    </div>
  )
}
