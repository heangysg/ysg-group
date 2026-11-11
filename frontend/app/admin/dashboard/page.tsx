"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Mail,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Clock,
  PieChart as PieChartIcon,
  BarChart2,
  ShoppingBag,
  AlertTriangle,
  DollarSign,
  CreditCard
} from "lucide-react"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
  StatsRange,
  RANGE_OPTIONS,
  ORDER_STATUS_COLORS,
  formatUsd,
  getOrderStatusBadgeClass,
  getOrderStatusLabel,
  translateMonthLabel,
  getAdminHeaders
} from "../../../lib/adminAnalytics"
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

  const [range, setRange] = useState<StatsRange>("30d")
  const [stats, setStats] = useState<any>({
    products: 0,
    categories: 0,
    inquiries: 0,
    orders: 0,
    revenue: 0,
    aov: 0,
    revenueGrowth: null,
    ordersGrowth: null,
    allTimeRevenue: 0,
    pendingOrders: 0
  })
  const [stock, setStock] = useState<any>({ lowStock: 0, outOfStock: 0 })
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async (selectedRange: StatsRange, initial = false) => {
    if (initial) setLoading(true)
    else setRefreshing(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const headers = getAdminHeaders()

      const [statsRes, inquiriesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          method: "POST",
          headers,
          body: JSON.stringify({ range: selectedRange })
        }),
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

      setStats(data.stats || {})
      setStock(data.stock || { lowStock: 0, outOfStock: 0 })
      setLowStockProducts(data.lowStockProducts || [])
      const ordersList = data.recentOrders || []
      setRecentOrders(ordersList)
      setRevenueData(data.revenueData || [])
      setMonthlyRevenue(data.monthlyRevenue || [])

      if (data.statusData) {
        const statChartData = data.statusData.map((item: any) => ({
          name: String(item.status || "pending").toUpperCase(),
          rawStatus: String(item.status || "pending").toLowerCase(),
          value: item.count,
          color: ORDER_STATUS_COLORS[String(item.status || "").toLowerCase()] || "#64748b"
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
          subtitle: `${o.customerName || t("walkInCustomer")} • ${formatUsd(o.totalAmount, 2)}`,
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
      setRefreshing(false)
    }
  }, [isKh, router, t])

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (!user.isSuperAdmin && user.roleName === "STAFF") {
        router.replace("/admin/orders")
        return
      }
    }
    fetchData("30d", true)
  }, [fetchData, router])

  const handleRangeChange = (next: StatsRange) => {
    setRange(next)
    fetchData(next, false)
  }

  const renderGrowthBadge = (growth: number | null) => {
    if (growth === null || growth === undefined) return null
    const positive = growth >= 0
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
          positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}
      >
        {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {positive ? `+${growth}%` : `${growth}%`}
      </span>
    )
  }

  const chartSeries =
    range === "12m" || range === "all"
      ? monthlyRevenue.map((m) => ({ label: translateMonthLabel(m.label, isKh), revenue: m.revenue, orders: m.orders }))
      : revenueData.map((d) => ({ label: d.date, revenue: d.revenue, orders: d.orders }))

  const statCards = [
    {
      title: isKh ? "ប្រាក់ចំណូលបានបង់" : "Paid Revenue",
      value: formatUsd(stats.revenue, 2),
      sub: `${isKh ? "សរុបគ្រប់ពេល" : "All-time"}: ${formatUsd(stats.allTimeRevenue, 0)}`,
      growth: stats.revenueGrowth,
      href: "/admin/reports",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100"
    },
    {
      title: isKh ? "ការបញ្ជាទិញបានបង់" : "Paid Orders",
      value: stats.orders || 0,
      sub: `${isKh ? "មិនទាន់បង់ (Pending)" : "Unpaid pending"}: ${stats.pendingOrders || 0}`,
      growth: stats.ordersGrowth,
      href: "/admin/orders",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100"
    },
    {
      title: isKh ? "តម្លៃមធ្យម / ១ Order" : "Avg. Order Value",
      value: formatUsd(stats.aov, 2),
      sub: `${isKh ? "ផលិតផលសកម្ម" : "Active products"}: ${stats.products || 0}`,
      growth: null,
      href: "/admin/reports",
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50 border-indigo-100"
    },
    {
      title: isKh ? "សំណួរអតិថិជន" : t("totalInquiries"),
      value: stats.inquiries || 0,
      sub: `${isKh ? "ស្តុកទាប / អស់" : "Low / Out stock"}: ${(stock.lowStock || 0) + (stock.outOfStock || 0)}`,
      growth: null,
      href: "/admin/inquiries",
      icon: Mail,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-100"
    }
  ]

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary border-t-2"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${refreshing ? "opacity-80 transition-opacity" : ""}`}>
      {/* Header + Date Range Filter */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {isKh ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard"}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-800">
            {isKh ? "ទិដ្ឋភាពទូទៅនៃការលក់ ស្តុក និងសកម្មភាពជាក់ស្តែង" : "Real-time sales performance, inventory alerts & store activity"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleRangeChange(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  range === opt.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-800 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {isKh ? opt.labelKh : opt.labelEn}
              </button>
            ))}
          </div>

          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-2 hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <BarChart2 className="w-4 h-4" />
            {t("reports")}
          </Link>
          <Link href="/admin/products/new" className="btn-primary py-2 px-4 rounded-xl text-xs flex items-center gap-2">
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
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between space-y-3 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl border ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                {renderGrowthBadge(stat.growth)}
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-800 mb-1">{stat.title}</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-[11px] font-semibold text-slate-700 mt-1">{stat.sub}</p>
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
              {range === "12m" || range === "all"
                ? isKh ? "និន្នាការចំណូលប្រចាំខែ (១២ ខែ)" : "Monthly Revenue Trend (12 Months)"
                : isKh ? `ចំណូលរយៈពេល ${RANGE_OPTIONS.find((o) => o.value === range)?.labelKh}` : `Revenue Trend (Last ${range.toUpperCase()})`}
            </h2>
            <span className="text-[11px] font-semibold text-blue-100">USD ($)</span>
          </div>
          <div className="p-5 h-72 w-full">
            {chartSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSeries} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      name === "revenue" ? formatUsd(value, 2) : value,
                      name === "revenue" ? (isKh ? "ចំណូល" : "Revenue") : (isKh ? "ការបញ្ជាទិញ" : "Orders")
                    ]}
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
              <div className="h-full flex items-center justify-center text-xs font-medium text-slate-700">
                {isKh ? "មិនទាន់មានទិន្នន័យចំណូលទេ" : "No revenue data in this period"}
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
                        {getOrderStatusLabel(entry.rawStatus, isKh, t)}
                      </span>
                      <span className="font-bold text-slate-900">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs font-medium text-slate-700">
                {isKh ? "មិនទាន់មានការបញ្ជាទិញទេ" : "No order data in this period"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Confirmed Orders + Low Stock & Quick Activity */}
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
                  <th className="px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">{isKh ? "ការទូទាត់" : "Method"}</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">{t("amount")}</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-right">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-xs font-medium text-slate-700">
                      {isKh ? "មិនទាន់មានការបញ្ជាទិញដែលបានបញ្ជាក់ទេ" : "No confirmed orders yet"}
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
                        <p className="text-[11px] text-slate-800 font-medium mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString(isKh ? "km-KH" : "en-US")}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          <CreditCard className="w-3 h-3 text-slate-800" />
                          {order.paymentMethod || "Bakong"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-slate-900">{formatUsd(order.totalAmount, 2)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full ${getOrderStatusBadgeClass(order.status)}`}>
                          {getOrderStatusLabel(order.status, isKh, t)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts + Live Activity */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-amber-600 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {isKh ? "ទំនិញជិតអស់ស្តុក" : "Low Stock Alerts"}
              </h2>
              <Link href="/admin/products" className="text-xs font-bold text-white hover:text-amber-100 flex items-center gap-1">
                {t("viewAll")} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-4 divide-y divide-slate-100">
              {lowStockProducts.length === 0 ? (
                <div className="py-6 text-center text-xs font-medium text-emerald-600">
                  {isKh ? "ស្តុកទំនិញទាំងអស់មានគ្រប់គ្រាន់" : "All products are well stocked"}
                </div>
              ) : (
                lowStockProducts.slice(0, 4).map((prod) => (
                  <Link
                    key={prod.id}
                    href={`/admin/products/edit/${prod.slug}`}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg px-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {isKh && prod.nameKhmer ? prod.nameKhmer : prod.name}
                      </p>
                      <p className="text-[10px] text-slate-700 font-medium">{prod.sku || prod.slug}</p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        prod.stock <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {prod.stock <= 0 ? (isKh ? "អស់ស្តុក" : "Out (0)") : `${prod.stock} ${isKh ? "គ្រឿង" : "left"}`}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-200 bg-primary flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">{t("quickActivity")}</h2>
              <Link href="/admin/activity" className="text-xs font-bold text-white hover:text-blue-100 transition-colors flex items-center gap-1">
                {t("viewAll")} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-4 divide-y divide-slate-100 flex-1">
              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs font-medium text-slate-700">
                  {t("noActivityFound") || (isKh ? "មិនទាន់មានសកម្មភាពទេ" : "No recent activity")}
                </div>
              ) : (
                recentActivity.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 hover:bg-slate-50 rounded-lg px-2 transition-colors group"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === "order" ? "bg-emerald-50 text-emerald-600" : "bg-purple-50 text-purple-600"
                      }`}
                    >
                      {item.type === "order" ? <ShoppingBag className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-800 font-medium truncate mt-0.5">{item.subtitle}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-700 font-medium">
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
    </div>
  )
}
