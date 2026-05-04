"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../../lib/supabase/client"
import { Mail, CheckCircle, ArrowLeft } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }
    fetchInquiries()
  }, [])

  async function fetchInquiries() {
    const supabase = createClient()
    const { data } = await supabase
      .from("Inquiry")
      .select("*")
      .order("createdAt", { ascending: false })
    
    setInquiries(data || [])
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("Inquiry")
      .update({ status })
      .eq("id", id)
    
    if (error) {
      toast.error("Error updating status")
    } else {
      toast.success(`Marked as ${status}`)
      fetchInquiries()
    }
  }

  return (
    <div>
      <Toaster position="top-right" />

      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{t("customerInquiries")}</h1>
      </div>

      <div className="grid gap-4">
        {inquiries.map((inquiry: any) => (
          <div key={inquiry.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{inquiry.customerName}</h3>
                <p className="text-sm text-gray-600">{inquiry.email} • {inquiry.phone || "No phone"}</p>
              </div>
              <div className="flex gap-2">
                {inquiry.status !== "replied" && (
                  <button
                    onClick={() => updateStatus(inquiry.id, "replied")}
                    className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                  >
                    <CheckCircle className="w-3 h-3" />
                    {t("markReplied")}
                  </button>
                )}
                <span className={`px-3 py-1 rounded-lg text-sm ${
                  inquiry.status === "new" ? "bg-yellow-100 text-yellow-700" :
                  inquiry.status === "read" ? "bg-blue-100 text-blue-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {inquiry.status || "new"}
                </span>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{inquiry.message}</p>
            <div className="text-xs text-gray-400">
              {new Date(inquiry.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
        
        {inquiries.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t("noActivityFound")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
