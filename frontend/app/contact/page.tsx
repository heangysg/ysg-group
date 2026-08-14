"use client"

import { useState, useEffect } from "react"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Send, Phone, Mail, MapPin, Clock } from "lucide-react"

export default function ContactPage() {
 const [loading, setLoading] = useState(false)
 const { t, language } = useLanguage()
 const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
 const [settings, setSettings] = useState<any>({
 address: "Building 230, St. 271, Sangkat Toul Tompong II, Khan Chamkamon, Phnom Penh.",
 contact_phone: "010 / 011 / 012 / 070 : 309 302",
 contact_email: "yeungshigroup123@gmail.com",
 working_hours: "8 : 00 am – 5:30pm ( Mon – Sat )"
 })

 useEffect(() => {
 const fetchSettings = async () => {
 try {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const res = await fetch(`${API_URL}/api/public/settings`)
 if (res.ok) {
 const { data } = await res.json()
 if (data) {
 setSettings((prev: any) => ({ ...prev, ...data }))
 }
 }
 } catch (err) {
 console.error("Failed to fetch settings:", err)
 }
 }
 fetchSettings()
 }, [])

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)

 const tgMessage = `📬 *ការទំនាក់ទំនងថ្មី (New Contact)* 📬
*ឈ្មោះ (Name):* ${formData.name}
*អ៊ីមែល (Email):* ${formData.email}
*លេខទូរស័ព្ទ (Phone):* ${formData.phone}
*សារ (Message):* ${formData.message}`

 const telegramUrl = `https://t.me/Emma_Heang?text=${encodeURIComponent(tgMessage)}`

 // Save to DB in the background
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 fetch(`${API_URL}/api/public/contact`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(formData)
 }).catch(err => console.error("Failed to save contact to DB", err))

 // Redirect user to Telegram
 window.open(telegramUrl, '_blank')

 toast.success(language === "kh" ? "កំពុងបើក Telegram..." : "Opening Telegram...")
 setFormData({ name: "", email: "", phone: "", message: "" })
 setLoading(false)
 }

 return (
 <PublicLayout>
 <main className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
 <Toaster position="top-center" />
 <div className="max-w-7xl mx-auto px-4 md:px-8">
 
 {/* 🍞 Mobile Responsive Breadcrumbs */}
 <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
 <a href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</a>
 <span className="shrink-0 text-slate-400">/</span>
 <span className="text-slate-900 font-bold truncate min-w-0">{t("contact")}</span>
 </div>

 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200">
 <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#004691] ">
 {t("contact")}
 </h1>
 </div>

 <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

 {/* 💎 Elite Contact Info */}
 <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
 <div className="space-y-4">
 <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
 {language === "kh"
 ? "ប្រសិនបើអ្នកមានចម្ងល់អំពីលក្ខណៈពិសេស ឬចាប់អារម្មណ៍លើផលិតផលពីគេហទំព័ររបស់យើង សូមកុំស្ទាក់ស្ទើរក្នុងការទាក់ទងមកយើងតាមរយៈលេខទូរស័ព្ទ ឬអ៊ីមែល។ យើងខ្ញុំសូមអរគុណយ៉ាងជ្រាលជ្រៅចំពោះការចាប់អារម្មណ៍របស់អ្នកចំពោះផលិតផលរបស់យើង។"
 : "If you have any feature inquiry or you are interested in products from our website, please don't hesitate to contact us through phone number or our email. We truly appreciate for your interested with our products."}
 </p>
 </div>

 <div className="grid gap-4">
 {[
 { icon: Phone, label: t("phone"), value: settings.contact_phone, color: "text-primary" },
 { icon: Mail, label: t("email"), value: settings.contact_email, color: "text-primary" },
 { icon: MapPin, label: t("location"), value: settings.address, color: "text-primary" },
 { icon: Clock, label: language === "kh" ? "ម៉ោងធ្វើការ" : "Working Hours", value: settings.working_hours || "8 : 00 am – 5:30pm ( Mon – Sat )", color: "text-primary" }
 ].map((item, i) => (
 <div key={i} className="flex gap-6 items-center p-6 bg-slate-50 rounded-md border border-slate-100 group hover:bg-slate-100 transition-all cursor-pointer">
 <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
 <item.icon className="w-5 h-5" />
 </div>
 <div>
 <h4 className="text-[10px] font-bold font-medium text-slate-900 mb-1">{item.label}</h4>
 <p className="text-[16px] md:text-[18px] font-bold text-slate-900 ">{item.value}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* 🏗️ Professional Contact Form */}
 <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right duration-1000">
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-6">
 <div className="space-y-2">
 <label className="text-xs font-bold font-medium text-slate-900 ml-1">{t("customerName")} *</label>
 <input
 type="text"
 required
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 text-[14px]"
 placeholder={language === "kh" ? "ឈ្មោះពេញរបស់អ្នក" : "Your Full Name"}
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 />
 </div>

 <div className="grid md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-xs font-bold font-medium text-slate-900 ml-1">{t("email")} *</label>
 <input
 type="email"
 required
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 text-[14px]"
 placeholder={language === "kh" ? "អាសយដ្ឋានអ៊ីមែល" : "Email Address"}
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-bold font-medium text-slate-900 ml-1">{t("phone")}</label>
 <input
 type="tel"
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 text-[14px]"
 placeholder={language === "kh" ? "លេខទូរស័ព្ទ" : "Phone Number"}
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-bold font-medium text-slate-900 ml-1">{t("message")} *</label>
 <textarea
 rows={5}
 required
 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-md focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 text-[14px] resize-none"
 placeholder={language === "kh" ? "តើអ្នកចង់ឱ្យយើងជួយអ្វីខ្លះចំពោះអាជីវកម្មរបស់អ្នក?" : "How can we help your business?"}
 value={formData.message}
 onChange={(e) => setFormData({ ...formData, message: e.target.value })}
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-primary text-white py-4 rounded-md font-bold text-xs flex items-center justify-center gap-3 disabled:opacity-50 mt-6 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all"
 >
 {loading ? (
 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
 ) : (
 <>
 {language === "kh" ? "បញ្ជូនសារ" : "Send Message"}
 <Send className="w-4 h-4" />
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
