"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../../contexts/CartContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PublicLayout from "../../components/PublicLayout"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, Truck, User, Phone, MapPin, Package, Check } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, cartTotal, removeFromCart, updateQuantity, clearCart, isLoaded } = useCart()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
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
          customerName: user.user_metadata?.full_name || "",
          customerEmail: user.email || ""
        }))
      }
    }
    fetchUser()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          address: formData.address,
          paymentMethod: formData.paymentMethod,
          items: items
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Failed to checkout")

      toast.success("Order placed successfully!", { duration: 3000 })
      clearCart()
      router.push(`/orders/${data.order.id}`)
    } catch (error: any) {
      console.error("Error placing order:", error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    )
  }

  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
          <div className="text-center max-w-sm space-y-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">{t("emptyCart")}</h2>
              <p className="text-[14px] text-slate-500 font-medium">{t("emptyCartDesc")}</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 bg-slate-950 text-white px-6 py-3.5 rounded-xl font-medium text-[12px] font-medium transition-all hover:bg-primary shadow-lg">
              <ArrowLeft className="w-4 h-4" />
              {t("browseEquipment")}
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="bg-white md:bg-[#F8FAFC] min-h-screen">
        <div className="max-w-6xl mx-auto px-0 md:px-6 pt-4 md:pt-8 pb-32 md:pb-24">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 items-start">
            
            {/* 🛒 Shopping Cart Section */}
            <div className="w-full lg:flex-1 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-0">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight uppercase">{t("shoppingCart")}</h1>
                <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-medium text-slate-400 font-medium border border-slate-100">
                  {items.length} {items.length === 1 ? 'UNIT' : 'UNITS'}
                </span>
              </div>

              <div className="space-y-3 md:space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="solid-card bg-white border border-slate-100 md:border-slate-200 p-3 md:p-6 flex items-center gap-3 md:gap-6 group rounded-2xl md:rounded-3xl">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image.includes('cloudinary.com') ? item.image.replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-[8px] font-medium font-medium text-primary">{item.brand}</p>
                      <h3 className="text-[14px] md:text-[16px] font-medium text-slate-900 font-medium truncate">
                        {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                      </h3>
                      <p className="text-[9px] font-medium text-slate-400 font-medium">{item.model}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 md:gap-3">
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2 bg-slate-50 p-1 px-2 border border-slate-200">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 text-slate-900 hover:bg-slate-200">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-[13px] text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 text-slate-900 hover:bg-slate-200">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8 mt-6">
                <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm font-medium hover:text-slate-900 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {language === "kh" ? "ត្រលប់ទៅកាន់ផលិតផល" : "Back to Products"}
                </Link>
              </div>
            </div>

            {/* 🏗️ Checkout Details Section */}
            <div className="w-full lg:w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-1000 px-4 md:px-0">
              <div className="solid-card bg-white p-0 md:p-10 md:sticky md:top-24 md:border md:border-slate-100 md:rounded-3xl md:shadow-sm">
                <h2 className="hidden md:block text-xl md:text-2xl font-bold text-slate-900 mb-8 font-medium">
                  {step === 1 ? t("checkoutDetails") : (language === "kh" ? "ពិនិត្យឡើងវិញនូវការបញ្ជាទិញ" : "Review Your Order")}
                </h2>
                
                <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-6 md:space-y-8">
                  {step === 1 ? (
                    <>
                      <div className="space-y-3">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        name="customerName"
                        placeholder={t("fullName")}
                        required
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[13px] font-medium"
                      />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="tel" 
                        name="customerPhone"
                        placeholder={t("phone")}
                        required
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[13px] font-medium"
                      />
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea 
                        name="address"
                        placeholder={t("address")}
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[13px] resize-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col ml-1">
                      <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                        {language === "kh" ? "វិធីសាស្ត្រទូទាត់" : "Payment Method"}
                      </p>
                      <p className="text-[11px] font-medium text-slate-300 italic">
                        {language === "kh" ? "វិធីសាស្ត្រដែលត្រូវបានទទួលយក" : "Accepted method"}
                      </p>
                    </div>

                    <div className="w-full p-4 md:p-5 border-2 border-[#E1232E] bg-[#E1232E]/5 flex items-center gap-3 md:gap-4 group relative rounded-2xl transition-all">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center border-[#E1232E]">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-[#E1232E]" />
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-[#E1232E] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <img 
                          src="/logo/KHQR Logo.png" 
                          alt="KHQR" 
                          className="w-8 h-8 object-contain" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-[#E1232E] font-medium">KHQR</span>
                          <div className="w-1 h-1 bg-slate-300 rounded-xl" />
                          <span className="text-[13px] md:text-[14px] font-bold text-slate-900 font-medium truncate">Bakong KHQR</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 truncate">
                          {language === "kh" ? "ការទូទាត់តាម Bakong" : "Cambodia's Bakong Payment"}
                        </p>
                      </div>
                      <div className="w-6 h-6 bg-[#E1232E] rounded-full flex items-center justify-center text-white shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-900 font-medium text-sm mb-4">
                          {language === "kh" ? "ព័ត៌មានលម្អិត" : "Customer Details"}
                        </h3>
                        <div className="space-y-3 text-sm text-slate-900">
                          <p><strong className="font-medium text-xs w-24 inline-block">{t("fullName")}:</strong> {formData.customerName}</p>
                          <p><strong className="font-medium text-xs w-24 inline-block">{t("phone")}:</strong> {formData.customerPhone}</p>
                          <p><strong className="font-medium text-xs w-24 inline-block">{t("email")}:</strong> <span className="break-all">{formData.customerEmail || "N/A"}</span></p>
                          <p className="flex items-start"><strong className="font-medium text-xs w-24 shrink-0 inline-block">{t("address")}:</strong> <span className="flex-1">{formData.address}</span></p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex flex-col ml-1">
                          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                            {language === "kh" ? "វិធីសាស្ត្រទូទាត់" : "Payment Method"}
                          </p>
                          <p className="text-[11px] font-medium text-slate-300 italic">
                            {language === "kh" ? "វិធីសាស្ត្រដែលត្រូវបានទទួលយក" : "Accepted method"}
                          </p>
                        </div>
                        <div className="w-full p-4 md:p-5 border-2 border-[#E1232E] bg-[#E1232E]/5 rounded-2xl flex items-center gap-3 md:gap-4">
                          <div className="w-12 h-12 bg-[#E1232E] rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                            <img src="/logo/KHQR Logo.png" alt="KHQR" className="w-8 h-8 object-contain" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-[#E1232E] font-medium">KHQR</span>
                              <div className="w-1 h-1 bg-slate-300 rounded-xl" />
                              <span className="text-[13px] md:text-[14px] font-bold text-slate-900 font-medium truncate">Bakong KHQR</span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 truncate">
                              {language === "kh" ? "ការទូទាត់តាម Bakong" : "Cambodia's Bakong Payment"}
                            </p>
                          </div>
                          <div className="w-6 h-6 bg-[#E1232E] rounded-full flex items-center justify-center text-white shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <button type="button" onClick={() => setStep(1)} className="w-full py-4 bg-white text-slate-900 border border-slate-200 shadow-sm font-bold text-xs font-medium hover:-translate-y-0.5 hover:shadow-sm-lg transition-all">
                        {language === "kh" ? "កែប្រែព័ត៌មាន" : "Edit Details"}
                      </button>
                    </div>
                  )}

                  <div className="fixed md:static bottom-[calc(64px+env(safe-area-inset-bottom))] md:bottom-auto left-0 right-0 bg-white p-4 md:p-0 border-t border-slate-100 md:border-none shadow-[0_-8px_30px_rgb(0,0,0,0.06)] md:shadow-none z-40">
                    <div className="hidden md:block pt-6 border-t border-slate-200 space-y-2.5">
                      <div className="flex justify-between text-slate-400 font-medium text-[10px]">
                        <span>{t("subtotal")}</span>
                        <span>{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 font-medium text-[10px]">
                        <span>{t("shipping")}</span>
                        <span className="text-emerald-500 font-medium">{language === "kh" ? "ឥតគិតថ្លៃ" : "FREE"}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:pt-3 md:pb-6 tracking-tighter uppercase">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold md:hidden">{t("total")}</span>
                        <span className="hidden md:inline text-[13px] font-bold text-slate-900">{t("total")}</span>
                        <span className="text-xl md:text-2xl font-black text-primary leading-none mt-0.5">{formatPrice(cartTotal)}</span>
                      </div>
                      <div className="md:hidden">
                        <button 
                          type="submit"
                          disabled={loading}
                          className="btn-primary px-8 py-3.5 text-[12px] flex items-center justify-center gap-2 rounded-xl"
                        >
                          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (step === 1 ? (language === "kh" ? "បន្ត" : "Continue") : t("placeOrder"))}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="hidden md:flex btn-primary w-full py-5 text-[12px] items-center justify-center gap-3"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border border-slate-200/20 border-t-slate-900 rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          {step === 1 ? (language === "kh" ? "ពិនិត្យការបញ្ជាទិញ" : "Review Order") : (language === "kh" ? "បញ្ជាក់ការបញ្ជាទិញ" : t("placeOrder"))}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
