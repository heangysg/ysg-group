"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "../../contexts/LanguageContext"
import PublicLayout from "../../components/PublicLayout"
import toast, { Toaster } from "react-hot-toast"
import { Search, MapPin, Package, ArrowRight, Truck } from "lucide-react"
import Link from "next/link"

export default function TrackOrderPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    orderId: "",
    phone: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.orderId || !formData.phone) return

    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/orders/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Failed to track order")

      toast.success(language === "kh" ? "បានរកឃើញការបញ្ជាទិញ!" : "Order found!")
      router.push(`/orders/${data.id}`)
    } catch (error: any) {
      console.error("Tracking Error:", error)
      toast.error(error.message || t("orderNotFound"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicLayout>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="bg-[#F8FAFC] min-h-[80vh] flex flex-col items-center justify-center py-20 px-4">
        
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-primary mb-6">
              <Truck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
              {t("trackOrder")}
            </h1>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
              {t("trackOrderDesc")}
            </p>
          </div>

          <div className="solid-card bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <form onSubmit={handleTrackOrder} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{t("orderId")}</label>
                <div className="relative group">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    name="orderId"
                    required
                    value={formData.orderId}
                    onChange={handleInputChange}
                    placeholder={t("enterOrderId")}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">{t("phone")}</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t("enterPhone")}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold transition-all hover:bg-slate-800 active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:pointer-events-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    {t("track")}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-primary transition-colors text-sm">
              <ArrowRight className="w-4 h-4 rotate-180" /> {t("browseEquipment")}
            </Link>
          </div>
        </div>

      </div>
    </PublicLayout>
  )
}
