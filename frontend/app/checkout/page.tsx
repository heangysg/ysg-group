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
              <p className="text-[14px] text-slate-500 font-medium">Your cart is currently empty.</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 bg-slate-950 text-white px-6 py-3.5 rounded-xl font-medium text-[12px] uppercase tracking-widest transition-all hover:bg-primary shadow-lg">
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
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6 pt-6 md:pt-8 pb-12 md:pb-24">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            
            {/* 🛒 Shopping Cart Section */}
            <div className="w-full lg:flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight uppercase">{t("shoppingCart")}</h1>
                <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-medium text-slate-400 uppercase tracking-widest border border-slate-100">
                  {items.length} {items.length === 1 ? 'UNIT' : 'UNITS'}
                </span>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="solid-card bg-white border-2 border-slate-900 p-4 md:p-6 flex items-center gap-4 md:gap-6 group">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 border-2 border-slate-900 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image.includes('cloudinary.com') ? item.image.replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-[8px] font-medium uppercase tracking-widest text-primary">{item.brand}</p>
                      <h3 className="text-[14px] md:text-[16px] font-medium text-slate-900 uppercase tracking-tight truncate">
                        {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                      </h3>
                      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{item.model}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 md:gap-3">
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2 bg-slate-50 p-1 px-2 border-2 border-slate-900">
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
                <Link href="/products" className="inline-flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-slate-900 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {language === "kh" ? "ត្រលប់ទៅកាន់ផលិតផល" : "Back to Products"}
                </Link>
              </div>
            </div>

            {/* 🏗️ Checkout Details Section */}
            <div className="w-full lg:w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="solid-card bg-white p-6 md:p-10 sticky top-24">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 uppercase tracking-widest">
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
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-900 focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[13px] uppercase tracking-widest"
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
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-900 focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[13px] uppercase tracking-widest"
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
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-900 focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-[13px] resize-none uppercase tracking-widest"
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

                    <div className="w-full p-4 md:p-5 border-2 border-primary bg-slate-50 flex items-center gap-3 md:gap-4 group relative shadow-hard-primary transition-all">
                      {/* Red Box for Logo - Using Official Bakong Red #E1232E */}
                      <div className="w-12 h-12 bg-[#E1232E] border-2 border-slate-900 flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/logo/KHQR Logo.png" 
                          alt="KHQR" 
                          className="w-8 h-8 object-contain" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-[#E1232E] uppercase tracking-widest">KHQR</span>
                          <div className="w-1 h-1 bg-slate-300 rounded-none" />
                          <span className="text-[13px] md:text-[14px] font-bold text-slate-900 uppercase tracking-tight truncate">Bakong KHQR</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 truncate">
                          {language === "kh" ? "ការទូទាត់តាម Bakong" : "Cambodia's Bakong Payment"}
                        </p>
                      </div>
                      <div className="w-6 h-6 bg-primary border-2 border-slate-900 flex items-center justify-center text-slate-900 shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-slate-50 p-6 border-2 border-slate-900 shadow-hard">
                        <h3 className="font-bold text-slate-900 uppercase tracking-widest text-sm mb-4">
                          {language === "kh" ? "ព័ត៌មានលម្អិត" : "Customer Details"}
                        </h3>
                        <div className="space-y-3 text-sm text-slate-900">
                          <p><strong className="uppercase tracking-widest text-xs w-24 inline-block">{t("fullName")}:</strong> {formData.customerName}</p>
                          <p><strong className="uppercase tracking-widest text-xs w-24 inline-block">{t("phone")}:</strong> {formData.customerPhone}</p>
                          <p><strong className="uppercase tracking-widest text-xs w-24 inline-block">{t("email")}:</strong> {formData.customerEmail || "N/A"}</p>
                          <p className="flex items-start"><strong className="uppercase tracking-widest text-xs w-24 shrink-0 inline-block">{t("address")}:</strong> <span className="flex-1">{formData.address}</span></p>
                        </div>
                      </div>
                      
                      <div className="w-full p-4 md:p-5 border-2 border-primary bg-slate-50 flex items-center gap-3 md:gap-4 shadow-hard-primary">
                        <div className="w-12 h-12 bg-[#E1232E] border-2 border-slate-900 flex items-center justify-center flex-shrink-0">
                          <img src="/logo/KHQR Logo.png" alt="KHQR" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-[#E1232E] uppercase tracking-widest">KHQR</span>
                            <div className="w-1 h-1 bg-slate-300 rounded-none" />
                            <span className="text-[13px] md:text-[14px] font-bold text-slate-900 uppercase tracking-tight truncate">Bakong KHQR</span>
                          </div>
                        </div>
                        <div className="w-6 h-6 bg-primary border-2 border-slate-900 flex items-center justify-center text-slate-900 shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>

                      <button type="button" onClick={() => setStep(1)} className="w-full py-4 bg-white text-slate-900 border-2 border-slate-900 shadow-hard font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 hover:shadow-hard-lg transition-all">
                        {language === "kh" ? "កែប្រែព័ត៌មាន" : "Edit Details"}
                      </button>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-200 space-y-2.5">
                    <div className="flex justify-between text-slate-400 font-medium text-[10px] uppercase tracking-widest">
                      <span>{t("subtotal")}</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-medium text-[10px] uppercase tracking-widest">
                      <span>{t("shipping")}</span>
                      <span className="text-emerald-500 font-medium tracking-widest">
                        {language === "kh" ? "ឥតគិតថ្លៃ" : "FREE"}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-900 text-xl md:text-2xl font-medium pt-3 tracking-tighter uppercase">
                      <span>{t("total")}</span>
                      <span className="text-primary">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-5 text-[12px] flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        {step === 1 ? (language === "kh" ? "ពិនិត្យការបញ្ជាទិញ" : "Review Order") : (language === "kh" ? "បញ្ជាក់ការបញ្ជាទិញ" : t("placeOrder"))}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
