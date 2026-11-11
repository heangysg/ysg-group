"use client"
import { useState, useEffect } from "react"
import { useLanguage } from "../../../contexts/LanguageContext"
import { Search, Users, MapPin, Mail, Phone, ShoppingBag, X } from "lucide-react"

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const { t, language } = useLanguage()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("ysg_admin_token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const res = await fetch(`${API_URL}/api/admin/customers`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      const result = await res.json()
      if (res.ok && result.customers) {
        setCustomers(result.customers)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase())
  )

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
        <p className="text-slate-400 font-medium text-xs">{language === 'kh' ? 'កំពុងផ្ទុកអតិថិជន...' : 'Loading Customers...'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            {t("customers") || (language === 'kh' ? 'អតិថិជន' : 'Customers')}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
            {language === 'kh' ? 'គ្រប់គ្រងអតិថិជន និងប្រវត្តិការទិញរបស់ពួកគេ' : 'Manage customers and their purchase history'}
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("search") || (language === 'kh' ? 'ស្វែងរកអតិថិជន...' : 'Search...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all text-slate-900 font-medium text-xs sm:text-sm"
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

      <div className="solid-card bg-white overflow-hidden p-0 border border-slate-200 shadow-sm rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {language === 'kh' ? 'អតិថិជន' : 'Customer'}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {language === 'kh' ? 'ទំនាក់ទំនង' : 'Contact Info'}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                  {language === 'kh' ? 'អាសយដ្ឋានចុងក្រោយ' : 'Last Address'}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap text-right">
                  {language === 'kh' ? 'កាលបរិច្ឆេទបញ្ជាទិញចុងក្រោយ' : 'Last Order Date'}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap text-center">
                  {language === 'kh' ? 'ចំនួនការបញ្ជាទិញ' : 'Total Orders'}
                </th>
                <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap text-right">
                  {language === 'kh' ? 'ចំណាយសរុប' : 'Total Spent'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center font-bold text-slate-500 text-sm uppercase tracking-wider">
                    {language === 'kh' ? 'រកមិនឃើញអតិថិជនទេ' : 'No customers found'}
                  </td>
                </tr>
              ) : filteredCustomers.map((customer, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm uppercase">
                        {(customer.name || 'C').charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 text-sm">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {customer.phone ? (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{customer.phone}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-3.5 h-3.5 opacity-50 shrink-0" />
                          <span className="italic">N/A</span>
                        </div>
                      )}
                      
                      {customer.email ? (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium">{customer.email}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3.5 h-3.5 opacity-50 shrink-0" />
                          <span className="italic">N/A</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 text-slate-600 text-xs max-w-xs">
                      {customer.address ? (
                        <>
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2 font-medium">{customer.address}</span>
                        </>
                      ) : (
                        <span className="text-slate-400 italic font-medium">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-slate-600">
                      {new Date(customer.last_order_date).toLocaleDateString(language === 'kh' ? 'km-KH' : 'en-US')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                      <ShoppingBag className="w-3 h-3" />
                      {customer.order_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-emerald-600 text-sm">
                      {formatCurrency(customer.total_spent)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function formatCurrency(val: number) {
  return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
