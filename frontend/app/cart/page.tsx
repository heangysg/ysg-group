"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PublicLayout from "../../components/PublicLayout"
import { useCart } from "../../contexts/CartContext"
import { useLanguage } from "../../contexts/LanguageContext"
import { ShoppingCart, Trash2, ArrowRight, Plus, Minus, ArrowLeft, Package, ShieldCheck } from "lucide-react"
import { getValidImages, getOptimizedImageUrl } from "../../lib/imageUtils"

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart()
  const { language, t } = useLanguage()
  const router = useRouter()

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white pb-24 pt-4 md:pt-6 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          
          {/* 🍞 Mobile Responsive Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
            <span className="shrink-0 text-slate-400">/</span>
            <span className="text-slate-900 font-bold truncate min-w-0">{language === "kh" ? "កន្ត្រកទំនិញ" : "Shopping Cart"}</span>
          </div>

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-[#004691] tracking-tight">
                {language === "kh" ? "កន្ត្រកទំនិញ" : "Shopping Cart"}
              </h1>
              <span className="bg-blue-50 text-[#004691] text-xs sm:text-sm font-extrabold px-2.5 py-0.5 sm:py-1 rounded-full border border-blue-100 shrink-0">
                {cartCount} {language === "kh" ? "មុខ" : "items"}
              </span>
            </div>

            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors self-start sm:self-center"
              >
                {language === "kh" ? "សម្អាតកន្ត្រក" : "Clear Cart"}
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-8 sm:p-12 text-center border border-slate-200 shadow-2xs flex flex-col items-center justify-center my-6 max-w-2xl mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-4 shadow-2xs">
                <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                {language === "kh" ? "គ្មានទំនិញក្នុងកន្ត្រកទេ" : "Your cart is empty"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-6 font-medium">
                {language === "kh" ? "សូមរុករកផលិតផល និងបន្ថែមទៅកន្ត្រករបស់អ្នក" : "Explore our catalog and add products to your cart."}
              </p>
              <Link
                href="/products"
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-[#004691] text-white text-xs sm:text-sm font-bold rounded-full hover:bg-[#003366] transition-all shadow-2xs active:scale-95 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === "kh" ? "រុករកផលិតផល" : "Browse Products"}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* Items List (7 cols) */}
              <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex gap-3 sm:gap-4 items-center hover:border-slate-300 transition-all"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                      {getValidImages(item)[0] ? (
                        <img src={getOptimizedImageUrl(getValidImages(item)[0], 'thumb')} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-base font-extrabold text-slate-900 truncate mb-1">
                        {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                      </h3>
                      <span className="text-xs sm:text-sm font-black text-[#004691] block mb-2 sm:mb-3">
                        ${item.price?.toLocaleString()}
                      </span>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-slate-100 rounded-full border border-slate-200 p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 sm:w-8 text-center text-xs font-extrabold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] sm:text-xs font-extrabold text-slate-700">
                          {language === "kh" ? "សរុប:" : "Total:"} <span className="text-[#004691] font-black">${(item.price * item.quantity).toLocaleString()}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 sm:p-2 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary Card (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-slate-50 border border-slate-200 p-4 sm:p-8 rounded-2xl shadow-2xs space-y-4 sm:space-y-6 lg:sticky lg:top-24">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 border-b border-slate-200 pb-3">
                    {language === "kh" ? "សេចក្តីសង្ខេបការបញ្ជាទិញ" : "Order Summary"}
                  </h2>

                  <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm font-semibold text-slate-600">
                    <div className="flex justify-between">
                      <span>{language === "kh" ? "សរុបរង (Subtotal):" : "Subtotal:"}</span>
                      <span className="font-bold text-slate-900">${cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === "kh" ? "សេវាដឹកជញ្ជូន:" : "Shipping:"}</span>
                      <span className="text-emerald-600 font-bold">{language === "kh" ? "គិតពេលបន្តទូទាត់" : "Calculated at checkout"}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 sm:pt-4 flex justify-between items-center text-base sm:text-lg">
                    <span className="font-extrabold text-slate-900">{language === "kh" ? "សរុបចុងក្រោយ:" : "Total:"}</span>
                    <span className="text-xl sm:text-2xl font-black text-[#004691]">${cartTotal.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full py-3.5 sm:py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{language === "kh" ? "ទៅកាន់ការទូទាត់ប្រាក់" : "Proceed to Checkout"}</span>
                    <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 pt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Safe & Verified Checkout Process</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </PublicLayout>
  )
}
