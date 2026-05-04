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
      <main className="pb-24 pt-12 md:pt-20 px-4">
        <Toaster position="top-center" />
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-12">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">{t("contact")}</h1>
                <p className="text-gray-500 text-lg md:text-xl">Have questions about our machinery? Our team is here to help you find the perfect solution.</p>
              </div>

              <div className="grid gap-8">
                <div className="flex gap-6 items-start group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">{t("phone")}</h4>
                    <p className="text-xl font-bold text-gray-900">+855 12 345 678</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">{t("email")}</h4>
                    <p className="text-xl font-bold text-gray-900">sales@ysgmachinery.com</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">{t("location")}</h4>
                    <p className="text-xl font-bold text-gray-900">Phnom Penh, Cambodia</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm border border-gray-100">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">{t("businessHours")}</h4>
                    <p className="text-xl font-bold text-gray-900">Mon - Fri: 8:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-gray-200/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t("customerName")} *</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300" 
                      placeholder="Your Name"
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t("email")} *</label>
                      <input 
                        type="email" 
                        required 
                        className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300" 
                        placeholder="Email Address"
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t("phone")}</label>
                      <input 
                        type="tel" 
                        className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300" 
                        placeholder="Phone Number"
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">{t("message")} *</label>
                    <textarea 
                      rows={5} 
                      required 
                      className="w-full px-6 py-4 bg-white border border-transparent rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-bold text-gray-900 placeholder:text-gray-300 resize-none" 
                      placeholder="How can we help you?"
                      value={formData.message} 
                      onChange={(e) => setFormData({...formData, message: e.target.value})} 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {language === "kh" ? "បញ្ជូនសារ" : "Send Message"}
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

