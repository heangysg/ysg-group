"use client"

import { useState } from "react"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Send, Phone, Mail, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const { t, language } = useLanguage()
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from("ContactMessage").insert([formData])
    if (error) {
      toast.error(language === "kh" ? "ការបញ្ជូនបានបរាជ័យ" : "Failed to send message")
    } else {
      toast.success(language === "kh" ? "សារត្រូវបានផ្ញើដោយជោគជ័យ!" : "Message sent successfully!")
      setFormData({ name: "", email: "", phone: "", message: "" })
    }
    setLoading(false)
  }

  return (
    <PublicLayout>
      <main className="pb-32 pt-24 md:pt-40 px-6 bg-nichhy min-h-screen">
        <Toaster position="top-center" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            
            {/* 💎 Elite Contact Info */}
            <div className="space-y-16 animate-in fade-in slide-in-from-left duration-700">
              <div className="space-y-6">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">Support Portal</span>
                <h1 className="text-5xl md:text-7xl font-black text-slate-950 leading-[0.9] tracking-tighter uppercase">
                  {t("contact")}
                </h1>
                <p className="text-slate-500 text-lg md:text-xl font-bold italic opacity-80 leading-relaxed max-w-xl">
                  Have questions about our machinery? Our elite team is here to help you find the perfect industrial solution.
                </p>
              </div>

              <div className="grid gap-10">
                <div className="flex gap-8 items-center group p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lux-deep transition-soft">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-soft shadow-sm border border-slate-100">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">{t("phone")}</h4>
                    <p className="text-2xl font-black text-slate-950 tracking-tight group-hover:text-primary transition-soft">+855 12 345 678</p>
                  </div>
                </div>

                <div className="flex gap-8 items-center group p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lux-deep transition-soft">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-soft shadow-sm border border-slate-100">
                    <Mail className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">{t("email")}</h4>
                    <p className="text-2xl font-black text-slate-950 tracking-tight group-hover:text-primary transition-soft">sales@ysgmachinery.com</p>
                  </div>
                </div>

                <div className="flex gap-8 items-center group p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lux-deep transition-soft">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-soft shadow-sm border border-slate-100">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">{t("location")}</h4>
                    <p className="text-2xl font-black text-slate-950 tracking-tight group-hover:text-primary transition-soft">Phnom Penh, Cambodia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 🏗️ Heavy Industrial Boutique Form */}
            <div className="bg-white rounded-[4rem] p-12 md:p-20 border border-slate-100 shadow-lux-deep animate-in fade-in slide-in-from-right duration-1000">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid gap-10">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">{t("customerName")} *</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-10 py-7 bg-slate-50/80 border border-slate-100 rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-soft outline-none font-black text-slate-950 placeholder:text-slate-300 text-[18px]" 
                      placeholder="Your Name"
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">{t("email")} *</label>
                      <input 
                        type="email" 
                        required 
                        className="w-full px-10 py-7 bg-slate-50/80 border border-slate-100 rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-soft outline-none font-black text-slate-950 placeholder:text-slate-300 text-[18px]" 
                        placeholder="Email Address"
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">{t("phone")}</label>
                      <input 
                        type="tel" 
                        className="w-full px-10 py-7 bg-slate-50/80 border border-slate-100 rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-soft outline-none font-black text-slate-950 placeholder:text-slate-300 text-[18px]" 
                        placeholder="Phone Number"
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">{t("message")} *</label>
                    <textarea 
                      rows={6} 
                      required 
                      className="w-full px-10 py-8 bg-slate-50/80 border border-slate-100 rounded-[2.5rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-soft outline-none font-black text-slate-950 placeholder:text-slate-300 text-[18px] resize-none" 
                      placeholder="How can we help you?"
                      value={formData.message} 
                      onChange={(e) => setFormData({...formData, message: e.target.value})} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-primary text-white py-7 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[13px] shadow-2xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 transition-soft flex items-center justify-center gap-5 disabled:opacity-50 mt-10"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-7 w-7 border-3 border-white/20 border-t-white" />
                  ) : (
                    <>
                      {language === "kh" ? "បញ្ជូនសារ" : "Send Message"}
                      <Send className="w-6 h-6" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
