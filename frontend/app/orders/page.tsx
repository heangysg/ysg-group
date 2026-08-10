"use client"

import { useState } from "react"
import Link from "next/link"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Search, Package, Calendar, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function OrderTrackingPage() {
  const { language, t } = useLanguage()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      toast.error(language === "kh" ? "សូមបញ្ចូលលេខបញ្ជាទិញ ឬលេខទូរស័ព្ទ" : "Please enter an Order ID, Phone, or Email")
      return
    }

    setLoading(true)
    setSearched(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

    try {
      const res = await fetch(`${API_URL}/api/orders/user/${encodeURIComponent(trimmed)}`)
      if (res.ok) {
        const { data } = await res.json()
        setOrders(data || [])
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error("Order lookup error:", err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const s = (status || "").toUpperCase()
    if (s === "PAID" || s === "COMPLETED") return language === "kh" ? "បានទូទាត់ប្រាក់" : "Paid"
    if (s === "PENDING") return language === "kh" ? "រង់ចាំការផ្ទៀងផ្ទាត់" : "Pending Verification"
    if (s === "CANCELLED") return language === "kh" ? "បានលុបចោល" : "Cancelled"
    return status
  }

  const getStatusStyle = (status: string) => {
    const s = (status || "").toUpperCase()
    if (s === "PAID" || s === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (s === "PENDING") return "bg-amber-50 text-amber-700 border-amber-200"
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  return (
    <PublicLayout>
      <main className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
        <Toaster position="top-center" />
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          
          {/* 🍞 Mobile Responsive Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
            <span className="shrink-0 text-slate-400">/</span>
            <span className="text-slate-900 font-bold truncate min-w-0">{language === "kh" ? "តាមដានការបញ្ជាទិញ" : "Track Order"}</span>
          </div>

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#004691] tracking-tight">
              {language === "kh" ? "តាមដានការបញ្ជាទិញ" : "Track Order"}
            </h1>
          </div>

          {/* Search Card Container */}
          <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs mb-10">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-50 text-[#004691] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {language === "kh" ? "ស្វែងរកព័ត៌មានបញ្ជាទិញរបស់អ្នក" : "Look up your order status"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {language === "kh" ? "សូមបញ្ចូលលេខ ID បញ្ជាទិញ លេខទូរស័ព្ទ ឬ អ៊ីមែល" : "Enter your Order ID (e.g. #7L6JSCGL), Phone Number, or Email"}
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={language === "kh" ? "ឧទាហរណ៍: 7L6JSCGL77 ឬ 012309302" : "e.g. 7L6JSCGL77 or 012309302"}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#004691] hover:bg-[#003366] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-2xs shrink-0 flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{language === "kh" ? "ស្វែងរក" : "Search"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Search Results Display */}
          {searched && (
            <div className="max-w-4xl mx-auto space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs hover:border-[#004691] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                          #{order.id?.substring(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusStyle(order.paymentStatus || order.status)}`}>
                          {getStatusLabel(order.paymentStatus || order.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>
                          {language === "kh" ? "អតិថិជន:" : "Customer:"} <strong className="text-slate-700">{order.customerName || "Customer"}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {language === "kh" ? "ទូរស័ព្ទ:" : "Phone:"} <strong className="text-slate-700">{order.customerPhone || "N/A"}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 font-medium block">
                          {language === "kh" ? "ចំណាយសរុប" : "Total Amount"}
                        </span>
                        <span className="text-lg sm:text-xl font-extrabold text-[#004691]">
                          ${parseFloat(order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="bg-slate-100 hover:bg-[#004691] hover:text-white text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1 shrink-0"
                      >
                        <span>{language === "kh" ? "មើលព័ត៌មានលម្អិត" : "View Details"}</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {language === "kh" ? "រកមិនឃើញការបញ្ជាទិញទេ" : "No orders found"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    {language === "kh" 
                      ? "សូមពិនិត្យមើលលេខ ID បញ្ជាទិញ ឬលេខទូរស័ព្ទឡើងវិញ ហើយព្យាយាមម្តងទៀត។" 
                      : "Please check your Order ID or phone number and try searching again."}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </PublicLayout>
  )
}
