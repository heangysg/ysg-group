"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../../../lib/supabase/client"
import { 
  Package, 
  FolderOpen, 
  Mail, 
  TrendingUp, 
  Eye, 
  ShoppingCart, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2
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
    const supabase = createClient()
    
    // Fetch counts
    const { count: productsCount } = await supabase.from("Product").select("*", { count: "exact", head: true })
    const { count: categoriesCount } = await supabase.from("Category").select("*", { count: "exact", head: true })
    const { count: inquiriesCount } = await supabase.from("Inquiry").select("*", { count: "exact", head: true })
    const { count: ordersCount, data: ordersData } = await supabase.from("Order").select("totalAmount", { count: "exact" })
    
    // Calculate revenue
    const totalRevenue = ordersData?.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0) || 0
    
    // Recent orders
    const { data: recent } = await supabase
      .from("Order")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(5)

    setStats({
      products: productsCount || 0,
      categories: categoriesCount || 0,
      inquiries: inquiriesCount || 0,
      orders: ordersCount || 0,
      revenue: totalRevenue
    })
    setRecentOrders(recent || [])
    setLoading(false)
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Gathering Data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("dashboard")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("welcomeBack")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/products/new" 
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t("newProduct")}
          </Link>
          <Link 
            href="/admin/orders" 
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            {t("viewOrders")}
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className={`p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">{t("recentOrders")}</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              {t("viewAll")} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("orderId")}</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("customer")}</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t("amount")}</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-900">#{order.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">{order.customerName || "Walk-in Customer"}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                        {order.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">{t("quickActivity")}</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                    {i % 2 === 0 ? <Package className="w-5 h-5 text-amber-500" /> : <Mail className="w-5 h-5 text-purple-500" />}
                  </div>
                  {i < 4 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-slate-100" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {i % 2 === 0 ? "New product added" : "New inquiry received"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <p className="text-[10px] text-slate-400 font-medium">2 hours ago</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-auto py-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
            {t("seeAllActivity")}
          </button>
        </div>
      </div>
    </div>
  )
}
