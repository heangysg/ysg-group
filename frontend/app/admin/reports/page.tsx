"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "../../../contexts/LanguageContext"
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { BarChart3, Package, DollarSign, TrendingUp, PackageSearch, History } from "lucide-react"

export default function ReportsPage() {
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("ysg_admin_token")
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
      })
      const result = await res.json()
      if (res.ok) {
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch reports data:", error)
    } finally {
      setLoading(false)
    }
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
        {language === 'kh' ? 'រកមិនឃើញទិន្នន័យទេ' : 'No data available'}
      </div>
    )
  }

  // Calculate year totals
  const currentYearTotal = data.yearlyRevenue?.[0]?.revenue || 0
  const currentYearOrders = data.yearlyRevenue?.[0]?.orders || 0

  // Colors for stock pie chart
  const COLORS = ['#22c55e', '#ef4444', '#eab308']
  const stockData = [
    { name: language === 'kh' ? 'បានផ្សព្វផ្សាយ' : 'Published', value: data.stock?.published || 0 },
    { name: language === 'kh' ? 'បានលាក់' : 'Hidden', value: data.stock?.hidden || 0 },
    { name: language === 'kh' ? 'លេចធ្លោ' : 'Featured', value: data.stock?.featured || 0 },
  ].filter(item => item.value > 0)

  // Format currency
  const formatCurrency = (val: number) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            {language === 'kh' ? 'របាយការណ៍លក់ & ស្តុក' : 'Sales & Stock Reports'}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {language === 'kh' ? 'តាមដានសកម្មភាពលក់ និងស្តុកទំនិញ' : 'Track sales performance and inventory'}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1 relative z-10">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                {language === 'kh' ? 'ប្រាក់ចំណូលប្រចាំឆ្នាំ' : 'Yearly Revenue'}
              </p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {formatCurrency(currentYearTotal)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center shrink-0 relative z-10 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1 relative z-10">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                {language === 'kh' ? 'ការបញ្ជាទិញសរុប (ឆ្នាំនេះ)' : 'Total Orders (This Year)'}
              </p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {currentYearOrders}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0 relative z-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden group hover:shadow-md hover:border-primary/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1 relative z-10">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                {language === 'kh' ? 'ស្តុកទំនិញសរុប' : 'Total Stock'}
              </p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {data.stock?.total || 0}
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center shrink-0 relative z-10 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {language === 'kh' ? 'ប្រាក់ចំណូលប្រចាំខែ (១២ ខែចុងក្រោយ)' : 'Monthly Revenue (Last 12 Months)'}
            </h2>
          </div>
          <div className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyRevenue} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      fontWeight: '500'
                    }}
                    formatter={(value: any) => [formatCurrency(value || 0), language === 'kh' ? 'ប្រាក់ចំណូល' : 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Stock Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-slate-500" />
              {language === 'kh' ? 'សង្ខេបស្តុក' : 'Stock Summary'}
            </h2>
          </div>
          <div className="p-6">
            <div className="h-[300px] w-full flex items-center justify-center">
              {stockData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        fontWeight: '500'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="square"
                      formatter={(value) => <span className="font-bold text-slate-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-400 font-bold uppercase tracking-wider text-sm">
                  {language === 'kh' ? 'គ្មានទិន្នន័យ' : 'No Data'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            {language === 'kh' ? 'ទំនិញដែលលក់ដាច់ជាងគេទាំង ១០' : 'Top 10 Selling Products'}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap">#</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap">{language === 'kh' ? 'ឈ្មោះទំនិញ' : 'Product Name'}</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap">{language === 'kh' ? 'តម្លៃ' : 'Price'}</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap text-right">{language === 'kh' ? 'ចំនួនលក់ដាច់' : 'Orders'}</th>
                <th className="p-4 text-[11px] uppercase tracking-wider font-bold text-slate-500 whitespace-nowrap text-right">{language === 'kh' ? 'ប្រាក់ចំណូលសរុប' : 'Total Revenue'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.topProducts?.map((product: any, index: number) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{language === 'kh' && product.nameKhmer ? product.nameKhmer : product.name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{product.id.substring(0, 8)}</p>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{formatCurrency(product.price)}</td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      {product.orderCount}
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-emerald-600">
                    {formatCurrency(product.totalRevenue)}
                  </td>
                </tr>
              ))}
              {(!data.topProducts || data.topProducts.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold uppercase tracking-wider">
                    {language === 'kh' ? 'រកមិនឃើញទំនិញទេ' : 'No products found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
