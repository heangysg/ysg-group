"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../../lib/supabase/client"
import { useLanguage } from "../../../contexts/LanguageContext"
import { Mail, Package, ShoppingCart, Clock, ArrowLeft, ShoppingBag } from "lucide-react"
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
    const supabase = createClient()
    
    try {
      // Fetch inquiries and orders in parallel
      const [{ data: inquiries }, { data: orders }] = await Promise.all([
        supabase.from("Inquiry").select("*").order("createdAt", { ascending: false }).limit(25),
        supabase.from("Order").select("*").order("createdAt", { ascending: false }).limit(25)
      ])

    const allActivities: any[] = []

    if (inquiries) {
      inquiries.forEach(item => {
        allActivities.push({
          id: item.id,
          type: 'inquiry',
          title: t("newInquiryReceived"),
          message: item.message,
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
      orders.forEach(item => {
        allActivities.push({
          id: item.id,
          type: 'order',
          title: t("newOrderReceived"),
          message: `${t("order")} #${item.id.slice(-6).toUpperCase()} - $${item.totalAmount}`,
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

    // Sort by most recent
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t("loading")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/dashboard"
            className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-primary hover:border-primary/20 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("viewAllActivity")}</h1>
            <p className="text-sm text-slate-500 mt-1">{t("trackSystemUpdates") || "Track all system updates and interactions"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
          <h2 className="font-bold text-slate-900">{t("recentActivity") || "Recent Activity"}</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="p-8 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center gap-6 group">
                <div className={`shrink-0 w-14 h-14 rounded-2xl ${activity.bg} ${activity.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <activity.icon className="w-7 h-7" />
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-900">{activity.title}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-md">
                      {t(activity.type) || activity.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{activity.message}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-xs text-slate-400 font-medium">{activity.time}</span>
                    </div>
                    <span className="text-slate-200">|</span>
                    <span className="text-xs font-bold text-primary">{activity.customer}</span>
                  </div>
                </div>

                <Link 
                  href={activity.type === 'order' ? `/admin/orders` : `/admin/inquiries`}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm active:scale-95"
                >
                  {t("viewDetails") || "View Details"}
                </Link>
              </div>
            ))
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t("noActivityFound") || "No activity found"}</h3>
              <p className="text-slate-400 mt-2">{t("activityWillShowUp") || "Your activity history will appear here once users interact with your platform."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
