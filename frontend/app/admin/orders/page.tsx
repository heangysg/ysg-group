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
  Package
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

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
      default: return "bg-slate-50 text-slate-900 border-slate-900"
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
        <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Loading Transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{t("orders")}</h1>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{t("manageOrders")}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
      </div>

      <div className="solid-card bg-white overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-primary border-b-2 border-slate-900">
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("orderId")}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("customer")}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("date")}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("amount")}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("status")}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-900">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">No orders found</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="group hover:bg-primary/5 transition-all duration-200">
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm uppercase tracking-widest">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{order.customerName || "Customer"}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-widest">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm tracking-wider">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 border-2 shadow-hard text-xs font-bold uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {t(order.status || "pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 bg-white text-slate-900 border-2 border-transparent hover:border-slate-900 hover:shadow-hard transition-all"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-start md:items-center justify-center p-4 overflow-y-auto">
          <div className="relative solid-card bg-white w-full max-w-4xl p-0 flex flex-col md:flex-row my-8 md:my-0 md:max-h-[90vh] md:overflow-hidden animate-in zoom-in-95 duration-200 shrink-0">
            {/* Left: Info */}
            <div className="flex-1 p-5 md:p-8 md:overflow-y-auto custom-scrollbar">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 pr-12 md:pr-0">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-tight leading-snug">{t("orderId")} <br className="md:hidden" />#{selectedOrder.id.slice(0, 8)}</h2>
                  <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className={`self-start px-4 py-2 border-2 shadow-hard text-xs font-bold uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                  {t(selectedOrder.status || "pending")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("customerInfo")}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-900">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-900">
                      <Mail className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-900">
                      <Phone className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{selectedOrder.customerPhone || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("shippingAddress")}</h3>
                  <div className="flex gap-3 text-slate-900">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider leading-relaxed">
                      {selectedOrder.address || "Local Pickup / Address not provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t("orderItems")}</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-900 shadow-hard">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-900" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{item.name}</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t("qty")}: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 tracking-wider">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="mt-8 flex justify-between items-center p-6 bg-primary border-2 border-slate-900 shadow-hard">
                    <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t("totalAmount")}</span>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full md:w-80 bg-slate-50 border-t-2 md:border-t-0 md:border-l-2 border-slate-900 p-5 md:p-8 flex flex-col md:overflow-y-auto custom-scrollbar">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 md:static md:self-end md:mb-8 p-2 bg-white border-2 border-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all z-10"
              >
                <X className="w-5 h-5 text-slate-900" />
              </button>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{t("updateStatus")}</h3>
              <div className="space-y-4 flex-1">
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
                    className={`w-full flex items-center gap-3 px-5 py-4 border-2 shadow-hard font-bold text-xs uppercase tracking-widest transition-all hover:translate-y-1 hover:translate-x-1 hover:shadow-none ${
                      selectedOrder.status === status.id 
                        ? `${status.bg} ${status.color} ${status.border}` 
                        : "bg-white text-slate-900 border-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <status.icon className="w-4 h-4" />
                    <span>{t(status.id)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
