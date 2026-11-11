"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Package,
  Mail,
  TrendingUp,
  ShoppingCart,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Clock,
  PieChart as PieChartIcon,
  BarChart2,
  ShoppingBag
} from "lucide-react"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

export default function AdminDashboard() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const isKh = language === "kh"

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    inquiries: 0,
    orders: 0,
    revenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (!user.isSuperAdmin && user.roleName === "STAFF") {
        router.replace("/admin/orders")
        return
      }
    }
    fetchData()
  }, [router])

  async function fetchData() {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const token = localStorage.getItem("ysg_admin_token")
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }

      const [statsRes, inquiriesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, { method: "POST", headers }),
        fetch(`${API_URL}/api/admin/read`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            table: "Inquiry",
            order: { column: "createdAt", ascending: false },
            limit: 5
          })
        }).catch(() => null)
      ])

      const data = await statsRes.json()

      if (data.error) {
        console.error("Dashboard Fetch Error:", data.error)
        if (data.error === "Invalid or expired token" || statsRes.status === 401 || statsRes.status === 403) {
          localStorage.removeItem("ysg_admin_token")
          localStorage.removeItem("ysg_admin_user")
          router.push("/admin/login")
        }
        return
      }

      setStats(data.stats || { products: 0, categories: 0, inquiries: 0, orders: 0, revenue: 0 })
      const ordersList = data.recentOrders || []
      setRecentOrders(ordersList)
      setRevenueData(data.revenueData || [])

      const statusColors: Record<string, string> = {
        pending: "#f59e0b",
        paid: "#10b981",
        confirmed: "#3b82f6",
        shipping: "#6366f1",
        completed: "#059669",
        cancelled: "#ef4444",
        failed: "#dc2626"
      }

      if (data.statusData) {
        const statChartData = data.statusData.map((item: any) => ({
          name: String(item.status || "pending").toUpperCase(),
          rawStatus: String(item.status || "pending").toLowerCase(),
          value: item.count,
          color: statusColors[String(item.status || "").toLowerCase()] || "#64748b"
        }))
        setStatusData(statChartData)
      }

      const inquiriesJson = inquiriesRes && inquiriesRes.ok ? await inquiriesRes.json().catch(() => ({})) : {}
      const inquiriesList = inquiriesJson?.data || []

      const combinedActivity = [
        ...ordersList.map((o: any) => ({
          id: `order-${o.id}`,
          type: "order",
          title: `${isKh ? "ការបញ្ជាទិញ" : "Order"} #${String(o.id).slice(0, 8)}`,
          subtitle: `${o.customerName || t("walkInCustomer")} • $${Number(o.totalAmount || 0).toLocaleString()}`,
          href: "/admin/orders",
          createdAt: new Date(o.createdAt)
        })),
        ...inquiriesList.map((inq: any) => ({
          id: `inq-${inq.id}`,
          type: "inquiry",
          title: inq.customerName || inq.name || t("walkInCustomer"),
          subtitle: inq.message || (isKh ? "សំណួរអតិថិជនថ្មី" : "New customer inquiry"),
          href: "/admin/inquiries",
          createdAt: new Date(inq.createdAt)
        }))
      ]
        .filter((item) => !Number.isNaN(item.createdAt.getTime()))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)

      setRecentActivity(combinedActivity)
    } catch (err) {
      console.error("Dashboard Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: t("totalRevenue"),
      value: `$${stats.revenue.toLocaleString()}`,
      href: "/admin/reports",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100"
    },
    {
      title: t("totalOrders"),
      value: stats.orders,
      href: "/admin/orders",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100"
    },
    {
      title: t("totalProducts"),
      value: stats.products,
      href: "/admin/products",
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100"
    },
    {
      title: t("totalInquiries"),
      value: stats.inquiries,
      href: "/admin/inquiries",
      icon: Mail,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-100"
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return t("pending")
      case "paid": return t("paid") || "Paid"
      case "confirmed": return t("confirmed")
      case "shipping": return t("shipping")
      case "completed": return t("completed")
      case "cancelled": return t("cancelled")
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "cancelled":
      case "failed":
        return "bg-red-50 text-red-700 border border-red-200"
      default:
        return "bg-blue-50 text-blue-700 border border-blue-200"
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary border-t-2"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {isKh ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {isKh ? "ទិដ្ឋភាពទូទៅនៃការលក់ និងសកម្មភាពប្រព័ន្ធ" : "System Overview & Real-Time Analytics"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/reports"
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-2 hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <BarChart2 className="w-4 h-4" />
            {t("reports")}
          </Link>
          <Link href="/admin/products/new" className="btn-primary py-2.5 px-5 rounded-xl text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isKh ? "បន្ថែមផលិតផលថ្មី" : "New Product"}
          </Link>
        </div>
      </div>

      {/* Clickable KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => (
          <Link
            key={idx}
            href={stat.href}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-primary text-white">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              {isKh ? "ចំណូលរយៈពេល ៣០ ថ្ងៃចុងក្រោយ" : "Revenue Trend (Last 30 Days)"}
            </h2>
            <span className="text-[11px] font-semibold text-blue-100">USD ($)</span>
          </div>
          <div className="p-5 h-72 w-full">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value || 0).toLocaleString()}`, isKh ? "ចំណូល" : "Revenue"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1d4ed8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#dashRevenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-medium text-slate-400">
                {isKh ? "មិនទាន់មានទិន្នន័យចំណូល ៣០ ថ្ងៃចុងក្រោយទេ" : "No revenue data in the last 30 days"}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-primary text-white">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4" />
              {isKh ? "ស្ថានភាពការបញ្ជាទិញ" : "Orders by Status"}
            </h2>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            {statusData.length > 0 ? (
              <>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={3}
                      >
                        {statusData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  {statusData.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-slate-50">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                        {getStatusLabel(entry.rawStatus)}
                      </span>
                      <span className="font-bold text-slate-900">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs font-medium text-slate-400">
                {isKh ? "មិនទាន់មានការបញ្ជាទិញទេ" : "No order data yet"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-primary">
            <h2 className="text-base font-bold text-white">{t("recentOrders")}</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-white hover:text-blue-100 transition-colors flex items-center gap-1">
              {t("viewAll")} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">{t("orderId")}</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">{t("customer")}</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">{t("amount")}</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-right">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-xs font-medium text-slate-400">
                      {isKh ? "មិនទាន់មានការបញ្ជាទិញទេ" : "No recent orders"}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => router.push("/admin/orders")}
                      className="hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-slate-900 uppercase">#{String(order.id).slice(0, 8)}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-slate-900">{order.customerName || t("walkInCustomer")}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(isKh ? "km-KH" : "en-US")}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-slate-900">{formatPrice(order.totalAmount)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-200 bg-primary flex items-center justify-between">
            <h2 className="text-base font-bold text-white">{t("quickActivity")}</h2>
            <Link href="/admin/activity" className="text-xs font-bold text-white hover:text-blue-100 transition-colors flex items-center gap-1">
              {t("viewAll")} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="p-4 divide-y divide-slate-100 flex-1">
            {recentActivity.length === 0 ? (
              <div className="py-12 text-center text-xs font-medium text-slate-400">
                {t("noActivityFound") || (isKh ? "មិនទាន់មានសកម្មភាពទេ" : "No recent activity")}
              </div>
            ) : (
              recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="py-3 first:pt-1 last:pb-1 flex items-start gap-3 hover:bg-slate-50 rounded-lg px-2 transition-colors group"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.type === "order" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {item.type === "order" ? <ShoppingBag className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {item.subtitle}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{item.createdAt.toLocaleString(isKh ? "km-KH" : "en-US")}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
