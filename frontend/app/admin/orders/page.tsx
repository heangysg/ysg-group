"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
  Search,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  X,
  Package,
  Printer,
  ExternalLink
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import Portal from "../../../components/Portal"
import { getOptimizedImageUrl } from "../../../lib/imageUtils"
import {
  formatUsd,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  getAdminHeaders
} from "../../../lib/adminAnalytics"

const ORDER_TABS = [
  { id: "all", labelEn: "All Orders", labelKh: "ទាំងអស់" },
  { id: "paid", labelEn: "Paid", labelKh: "បានបង់ប្រាក់" },
  { id: "pending", labelEn: "Pending (Unpaid)", labelKh: "មិនទាន់បង់" },
  { id: "confirmed", labelEn: "Confirmed", labelKh: "បានបញ្ជាក់" },
  { id: "shipping", labelEn: "Shipping", labelKh: "កំពុងដឹកជញ្ជូន" },
  { id: "completed", labelEn: "Completed", labelKh: "បានបញ្ចប់" },
  { id: "cancelled", labelEn: "Cancelled", labelKh: "បានបោះបង់" },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { t, language } = useLanguage()
  const isKh = language === "kh"

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(timer)
  }, [search])

  const fetchOrders = useCallback(async (page: number, activeStatus: string, searchTerm: string) => {
    setLoading(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const headers = getAdminHeaders()
    const pageSize = 10
    const start = (page - 1) * pageSize

    const body: any = {
      table: "Order",
      countExact: true,
      order: { column: "createdAt", ascending: false },
      limit: pageSize,
      offset: start,
    }

    if (activeStatus !== "all") {
      body.eq = { status: activeStatus }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim()
      body.or = `id.ilike.%${q}%,customerName.ilike.%${q}%,customerPhone.ilike.%${q}%,customerEmail.ilike.%${q}%`
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/read`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      })
      const result = await res.json()

      if (result.error) {
        console.error("Orders Fetch Error Details:", result.error)
      } else {
        setOrders(result.data || [])
        if (result.count !== null && result.count !== undefined) {
          setTotalCount(result.count)
          setTotalPages(Math.max(1, Math.ceil(result.count / pageSize)))
        }
      }
    } catch (err) {
      console.error("Orders Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders(currentPage, statusFilter, debouncedSearch)
  }, [currentPage, statusFilter, debouncedSearch, fetchOrders])

  const handleStatusTabChange = (nextStatus: string) => {
    setStatusFilter(nextStatus)
    setCurrentPage(1)
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    const res = await fetch(`${API_URL}/api/admin/crud`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ table: "Order", action: "update", match: { id: orderId }, data: { status } }),
    })

    if (!res.ok) {
      toast.error("Error updating status")
    } else {
      toast.success(isKh ? "បានកែប្រែស្ថានភាពការបញ្ជាទិញ" : "Order status updated")
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, status })
      fetchOrders(currentPage, statusFilter, search)
    }
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-700 font-medium text-xs">Loading Transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t("orders")}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {totalCount}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-800 mt-1">{t("manageOrders")}</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
          <input
            type="text"
            placeholder={isKh ? "ស្វែងរកតាម លេខកូដ ឈ្មោះ ឬ ទូរស័ព្ទ..." : "Search ID, name, phone, email..."}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-9 bg-white border border-slate-200 rounded-xl focus:border-primary outline-none transition-all font-medium text-slate-900 text-xs sm:text-sm shadow-sm"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-700 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {ORDER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleStatusTabChange(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === tab.id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-slate-800 border-slate-200 hover:border-primary/40 hover:text-slate-900"
            }`}
          >
            {isKh ? tab.labelKh : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white overflow-hidden border border-slate-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary text-white border-b border-slate-200">
                <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{t("orderId")}</th>
                <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{t("customer")}</th>
                <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{isKh ? "ការទូទាត់" : "Method"}</th>
                <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{t("date")}</th>
                <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{t("amount")}</th>
                <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider">{t("status")}</th>
                <th className="px-5 py-3.5 text-xs font-bold text-white uppercase tracking-wider text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center font-bold text-slate-700 text-xs sm:text-sm">
                    {isKh ? "មិនមានការបញ្ជាទិញទេ" : "No orders found"}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="group hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 text-xs sm:text-sm uppercase">
                      #{String(order.id).slice(0, 8)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-900">{order.customerName || "Customer"}</p>
                      <p className="text-[11px] text-slate-800 font-medium">{order.customerPhone || order.customerEmail || "-"}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <CreditCard className="w-3 h-3 text-slate-800" />
                        {order.paymentMethod || "Bakong"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs sm:text-sm font-medium text-slate-800">
                      {new Date(order.createdAt).toLocaleDateString(isKh ? "km-KH" : "en-US")}
                    </td>
                    <td className="px-5 py-3.5 font-black text-slate-900 text-xs sm:text-sm">
                      {formatUsd(order.totalAmount, 2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${getOrderStatusBadgeClass(order.status)}`}>
                        {getOrderStatusLabel(order.status || "pending", isKh, t)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrder(order)
                        }}
                        className="p-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:border-primary hover:text-primary transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-4xl p-0 flex flex-col md:flex-row my-auto max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 shrink-0 shadow-xl">
              {/* Left: Info */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-3 mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-snug">
                        {t("orderId")} #{String(selectedOrder.id).slice(0, 8)}
                      </h2>
                      <p className="text-xs text-slate-800 mt-0.5 font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="md:hidden p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all shrink-0"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <button
                      onClick={() => window.open(`/orders/${selectedOrder.id}/invoice`, "_blank")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer whitespace-nowrap rounded-lg"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                      <span>{isKh ? "វិក្កយបត្រ (Invoice)" : "Print Invoice"}</span>
                      <ExternalLink className="w-3 h-3 text-slate-700 shrink-0" />
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getOrderStatusBadgeClass(selectedOrder.status)}`}>
                      {getOrderStatusLabel(selectedOrder.status || "pending", isKh, t)}
                    </span>
                  </div>
                </div>

                {/* Customer & Shipping Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-5">
                  <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{t("customerInfo")}</h3>
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                        <span className="font-bold text-slate-900 break-words">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Mail className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                        <span className="font-medium break-all text-slate-700">{selectedOrder.customerEmail || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                        <span className="font-medium text-slate-700">{selectedOrder.customerPhone || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{t("shippingAddress")}</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 text-slate-900 text-xs sm:text-sm">
                        <MapPin className="w-3.5 h-3.5 text-slate-800 mt-0.5 shrink-0" />
                        <span className="font-medium text-slate-800 leading-relaxed break-words">
                          {selectedOrder.address || "Local Pickup / Address not provided"}
                        </span>
                      </div>
                      {selectedOrder.latitude && selectedOrder.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors font-bold text-xs rounded-lg w-fit"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          View on Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{t("orderItems")}</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 border border-slate-200 rounded-xl gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 rounded-lg">
                            {item.image ? (
                              <img
                                src={getOptimizedImageUrl(item.image, 'thumb')}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-slate-700" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-xs text-slate-800 font-medium">
                              {t("qty")}: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 shrink-0">
                          {formatUsd(item.price * item.quantity, 2)}
                        </span>
                      </div>
                    ))}
                    <div className="mt-3 flex justify-between items-center p-3.5 sm:p-4 bg-primary text-white rounded-xl">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{t("totalAmount")}</span>
                      <span className="text-lg sm:text-xl font-bold text-white">{formatUsd(selectedOrder.totalAmount, 2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Status Update Actions */}
              <div className="w-full md:w-60 lg:w-64 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-4 sm:p-5 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
                <div className="flex items-center justify-between md:mb-4 mb-2.5">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{t("updateStatus")}</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="hidden md:flex p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all text-slate-700"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 flex-1">
                  {[
                    { id: "pending", icon: Clock },
                    { id: "paid", icon: CreditCard },
                    { id: "confirmed", icon: CheckCircle2 },
                    { id: "shipping", icon: Truck },
                    { id: "completed", icon: CheckCircle2 },
                    { id: "cancelled", icon: XCircle },
                  ].map((st) => {
                    const active = String(selectedOrder.status || "").toLowerCase() === st.id
                    return (
                      <button
                        key={st.id}
                        onClick={() => updateOrderStatus(selectedOrder.id, st.id)}
                        className={`flex items-center justify-center md:justify-start gap-2 px-3 py-2.5 border font-bold text-xs transition-all rounded-xl ${
                          active
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-primary/40 hover:bg-slate-50"
                        }`}
                      >
                        <st.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{getOrderStatusLabel(st.id, isKh, t)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <Toaster position="top-right" />
    </div>
  )
}
