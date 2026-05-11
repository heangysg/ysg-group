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
    toast.success(`${product.name} added to cart!`)
  }

  const imageUrl = product.images && product.images[0] ? product.images[0] : product.thumbnail

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="flex flex-col h-full overflow-hidden bg-white rounded-2xl md:rounded-[2.5rem] shadow-lux-deep border border-slate-100/50 transition-soft group-hover:-translate-y-1">
        {/* 🖼️ High-End Image Showcase (Nichhy Style) */}
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          {imageUrl && imageUrl !== "" ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover transition-soft duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Package className="w-12 h-12 text-slate-200" />
            </div>
          )}
          
          {/* Subtle Lux Label */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2">
            <span className="px-3 py-1.5 md:px-4 md:py-2 bg-white/90 backdrop-blur-md rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-slate-950 shadow-sm border border-slate-100">
              {product.brand || "Industrial"}
            </span>
          </div>

          {/* Quick Action Overlay */}
          <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-soft flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-xl shadow-lux-deep transform translate-y-4 group-hover:translate-y-0 transition-soft duration-500">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-950">View Details</span>
            </div>
          </div>
        </div>

        {/* 📝 Minimalist Content */}
        <div className="p-4 md:p-8 flex flex-col flex-1 space-y-4 md:space-y-6">
          <div className="space-y-1.5 md:space-y-2">
            <h3 className="text-sm md:text-xl font-black text-slate-950 leading-tight tracking-tighter group-hover:text-primary transition-soft line-clamp-1 uppercase">
              {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
            </h3>
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em]">
              {product.model || "Premium Edition"}
            </p>
          </div>

          <div className="pt-4 md:pt-6 mt-auto border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[7px] md:text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5 md:mb-1">Price Est.</span>
              <span className="text-lg md:text-2xl font-black text-primary tracking-tighter leading-none">
                ${formatPrice(product.price)}
              </span>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-soft border border-slate-100 shadow-sm hover:shadow-lux-deep active:scale-95"
            >
              <ShoppingCart className="w-4.5 h-4.5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
