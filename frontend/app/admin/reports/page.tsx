"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
  StatsRange,
  RANGE_OPTIONS,
  formatUsd,
  translateMonthLabel,
  getAdminHeaders
} from "../../../lib/adminAnalytics"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import {
  BarChart3,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PackageSearch,
  History,
  Users,
  Download,
  CreditCard,
  AlertTriangle,
  Layers
} from "lucide-react"

export default function ReportsPage() {
  const { language } = useLanguage()
  const isKh = language === "kh"
  const router = useRouter()

  const [range, setRange] = useState<StatsRange>("30d")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<any>(null)

  const fetchStats = useCallback(async (selectedRange: StatsRange, initial = false) => {
    if (initial) setLoading(true)
    else setRefreshing(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({ range: selectedRange })
      })
      const result = await res.json()
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("ysg_admin_token")
        localStorage.removeItem("ysg_admin_user")
        router.push("/admin/login")
        return
      }
      if (res.ok) {
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch reports data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (userStr) {
      const user = JSON.parse(userStr)
      if (!user.isSuperAdmin && user.roleName === "STAFF") {
        router.replace("/admin/orders")
        return
      }
    }
    fetchStats("30d", true)
  }, [fetchStats, router])

  const handleRangeChange = (next: StatsRange) => {
    setRange(next)
    fetchStats(next, false)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary border-t-2"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        {isKh ? "រកមិនឃើញទិន្នន័យទេ" : "No data available"}
      </div>
    )
  }

  const stats = data.stats || {}
  const stock = data.stock || {}
  const paymentMethods = data.paymentMethods || []
  const categoryBreakdown = (data.categoryBreakdown || []).map((c: any) => ({
    ...c,
    displayName: isKh && c.nameKhmer ? c.nameKhmer : c.name
  }))

  const stockHealthData = [
    { name: isKh ? "ស្តុកល្អ (>5)" : "In Stock (>5)", value: stock.inStock || 0, color: "#10b981" },
    { name: isKh ? "ស្តុកទាប (1-5)" : "Low Stock (1-5)", value: stock.lowStock || 0, color: "#f59e0b" },
    { name: isKh ? "អស់ស្តុក (0)" : "Out of Stock (0)", value: stock.outOfStock || 0, color: "#ef4444" }
  ].filter((item) => item.value > 0)

  const formattedMonthlyData = (data.monthlyRevenue || []).map((d: any) => ({
    ...d,
    labelKhmer: translateMonthLabel(d.label, isKh)
  }))

  const totalPaymentRevenue = paymentMethods.reduce((sum: number, p: any) => sum + Number(p.revenue || 0), 0)

  const renderGrowth = (growth: number | null) => {
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

  const exportReportsCSV = () => {
    const rows: string[] = []
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`

    rows.push("Section,Item,Orders/Units,Stock/Extra,Amount (USD)")
    rows.push(`Summary,Paid Revenue (${range.toUpperCase()}),${stats.orders || 0},AOV $${Number(stats.aov || 0).toFixed(2)},${Number(stats.revenue || 0).toFixed(2)}`)
    rows.push(`Summary,Inventory Value,${stock.totalUnits || 0} units,${stock.total || 0} products,${Number(stock.inventoryValue || 0).toFixed(2)}`)

    paymentMethods.forEach((p: any) => {
      rows.push(`Payment Method,${esc(p.method)},${p.orders || 0},,${Number(p.revenue || 0).toFixed(2)}`)
    })

    categoryBreakdown.forEach((c: any) => {
      rows.push(`Category,${esc(c.name)},${c.unitsSold || 0} units,,${Number(c.revenue || 0).toFixed(2)}`)
    })

    ;(data.monthlyRevenue || []).forEach((m: any) => {
      rows.push(`Monthly Revenue,${esc(m.label)},${m.orders || 0},,${Number(m.revenue || 0).toFixed(2)}`)
    })

    ;(data.topProducts || []).forEach((p: any) => {
      rows.push(`Top Product,${esc(p.name)},${p.unitsSold || 0} units (${p.orderCount || 0} orders),Stock ${p.stock ?? 0},${Number(p.totalRevenue || 0).toFixed(2)}`)
    })

    ;(data.topCustomers || []).forEach((c: any) => {
      rows.push(`Top Customer,${esc(c.customerName || "Customer")},${c.orderCount || 0} orders,,${Number(c.totalSpent || 0).toFixed(2)}`)
    })

    ;(data.lowStockProducts || []).forEach((p: any) => {
      rows.push(`Low Stock Alert,${esc(p.name)},Stock ${p.stock ?? 0},${esc(p.sku || "")},${Number(p.price || 0).toFixed(2)}`)
    })

    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `ysg-ecommerce-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${refreshing ? "opacity-80 transition-opacity" : ""}`}>
      {/* Header + Date Range + CSV */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            {isKh ? "របាយការណ៍លក់ និងស្តុកទំនិញ" : "Sales & Inventory Reports"}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {isKh ? "វិភាគប្រាក់ចំណូលពិត វិធីទូទាត់ ទំនិញលក់ដាច់ និងសុខភាពស្តុក" : "Paid revenue analytics, payment breakdown, top products & stock health"}
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
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {isKh ? opt.labelKh : opt.labelEn}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={exportReportsCSV}
            className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            {isKh ? "ទាញយក CSV" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* 4 Financial & Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            {renderGrowth(stats.revenueGrowth)}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              {isKh ? "ប្រាក់ចំណូលបានបង់" : "Net Paid Revenue"}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {formatUsd(stats.revenue, 2)}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {isKh ? "សរុបគ្រប់ពេល" : "All-time"}: {formatUsd(stats.allTimeRevenue, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <div className="w-11 h-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            {renderGrowth(stats.ordersGrowth)}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              {isKh ? "ការបញ្ជាទិញបានបង់ & មធ្យម" : "Paid Orders & AOV"}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.orders || 0}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {isKh ? "តម្លៃមធ្យម/Order" : "Avg. Order Value"}: {formatUsd(stats.aov, 2)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <div className="w-11 h-11 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              {isKh ? "ស្តុកទំនិញពិតសរុប" : "Total Inventory Units"}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {(stock.totalUnits || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {isKh ? "តម្លៃស្តុក" : "Stock Value"}: {formatUsd(stock.inventoryValue, 0)} ({stock.total || 0} SKU)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <div className="w-11 h-11 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            {(stock.outOfStock || 0) > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                {stock.outOfStock} {isKh ? "អស់" : "Out"}
              </span>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              {isKh ? "ទំនិញជិតអស់ / អស់ស្តុក" : "Restock Alerts"}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {(stock.lowStock || 0) + (stock.outOfStock || 0)}
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              {isKh ? "ស្តុកល្អ" : "Healthy"}: {stock.inStock || 0} • {isKh ? "ទាប" : "Low"}: {stock.lowStock || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: Monthly Revenue Trend + Stock Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="px-5 py-3 border-b border-slate-200 bg-primary flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              {isKh ? "ប្រាក់ចំណូលប្រចាំខែ (១២ ខែចុងក្រោយ)" : "Monthly Revenue (Last 12 Months)"}
            </h2>
            <span className="text-[11px] font-semibold text-blue-100">USD ($)</span>
          </div>
          <div className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedMonthlyData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="labelKhmer" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                    formatter={(value: any, name: any) => [
                      name === "revenue" ? formatUsd(value, 2) : value,
                      name === "revenue" ? (isKh ? "ប្រាក់ចំណូល" : "Revenue") : (isKh ? "ការបញ្ជាទិញ" : "Paid Orders")
                    ]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-primary flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <PackageSearch className="w-4 h-4" />
              {isKh ? "សុខភាពស្តុកទំនិញ" : "Stock Health Summary"}
            </h2>
          </div>
          <div className="p-6">
            <div className="h-[300px] w-full flex items-center justify-center">
              {stockHealthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockHealthData} cx="50%" cy="46%" innerRadius={58} outerRadius={82} paddingAngle={4} dataKey="value">
                      {stockHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                    <Legend verticalAlign="bottom" height={42} iconType="circle" formatter={(value) => <span className="font-bold text-xs text-slate-700">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                  {isKh ? "គ្មានទិន្នន័យស្តុក" : "No Stock Data"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Sales by Category + Payment Methods Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="px-5 py-3 border-b border-slate-200 bg-primary flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {isKh ? "ចំណូលតាមប្រភេទទំនិញ (Category)" : "Revenue by Category"}
            </h2>
          </div>
          <div className="p-6">
            {categoryBreakdown.length > 0 ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="displayName" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                      formatter={(value: any) => [formatUsd(value, 2), isKh ? "ប្រាក់ចំណូល" : "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#1d4ed8" radius={[8, 8, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-xs font-bold text-slate-400">
                {isKh ? "មិនទាន់មានការលក់តាមប្រភេទក្នុងរយៈពេលនេះទេ" : "No category sales in this period"}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-200 bg-primary flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              {isKh ? "វិធីសាស្ត្រទូទាត់" : "Payment Methods"}
            </h2>
          </div>
          <div className="p-6 space-y-4 flex-1">
            {paymentMethods.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400 py-12">
                {isKh ? "មិនទាន់មានការទូទាត់ក្នុងរយៈពេលនេះទេ" : "No paid orders in this period"}
              </div>
            ) : (
              paymentMethods.map((pm: any) => {
                const pct = totalPaymentRevenue > 0 ? Math.round((Number(pm.revenue || 0) / totalPaymentRevenue) * 100) : 0
                return (
                  <div key={pm.method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{pm.method}</span>
                      <span className="font-bold text-slate-900">
                        {formatUsd(pm.revenue, 2)} <span className="text-slate-400 font-semibold">({pm.orders})</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] font-semibold text-slate-400 text-right">{pct}%</p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Top 10 Selling Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-primary flex justify-between items-center">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4" />
            {isKh ? "ទំនិញលក់ដាច់ជាងគេទាំង ១០ (គិតតាមបរិមាណពិត)" : "Top 10 Selling Products (Verified Item Revenue)"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap">#</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap">{isKh ? "ឈ្មោះទំនិញ" : "Product Name"}</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap">{isKh ? "តម្លៃ" : "Price"}</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap text-right">{isKh ? "ចំនួនលក់ (គ្រឿង)" : "Units Sold"}</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap text-right">{isKh ? "Orders" : "Orders"}</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap text-right">{isKh ? "ស្តុកនៅសល់" : "Stock"}</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap text-right">{isKh ? "ប្រាក់ចំណូលពិត" : "Item Revenue"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.topProducts || []).map((product: any, index: number) => (
                <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/admin/products/edit/${product.slug}`} className="font-bold text-slate-900 hover:text-primary transition-colors">
                      {isKh && product.nameKhmer ? product.nameKhmer : product.name}
                    </Link>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{product.id.substring(0, 8)}</p>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{formatUsd(product.price, 2)}</td>
                  <td className="p-4 text-right font-bold text-slate-900">{product.unitsSold}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {product.orderCount}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        product.stock <= 0
                          ? "bg-red-100 text-red-700"
                          : product.stock <= 5
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-emerald-600">{formatUsd(product.totalRevenue, 2)}</td>
                </tr>
              ))}
              {(!data.topProducts || data.topProducts.length === 0) && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-wider">
                    {isKh ? "មិនទាន់មានទំនិញលក់ដាច់ក្នុងរយៈពេលនេះទេ" : "No product sales in this period"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Top Customers + Low Stock Restock List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2">
          <div className="px-5 py-3 border-b border-slate-200 bg-primary flex justify-between items-center">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              {isKh ? "អតិថិជនកំពូលទាំង ១០" : "Top 10 Customers"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500">#</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500">{isKh ? "អតិថិជន" : "Customer"}</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500">{isKh ? "ទំនាក់ទំនង" : "Contact"}</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 text-right">{isKh ? "Orders" : "Orders"}</th>
                  <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 text-right">{isKh ? "ចំណាយសរុប" : "Total Spent"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.topCustomers || []).map((customer: any, index: number) => (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{customer.customerName}</td>
                    <td className="p-4">
                      <p className="font-medium text-slate-700 text-xs">{customer.customerEmail || "-"}</p>
                      <p className="text-[11px] text-slate-500">{customer.customerPhone}</p>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-emerald-600">{formatUsd(customer.totalSpent, 2)}</td>
                  </tr>
                ))}
                {(!data.topCustomers || data.topCustomers.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-bold text-xs uppercase tracking-wider">
                      {isKh ? "រកមិនឃើញទិន្នន័យអតិថិជនទេ" : "No customer orders in this period"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Restock Needed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-amber-600 flex justify-between items-center">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {isKh ? "ត្រូវបន្ថែមស្តុក (<= 5)" : "Low / Out of Stock"}
            </h2>
          </div>
          <div className="p-4 divide-y divide-slate-100">
            {(data.lowStockProducts || []).length === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-emerald-600">
                {isKh ? "ស្តុកទំនិញទាំងអស់មានគ្រប់គ្រាន់" : "All products are well stocked"}
              </div>
            ) : (
              (data.lowStockProducts || []).map((p: any) => (
                <Link
                  key={p.id}
                  href={`/admin/products/edit/${p.slug}`}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg px-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {isKh && p.nameKhmer ? p.nameKhmer : p.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {p.sku || p.slug} • {formatUsd(p.price, 2)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      p.stock <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.stock <= 0 ? (isKh ? "អស់ស្តុក" : "Out (0)") : `${p.stock} ${isKh ? "គ្រឿង" : "left"}`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
