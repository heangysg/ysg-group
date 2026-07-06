"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, CheckCircle, ArrowLeft, Clock } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t, language } = useLanguage()

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (!userStr) {
      router.push("/admin/login")
      return
    }
    fetchInquiries()
  }, [router])

  async function fetchInquiries() {
    setLoading(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem("ysg_admin_token")
    const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    
    const res = await fetch(`${API_URL}/api/admin/read`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        table: "Inquiry",
        order: { column: "createdAt", ascending: false }
      })
    })
    
    const result = await res.json()

    if (result.error) {
      console.error("Error fetching inquiries:", result.error)
    } else {
      setInquiries(result.data || [])
    }
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const token = localStorage.getItem("ysg_admin_token")
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const res = await fetch(`${API_URL}/api/admin/crud`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ table: "Inquiry", action: "update", match: { id }, data: { status } })
    })

    if (!res.ok) {
      toast.error(t("errorUpdatingStatus") || "Error updating status")
    } else {
      toast.success(t("statusUpdated") || "Status updated!")
      fetchInquiries()
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">{t("loading")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white border-2 border-slate-900 text-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{t("customerInquiries")}</h1>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{t("manageInquiriesDesc") || "Respond to customer questions and machinery requests"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {inquiries.map((inquiry: any) => (
          <div key={inquiry.id} className="solid-card bg-white p-0 flex flex-col">
            <div className="p-8 border-b-2 border-slate-900 bg-primary">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white border-2 border-slate-900 shadow-hard text-slate-900 flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xl uppercase tracking-wider">{inquiry.name || inquiry.customerName || t("walkInCustomer")}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-900 font-bold uppercase tracking-widest">
                      <span>{inquiry.email}</span>
                      <span className="text-slate-900">|</span>
                      <span>{inquiry.phone || t("noPhoneProvided") || "No phone"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <a
                    href={`mailto:${inquiry.email}?subject=Re: Inquiry at YSG Machinery`}
                    onClick={() => updateStatus(inquiry.id, "replied")}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border-2 border-slate-900 shadow-hard font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-hard-lg transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    {language === "kh" ? "ឆ្លើយតប" : "Reply"}
                  </a>
                  {inquiry.status !== "replied" && (
                    <button
                      onClick={() => updateStatus(inquiry.id, "replied")}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-900 border-2 border-emerald-900 shadow-hard font-bold text-xs uppercase tracking-widest hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t("markReplied")}
                    </button>
                  )}
                  <span className={`px-5 py-3 border-2 shadow-hard text-xs font-bold uppercase tracking-widest ${inquiry.status === "new" ? "bg-amber-50 text-amber-900 border-amber-900" :
                    inquiry.status === "read" ? "bg-blue-50 text-blue-900 border-blue-900" :
                      "bg-slate-50 text-slate-900 border-slate-900"
                    }`}>
                    {inquiry.status || "new"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50">
              <p className="text-slate-900 leading-relaxed text-sm whitespace-pre-wrap font-bold">{inquiry.message}</p>
            </div>

            <div className="px-8 py-4 bg-white border-t-2 border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                {new Date(inquiry.createdAt).toLocaleString(language === 'kh' ? 'km-KH' : 'en-US')}
              </div>
            </div>
          </div>
        ))}

        {inquiries.length === 0 && (
          <div className="solid-card bg-white p-20 text-center">
            <div className="w-24 h-24 bg-primary border-2 border-slate-900 shadow-hard flex items-center justify-center mx-auto mb-8">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">{t("noActivityFound")}</h3>
            <p className="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs">{t("noInquiriesDesc") || "Customer messages will appear here once they contact you."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
