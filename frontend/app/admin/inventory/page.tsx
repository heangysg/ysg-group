"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  Boxes,
  Search,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Plus,
  Minus,
  Save,
  Edit,
  X,
  Package
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"
import { logActivity } from "../../../lib/audit"
import { getAdminHeaders, formatUsd } from "../../../lib/adminAnalytics"

type StockTab = "all" | "out" | "low" | "healthy"

export default function AdminInventoryPage() {
  const { language } = useLanguage()
  const isKh = language === "kh"

  const [products, setProducts] = useState<any[]>([])
  const [draftStocks, setDraftStocks] = useState<Record<string, number>>({})
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({})
  const [savingAll, setSavingAll] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<StockTab>("all")

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    try {
      const res = await fetch(`${API_URL}/api/admin/read`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          table: "Product",
          eq: { isActive: true },
          order: { column: "stock", ascending: true },
          limit: 500,
        }),
      })
      const json = await res.json()
      if (res.ok && !json.error) {
        setProducts(json.data || [])
        setDraftStocks({})
      } else {
        toast.error(json.error || "Failed to load inventory")
      }
    } catch {
      toast.error("Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const getEffectiveStock = (p: any) =>
    draftStocks[p.id] !== undefined ? draftStocks[p.id] : Number(p.stock ?? 0)

  const setItemDraft = (id: string, nextVal: number) => {
    const clamped = Math.max(0, Math.floor(Number.isFinite(nextVal) ? nextVal : 0))
    setDraftStocks((prev) => ({ ...prev, [id]: clamped }))
  }

  const changedProducts = useMemo(
    () =>
      products.filter(
        (p) => draftStocks[p.id] !== undefined && draftStocks[p.id] !== Number(p.stock ?? 0)
      ),
    [products, draftStocks]
  )

  const saveSingleStock = async (product: any) => {
    const newQty = getEffectiveStock(product)
    const oldQty = Number(product.stock ?? 0)
    if (newQty === oldQty) return

    setSavingIds((prev) => ({ ...prev, [product.id]: true }))
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    try {
      const res = await fetch(`${API_URL}/api/admin/crud`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          table: "Product",
          action: "update",
          match: { id: product.id },
          data: { stock: newQty, updatedAt: new Date().toISOString() },
        }),
      })
      if (!res.ok) throw new Error("Failed")

      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: newQty } : p)))
      setDraftStocks((prev) => {
        const copy = { ...prev }
        delete copy[product.id]
        return copy
      })
      await logActivity({
        action: "update",
        entityType: "product",
        entityId: product.id,
        details: { name: product.name, sku: product.sku, oldStock: oldQty, newStock: newQty },
      })
      toast.success(isKh ? `បានកែស្តុក "${product.nameKhmer || product.name}" ទៅ ${newQty}` : `Updated stock to ${newQty}`)
    } catch {
      toast.error(isKh ? "កែប្រែស្តុកមិនបានជោគជ័យ" : "Failed to update stock")
    } finally {
      setSavingIds((prev) => ({ ...prev, [product.id]: false }))
    }
  }

  const saveAllChanges = async () => {
    if (changedProducts.length === 0) return
    setSavingAll(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const headers = getAdminHeaders()
    let updated = 0

    try {
      await Promise.all(
        changedProducts.map(async (p) => {
          const newQty = draftStocks[p.id]
          const res = await fetch(`${API_URL}/api/admin/crud`, {
            method: "POST",
            headers,
            body: JSON.stringify({
              table: "Product",
              action: "update",
              match: { id: p.id },
              data: { stock: newQty, updatedAt: new Date().toISOString() },
            }),
          })
          if (res.ok) updated++
        })
      )
      toast.success(isKh ? `បានរក្សាទុកស្តុក ${updated} មុខទំនិញ` : `Saved ${updated} stock updates`)
      await fetchInventory()
    } catch {
      toast.error("Failed to save some stock updates")
    } finally {
      setSavingAll(false)
    }
  }

  const summary = useMemo(() => {
    let totalUnits = 0
    let totalValue = 0
    let outCount = 0
    let lowCount = 0
    let healthyCount = 0

    for (const p of products) {
      const qty = Math.max(0, Number(p.stock ?? 0))
      const price = Math.max(0, Number(p.price ?? 0))
      totalUnits += qty
      totalValue += qty * price
      if (qty <= 0) outCount++
      else if (qty <= 5) lowCount++
      else healthyCount++
    }
    return { totalSkus: products.length, totalUnits, totalValue, outCount, lowCount, healthyCount }
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      const qty = Number(p.stock ?? 0)
      if (tab === "out" && qty > 0) return false
      if (tab === "low" && (qty <= 0 || qty > 5)) return false
      if (tab === "healthy" && qty <= 5) return false

      if (!q) return true
      return (
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.nameKhmer || "").toLowerCase().includes(q) ||
        String(p.sku || "").toLowerCase().includes(q) ||
        String(p.brand || "").toLowerCase().includes(q) ||
        String(p.model || "").toLowerCase().includes(q)
      )
    })
  }, [products, search, tab])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Boxes className="w-7 h-7 text-primary" />
            {isKh ? "ការគ្រប់គ្រងស្តុកទំនិញ" : "Stock & Inventory Management"}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-800 mt-1">
            {isKh
              ? "តាមដាន និងកែសម្រួលចំនួនស្តុកផលិតផលភ្លាមៗ (កាត់ស្តុកស្វ័យប្រវត្តិពេលបង់ប្រាក់រួច)"
              : "Monitor stock levels and restock products quickly (auto-deducted on paid orders)"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {changedProducts.length > 0 && (
            <button
              type="button"
              onClick={saveAllChanges}
              disabled={savingAll}
              className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {savingAll
                ? isKh ? "កំពុងរក្សាទុក..." : "Saving..."
                : isKh
                ? `រក្សាទុកទាំងអស់ (${changedProducts.length})`
                : `Save All (${changedProducts.length})`}
            </button>
          )}
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-2 hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isKh ? "បន្ថែមផលិតផល" : "Add Product"}
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800">
              {isKh ? "ស្តុកសរុប (គ្រឿង)" : "Total Units"}
            </span>
            <Boxes className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.totalUnits.toLocaleString()}</p>
          <p className="text-[11px] font-semibold text-slate-700 mt-1">
            {summary.totalSkus} SKU • {formatUsd(summary.totalValue, 0)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800">
              {isKh ? "ស្តុកគ្រប់គ្រាន់ (>5)" : "In Stock (>5)"}
            </span>
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{summary.healthyCount}</p>
          <p className="text-[11px] font-semibold text-slate-700 mt-1">{isKh ? "មុខទំនិញ" : "products"}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800">
              {isKh ? "ស្តុកទាប (1-5)" : "Low Stock (1-5)"}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{summary.lowCount}</p>
          <p className="text-[11px] font-semibold text-slate-700 mt-1">{isKh ? "គួរបន្ថែមស្តុក" : "need restock"}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800">
              {isKh ? "អស់ស្តុក (0)" : "Out of Stock (0)"}
            </span>
            <PackageX className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600">{summary.outCount}</p>
          <p className="text-[11px] font-semibold text-slate-700 mt-1">{isKh ? "មិនមានក្នុងស្តុក" : "unavailable"}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {[
            { id: "all" as StockTab, label: isKh ? `ទាំងអស់ (${summary.totalSkus})` : `All (${summary.totalSkus})` },
            { id: "out" as StockTab, label: isKh ? `អស់ស្តុក (${summary.outCount})` : `Out of Stock (${summary.outCount})` },
            { id: "low" as StockTab, label: isKh ? `ស្តុកទាប (${summary.lowCount})` : `Low Stock (${summary.lowCount})` },
            { id: "healthy" as StockTab, label: isKh ? `ស្តុកល្អ (${summary.healthyCount})` : `Healthy (${summary.healthyCount})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                tab === item.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isKh ? "ស្វែងរកតាម ឈ្មោះ ឬ SKU..." : "Search product or SKU..."}
            className="w-full h-10 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none text-xs sm:text-sm font-medium text-slate-900"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-700 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="w-9 h-9 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary text-white border-b border-slate-200">
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">{isKh ? "ផលិតផល" : "Product"}</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">SKU</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">{isKh ? "តម្លៃ" : "Price"}</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">{isKh ? "ស្ថានភាពស្តុក" : "Status"}</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider">{isKh ? "កែចំនួនស្តុក" : "Adjust Stock"}</th>
                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-right">{isKh ? "សកម្មភាព" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-xs font-bold text-slate-700">
                      {isKh ? "មិនមានទំនិញក្នុងបញ្ជីនេះទេ" : "No products match this stock filter"}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const effective = getEffectiveStock(p)
                    const currentSaved = Number(p.stock ?? 0)
                    const isDirty = effective !== currentSaved
                    const isSaving = !!savingIds[p.id]

                    return (
                      <tr key={p.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                              {p.thumbnail ? (
                                <img src={p.thumbnail} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-700">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[240px]">
                                {isKh ? p.nameKhmer || p.name : p.name}
                              </p>
                              <p className="text-[11px] text-slate-700 font-medium">{p.brand || "-"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-bold text-slate-800">
                          {p.sku || `#${String(p.id).slice(0, 8)}`}
                        </td>
                        <td className="px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-900">
                          {formatUsd(p.price, 2)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              currentSaved <= 0
                                ? "bg-red-100 text-red-700"
                                : currentSaved <= 5
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {currentSaved <= 0
                              ? isKh ? "អស់ស្តុក" : "Out of Stock"
                              : currentSaved <= 5
                              ? isKh ? "ស្តុកទាប" : "Low Stock"
                              : isKh ? "មានស្តុក" : "In Stock"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => setItemDraft(p.id, effective - 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={effective}
                              onChange={(e) => setItemDraft(p.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-7 text-center text-xs font-black text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => setItemDraft(p.id, effective + 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            {isDirty && (
                              <button
                                type="button"
                                onClick={() => saveSingleStock(p)}
                                disabled={isSaving}
                                className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 flex items-center gap-1 shadow-sm disabled:opacity-50"
                              >
                                <Save className="w-3.5 h-3.5" />
                                {isSaving ? "..." : isKh ? "រក្សាទុក" : "Save"}
                              </button>
                            )}
                            <Link
                              href={`/admin/products/edit/${p.slug}`}
                              className="p-2 bg-white text-slate-800 rounded-lg border border-slate-200 hover:border-primary hover:text-primary transition-all"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

