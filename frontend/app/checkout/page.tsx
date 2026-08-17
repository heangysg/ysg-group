"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../../contexts/CartContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PublicLayout from "../../components/PublicLayout"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import {
  ShoppingBag, ArrowLeft, User, Phone, MapPin, Package,
  Check, ArrowRight, ShieldCheck, CreditCard, Truck, Sparkles
} from "lucide-react"
import Link from "next/link"
import { getValidImages, getOptimizedImageUrl } from "../../lib/imageUtils"
import { generateBakongQR } from "../../lib/bakong"
import BakongQRModal from "../../components/BakongQRModal"
import PaymentSuccessModal from "../../components/PaymentSuccessModal"

export default function CheckoutPage() {
  const { items, cartTotal, clearCart, isLoaded } = useCart()
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

  // Bakong & Success Modal States
  const [showBakongModal, setShowBakongModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [bakongData, setBakongData] = useState<{
    qrString: string
    md5: string
    orderId: string
    amount: number
    expiresAt: number
  } | null>(null)
  const [completedOrderId, setCompletedOrderId] = useState<string>("")
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)

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
        setIsOrderPlaced(true)
        clearCart()
        
        if (formData.paymentMethod === "Bakong") {
          // Seamlessly generate Bakong QR code without glitching or page redirects
          const orderExpiresAt = new Date(data.order.createdAt).getTime() + (5 * 60 * 1000)
          const expirationToUse = Date.now() < orderExpiresAt ? orderExpiresAt : Date.now() + (5 * 60 * 1000)
          
          try {
            const generated = await generateBakongQR(data.order.totalAmount, data.order.id, expirationToUse)
            if (generated && generated.qrString) {
              const qrPayload = {
                qrString: generated.qrString,
                md5: generated.md5,
                orderId: data.order.id,
                amount: data.order.totalAmount,
                expiresAt: expirationToUse
              }
              localStorage.setItem(`bakong_qr_${data.order.id}`, JSON.stringify(qrPayload))
              setBakongData(qrPayload)
              setShowBakongModal(true)
            } else {
              router.push(`/orders/${data.order.id}`)
            }
          } catch (qrErr) {
            console.error("Bakong generation error:", qrErr)
            router.push(`/orders/${data.order.id}`)
          }
        } else {
          // Cash on Delivery
          toast.success(language === "kh" ? "ការបញ្ជាទិញបានបង្កើតដោយជោគជ័យ!" : "Order placed successfully!")
          router.push(`/orders/${data.order.id}`)
        }
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

  const handleBakongPaymentSuccess = () => {
    if (bakongData) {
      setCompletedOrderId(bakongData.orderId)
      setShowBakongModal(false)
      setShowSuccessModal(true)
    }
  }

  const handleBakongModalClose = () => {
    setShowBakongModal(false)
    if (bakongData) {
      router.push(`/orders/${bakongData.orderId}`)
    }
  }

  if (isLoaded && items.length === 0 && !showBakongModal && !showSuccessModal && !isOrderPlaced) {
    return (
      <PublicLayout>
        <div className="bg-white min-h-screen pt-16 sm:pt-20 md:pt-16 pb-32 font-sans">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              {language === "kh" ? "កន្ត្រកទំនិញរបស់អ្នកទទេ" : "Your cart is empty"}
            </h1>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              {language === "kh"
                ? "សូមជ្រើសរើសផលិតផលគ្រឿងម៉ាស៊ីន និងបន្ថែមទៅកន្ត្រកដើម្បីបន្តការទូទាត់ប្រាក់។"
                : "Browse our machinery catalog and add items to your cart before proceeding to checkout."}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#004691] hover:bg-[#003366] text-white font-bold rounded-md text-sm transition-all shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === "kh" ? "រុករកផលិតផលឥឡូវនេះ" : "Browse Products Now"}</span>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
            <span className="shrink-0 text-slate-400">/</span>
            <Link href="/products" className="hover:text-[#004691] shrink-0 transition-colors">{t("products")}</Link>
            <span className="shrink-0 text-slate-400">/</span>
            <span className="text-slate-900 font-bold truncate min-w-0">
              {language === "kh" ? "ការទូទាត់ប្រាក់" : "Checkout"}
            </span>
          </div>

          {/* Header Bar */}
          <div className="pb-4 mb-6 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#004691]">
              {language === "kh" ? "ការទូទាត់ប្រាក់" : "Checkout"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              {language === "kh"
                ? "បំពេញព័ត៌មានដឹកជញ្ជូន និងជ្រើសរើសវិធីសាស្ត្រទូទាត់"
                : "Complete your delivery details and choose your payment method"}
            </p>
          </div>

          {/* Checkout Main Form Grid */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Left: Customer Information & Payment Method (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 sm:p-6 shadow-sm space-y-6">

                {/* Step 1: Customer Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
                    <span className="w-6 h-6 rounded-full bg-[#004691] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#004691]" />
                      <span>{language === "kh" ? "ព័ត៌មានអតិថិជន និងការដឹកជញ្ជូន" : "Customer & Shipping Information"}</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-700">
                        {language === "kh" ? "ឈ្មោះពេញ *" : "Full Name *"}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="customerName"
                          required
                          value={formData.customerName}
                          onChange={handleInputChange}
                          placeholder={language === "kh" ? "ឧ. សុខ ចាន់ដារ៉ា" : "e.g. John Doe"}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-900 text-sm font-medium focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-bold text-slate-700">
                        {language === "kh" ? "លេខទូរស័ព្ទ *" : "Phone Number *"}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="customerPhone"
                          required
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          placeholder="012 345 678"
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-900 text-sm font-medium focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  {/* Email Address (Optional) */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">
                      {language === "kh" ? "អ៊ីមែល (មិនបង្ខំ)" : "Email Address (Optional)"}
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="example@domain.com"
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-900 text-sm font-medium focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">
                      {language === "kh" ? "អាសយដ្ឋានដឹកជញ្ជូន *" : "Delivery Address *"}
                    </label>
                    <div className="relative">
                      <textarea
                        name="address"
                        required
                        rows={2}
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder={language === "kh" ? "ផ្ទះលេខ, ផ្លូវ, សង្កាត់/ឃុំ, ខណ្ឌ/ស្រុក, រាជធានី/ខេត្ត" : "House/Street, Sangkat, Khan, Province/City"}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-md text-slate-900 text-sm font-medium focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all resize-none"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                  </div>
                </div>

                {/* Step 2: Payment Method Section */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-2.5 pb-1">
                    <span className="w-6 h-6 rounded-full bg-[#004691] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#004691]" />
                      <span>{language === "kh" ? "វិធីសាស្ត្រទូទាត់ប្រាក់" : "Payment Method"}</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Bakong KHQR */}
                    <label className={`relative flex items-center gap-3 p-3.5 rounded-md border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === "Bakong"
                        ? "border-[#E1232E] bg-red-50/40"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Bakong"
                        checked={formData.paymentMethod === "Bakong"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="w-8 h-8 rounded-full bg-[#E1232E] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">Bakong (KHQR)</span>
                          <span className="px-1.5 py-0.5 bg-[#E1232E] text-white text-[10px] font-bold rounded">
                            {language === "kh" ? "ស្កេន QR" : "Instant"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {language === "kh" ? "ទូទាត់តាម App ធនាគារទាំងអស់" : "Any Mobile Banking App"}
                        </p>
                      </div>
                      {formData.paymentMethod === "Bakong" && (
                        <div className="w-5 h-5 rounded-full bg-[#E1232E] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </label>

                    {/* Option 2: Cash on Delivery */}
                    <label className={`relative flex items-center gap-3 p-3.5 rounded-md border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === "Cash on Delivery"
                        ? "border-[#004691] bg-blue-50/40"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={formData.paymentMethod === "Cash on Delivery"}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="w-8 h-8 rounded-full bg-[#004691] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-900 text-sm">
                          {language === "kh" ? "ទូទាត់ពេលទទួល" : "Cash on Delivery"}
                        </span>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                          {language === "kh" ? "ទូទាត់ពេលទំនិញដល់ដៃ" : "Pay when received"}
                        </p>
                      </div>
                      {formData.paymentMethod === "Cash on Delivery" && (
                        <div className="w-5 h-5 rounded-full bg-[#004691] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Order Summary Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 shadow-sm sticky top-24 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#004691]" />
                    <span>{language === "kh" ? "សេចក្តីសង្ខេបការបញ្ជាទិញ" : "Order Summary"}</span>
                  </h2>
                  <span className="text-xs font-bold text-slate-500">
                    {items.length} {language === "kh" ? "មុខទំនិញ" : "items"}
                  </span>
                </div>

                {/* Items Mini List */}
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto no-scrollbar pr-1 space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 pt-2 first:pt-0">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-md overflow-hidden shrink-0 flex items-center justify-center p-1">
                        {item.image ? (
                          <img
                            src={getOptimizedImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {item.name}
                        </h3>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          ${item.price?.toLocaleString()} × {item.quantity}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#004691] shrink-0">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Summary Breakdown */}
                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs sm:text-sm font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>{language === "kh" ? "សរុបរង (Subtotal):" : "Subtotal:"}</span>
                    <span className="font-bold text-slate-900">${cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "kh" ? "ថ្លៃដឹកជញ្ជូន:" : "Shipping:"}</span>
                    <span className="text-emerald-600 font-bold">{language === "kh" ? "ឥតគិតថ្លៃ / ពិភាក្សា" : "Free / Discussed"}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-base sm:text-lg">
                    <span className="font-bold text-slate-900">{language === "kh" ? "សរុបចុងក្រោយ:" : "Total:"}</span>
                    <span className="font-bold text-[#004691] text-xl sm:text-2xl">${cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submit Order Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {formData.paymentMethod === "Bakong"
                          ? (language === "kh" ? "ទូទាត់តាម Bakong (KHQR)" : "Pay with Bakong (KHQR)")
                          : (language === "kh" ? "បញ្ជាក់ការបញ្ជាទិញ" : "Place Order Now")}
                      </span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{language === "kh" ? "ការទូទាត់ប្រកបដោយសុវត្ថិភាព ១០០%" : "100% Encrypted & Secure Checkout"}</span>
                </div>
              </div>
            </div>

          </form>

        </div>
      </div>

      {/* Bakong KHQR Modal */}
      {bakongData && (
        <BakongQRModal
          isOpen={showBakongModal}
          onClose={handleBakongModalClose}
          qrString={bakongData.qrString}
          amount={bakongData.amount}
          orderId={bakongData.orderId}
          md5={bakongData.md5}
          expiresAt={bakongData.expiresAt}
          onSuccess={handleBakongPaymentSuccess}
        />
      )}

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          router.push(`/orders/${completedOrderId}`)
        }}
        orderId={completedOrderId}
        amount={bakongData?.amount || cartTotal}
      />
    </PublicLayout>
  )
}
