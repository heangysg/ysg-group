"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../../../lib/supabase/client"
import { 
  Package, 
  FolderOpen, 
  Mail, 
  TrendingUp, 
  ShoppingCart, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  Clock
} from "lucide-react"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminDashboard() {
  const { t, language } = useLanguage()
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    inquiries: 0,
    orders: 0,
    revenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const supabase = createClient()
    
    try {
      // Fetch all stats in parallel for speed
      const [
        { count: productsCount },
        { count: categoriesCount },
        { count: inquiriesCount },
        { count: ordersCount, data: ordersData },
        { data: recent }
      ] = await Promise.all([
        supabase.from("Product").select("*", { count: "exact", head: true }),
        supabase.from("Category").select("*", { count: "exact", head: true }),
        supabase.from("Inquiry").select("*", { count: "exact", head: true }),
        supabase.from("Order").select("totalAmount", { count: "exact" }),
        supabase.from("Order").select("*").order("createdAt", { ascending: false }).limit(5)
      ])
      
      const totalRevenue = ordersData?.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0) || 0
      
      setStats({
        products: productsCount || 0,
        categories: categoriesCount || 0,
        inquiries: inquiriesCount || 0,
        orders: ordersCount || 0,
        revenue: totalRevenue
      })
      setRecentOrders(recent || [])
    } catch (err) {
      console.error("Dashboard Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: t("totalRevenue"), value: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { title: t("totalOrders"), value: stats.orders, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { title: t("totalProducts"), value: stats.products, icon: Package, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { title: t("totalInquiries"), value: stats.inquiries, icon: Mail, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return t("pending")
      case 'paid': return t("paid") || "Paid"
      case 'confirmed': return t("confirmed")
      case 'shipping': return t("shipping")
      case 'completed': return t("completed")
      case 'cancelled': return t("cancelled")
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-2 border-amber-600 shadow-hard'
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-2 border-emerald-600 shadow-hard'
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-2 border-blue-600 shadow-hard'
      case 'shipping': return 'bg-purple-50 text-purple-600 border-2 border-purple-600 shadow-hard'
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-2 border-emerald-600 shadow-hard'
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-2 border-rose-600 shadow-hard'
      default: return 'bg-slate-50 text-slate-900 border-2 border-slate-900 shadow-hard'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">{t("gatheringData")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{t("dashboard")}</h1>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{t("welcomeBack")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/products/new" 
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-900 text-slate-900 font-bold text-xs uppercase tracking-widest shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            <Plus className="w-4 h-4" />
            {t("newProduct")}
          </Link>
          <Link 
            href="/admin/orders" 
            className="btn-primary px-6 py-3 flex items-center gap-2 text-xs"
          >
            {t("viewOrders")}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-6 solid-card bg-white group`}>
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 ${card.bg} border-2 border-slate-900 shadow-hard transition-transform group-hover:scale-110`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border-2 border-emerald-600 px-2 py-1 shadow-hard">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 solid-card bg-white flex flex-col">
          <div className="p-6 border-b-2 border-slate-900 flex items-center justify-between bg-primary">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest">{t("recentOrders")}</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-slate-900 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-widest">
              {t("viewAll")} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-900">
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("orderId")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("customer")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("amount")}</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest text-right">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-900">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-primary/5 transition-all">
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-900 uppercase">#{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-900 uppercase">{order.customerName || t("walkInCustomer")}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-900 tracking-wider">{formatPrice(order.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`text-xs font-bold px-3 py-1.5 uppercase tracking-widest ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="solid-card bg-white p-0 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 p-6 border-b-2 border-slate-900 uppercase tracking-widest bg-slate-50">{t("quickActivity")}</h2>
          <div className="space-y-6 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-white flex items-center justify-center border-2 border-slate-900 shadow-hard group-hover:bg-primary group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all">
                    {i % 2 === 0 ? <Package className="w-5 h-5 text-slate-900" /> : <Mail className="w-5 h-5 text-slate-900" />}
                  </div>
                  {i < 4 && <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-900" />}
                </div>
                <div className="pt-1">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {i % 2 === 0 ? t("newProductAdded") : t("newInquiryReceived")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t("twoHoursAgo")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-auto py-4 border-t-2 border-slate-900 text-xs font-bold text-slate-900 uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all">
            {t("seeAllActivity")}
          </button>
        </div>
      </div>
    </div>
  )
}
