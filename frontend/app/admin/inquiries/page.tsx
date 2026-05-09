"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../../lib/supabase/client"
import { Mail, CheckCircle, ArrowLeft } from "lucide-react"
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
    const supabase = createClient()
    const { data, error } = await supabase
      .from("Inquiry")
      .select("*")
      .order("createdAt", { ascending: false })
    
    if (error) {
      console.error("Error fetching inquiries:", error)
    } else {
      setInquiries(data || [])
    }
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("Inquiry")
      .update({ status })
      .eq("id", id)
    
    if (error) {
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
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{t("loading")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-primary hover:border-primary/20 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("customerInquiries")}</h1>
            <p className="text-sm text-slate-500 mt-1">{t("manageInquiriesDesc") || "Respond to customer questions and machinery requests"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {inquiries.map((inquiry: any) => (
          <div key={inquiry.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{inquiry.name || inquiry.customerName || t("walkInCustomer")}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                      <span>{inquiry.email}</span>
                      <span className="text-slate-200">|</span>
                      <span>{inquiry.phone || t("noPhoneProvided") || "No phone"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {inquiry.status !== "replied" && (
                    <button
                      onClick={() => updateStatus(inquiry.id, "replied")}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t("markReplied")}
                    </button>
                  )}
                  <span className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    inquiry.status === "new" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                    inquiry.status === "read" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                    "bg-slate-50 text-slate-600 border border-slate-100"
                  }`}>
                    {inquiry.status || "new"}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{inquiry.message}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(inquiry.createdAt).toLocaleString(language === 'kh' ? 'km-KH' : 'en-US')}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {inquiries.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t("noActivityFound")}</h3>
            <p className="text-slate-400 mt-2">{t("noInquiriesDesc") || "Customer messages will appear here once they contact you."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
