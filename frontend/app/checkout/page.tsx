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
import { generateBakongQR } from "../../lib/bakong"
import BakongQRModal from "../../components/BakongQRModal"

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
      // Generate a Secure Boutique Short ID (10 chars, Alphanumeric)
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

      // Redirect immediately to the stable order page

      if (formData.paymentMethod === "Bakong") {
        toast.success("Order placed! Opening payment...")
        clearCart()
        router.push(`/orders/${data[0].id}`)
      } else {
        toast.success("Order placed successfully!")
        clearCart()
        router.push(`/orders/${data[0].id}`)
      }
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    )
  }

  if (items.length === 0) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex flex-center items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">{t("emptyCart")}</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any machinery to your cart yet.</p>
            <Link href="/products" className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black transition-all hover:shadow-xl hover:shadow-primary/20">
              <ArrowLeft className="w-5 h-5" />
              {t("browseEquipment")}
            </Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-40 bg-nichhy min-h-screen">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* 🛒 Elite Shopping Cart Items */}
          <div className="flex-1 space-y-12 animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center justify-between px-4">
              <h1 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase">{t("shoppingCart")}</h1>
              <span className="text-slate-400 font-black text-[11px] uppercase tracking-[0.3em]">{items.length} {items.length === 1 ? 'UNIT' : 'UNITS'}</span>
            </div>

            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100/50 rounded-[3rem] p-10 flex flex-col sm:flex-row gap-10 hover:shadow-lux-deep transition-soft group">
                  <div className="w-full sm:w-44 h-44 bg-slate-50 rounded-[2rem] overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100 transition-soft group-hover:scale-95">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-14 h-14 text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">{item.brand}</p>
                        <h3 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-tighter leading-none group-hover:text-primary transition-soft">{language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}</h3>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">{item.model}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-soft">
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-10">
                      <div className="flex items-center gap-4 bg-slate-50 rounded-[1.5rem] p-2 px-6 border border-slate-100">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-slate-400 hover:text-slate-950 transition-soft active:scale-75">
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className="w-10 text-center font-black text-lg text-slate-950">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-slate-400 hover:text-slate-950 transition-soft active:scale-75">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-2xl md:text-3xl font-black text-primary tracking-tighter">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/products" className="inline-flex items-center gap-4 text-slate-400 font-black text-[11px] uppercase tracking-[0.3em] hover:text-primary hover:gap-6 transition-soft group px-4">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-soft" />
              {t("backToProducts")}
            </Link>
          </div>

          {/* 🏗️ Heavy Industrial Boutique Checkout Summary */}
          <div className="lg:w-[500px] animate-in fade-in slide-in-from-right duration-1000">
            <div className="bg-white border border-slate-100/50 rounded-[4rem] p-12 md:p-16 shadow-lux-deep sticky top-32">
              <h2 className="text-3xl font-black text-slate-950 mb-12 uppercase tracking-tighter">{t("checkoutDetails")}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-5">
                  <div className="group relative">
                    <User className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-soft" />
                    <input 
                      type="text" 
                      name="customerName"
                      placeholder={t("fullName")}
                      required
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full pl-20 pr-10 py-7 bg-slate-50/80 border border-slate-100 rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-soft font-black text-slate-950 placeholder:text-slate-300 text-[18px]"
                    />
                  </div>
                  <div className="group relative">
                    <Phone className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-soft" />
                    <input 
                      type="tel" 
                      name="customerPhone"
                      placeholder={t("phone")}
                      required
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full pl-20 pr-10 py-7 bg-slate-50/80 border border-slate-100 rounded-[2rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-soft font-black text-slate-950 placeholder:text-slate-300 text-[18px]"
                    />
                  </div>
                  <div className="group relative">
                    <MapPin className="absolute left-8 top-8 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-soft" />
                    <textarea 
                      name="address"
                      placeholder={t("address")}
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-20 pr-10 py-7 bg-slate-50/80 border border-slate-100 rounded-[2.5rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-soft font-black text-slate-950 placeholder:text-slate-300 text-[18px] resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col ml-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-1">{t("paymentMethod")}</p>
                    <p className="text-[14px] font-bold text-slate-400 uppercase tracking-tight italic opacity-60">Accepted payment methods</p>
                  </div>

                  <div className="space-y-4">
                    {/* Bakong KHQR Premium Option */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Bakong' }))}
                      className={`w-full p-6 rounded-[2.5rem] transition-all duration-300 border-2 text-left flex items-center gap-6 group relative overflow-hidden ${
                        formData.paymentMethod === 'Bakong'
                          ? "border-[#E1232E] bg-[#E1232E]/5 shadow-xl shadow-[#E1232E]/5"
                          : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                      }`}
                    >
                      {/* Small Red Box for Logo */}
                      <div className="w-16 h-16 bg-[#E1232E] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#E1232E]/20 transition-transform group-hover:scale-105">
                        <img 
                          src="/logo/KHQR Logo.png" 
                          alt="KHQR" 
                          className="w-10 h-10 object-contain brightness-0 invert" 
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[12px] font-black text-[#E1232E] uppercase tracking-[0.2em]">KHQR</span>
                          <div className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-[16px] font-black text-slate-950 uppercase tracking-tighter">Bakong KHQR</span>
                        </div>
                        <p className="text-[13px] font-bold text-slate-400 italic leading-tight">Pay via Cambodia's Bakong QR payment system</p>
                      </div>

                      {formData.paymentMethod === 'Bakong' && (
                        <div className="w-8 h-8 bg-[#E1232E] rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </button>

                    {/* Other Basic Options */}
                    <div className="grid grid-cols-3 gap-4">
                      {['ABA', 'Wing', 'Cash'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                          className={`py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-widest transition-soft border-2 flex items-center justify-center gap-2 ${
                            formData.paymentMethod === method 
                              ? "border-primary bg-primary/5 text-primary shadow-xl shadow-primary/5" 
                              : "border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-100"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50 space-y-4">
                  <div className="flex justify-between text-slate-400 font-black text-[11px] uppercase tracking-[0.2em]">
                    <span>{t("subtotal")}</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-black text-[11px] uppercase tracking-[0.2em]">
                    <span>{t("shipping")}</span>
                    <span className="text-green-500">FREE OF CHARGE</span>
                  </div>
                  <div className="flex justify-between text-slate-950 text-3xl font-black pt-4 tracking-tighter uppercase">
                    <span>{t("total")}</span>
                    <span className="text-primary">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-7 rounded-[2.5rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl shadow-primary/30 hover:bg-primary-dark hover:-translate-y-1 transition-soft active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-5 mt-4"
                >
                  {loading ? (
                    <div className="w-7 h-7 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      {t("placeOrder")}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

    </PublicLayout>
  )
}
