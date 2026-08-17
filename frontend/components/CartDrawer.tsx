"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCart, Trash2, ArrowRight, Plus, Minus } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useLanguage } from "../contexts/LanguageContext"

export default function CartDrawer() {
 const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart()
 const { language, t } = useLanguage()
 const router = useRouter()

 if (!isCartOpen) return null

 const handleCheckout = () => {
 closeCart()
 router.push("/checkout")
 }

 const handleViewCartPage = () => {
 closeCart()
 router.push("/cart")
 }

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-[250]">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="absolute inset-0 bg-slate-900/50"
 onClick={closeCart}
 />

 {/* Slide-over Right Drawer */}
 <motion.div
 initial={{ x: "100%" }}
 animate={{ x: 0 }}
 exit={{ x: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 220 }}
 className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col z-[260]"
 >
 {/* Drawer Header */}
 <div className="p-4 border-b border-slate-100 bg-white">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-base font-bold text-slate-900">
 {language === "kh" ? "កន្ត្រកទំនិញរបស់អ្នក" : "Your Shopping Cart"}
 </h2>
 <button
 onClick={closeCart}
 className="p-1 text-slate-400 hover:text-slate-900 rounded-md"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Subtotal Banner */}
 {items.length > 0 && (
 <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sm">
 <span className="font-bold text-slate-700">
 {language === "kh" ? "សរុប :" : "Total :"}
 </span>
 <span className="text-lg font-bold text-[#004691]">
 ${cartTotal.toLocaleString()}
 </span>
 </div>
 )}
 </div>

 {/* Cart Items List */}
 <div className="flex-1 overflow-y-auto p-4 space-y-3">
 {items.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
 <div className="w-16 h-16 rounded-md bg-slate-100 flex items-center justify-center">
 <ShoppingCart className="w-8 h-8 text-slate-300" />
 </div>
 <p className="text-sm font-semibold text-slate-600">
 {language === "kh" ? "គ្មានទំនិញក្នុងកន្ត្រកទេ" : "Your cart is empty"}
 </p>
 <button
 onClick={closeCart}
 className="px-6 py-2 bg-[#004691] text-white text-xs font-bold rounded-md hover:bg-[#003366] transition-all"
 >
 {language === "kh" ? "ទិញទំនិញឥឡូវនេះ" : "Shop Now"}
 </button>
 </div>
 ) : (
 items.map((item) => (
 <div
 key={item.id}
 className="flex items-center gap-3 p-3 bg-slate-50 rounded-md border border-slate-100 relative"
 >
 <div className="w-16 h-16 bg-white rounded-md border border-slate-200 shrink-0 overflow-hidden p-1 flex items-center justify-center">
 {item.image ? (
 <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
 ) : (
 <div className="w-full h-full bg-slate-100 rounded-md" />
 )}
 </div>

 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-bold text-slate-900 truncate mb-1">
 {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
 </h4>

 <div className="text-sm font-bold text-red-600 mb-1">
 ${item.price.toLocaleString()}
 </div>

 {/* Quantity controls */}
 <div className="flex items-center gap-2">
 <div className="flex items-center bg-white rounded-md border border-slate-200 p-0.5">
 <button
 onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
 className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold"
 >
 <Minus className="w-3 h-3" />
 </button>
 <span className="w-6 text-center text-xs font-bold text-slate-800">
 {item.quantity}
 </span>
 <button
 onClick={() => updateQuantity(item.id, item.quantity + 1)}
 className="w-5 h-5 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold"
 >
 <Plus className="w-3 h-3" />
 </button>
 </div>
 </div>
 </div>

 <button
 onClick={() => removeFromCart(item.id)}
 className="text-slate-300 hover:text-red-500 p-1.5"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 ))
 )}
 </div>

 {/* Drawer Footer (Full-Width Checkout Button) */}
 {items.length > 0 && (
 <div className="p-4 border-t border-slate-100 bg-white">
 <button
 onClick={handleCheckout}
 className="w-full py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 uppercase tracking-wider"
 >
 <span>{language === "kh" ? "ទូទាត់" : "Checkout"}</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 )}
 </motion.div>
 </div>
 </AnimatePresence>
 )
}
