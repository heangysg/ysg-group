"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../../contexts/CartContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PublicLayout from "../../components/PublicLayout"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, Truck, User, Phone, MapPin, Package, Check, ArrowRight, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { getValidImages, getOptimizedImageUrl } from "../../lib/imageUtils"

export default function CheckoutPage() {
  const { items, cartTotal, removeFromCart, updateQuantity, clearCart, isLoaded } = useCart()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    paymentMethod: "Bakong"
  })

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setFormData(prev => ({
          ...prev,
          customerName: user.user_metadata?.full_name || prev.customerName,
          customerPhone: user.user_metadata?.phone || prev.customerPhone,
          customerEmail: user.email || prev.customerEmail
        }))
      }
    }
    fetchUser()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerName || !formData.customerPhone || !formData.address) {
      toast.error(language === "kh" ? "សូមបំពេញព័ត៌មានដែលបានតម្រូវ" : "Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        })
      })

      const data = await response.json()

      if (response.ok && data.order) {
        clearCart()
        toast.success(language === "kh" ? "ការបញ្ជាទិញបានជោគជ័យ!" : "Order placed successfully!")
        router.push(`/orders/${data.order.id}`)
      } else {
        toast.error(data.error || (language === "kh" ? "មានបញ្ហាក្នុងការបញ្ជាទិញ" : "Failed to place order"))
      }
    } catch (err: any) {
      console.error("Checkout Error:", err)
      toast.error(language === "kh" ? "មានបញ្ហាក្នុងការបញ្ជាទិញ" : "Failed to process checkout")
    } finally {
      setLoading(false)
    }
  }

  if (isLoaded && items.length === 0) {
    return (
      <PublicLayout>
        <div className="bg-white min-h-screen pt-16 sm:pt-20 md:pt-12 pb-32 font-sans">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xs">
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {language === "kh" ? "កន្ត្រកទំនិញរបស់អ្នកទទេ" : "Your cart is empty"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
              {language === "kh" ? "សូមជ្រើសរើសផលិតផល និងបន្ថែមទៅកន្ត្រកដើម្បីបន្តទូទាត់" : "Browse our inventory and add items to your cart before checking out."}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#004691] hover:bg-[#003366] text-white font-bold rounded-full text-xs sm:text-sm transition-all shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === "kh" ? "រុករកផលិតផល" : "Browse Products"}</span>
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Toaster position="top-center" />
      <div className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

          {/* 🍞 Mobile Responsive Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
            <span className="shrink-0 text-slate-400">/</span>
            <Link href="/cart" className="hover:text-[#004691] shrink-0 transition-colors">{language === "kh" ? "កន្ត្រកទំនិញ" : "Cart"}</Link>
            <span className="shrink-0 text-slate-400">/</span>
            <span className="text-slate-900 font-bold truncate min-w-0">{language === "kh" ? "ការទូទាត់ប្រាក់" : "Checkout"}</span>
          </div>

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#004691] tracking-tight">
              {language === "kh" ? "ការទូទាត់ប្រាក់" : "Checkout"}
            </h1>
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              {items.length} {language === "kh" ? "មុខទំនិញ" : "items in cart"}
            </span>
          </div>

          {/* Checkout Main Form Grid */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left: Customer Information & Payment Method (7 cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              
              {/* Customer Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-5 shadow-2xs">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 sm:pb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 text-[#004691] rounded-xl flex items-center justify-center font-bold shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {language === "kh" ? "ព័ត៌មានអតិថិជន និងការដឹកជញ្ជូន" : "Customer & Delivery Details"}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      {language === "kh" ? "សូមបញ្ចូលព័ត៌មានទំនាក់ទំនងរបស់អ្នកសម្រាប់ការដឹកជញ្ជូន" : "Enter your contact info for order delivery"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4 pt-1">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === "kh" ? "ឈ្មោះពេញ *" : "Full Name *"}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="customerName"
                        required
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder={language === "kh" ? "បញ្ចូលឈ្មោះរបស់អ្នក" : "e.g. Sok Dara"}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        {language === "kh" ? "លេខទូរស័ព្ទ *" : "Phone Number *"}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          name="customerPhone"
                          required
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          placeholder="e.g. 012 345 678"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        {language === "kh" ? "អ៊ីមែល (មិនបាច់បំពេញក៏បាន)" : "Email Address (Optional)"}
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="customerEmail"
                          value={formData.customerEmail}
                          onChange={handleInputChange}
                          placeholder="e.g. client@example.com"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === "kh" ? "អាសយដ្ឋានដឹកជញ្ជូន *" : "Delivery Address *"}
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <textarea
                        name="address"
                        required
                        rows={3}
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder={language === "kh" ? "ផ្ទះលេខ ផ្លូវ សង្កាត់ ខណ្ឌ រាជធានី/ខេត្ត" : "House/Street, Sangkat, Khan, City/Province"}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-4 shadow-2xs">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-3 sm:pb-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-50 text-[#E1232E] rounded-xl flex items-center justify-center font-bold shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {language === "kh" ? "វិធីសាស្ត្រទូទាត់ប្រាក់" : "Payment Method"}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                      {language === "kh" ? "ជ្រើសរើសវិធីសាស្ត្រទូទាត់ប្រាក់ដែលអ្នកពេញចិត្ត" : "Select your preferred payment method"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Bakong KHQR Option */}
                  <label
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "Bakong" }))}
                    className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === "Bakong"
                        ? "bg-[#E1232E]/5 border-[#E1232E] shadow-2xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#E1232E] rounded-xl flex items-center justify-center shrink-0">
                      <img src="/logo/KHQR Logo.png" alt="KHQR" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {language === "kh" ? "បាគង KHQR" : "Bakong KHQR"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        {language === "kh" ? "ស្កេនទូទាត់ជាមួយកម្មវិធីធនាគារ" : "Scan with any KHQR App"}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      formData.paymentMethod === "Bakong" ? "border-[#E1232E] bg-[#E1232E]" : "border-slate-300"
                    }`}>
                      {formData.paymentMethod === "Bakong" && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                  </label>

                  {/* Cash / Direct Option */}
                  <label
                    onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "Cash" }))}
                    className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === "Cash"
                        ? "bg-blue-50/70 border-[#004691] shadow-2xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 text-[#004691] rounded-xl flex items-center justify-center shrink-0 font-bold">
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {language === "kh" ? "ទូទាត់ពេលប្រគល់" : "Cash / Transfer"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold block">
                        {language === "kh" ? "ទូទាត់ប្រាក់ពេលទទួលបានទំនិញ" : "Pay upon order confirmation"}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      formData.paymentMethod === "Cash" ? "border-[#004691] bg-[#004691]" : "border-slate-300"
                    }`}>
                      {formData.paymentMethod === "Cash" && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Items Summary & Final CTA (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xs lg:sticky lg:top-24">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  {language === "kh" ? "សេចក្តីសង្ខេបការបញ្ជាទិញ" : "Order Summary"}
                </h2>

                {/* Items List */}
                <div className="divide-y divide-slate-100 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-2.5 sm:py-3 flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {getValidImages(item)[0] ? (
                          <img src={getOptimizedImageUrl(getValidImages(item)[0], 'thumb')} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                        </p>
                        <span className="text-[11px] text-slate-500 font-semibold block">
                          ${item.price?.toLocaleString()} × {item.quantity}
                        </span>
                      </div>
                      <span className="text-xs font-black text-[#004691] shrink-0">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Summary Breakdown */}
                <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs sm:text-sm font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>{language === "kh" ? "សរុបរង (Subtotal):" : "Subtotal:"}</span>
                    <span className="font-bold text-slate-900">${cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "kh" ? "ថ្លៃដឹកជញ្ជូន:" : "Shipping:"}</span>
                    <span className="text-emerald-600 font-bold">{language === "kh" ? "ឥតគិតថ្លៃ / ពិភាក្សា" : "Free / Discussed"}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-base sm:text-lg">
                    <span className="font-extrabold text-slate-900">{language === "kh" ? "សរុបចុងក្រោយ:" : "Total:"}</span>
                    <span className="font-black text-[#004691] text-xl sm:text-2xl">${cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Order Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{language === "kh" ? "បញ្ជាក់ការបញ្ជាទិញ" : "Place Order Now"}</span>
                      <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 pt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === "kh" ? "ការទូទាត់ប្រកបដោយសុវត្ថិភាព ១០០%" : "100% Encrypted & Secure Checkout"}</span>
                </div>
              </div>
            </div>

          </form>

        </div>
      </div>
    </PublicLayout>
  )
}
