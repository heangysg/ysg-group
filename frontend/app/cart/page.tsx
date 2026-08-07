"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PublicLayout from "../../components/PublicLayout"
import { useCart } from "../../contexts/CartContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { ShoppingCart, Trash2, ArrowRight, Plus, Minus, ArrowLeft } from "lucide-react"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart()
  const { language, t } = useLanguage()
  const router = useRouter()

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white pb-24 pt-6">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <Link href="/products" className="p-2 text-slate-500 hover:text-slate-900 bg-white rounded-full border border-slate-200">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">
                {language === "kh" ? "កន្ត្រកទំនិញ" : "Shopping Cart"}
              </h1>
              <span className="bg-blue-50 text-[#004691] text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                {cartCount} {language === "kh" ? "មុខ" : "items"}
              </span>
            </div>

            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                {language === "kh" ? "សម្អាតកន្ត្រក" : "Clear Cart"}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-2xs flex flex-col items-center justify-center my-8">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {language === "kh" ? "គ្មានទំនិញក្នុងកន្ត្រកទេ" : "Your cart is empty"}
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mb-6">
                {language === "kh" ? "សូមរុករកផលិតផល និងបន្ថែមទៅកន្ត្រករបស់អ្នក" : "Explore our catalog and add products to your cart."}
              </p>
              <Link
                href="/products"
                className="px-8 py-3 bg-[#004691] text-white text-xs font-bold rounded-full hover:bg-[#003366] transition-all shadow-md"
              >
                {language === "kh" ? "រុករកផលិតផល" : "Browse Products"}
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Items List */}
              <div className="lg:col-span-2 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex gap-4 items-center"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-lg border border-slate-100 p-1 flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 rounded-md" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate mb-1">
                        {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                      </h3>
                      <span className="text-sm font-black text-[#004691] block mb-2">
                        ${item.price.toLocaleString()}
                      </span>

                      <div className="flex items-center justify-between">
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-slate-100 rounded-full border border-slate-200 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 rounded-full bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-500">
                          Total: <span className="text-slate-900">${(item.price * item.quantity).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs h-fit space-y-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  {language === "kh" ? "សេចក្តីសង្ខេប (Summary)" : "Order Summary"}
                </h2>

                <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>{language === "kh" ? "សរុប (Subtotal):" : "Subtotal:"}</span>
                    <span className="font-bold text-slate-900">${cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === "kh" ? "សេវាដឹកជញ្ជូន:" : "Shipping:"}</span>
                    <span className="text-emerald-600 font-bold">{language === "kh" ? "គិតពេលប្រគល់" : "Calculated at checkout"}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">{language === "kh" ? "សរុបចុងក្រោយ:" : "Total:"}</span>
                  <span className="text-xl sm:text-2xl font-black text-[#004691]">${cartTotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <span>{language === "kh" ? "ទៅកាន់ការទូទាត់ប្រាក់" : "Proceed to Checkout"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      </main>
    </PublicLayout>
  )
}
