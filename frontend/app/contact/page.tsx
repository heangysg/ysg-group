"use client"

import { useState, useEffect } from "react"
import toast, { Toaster } from "react-hot-toast"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Send, Phone, Mail, MapPin, Clock, MessageSquare, Package, User, Hash } from "lucide-react"

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
      } catch (err) {
        console.error("Failed to fetch settings:", err)
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

    const tgMessage = `📬 ការទំនាក់ទំនងថ្មី (New Contact) 📬
ឈ្មោះ (Name): ${contactForm.name}
អ៊ីមែល (Email): ${contactForm.email}
លេខទូរស័ព្ទ (Phone): ${contactForm.phone}
សារ (Message): ${contactForm.message}`

    fetch(`${API_URL}/api/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactForm),
    }).catch(err => console.error("Failed to save contact to DB", err))

    window.open(`https://t.me/Emma_Heang?text=${encodeURIComponent(tgMessage)}`, "_blank")
    toast.success(language === "kh" ? "កំពុងបើក Telegram..." : "Opening Telegram...")
    setContactForm({ name: "", email: "", phone: "", message: "" })
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

    const tgMessage = `🚨 ការសាកសួរផលិតផល (Product Inquiry) 🚨
ឈ្មោះ (Name): ${inquiryForm.customerName}
ក្រុមហ៊ុន (Company): ${inquiryForm.companyName || "N/A"}
អ៊ីមែល (Email): ${inquiryForm.email}
លេខទូរស័ព្ទ (Phone): ${inquiryForm.phone}
ផលិតផល (Product): ${inquiryForm.productName}
ចំនួន (Quantity): ${inquiryForm.quantity || "N/A"}
សារ (Message): ${inquiryForm.message}`

    fetch(`${API_URL}/api/public/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: inquiryForm.customerName,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        companyName: inquiryForm.companyName,
        quantity: inquiryForm.quantity,
        message: `[Product: ${inquiryForm.productName}] ${inquiryForm.message}`,
        source: "contact-inquiry-tab",
      }),
    }).catch(err => console.error("Failed to save inquiry to DB", err))

    window.open(`https://t.me/Emma_Heang?text=${encodeURIComponent(tgMessage)}`, "_blank")
    toast.success(language === "kh" ? "កំពុងបើក Telegram..." : "Opening Telegram...")
    setInquirySubmitted(true)
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
      <main className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
        <div className="max-w-5xl mx-auto px-4 md:px-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mb-4">
            <a href="/" className="hover:text-[#004691] transition-colors">{t("home")}</a>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-bold">
              {activeTab === "contact" ? t("contact") : (language === "kh" ? "ស្នើសុំព័ត៌មាន" : "Inquiry")}
            </span>
          </div>

          {/* Header */}
          <div className="pb-4 mb-6 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#004691]">
              {t("contact")}
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-md w-fit mb-8">
            <button
              onClick={() => setActiveTab("contact")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all ${
                activeTab === "contact"
                  ? "bg-[#004691] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Mail className="w-4 h-4" />
              {t("contact")}
            </button>
            <button
              onClick={() => { setActiveTab("inquiry"); setInquirySubmitted(false) }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all ${
                activeTab === "inquiry"
                  ? "bg-[#004691] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {language === "kh" ? "ស្នើសុំព័ត៌មាន" : "Product Inquiry"}
            </button>
          </div>

          {/* ===================== CONTACT TAB ===================== */}
          {activeTab === "contact" && (
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

              {/* Contact Info */}
              <div className="space-y-8">
                <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                  {language === "kh"
                    ? "ប្រសិនបើអ្នកមានចម្ងល់អំពីលក្ខណៈពិសេស ឬចាប់អារម្មណ៍លើផលិតផលពីគេហទំព័ររបស់យើង សូមកុំស្ទាក់ស្ទើរក្នុងការទាក់ទងមកយើង។"
                    : "If you have any questions or are interested in our products, please don't hesitate to contact us."}
                </p>
                <div className="grid gap-4">
                  {contactInfo.map((item, i) => (
                    <div key={i} className="flex gap-6 items-center p-6 bg-slate-50 rounded-md border border-slate-100 hover:bg-slate-100 transition-all group cursor-pointer">
                      <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center text-[#004691] shadow-sm group-hover:scale-110 transition-transform shrink-0">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</h4>
                        <p className="text-base md:text-lg font-bold text-slate-900">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 ml-1">{t("customerName")} *</label>
                    <input
                      type="text" required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-medium text-slate-900 text-sm"
                      placeholder={language === "kh" ? "ឈ្មោះពេញរបស់អ្នក" : "Your Full Name"}
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 ml-1">{t("email")} *</label>
                      <input
                        type="email" required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-medium text-slate-900 text-sm"
                        placeholder="example@email.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900 ml-1">{t("phone")}</label>
                      <input
                        type="tel"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-medium text-slate-900 text-sm"
                        placeholder="0xx xxx xxx"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 ml-1">{t("message")} *</label>
                    <textarea
                      rows={5} required
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-medium text-slate-900 text-sm resize-none"
                      placeholder={language === "kh" ? "តើអ្នកចង់ឱ្យយើងជួយអ្វីខ្លះ?" : "How can we help you?"}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit" disabled={contactLoading}
                    className="w-full bg-[#004691] text-white py-4 rounded-md font-bold text-sm flex items-center justify-center gap-3 disabled:opacity-50 mt-2 hover:bg-[#003366] transition-all active:scale-95 shadow-lg shadow-[#004691]/30"
                  >
                    {contactLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                    ) : (
                      <>{language === "kh" ? "បញ្ជូនសារ" : "Send Message"}<Send className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===================== INQUIRY TAB ===================== */}
          {activeTab === "inquiry" && (
            <>
              {inquirySubmitted ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Send className="w-9 h-9 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {language === "kh" ? "បានផ្ញើជោគជ័យ!" : "Inquiry Sent!"}
                  </h2>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
                    {language === "kh" ? "ក្រុមការងារ YSG នឹងទំនាក់ទំនងមកអ្នកក្នុងពេលឆាប់ៗ" : "The YSG team will contact you soon."}
                  </p>
                  <button
                    onClick={() => setInquirySubmitted(false)}
                    className="inline-flex items-center gap-2 bg-[#004691] text-white px-6 py-3 rounded-md font-bold text-sm hover:bg-[#003366] transition-all"
                  >
                    {language === "kh" ? "ស្នើសុំម្ដងទៀត" : "Submit Another"}
                  </button>
                </div>
              ) : (
                <div className="max-w-3xl">
                  <p className="text-slate-500 text-sm font-medium mb-6">
                    {language === "kh"
                      ? "ប្រសិនបើអ្នកចាប់អារម្មណ៍លើផលិតផលណាមួយ សូមបំពេញទម្រង់ខាងក្រោម"
                      : "Interested in our products? Fill out the form below and we'll get back to you."}
                  </p>
                  <form onSubmit={handleInquirySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{language === "kh" ? "ឈ្មោះ *" : "Full Name *"}</span>
                        </label>
                        <input required name="customerName" value={inquiryForm.customerName}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, customerName: e.target.value })}
                          type="text" placeholder={language === "kh" ? "វាយបញ្ចូលឈ្មោះ..." : "Your name..."}
                          className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{language === "kh" ? "លេខទូរស័ព្ទ *" : "Phone *"}</span>
                        </label>
                        <input required name="phone" value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                          type="tel" placeholder="0xx xxx xxx"
                          className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{language === "kh" ? "អ៊ីមែល" : "Email"}</span>
                        </label>
                        <input name="email" value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                          type="email" placeholder="example@email.com"
                          className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          {language === "kh" ? "ឈ្មោះក្រុមហ៊ុន (ប្រសិនមាន)" : "Company (Optional)"}
                        </label>
                        <input name="companyName" value={inquiryForm.companyName}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, companyName: e.target.value })}
                          type="text" placeholder={language === "kh" ? "ឈ្មោះក្រុមហ៊ុន..." : "Company name..."}
                          className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{language === "kh" ? "ផលិតផលដែលចាប់អារម្មណ៍ *" : "Product of Interest *"}</span>
                        </label>
                        <input required name="productName" value={inquiryForm.productName}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, productName: e.target.value })}
                          type="text" placeholder={language === "kh" ? "ឈ្មោះម៉ាស៊ីន / ផលិតផល..." : "Machine / product name..."}
                          className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{language === "kh" ? "ចំនួន" : "Quantity"}</span>
                        </label>
                        <input name="quantity" value={inquiryForm.quantity}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, quantity: e.target.value })}
                          type="text" placeholder={language === "kh" ? "ឧ. 1, 5, 10..." : "e.g. 1, 5, 10..."}
                          className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />{language === "kh" ? "សារបន្ថែម *" : "Message *"}</span>
                      </label>
                      <textarea required name="message" value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        rows={5}
                        placeholder={language === "kh" ? "ពិពណ៌នាអំពីតម្រូវការរបស់អ្នក..." : "Describe your requirements..."}
                        className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium resize-none" />
                    </div>
                    <button
                      type="submit" disabled={inquiryLoading}
                      className="w-full bg-[#004691] hover:bg-[#003366] text-white py-4 rounded-md font-bold text-sm transition-all active:scale-95 shadow-lg shadow-[#004691]/30 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {inquiryLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><Send className="w-4 h-4" />{language === "kh" ? "ផ្ញើការសាកសួរ" : "Send Inquiry"}</>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </div>
      </main>
    </PublicLayout>
  )
}
