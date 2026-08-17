"use client"

import { useState, useEffect } from "react"
import toast, { Toaster } from "react-hot-toast"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Send, Phone, Mail, MapPin, Clock, MessageSquare, Package, User, Hash, ChevronRight } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function ContactPage() {
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<"contact" | "inquiry">("contact")

  const [settings, setSettings] = useState<any>({
    address: "Building 230, St. 271, Sangkat Toul Tompong II, Khan Chamkamon, Phnom Penh.",
    contact_phone: "010 / 011 / 012 / 070 : 309 302",
    contact_email: "yeungshigroup123@gmail.com",
    working_hours: "8 : 00 am – 5:30pm ( Mon – Sat )",
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/settings`)
        if (res.ok) {
          const { data } = await res.json()
          if (data) setSettings((prev: any) => ({ ...prev, ...data }))
        }
      } catch {
        // Silently fallback to default settings on network errors
      }
    }
    fetchSettings()
  }, [])

  // --- Contact Form ---
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" })
  const [contactLoading, setContactLoading] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      })

      if (res.ok) {
        toast.success(language === "kh" ? "សារបានផ្ញើដោយជោគជ័យ! យើងនឹងទំនាក់ទំនងមកអ្នកឆាប់ៗ។" : "Message sent successfully! We'll get back to you soon.")
        setContactForm({ name: "", email: "", phone: "", message: "" })
      } else {
        toast.error(language === "kh" ? "មិនអាចផ្ញើសារបាន សូមព្យាយាមម្ដងទៀត។" : "Failed to send message. Please try again.")
      }
    } catch {
      toast.error(language === "kh" ? "បញ្ហាបណ្ដាញ! សូមពិនិត្យការតភ្ជាប់ Internet។" : "Network error! Please check your connection.")
    }

    setContactLoading(false)
  }

  // --- Inquiry Form ---
  const [inquiryForm, setInquiryForm] = useState({
    customerName: "", email: "", phone: "", productName: "",
    quantity: "", companyName: "", message: "",
  })
  const [inquiryLoading, setInquiryLoading] = useState(false)
  const [inquirySubmitted, setInquirySubmitted] = useState(false)

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInquiryLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/public/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: inquiryForm.customerName,
          customerPhone: inquiryForm.phone,
          email: inquiryForm.email,
          companyName: inquiryForm.companyName,
          quantity: inquiryForm.quantity,
          message: `[Product: ${inquiryForm.productName}] ${inquiryForm.message}`,
          source: "contact-inquiry-tab",
        }),
      })

      if (res.ok) {
        toast.success(language === "kh" ? "សំណើររបស់អ្នកបានផ្ញើដោយជោគជ័យ! យើងនឹងទំនាក់ទំនងមកអ្នកឆាប់ៗ។" : "Inquiry sent successfully! We'll contact you soon.")
        setInquirySubmitted(true)
      } else {
        toast.error(language === "kh" ? "មិនអាចផ្ញើបាន សូមព្យាយាមម្ដងទៀត។" : "Failed to send. Please try again.")
      }
    } catch {
      toast.error(language === "kh" ? "បញ្ហាបណ្ដាញ! សូមពិនិត្យការតភ្ជាប់ Internet។" : "Network error! Please check your connection.")
    }

    setInquiryLoading(false)
  }

  const contactInfo = [
    { icon: Phone, label: t("phone"), value: settings.contact_phone },
    { icon: Mail, label: t("email"), value: settings.contact_email },
    { icon: MapPin, label: t("location"), value: settings.address },
    { icon: Clock, label: language === "kh" ? "ម៉ោងធ្វើការ" : "Working Hours", value: settings.working_hours || "8 : 00 am – 5:30pm ( Mon – Sat )" },
  ]

  return (
    <PublicLayout>
      <Toaster position="top-center" />
      <main className="min-h-screen bg-slate-50 font-sans pb-24 relative">

        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 md:pt-12">

          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-10">
            {/* Breadcrumb */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
              <a href="/" className="hover:text-[#004691] transition-colors">{t("home")}</a>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-[#004691]">
                {activeTab === "contact" ? t("contact") : (language === "kh" ? "សំណួរផលិតផល" : "Product Inquiry")}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              {language === "kh" ? "ទំនាក់ទំនងមកយើង" : "Get in Touch"}
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium">
              {language === "kh"
                ? "ប្រសិនបើអ្នកមានចម្ងល់អំពីលក្ខណៈពិសេស ឬចាប់អារម្មណ៍លើផលិតផលពីគេហទំព័ររបស់យើង សូមកុំស្ទាក់ស្ទើរក្នុងការទាក់ទងមកយើង។"
                : "If you have any questions or are interested in our products, please don't hesitate to contact us."}
            </p>
          </div>

          {/* Clean Minimalist Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-slate-200/60 p-1 rounded-md inline-flex">
              <button
                onClick={() => setActiveTab("contact")}
                className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-all ${
                  activeTab === "contact"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Mail className="w-4 h-4" />
                {t("contact")}
              </button>
              <button
                onClick={() => { setActiveTab("inquiry"); setInquirySubmitted(false) }}
                className={`flex items-center gap-2 px-6 py-2 rounded text-sm font-bold transition-all ${
                  activeTab === "inquiry"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {language === "kh" ? "សាកសួរផលិតផល" : "Product Inquiry"}
              </button>
            </div>
          </div>

          {/* ===================== CONTACT TAB ===================== */}
          {activeTab === "contact" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="grid lg:grid-cols-5">
                
                {/* Left: Contact Info */}
                <div className="lg:col-span-2 bg-slate-900 text-white p-8 md:p-10 flex flex-col">
                  <h3 className="text-xl font-bold mb-8">
                    {language === "kh" ? "ព័ត៌មានទំនាក់ទំនង" : "Contact Information"}
                  </h3>
                  
                  <div className="space-y-8 flex-1">
                    {contactInfo.map((item, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <item.icon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</h4>
                          <p className="text-sm font-medium leading-relaxed">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-3 p-8 md:p-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">
                    {language === "kh" ? "ផ្ញើសារមកយើង" : "Send us a Message"}
                  </h3>

                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">{t("customerName")} *</label>
                      <input
                        type="text" required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm"
                        placeholder={language === "kh" ? "ឈ្មោះពេញរបស់អ្នក" : "Your Full Name"}
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">{t("email")} *</label>
                        <input
                          type="email" required
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm"
                          placeholder="example@email.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">{t("phone")}</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm"
                          placeholder="0xx xxx xxx"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">{t("message")} *</label>
                      <textarea
                        rows={4} required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm resize-none"
                        placeholder={language === "kh" ? "តើអ្នកចង់ឱ្យយើងជួយអ្វីខ្លះ?" : "How can we help you?"}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>
                    
                    <button
                      type="submit" disabled={contactLoading}
                      className="w-full md:w-auto md:px-8 bg-[#004691] text-white py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#003875] transition-all disabled:opacity-50 mt-2"
                    >
                      {contactLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                      ) : (
                        <>{language === "kh" ? "បញ្ជូនសារ" : "Send Message"}<Send className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ===================== INQUIRY TAB ===================== */}
          {activeTab === "inquiry" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {inquirySubmitted ? (
                <div className="p-16 text-center max-w-xl mx-auto">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Send className="w-7 h-7 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {language === "kh" ? "បានផ្ញើជោគជ័យ!" : "Inquiry Sent Successfully!"}
                  </h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
                    {language === "kh" ? "សំណើររបស់អ្នកត្រូវបានទទួលយក។ យើងនឹងទំនាក់ទំនងមកអ្នកឆាប់ៗនេះ។" : "Your inquiry has been received. We will contact you shortly."}
                  </p>
                  <button
                    onClick={() => setInquirySubmitted(false)}
                    className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2.5 rounded-md font-bold text-sm transition-all"
                  >
                    {language === "kh" ? "ស្នើសុំម្ដងទៀត" : "Submit Another Inquiry"}
                  </button>
                </div>
              ) : (
                <div className="p-8 md:p-10">
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {language === "kh" ? "សំណុំបែបបទស្នើសុំផលិតផល" : "Product Inquiry Form"}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {language === "kh"
                        ? "សូមបំពេញព័ត៌មានលម្អិតខាងក្រោម ដើម្បីយើងអាចផ្ដល់តម្លៃ និងព័ត៌មានបានត្រឹមត្រូវ។"
                        : "Please provide the details below so we can give you an accurate quote."}
                    </p>
                  </div>

                  <form onSubmit={handleInquirySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />{language === "kh" ? "ឈ្មោះពេញ *" : "Full Name *"}
                        </label>
                        <input required name="customerName" value={inquiryForm.customerName}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, customerName: e.target.value })}
                          type="text" placeholder={language === "kh" ? "ឈ្មោះពេញរបស់អ្នក" : "Your Full Name"}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm" />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />{language === "kh" ? "លេខទូរស័ព្ទ *" : "Phone Number *"}
                        </label>
                        <input required name="phone" value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                          type="tel" placeholder="0xx xxx xxx"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm" />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />{language === "kh" ? "អ៊ីមែល" : "Email Address"}
                        </label>
                        <input name="email" value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                          type="email" placeholder="example@email.com"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm" />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-slate-400" />{language === "kh" ? "ឈ្មោះក្រុមហ៊ុន" : "Company Name"}
                        </label>
                        <input name="companyName" value={inquiryForm.companyName}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
                          type="text" placeholder={language === "kh" ? "ក្រុមហ៊ុន..." : "Company..."}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm" />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#004691]" />{language === "kh" ? "ផលិតផលដែលចាប់អារម្មណ៍ *" : "Product of Interest *"}
                        </label>
                        <input required name="productName" value={inquiryForm.productName}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, productName: e.target.value })}
                          type="text" placeholder={language === "kh" ? "ឧ. ម៉ាស៊ីនកិនស្រូវ..." : "e.g. Rice Mill Machine..."}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm" />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-slate-400" />{language === "kh" ? "ចំនួន" : "Quantity"}
                        </label>
                        <input name="quantity" value={inquiryForm.quantity}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                          type="text" placeholder={language === "kh" ? "ឧ. 1, 5..." : "e.g. 1, 5..."}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm" />
                      </div>
                      
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#004691]" />{language === "kh" ? "សារ ឬតម្រូវការបន្ថែម *" : "Additional Requirements *"}
                      </label>
                      <textarea required name="message" value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        rows={4}
                        placeholder={language === "kh" ? "សូមរៀបរាប់លម្អិត..." : "Please describe in detail..."}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm resize-none" />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit" disabled={inquiryLoading}
                        className="w-full md:w-auto md:px-8 bg-[#004691] text-white py-3 rounded-md font-bold text-sm hover:bg-[#003875] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {inquiryLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><Send className="w-3.5 h-3.5" />{language === "kh" ? "ផ្ញើសំណើរសាកសួរ" : "Submit Inquiry"}</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </PublicLayout>
  )
}
