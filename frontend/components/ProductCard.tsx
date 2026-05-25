"use client"

import Link from "next/link"
import { MapPin, Package, ShoppingCart, ArrowUpRight } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import toast from "react-hot-toast"

type ProductCardProps = {
  product: {
    id: string
    name: string
    nameKhmer?: string
    slug: string
    brand: string
    price: number
    status?: string
    images?: string[]
    thumbnail?: string
    location?: string
    model?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage()
  const { addToCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    const productName = language === "kh" && product.nameKhmer ? product.nameKhmer : product.name
    const message = language === "kh" ? `បានបន្ថែម ${productName} ទៅកន្ត្រក!` : `${productName} added to cart!`
    toast.success(message)
  }

  const imageUrl = product.images && product.images[0] ? product.images[0] : product.thumbnail

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="flex flex-col h-full bg-white rounded-3xl transition-all duration-500 shadow-sm border border-slate-100 hover:shadow-lux hover:-translate-y-2 hover:border-primary/20 overflow-hidden relative">
        
        {/* 🖼️ High-Impact Image */}
        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-500 z-10" />
          {imageUrl && imageUrl !== "" ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Package className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          )}
          
          {/* Badge: Bright & Sharp */}
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 shadow-sm border border-white">
              {product.brand || "Industrial"}
            </span>
          </div>

          {/* Quick Add Button Overlay */}
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
             <button 
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-white shadow-lux active:scale-90"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
          </div>
        </div>

        {/* 📝 Info Grid */}
        <div className="p-6 flex flex-col flex-1">
          <div className="space-y-2 mb-4">
            <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight line-clamp-2 uppercase group-hover:text-primary transition-colors duration-300">
              {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
            </h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 {product.model || "Standard"}
               </span>
               <div className="w-1 h-1 bg-slate-300 rounded-full" />
               <div className="flex items-center gap-1.5">
                 <MapPin className="w-3 h-3 text-primary" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{product.location || "Cambodia"}</span>
               </div>
            </div>
          </div>

          <div className="mt-auto pt-5 border-t border-slate-100 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Price Est.</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900 tracking-tighter">$</span>
                <span className="text-2xl font-bold text-slate-900 tracking-tighter">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
