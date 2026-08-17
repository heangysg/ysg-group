"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "../../../contexts/LanguageContext"
import { 
  ShoppingBag, 
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
  Calendar,
  X,
  MoreVertical,
  ChevronRight,
  Package,
  Printer,
  ExternalLink
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import Portal from "../../../components/Portal"

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { t, language } = useLanguage()

  useEffect(() => {
    fetchOrders(1)
  }, [])

  useEffect(() => {
    fetchOrders(currentPage)
  }, [currentPage])

  useEffect(() => {
    setCurrentPage(1)
    fetchOrders(1)
  }, [search])

  async function fetchOrders(page: number) {
    setLoading(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem("ysg_admin_token")
    const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    
    const pageSize = 10
    const start = (page - 1) * pageSize
    
    const body: any = {
      table: "Order",
      countExact: true,
      neq: { status: "pending" },
      order: { column: "createdAt", ascending: false },
      limit: pageSize,
      offset: start
    }

    if (search) {
      body.or = `customerName.ilike.%${search}%,customerPhone.ilike.%${search}%,customerEmail.ilike.%${search}%`
    }

    const res = await fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify(body) })
    const result = await res.json()

    if (result.error) {
      console.error("Orders Fetch Error Details:", result.error)
    } else {
      setOrders(result.data || [])
      if (result.count !== null) {
        setTotalPages(Math.ceil(result.count / pageSize) || 1)
      }
    }
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem("ysg_admin_token")
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const res = await fetch(`${API_URL}/api/admin/crud`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ table: "Order", action: "update", match: { id: orderId }, data: { status } })
    })
    
    if (!res.ok) {
      toast.error("Error updating status")
    } else {
      toast.success("Order status updated")
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, status })
      fetchOrders(currentPage)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-900 border-amber-900"
      case "confirmed": return "bg-blue-50 text-blue-900 border-blue-900"
      case "shipping": return "bg-indigo-50 text-indigo-900 border-indigo-900"
      case "completed": return "bg-emerald-50 text-emerald-900 border-emerald-900"
      case "cancelled": return "bg-red-50 text-red-900 border-red-900"
      default: return "bg-slate-50 text-slate-900 border-slate-200"
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-400 font-medium text-xs font-medium">Loading Transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold uppercase text-slate-900">{t("orders")}</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">{t("manageOrders")}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("search") || "Search..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-slate-900 font-medium text-xs"
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
      </div>

      <div className="solid-card bg-white overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary text-white border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("orderId")}</th>
                <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("customer")}</th>
                <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("date")}</th>
                <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("amount")}</th>
                <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("status")}</th>
                <th className="px-6 py-4 text-xs font-bold text-white font-medium text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-900">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center font-bold text-slate-500 font-medium text-xs">No orders found</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="group hover:bg-primary/5 transition-all duration-200">
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm font-medium">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{order.customerName || "Customer"}</p>
                    <p className="text-xs text-slate-500 font-medium">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm tracking-wider">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 border-2 shadow-sm text-xs font-bold font-medium ${getStatusColor(order.status)}`}>
                      {t(order.status || "pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-white text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs font-medium shadow-sm hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {t("previous") || "Previous"}
            </button>
            <span className="text-xs font-bold text-slate-900 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs font-medium shadow-sm hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
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
            <div className="relative solid-card bg-white w-full max-w-4xl p-0 flex flex-col md:flex-row my-auto max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 shrink-0 shadow-xl">
              {/* Left: Info */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
                {/* Header Row */}
                <div className="flex flex-col gap-3 mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-snug">
                        {t("orderId")} #{selectedOrder.id.slice(0, 8)}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {/* Close Button on Mobile */}
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="md:hidden p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-all shrink-0"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions & Status row */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <button
                      onClick={() => window.open(`/orders/${selectedOrder.id}/invoice`, '_blank')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-2xs transition-all cursor-pointer whitespace-nowrap rounded-md"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="whitespace-nowrap">{language === "kh" ? "វិក្កយបត្រ (Invoice)" : "Print Invoice"}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                    <div className={`px-3 py-1 border shadow-2xs text-xs font-semibold whitespace-nowrap rounded-md ${getStatusColor(selectedOrder.status)}`}>
                      {t(selectedOrder.status || "pending")}
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-5">
                  <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("customerInfo")}</h3>
                    <div className="space-y-1.5 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-slate-900">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-bold text-slate-900 break-words">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-medium break-all text-slate-700">{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="font-medium text-slate-700">{selectedOrder.customerPhone || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-lg border border-slate-200/80">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("shippingAddress")}</h3>
                    <div className="flex gap-2 text-slate-900 text-xs sm:text-sm">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                      <span className="font-medium text-slate-800 leading-relaxed break-words">
                        {selectedOrder.address || "Local Pickup / Address not provided"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("orderItems")}</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 border border-slate-200 shadow-2xs rounded-lg gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 rounded">
                            {item.image ? (
                              <img src={item.image.includes('cloudinary.com') ? item.image.replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-slate-900" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{t("qty")}: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-wider shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="mt-3 flex justify-between items-center p-3.5 sm:p-4 bg-primary text-white border border-slate-200 shadow-2xs rounded-lg">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{t("totalAmount")}</span>
                      <span className="text-lg sm:text-xl font-bold text-white">{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="w-full md:w-60 lg:w-64 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-4 sm:p-5 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
                <div className="flex items-center justify-between md:mb-4 mb-2.5">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("updateStatus")}</h3>
                  {/* Desktop close button */}
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="hidden md:flex p-1 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-all text-slate-700"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 flex-1">
                  {[
                    { id: "pending", icon: Clock, color: "text-amber-900", border: "border-amber-900", bg: "bg-amber-50" },
                    { id: "confirmed", icon: CheckCircle2, color: "text-blue-900", border: "border-blue-900", bg: "bg-blue-50" },
                    { id: "shipping", icon: Truck, color: "text-indigo-900", border: "border-indigo-900", bg: "bg-indigo-50" },
                    { id: "completed", icon: CheckCircle2, color: "text-emerald-900", border: "border-emerald-900", bg: "bg-emerald-50" },
                    { id: "cancelled", icon: XCircle, color: "text-red-900", border: "border-red-900", bg: "bg-red-50" },
                  ].map((status) => (
                    <button
                      key={status.id}
                      onClick={() => updateOrderStatus(selectedOrder.id, status.id)}
                      className={`flex items-center justify-center md:justify-start gap-2 px-3 py-2 border shadow-2xs font-semibold text-xs transition-all hover:translate-y-0.5 whitespace-nowrap rounded-md ${
                        selectedOrder.status === status.id 
                          ? `${status.bg} ${status.color} ${status.border}` 
                          : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <status.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="whitespace-nowrap">{t(status.id)}</span>
                    </button>
                  ))}
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
