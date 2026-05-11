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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    const supabase = createClient()

    try {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const shortId = Array.from({ length: 10 }, () => alphabet.charAt(Math.floor(Math.random() * alphabet.length))).join('')
      
      const { data, error } = await supabase
        .from("Order")
        .insert({
          id: shortId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          customerEmail: formData.customerEmail,
          address: formData.address,
          paymentMethod: formData.paymentMethod,
          totalAmount: cartTotal,
          items: items,
          status: "pending"
        })
        .select()

      if (error) throw error

      toast.success("Order placed successfully!")
      clearCart()
      router.push(`/orders/${data[0].id}`)
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
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("emptyCart")}</h2>
              <p className="text-[14px] text-slate-500 font-medium">Your cart is currently empty.</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 bg-slate-950 text-white px-6 py-3.5 rounded-xl font-bold text-[12px] uppercase tracking-widest transition-all hover:bg-primary shadow-lg">
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
      <Toaster position="top-center" />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-24">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            
            {/* 🛒 Shopping Cart Section */}
            <div className="w-full lg:flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">{t("shoppingCart")}</h1>
                <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                  {items.length} {items.length === 1 ? 'UNIT' : 'UNITS'}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 flex items-center gap-4 md:gap-6 group transition-all duration-300">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-primary">{item.brand}</p>
                      <h3 className="text-[14px] md:text-[16px] font-bold text-slate-900 uppercase tracking-tight truncate">
                        {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.model}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 md:gap-3">
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 px-2 border border-slate-100">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 text-slate-400 hover:text-slate-900">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center font-bold text-[13px] text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 text-slate-400 hover:text-slate-900">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/products" className="inline-flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-primary transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("backToProducts")}
              </Link>
            </div>

            {/* 🏗️ Checkout Details Section */}
            <div className="w-full lg:w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="bg-slate-50 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 sticky top-20">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-8 uppercase tracking-widest">{t("checkoutDetails")}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                  <div className="space-y-3">
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        name="customerName"
                        placeholder={t("fullName")}
                        required
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-xl focus:border-primary/20 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 text-[13px]"
                      />
                    </div>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        name="customerPhone"
                        placeholder={t("phone")}
                        required
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-xl focus:border-primary/20 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 text-[13px]"
                      />
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                      <textarea 
                        name="address"
                        placeholder={t("address")}
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-xl focus:border-primary/20 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 text-[13px] resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col ml-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-0.5">
                        {language === "kh" ? "វិធីសាស្ត្រទូទាត់" : "Payment Method"}
                      </p>
                      <p className="text-[11px] font-medium text-slate-300 italic">
                        {language === "kh" ? "វិធីសាស្ត្រដែលត្រូវបានទទួលយក" : "Accepted method"}
                      </p>
                    </div>

                    <div className="w-full p-4 md:p-5 rounded-2xl border-2 border-primary bg-white flex items-center gap-3 md:gap-4 group relative shadow-sm">
                      {/* Red Box for Logo - Using Official Bakong Red #E1232E */}
                      <div className="w-12 h-12 bg-[#E1232E] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/10">
                        <img 
                          src="/logo/KHQR Logo.png" 
                          alt="KHQR" 
                          className="w-8 h-8 object-contain" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-[#E1232E] uppercase tracking-widest">KHQR</span>
                          <div className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span className="text-[13px] md:text-[14px] font-bold text-slate-900 uppercase tracking-tight truncate">Bakong KHQR</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 truncate">
                          {language === "kh" ? "ការទូទាត់តាម Bakong" : "Cambodia's Bakong Payment"}
                        </p>
                      </div>
                      <div className="w-5 h-5 bg-[#E1232E] rounded-full flex items-center justify-center text-white shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-200 space-y-2.5">
                    <div className="flex justify-between text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      <span>{t("subtotal")}</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      <span>{t("shipping")}</span>
                      <span className="text-emerald-500 font-bold tracking-widest">
                        {language === "kh" ? "ឥតគិតថ្លៃ" : "FREE"}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-900 text-xl md:text-2xl font-bold pt-3 tracking-tighter uppercase">
                      <span>{t("total")}</span>
                      <span className="text-primary">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg hover:bg-primary transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        {language === "kh" ? "ធ្វើការបញ្ជាទិញ" : t("placeOrder")}
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
