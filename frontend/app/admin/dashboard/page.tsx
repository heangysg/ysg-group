"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { logActivity } from "../../../lib/audit"
import { 
  Package, 
  FolderOpen, 
  Mail, 
  TrendingUp, 
  ShoppingCart, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  Clock,
  PieChart as PieChartIcon,
  BarChart2
} from "lucide-react"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
  LineChart,
  Line,
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
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem("ysg_admin_token")
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      
      const [
        { count: productsCount },
        { count: categoriesCount },
        { count: inquiriesCount },
        { count: ordersCount, data: ordersData },
        { data: recent }
      ] = await Promise.all([
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Product", countExact: true, limit: 0 }) }).then(r => r.json()),
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Category", countExact: true, limit: 0 }) }).then(r => r.json()),
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Inquiry", countExact: true, limit: 0 }) }).then(r => r.json()),
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Order", select: "totalAmount, status, createdAt", countExact: true }) }).then(r => r.json()),
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Order", order: { column: "createdAt", ascending: false }, limit: 5 }) }).then(r => r.json())
      ])
      
      const totalRevenue = ordersData?.reduce((acc: number, curr: any) => acc + parseFloat(curr.totalAmount || 0), 0) || 0
      
      setStats({
        products: productsCount || 0,
        categories: categoriesCount || 0,
        inquiries: inquiriesCount || 0,
        orders: ordersCount || 0,
        revenue: totalRevenue
      })
      setRecentOrders(recent || [])

      if (ordersData) {
        const statMap: Record<string, number> = {}

        ordersData.forEach((o: any) => {
          const status = o.status?.toLowerCase() || 'pending'
          statMap[status] = (statMap[status] || 0) + 1
        })

        const sortedOrders = [...ordersData].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        const sortedRevMap: Record<string, number> = {}
        sortedOrders.forEach((o: any) => {
          const dateStr = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          sortedRevMap[dateStr] = (sortedRevMap[dateStr] || 0) + parseFloat(o.totalAmount || 0)
        })

        const revChartData = Object.keys(sortedRevMap).map(key => ({
          date: key,
          revenue: sortedRevMap[key]
        }))

        const statusColors: Record<string, string> = {
          'pending': '#f59e0b',
          'paid': '#10b981',
          'completed': '#3b82f6',
          'cancelled': '#ef4444'
        }
        
        const statChartData = Object.keys(statMap).map(key => ({
          name: key.toUpperCase(),
          value: statMap[key],
          color: statusColors[key] || '#64748b'
        }))

        setRevenueData(revChartData)
        setStatusData(statChartData)
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: t("totalRevenue"), value: `$${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: t("totalOrders"), value: stats.orders, icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
    { title: t("totalProducts"), value: stats.products, icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
    { title: t("totalInquiries"), value: stats.inquiries, icon: Mail, color: "text-purple-600", bg: "bg-purple-50" },
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
      case 'paid':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300'
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
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 uppercase tracking-tight">
            {language === "kh" ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard"}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {language === "kh" ? "ទិដ្ឋភាពទូទៅនៃប្រព័ន្ធ" : "System Overview & Analytics"}
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/products/new" className="btn-primary py-3 px-6 text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {language === "kh" ? "បន្ថែមផលិតផលថ្មី" : "New Product"}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`solid-card bg-white p-6 flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform`}>
            <div className="flex justify-between items-start">
              <div className={`p-4 rounded-xl border-2 border-slate-900 ${stat.bg} ${stat.color} shadow-hard-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
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
