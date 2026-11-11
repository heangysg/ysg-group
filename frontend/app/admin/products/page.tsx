"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { logActivity } from "../../../lib/audit"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Package,
  X,
  FileSpreadsheet,
  Star,
  AlertTriangle
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"
import ExcelImportModal from "../../../components/ExcelImportModal"
import Portal from "../../../components/Portal"
import { getAdminHeaders, formatUsd } from "../../../lib/adminAnalytics"

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const { t, language } = useLanguage()
  const isKh = language === "kh"

  const fetchProducts = useCallback(async (page: number) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const headers = getAdminHeaders()
    const pageSize = 10
    const start = (page - 1) * pageSize

    const body: any = {
      table: "Product",
      countExact: true,
      order: { column: "createdAt", ascending: false },
      limit: pageSize,
      offset: start,
      eq: { isActive: true },
    }

    if (search.trim()) {
      const q = search.trim()
      body.or = `name.ilike.%${q}%,nameKhmer.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%,sku.ilike.%${q}%`
    }
    if (selectedCategory) {
      body.eq.categoryId = selectedCategory
    }

    if (statusFilter === "published") {
      body.eq.isPublished = true
    } else if (statusFilter === "hidden") {
      body.eq.isPublished = false
    } else if (statusFilter === "featured") {
      body.eq.isFeatured = true
    }

    if (stockFilter === "in_stock") {
      body.gte = { stock: 6 }
    } else if (stockFilter === "low_stock") {
      body.gte = { stock: 1 }
      body.lte = { stock: 5 }
    } else if (stockFilter === "out_of_stock") {
      body.lte = { stock: 0 }
    }

    const res = await fetch(`${API_URL}/api/admin/read`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    const { data, count } = await res.json()
    setProducts(data || [])
    if (count !== null && count !== undefined) {
      setTotalCount(count)
      setTotalPages(Math.max(1, Math.ceil(count / pageSize)))
    }
  }, [search, selectedCategory, statusFilter, stockFilter])

  useEffect(() => {
    async function initialFetch() {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const headers = getAdminHeaders()
      try {
        const catRes = await fetch(`${API_URL}/api/admin/read`, {
          method: "POST",
          headers,
          body: JSON.stringify({ table: "Category", order: { column: "sortOrder", ascending: true } }),
        }).then((r) => r.json())
        setCategories(catRes.data || [])
        await fetchProducts(1)
      } catch (err) {
        console.error("Initial Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }
    initialFetch()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    if (!loading) {
      fetchProducts(1)
    }
  }, [search, selectedCategory, statusFilter, stockFilter])

  useEffect(() => {
    if (!loading) {
      fetchProducts(currentPage)
    }
  }, [currentPage])

  async function deleteProduct(id: string, name: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const res = await fetch(`${API_URL}/api/admin/crud`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({
        table: "Product",
        action: "update",
        match: { id },
        data: { isActive: false },
      }),
    })
    setDeleteConfirm(null)
    if (!res.ok) {
      toast.error("Failed to move product to trash")
    } else {
      await logActivity({ action: "delete", entityType: "product", entityId: id, details: { name, type: "soft_delete" } })
      toast.success(isKh ? "បានផ្លាស់ទីទៅធុងសំរាម" : "Product moved to trash")
      fetchProducts(currentPage)
    }
  }

  async function toggleVisibility(id: string, currentStatus: boolean, name: string) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const newStatus = !currentStatus

    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isPublished: newStatus } : p)))

    const res = await fetch(`${API_URL}/api/admin/crud`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({
        table: "Product",
        action: "update",
        match: { id },
        data: { isPublished: newStatus },
      }),
    })

    if (!res.ok) {
      toast.error("Failed to update status")
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isPublished: currentStatus } : p)))
    } else {
      await logActivity({
        action: "update",
        entityType: "product",
        entityId: id,
        details: { name, status: newStatus ? "published" : "hidden" },
      })
      toast.success(newStatus ? (isKh ? "បានផ្សព្វផ្សាយ" : "Product published") : (isKh ? "បានលាក់" : "Product hidden"))
    }
  }

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedProducts(products.map((p) => p.id))
    else setSelectedProducts([])
  }

  const toggleSelect = (id: string) => {
    if (selectedProducts.includes(id)) setSelectedProducts(selectedProducts.filter((pId) => pId !== id))
    else setSelectedProducts([...selectedProducts, id])
  }

  const handleBulkAction = async (action: "delete" | "publish" | "unpublish") => {
    if (selectedProducts.length === 0) return

    setBulkActionLoading(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const headers = getAdminHeaders()
    let successCount = 0

    try {
      await Promise.all(
        selectedProducts.map((id) => {
          const payload =
            action === "delete"
              ? { table: "Product", action: "update", match: { id }, data: { isActive: false } }
              : { table: "Product", action: "update", match: { id }, data: { isPublished: action === "publish" } }

          return fetch(`${API_URL}/api/admin/crud`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          }).then((r) => {
            if (r.ok) successCount++
          })
        })
      )

      toast.success(`${successCount} ${isKh ? "ផលិតផលត្រូវបានកែប្រែ" : action === "delete" ? "products moved to trash" : "products updated"}`)
      setSelectedProducts([])
      setBulkDeleteOpen(false)
      fetchProducts(currentPage)
    } catch {
      toast.error("Bulk action failed")
    } finally {
      setBulkActionLoading(false)
    }
  }

  const getStockBadge = (stockVal: number) => {
    const qty = Number(stockVal ?? 0)
    if (qty <= 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          {isKh ? "អស់ស្តុក (0)" : "Out of Stock (0)"}
        </span>
      )
    }
    if (qty <= 5) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
          <AlertTriangle className="w-3 h-3" />
          {isKh ? `ស្តុកទាប (${qty})` : `Low Stock (${qty})`}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        {isKh ? `មានស្តុក (${qty})` : `In Stock (${qty})`}
      </span>
    )
  }

  const selectedProductsData = products.filter((p) => selectedProducts.includes(p.id))
  const allSelectedPublished = selectedProductsData.length > 0 && selectedProductsData.every((p) => p.isPublished !== false)
  const allSelectedHidden = selectedProductsData.length > 0 && selectedProductsData.every((p) => p.isPublished === false)

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t("products")}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {totalCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-800 mt-1">{t("manageProductInventory")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/trash"
            className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs font-bold hover:border-red-300 hover:text-red-600 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            {isKh ? "ធុងសំរាម" : "Trash"}
          </Link>
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 text-white border border-emerald-700 rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs font-bold hover:bg-emerald-700 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {isKh ? "បញ្ចូល (Excel)" : "Import Excel"}
          </button>
          <Link
            href="/admin/products/new"
            className="btn-primary px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            {t("addProduct")}
          </Link>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-primary text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-white text-primary font-bold text-xs rounded-lg shadow-sm">
              {selectedProducts.length}
            </span>
            <span className="font-bold text-sm text-white">
              {isKh ? "ផលិតផលត្រូវបានជ្រើសរើស" : "Selected Products"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {!allSelectedPublished && (
              <button
                onClick={() => handleBulkAction("publish")}
                disabled={bulkActionLoading}
                className="px-3.5 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-sm hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                {isKh ? "ផ្សព្វផ្សាយ" : "Publish"}
              </button>
            )}
            {!allSelectedHidden && (
              <button
                onClick={() => handleBulkAction("unpublish")}
                disabled={bulkActionLoading}
                className="px-3.5 py-2 bg-white/15 text-white border border-white/25 font-bold text-xs rounded-xl hover:bg-white/25 transition-all disabled:opacity-50"
              >
                {isKh ? "លាក់" : "Unpublish"}
              </button>
            )}
            <button
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkActionLoading}
              className="px-3.5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl border border-red-400/50 shadow-sm hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {isKh ? "លុប" : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          <input
            type="text"
            placeholder={isKh ? "ស្វែងរកតាម ឈ្មោះ ម៉ាក ម៉ូដែល ឬ SKU..." : "Search by name, brand, model, or SKU..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-medium text-slate-900 text-xs sm:text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-700 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-xs"
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {isKh ? cat.nameKhmer || cat.name : cat.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full lg:w-40 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-xs"
          >
            <option value="all">{isKh ? "ស្ថានភាពទាំងអស់" : "All Status"}</option>
            <option value="published">{isKh ? "បានផ្សព្វផ្សាយ" : "Published"}</option>
            <option value="hidden">{isKh ? "បានលាក់" : "Hidden"}</option>
            <option value="featured">{isKh ? "ផលិតផលលេចធ្លោ" : "Featured"}</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full lg:w-40 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none font-bold text-slate-700 text-xs"
          >
            <option value="all">{isKh ? "ស្តុកទាំងអស់" : "All Stock"}</option>
            <option value="in_stock">{isKh ? "មានស្តុក (>5)" : "In Stock (>5)"}</option>
            <option value="low_stock">{isKh ? "ស្តុកទាប (1-5)" : "Low Stock (1-5)"}</option>
            <option value="out_of_stock">{isKh ? "អស់ស្តុក (0)" : "Out of Stock (0)"}</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white overflow-hidden flex flex-col border border-slate-200 shadow-sm rounded-2xl">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-slate-800 font-bold text-xs">{t("loading")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary border-b border-slate-200">
                  <th className="px-5 py-3.5 w-12">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-white cursor-pointer rounded"
                      checked={products.length > 0 && selectedProducts.length === products.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{t("productInfo")}</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{t("category")}</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{t("price")}</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{isKh ? "ស្តុក & ស្ថានភាព" : "Inventory & Status"}</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider text-right">{t("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="group hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary cursor-pointer rounded"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          {product.thumbnail ? (
                            <img
                              src={
                                product.thumbnail.includes("cloudinary.com")
                                  ? product.thumbnail.replace("/upload/f_auto,q_auto/", "/upload/w_300,c_fill,f_auto,q_auto/")
                                  : product.thumbnail
                              }
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/products/edit/${product.slug}`}
                              className="text-sm font-bold text-slate-900 hover:text-primary transition-colors truncate max-w-[260px]"
                            >
                              {isKh ? product.nameKhmer || product.name : product.name}
                            </Link>
                            {product.isFeatured && (
                              <span title={isKh ? "ផលិតផលលេចធ្លោ" : "Featured"} className="text-amber-500 shrink-0">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                            {product.sku ? `SKU: ${product.sku}` : `#${product.id.slice(0, 8)}`}
                            {product.brand ? ` • ${product.brand}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                        {(() => {
                          const cat = categories.find((c) => c.id === product.categoryId)
                          if (!cat) return t("general")
                          return isKh ? cat.nameKhmer || cat.name : cat.name
                        })()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-black text-slate-900">{formatUsd(product.price, 2)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-2 items-start">
                        {getStockBadge(product.stock)}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleVisibility(product.id, product.isPublished !== false, product.name)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                              product.isPublished !== false ? "bg-primary" : "bg-slate-300"
                            }`}
                            title={product.isPublished !== false ? "Click to Hide" : "Click to Publish"}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                                product.isPublished !== false ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className={`text-[11px] font-bold ${product.isPublished !== false ? "text-primary" : "text-slate-700"}`}>
                            {product.isPublished !== false ? (isKh ? "បានផ្សព្វផ្សាយ" : "Published") : (isKh ? "បានលាក់" : "Hidden")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-2 bg-white text-slate-800 rounded-lg border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-all"
                          title="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/edit/${product.slug}`}
                          className="p-2 bg-white text-blue-600 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                          className="p-2 bg-white text-red-600 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-all"
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
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="w-12 h-12 text-slate-200 mb-3" />
                        <p className="text-slate-700 font-bold text-sm">
                          {isKh ? "រកមិនឃើញផលិតផលទេ" : "No products found"}
                        </p>
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
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              {t("previous") || "Previous"}
            </button>
            <span className="text-xs font-bold text-slate-700">
              {isKh ? `ទំព័រ ${currentPage} នៃ ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
            >
              {t("next") || "Next"}
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{isKh ? "លុបផលិតផល" : "Delete Product"}</h3>
                  <p className="text-sm text-slate-800 mt-1 leading-relaxed">
                    {isKh ? (
                      <>តើអ្នកប្រាកដថាចង់លុប <strong>"{deleteConfirm.name}"</strong> មែនទេ? ផលិតផលនេះនឹងត្រូវបានផ្លាស់ទីទៅធុងសំរាម។</>
                    ) : (
                      <>Move <strong>"{deleteConfirm.name}"</strong> to trash?</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => deleteProduct(deleteConfirm.id, deleteConfirm.name)}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
                >
                  {isKh ? "លុប (ទៅធុងសំរាម)" : "Move to Trash"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteOpen && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-5 shadow-2xl border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{isKh ? "លុបផលិតផលច្រើន" : "Bulk Delete Products"}</h3>
                  <p className="text-sm text-slate-800 mt-1">
                    {isKh
                      ? `តើអ្នកប្រាកដថាចង់ផ្លាស់ទី ${selectedProducts.length} ផលិតផលទៅធុងសំរាមមែនទេ?`
                      : `Move ${selectedProducts.length} selected products to trash?`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setBulkDeleteOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={bulkActionLoading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {isKh ? "លុបទាំងអស់" : "Move All to Trash"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {importModalOpen && (
        <ExcelImportModal
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            fetchProducts(1)
            toast.success("Products updated!")
          }}
        />
      )}
      <Toaster position="top-right" />
    </div>
  )
}
