"use client"

import { useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Send, MessageSquare, User, Phone, Mail, Package, Hash, ArrowLeft } from "lucide-react"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function InquiryPage() {
  const { language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    productName: "",
    quantity: "",
    companyName: "",
    country: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const tgMessage = `🚨 ការសាកសួរផលិតផល (Product Inquiry) 🚨
ឈ្មោះ (Name): ${form.customerName}
ក្រុមហ៊ុន (Company): ${form.companyName || "N/A"}
ប្រទេស (Country): ${form.country || "Cambodia"}
អ៊ីមែល (Email): ${form.email}
លេខទូរស័ព្ទ (Phone): ${form.phone}
ផលិតផល (Product): ${form.productName}
ចំនួន (Quantity): ${form.quantity || "N/A"}
សារ (Message): ${form.message}`

    // Save to DB
    try {
      await fetch(`${API_URL}/api/public/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          email: form.email,
          phone: form.phone,
          companyName: form.companyName,
          country: form.country,
          quantity: form.quantity,
          message: `[Product: ${form.productName}] ${form.message}`,
          source: "inquiry-page",
        }),
      })
    } catch (err) {
      console.error("Failed to save inquiry to DB", err)
    }

    // Open Telegram
    const telegramUrl = `https://t.me/Emma_Heang?text=${encodeURIComponent(tgMessage)}`
    window.open(telegramUrl, "_blank")

    toast.success(language === "kh" ? "កំពុងបើក Telegram..." : "Opening Telegram...")
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <PublicLayout>
      <Toaster position="top-center" />
      <main className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
        <div className="max-w-4xl mx-auto px-4 md:px-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mb-6">
            <Link href="/" className="hover:text-[#004691] transition-colors">
              {language === "kh" ? "ទំព័រដើម" : "Home"}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-bold">
              {language === "kh" ? "ស្នើសុំព័ត៌មាន" : "Inquiry"}
            </span>
          </div>

          {/* Page Header */}
          <div className="mb-8 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#004691] rounded-md flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#004691]">
                {language === "kh" ? "ទំព័រស្នើសុំព័ត៌មាន" : "Product Inquiry"}
              </h1>
            </div>
            <p className="text-slate-500 text-sm font-medium ml-13 mt-1">
              {language === "kh"
                ? "ប្រសិនបើអ្នកចាប់អារម្មណ៍លើផលិតផលណាមួយ សូមបំពេញទម្រង់ខាងក្រោម ហើយក្រុមការងារយើងនឹងឆ្លើយតបឆាប់ៗ"
                : "Interested in our products? Fill out the form below and our team will get back to you promptly."}
            </p>
          </div>

          {submitted ? (
            /* Success State */
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Send className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {language === "kh" ? "បានផ្ញើជោគជ័យ!" : "Inquiry Sent!"}
              </h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-8">
                {language === "kh"
                  ? "សូមអរគុណ! ក្រុមការងារ YSG នឹងទំនាក់ទំនងមកអ្នកវិញក្នុងពេលឆាប់ៗ"
                  : "Thank you! The YSG team will contact you soon."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => { setSubmitted(false); setForm({ customerName: "", email: "", phone: "", productName: "", quantity: "", companyName: "", country: "", message: "" }) }}
                  className="inline-flex items-center gap-2 border border-[#004691] text-[#004691] px-6 py-3 rounded-md font-bold text-sm hover:bg-blue-50 transition-all"
                >
                  {language === "kh" ? "ស្នើសុំម្ដងទៀត" : "Submit Another"}
                </button>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-[#004691] text-white px-6 py-3 rounded-md font-bold text-sm hover:bg-[#003366] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {language === "kh" ? "ត្រឡប់ទៅបញ្ជីផលិតផល" : "Browse Products"}
                </Link>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {language === "kh" ? "ឈ្មោះ *" : "Full Name *"}
                    </span>
                  </label>
                  <input
                    required
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    type="text"
                    placeholder={language === "kh" ? "វាយបញ្ចូលឈ្មោះ..." : "Enter your name..."}
                    className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {language === "kh" ? "លេខទូរស័ព្ទ *" : "Phone Number *"}
                    </span>
                  </label>
                  <input
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    placeholder="0xx xxx xxx"
                    className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {language === "kh" ? "អ៊ីមែល" : "Email"}
                    </span>
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    {language === "kh" ? "ឈ្មោះក្រុមហ៊ុន (ប្រសិនមាន)" : "Company Name (Optional)"}
                  </label>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    type="text"
                    placeholder={language === "kh" ? "ឈ្មោះក្រុមហ៊ុន..." : "Your company name..."}
                    className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      {language === "kh" ? "ឈ្មោះផលិតផលដែលចាប់អារម្មណ៍ *" : "Product of Interest *"}
                    </span>
                  </label>
                  <input
                    required
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    type="text"
                    placeholder={language === "kh" ? "ឈ្មោះម៉ាស៊ីន / ផលិតផល..." : "Machine / product name..."}
                    className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />
                      {language === "kh" ? "ចំនួនដែលត្រូវការ" : "Quantity Needed"}
                    </span>
                  </label>
                  <input
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    type="text"
                    placeholder={language === "kh" ? "ឧ. 1, 5, 10..." : "e.g. 1, 5, 10..."}
                    className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {language === "kh" ? "សារបន្ថែម *" : "Message *"}
                  </span>
                </label>
                <textarea
                  required
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder={language === "kh"
                    ? "ពិពណ៌នាអំពីតម្រូវការ ឬ សំណួររបស់អ្នក..."
                    : "Describe your requirements or questions..."}
                  className="w-full px-4 py-3 bg-slate-50 rounded-md border border-slate-200 focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 outline-none transition-all text-slate-900 text-sm font-medium resize-none"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 text-sm text-[#004691] font-medium flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  {language === "kh"
                    ? "បន្ទាប់ពីចុច \"ផ្ញើការសាកសួរ\" Telegram នឹងបើកដោយស្វ័យប្រវត្តិ ដើម្បីបញ្ជាក់ការទំនាក់ទំនង"
                    : "After clicking \"Send Inquiry\", Telegram will open automatically to confirm the contact."}
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004691] hover:bg-[#003366] text-white py-4 rounded-md font-bold text-sm sm:text-base transition-all active:scale-95 shadow-lg shadow-[#004691]/30 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {language === "kh" ? "ផ្ញើការសាកសួរ" : "Send Inquiry"}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </PublicLayout>
  )
}
