"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "../../../contexts/LanguageContext"
import { Mail, Clock, ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function ActivityPage() {
  const { t, language } = useLanguage()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem("ysg_admin_token")
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      
      const [inquiriesRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Inquiry", order: { column: "createdAt", ascending: false }, limit: 25 }) }).then(r => r.json()),
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Order", order: { column: "createdAt", ascending: false }, limit: 25 }) }).then(r => r.json())
      ])

      const inquiries = inquiriesRes.data
      const orders = ordersRes.data

      const allActivities: any[] = []

      if (inquiries) {
        inquiries.forEach((item: any) => {
          allActivities.push({
            id: item.id,
            type: 'inquiry',
            titleKey: "newInquiryReceived",
            rawMessage: item.message,
            customer: item.name || item.email,
            time: new Date(item.createdAt).toLocaleString(language === 'kh' ? 'km-KH' : 'en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            icon: Mail,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            createdAt: new Date(item.createdAt)
          })
        })
      }

      if (orders) {
        orders.forEach((item: any) => {
          allActivities.push({
            id: item.id,
            type: 'order',
            titleKey: "newOrderReceived",
            orderId: item.id ? String(item.id).slice(-6).toUpperCase() : 'N/A',
            amount: item.totalAmount || 0,
            customer: item.customerName || item.customerEmail,
            time: new Date(item.createdAt).toLocaleString(language === 'kh' ? 'km-KH' : 'en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            icon: ShoppingBag,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            createdAt: new Date(item.createdAt)
          })
        })
      }

      setActivities(allActivities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    } catch (err) {
      console.error("Activity Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#004691] mb-4"></div>
        <p className="text-slate-400 font-bold text-xs">{t("loading")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      
      {/* Header section matching new admin style */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-6">
        <Link 
          href="/admin/dashboard"
          className="p-2 bg-white border border-slate-200 text-slate-400 rounded-md hover:text-[#004691] hover:border-[#004691] transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold uppercase text-[#004691] tracking-wide">
            {t("viewAllActivity")}
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {t("trackSystemUpdates") || "Track all system updates and interactions"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-slate-900 uppercase tracking-wide text-sm">{t("recentActivity") || "Recent Activity"}</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {activities.length > 0 ? (
            activities.map((activity: any) => (
              <div key={activity.id} className="p-4 md:p-6 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-start gap-4 md:gap-6 group">
                <div className={`shrink-0 w-12 h-12 rounded-md ${activity.bg} ${activity.color} flex items-center justify-center shadow-sm`}>
                  <activity.icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1 space-y-1 mt-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900">{t(activity.titleKey || activity.title)}</h3>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded-md">
                      {t(activity.type) || activity.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-2xl">
                    {activity.type === 'order' 
                      ? `${t("order")} #${activity.orderId} - $${activity.amount}`
                      : activity.rawMessage}
                  </p>
                  
                  {/* Meta info block */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] text-slate-600 font-bold">{activity.time}</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-bold text-[#004691] uppercase tracking-wide">{activity.customer}</span>
                  </div>
                </div>

                <Link 
                  href={activity.type === 'order' ? `/admin/orders` : `/admin/inquiries`}
                  className="mt-4 md:mt-1 self-start px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-md font-bold text-xs hover:bg-[#004691] hover:text-white hover:border-[#004691] transition-all shadow-sm flex items-center gap-2"
                >
                  {t("viewDetails") || "View Details"}
                </Link>
              </div>
            ))
          ) : (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">{t("noActivityFound") || "No activity found"}</h3>
              <p className="text-slate-500 font-medium text-sm mt-2">{t("activityWillShowUp") || "Your activity history will appear here once users interact with your platform."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
