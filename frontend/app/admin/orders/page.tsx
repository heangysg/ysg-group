"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../../lib/supabase/client"
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
  const { t, language } = useLanguage()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const supabase = createClient()
    
    // Try "Order" table first
    let result = await supabase
      .from("Order")
      .select("*")
      .order("createdAt", { ascending: false })
    
    // Fallback to "Orders"
    if (result.error && (result.error.code === '42P01' || result.error.message?.includes('does not exist'))) {
       result = await supabase
        .from("Orders")
        .select("*")
        .order("createdAt", { ascending: false })
    }
    
    if (result.error) {
      console.error("Orders Fetch Error Details:", result.error)
    } else {
      setOrders(result.data || [])
    }
    setLoading(false)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("Order")
      .update({ status })
      .eq("id", orderId)
    
    if (error) {
      toast.error("Error updating status")
    } else {
      toast.success("Order status updated")
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, status })
      fetchOrders()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-600 border border-amber-100"
      case "confirmed": return "bg-blue-50 text-blue-600 border border-blue-100"
      case "shipping": return "bg-indigo-50 text-indigo-600 border border-indigo-100"
      case "completed": return "bg-emerald-50 text-emerald-600 border border-emerald-100"
      case "cancelled": return "bg-red-50 text-red-600 border border-red-100"
      default: return "bg-slate-50 text-slate-600 border border-slate-100"
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const filteredOrders = orders.filter(o => 
    (o.customerName || "").toLowerCase().includes(search.toLowerCase()) || 
    (o.customerEmail || "").toLowerCase().includes(search.toLowerCase()) || 
    (o.customerPhone || "").toLowerCase().includes(search.toLowerCase()) || 
    (o.status || "").toLowerCase().includes(search.toLowerCase()) || 
    o.id.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
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
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight">{t("orders")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("manageOrders")}</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("search") || "Search..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest">{t("orderId")}</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest">{t("customer")}</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest">{t("date")}</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest">{t("amount")}</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest">{t("status")}</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">No orders found</td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-slate-50 transition-all duration-200">
                  <td className="px-6 py-4 font-medium text-slate-900 text-sm">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{order.customerName || "Customer"}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 text-sm">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {t(order.status || "pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col md:flex-row max-h-[90vh]">
            {/* Left: Info */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-medium text-slate-900">{t("orderId")} #{selectedOrder.id.slice(0, 8)}</h2>
                  <p className="text-sm text-slate-400 mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-xs font-medium uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                  {t(selectedOrder.status || "pending")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest">{t("customerInfo")}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-600">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">{selectedOrder.customerPhone || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest">{t("shippingAddress")}</h3>
                  <div className="flex gap-3 text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium leading-relaxed">
                      {selectedOrder.shippingAddress || "Local Pickup / Address not provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest">{t("orderItems")}</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-400">{t("qty")}: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="mt-6 flex justify-between items-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <span className="text-sm font-medium text-slate-900">{t("totalAmount")}</span>
                    <span className="text-xl font-medium text-primary">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full md:w-72 bg-slate-50 border-l border-slate-200 p-8 flex flex-col">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="self-end p-2 hover:bg-slate-200 rounded-xl mb-6 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-6">{t("updateStatus")}</h3>
              <div className="space-y-3 flex-1">
                {[
                  { id: "pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
                  { id: "confirmed", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100" },
                  { id: "shipping", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-100" },
                  { id: "completed", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" },
                  { id: "cancelled", icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => updateOrderStatus(selectedOrder.id, status.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      selectedOrder.status === status.id 
                        ? `${status.bg} ${status.color} ring-2 ring-white shadow-md` 
                        : "bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <status.icon className="w-4 h-4" />
                    <span className="capitalize">{t(status.id)}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-4 mt-8 rounded-2xl bg-white border border-slate-200 text-slate-600 font-medium text-sm shadow-sm hover:bg-slate-50 transition-all"
              >
                {t("closeDetails")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
