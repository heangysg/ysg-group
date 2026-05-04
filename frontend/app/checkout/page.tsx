"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../../contexts/CartContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PublicLayout from "../../components/PublicLayout"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, Truck, User, Phone, MapPin, Package } from "lucide-react"
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
    paymentMethod: "ABA"
  })

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
      const { data, error } = await supabase
        .from("Order")
        .insert({
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
      router.push(`/checkout/success?id=${data[0].id}`)
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
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t("shoppingCart")}</h1>
              <span className="text-gray-400 font-bold">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
                  <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-10 h-10 text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{item.brand}</p>
                        <h3 className="text-xl font-black text-gray-900">{language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}</h3>
                        <p className="text-sm text-gray-400 font-medium">{item.model}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 px-3">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-gray-400 hover:text-gray-900">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-gray-400 hover:text-gray-900">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xl font-black text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/products" className="inline-flex items-center gap-2 text-primary font-black hover:gap-3 transition-all">
              <ArrowLeft className="w-5 h-5" />
              {t("backToProducts")}
            </Link>
          </div>

          {/* Checkout Form */}
          <div className="lg:w-[450px]">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-gray-100 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 mb-8">{t("checkoutDetails")}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      name="customerName"
                      placeholder={t("fullName")}
                      required
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="tel" 
                      name="customerPhone"
                      placeholder={t("phone")}
                      required
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-6 w-5 h-5 text-gray-400" />
                    <textarea 
                      name="address"
                      placeholder={t("address")}
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-12 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">{t("paymentMethod")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['ABA', 'Wing', 'Cash'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                        className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                          formData.paymentMethod === method 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>{t("subtotal")}</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-bold">
                    <span>{t("shipping")}</span>
                    <span className="text-green-500 uppercase text-xs tracking-widest">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-900 text-2xl font-black pt-2">
                    <span>{t("total")}</span>
                    <span className="text-primary">{formatPrice(cartTotal)}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
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
