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
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="card-minimal flex flex-col h-full overflow-hidden bg-white">
        {/* 🖼️ High-End Image Showcase */}
        <div className="relative aspect-[4/5] bg-[#FDFDFD] overflow-hidden">
          {imageUrl && imageUrl !== "" ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover transition-soft duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <Package className="w-16 h-16 text-slate-100" />
            </div>
          )}
          
          {/* Subtle Lux Label */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
            <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 shadow-lux border-lux">
              {product.brand || "Industrial"}
            </span>
            {product.status === "available" && (
              <span className="px-4 py-2 bg-primary/10 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-primary border border-primary/20">
                In Stock
              </span>
            )}
          </div>

          {/* Quick Action Overlay */}
          <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-soft flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-2xl shadow-lux transform translate-y-4 group-hover:translate-y-0 transition-soft duration-500">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">View details</span>
            </div>
          </div>
        </div>

        {/* 📝 Minimalist Content */}
        <div className="p-8 md:p-10 flex flex-col flex-1 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xl md:text-3xl font-black text-slate-900 leading-[1.1] tracking-tighter group-hover:text-primary transition-soft line-clamp-2 uppercase">
              {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
            </h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              {product.model || "Premium Edition"}
            </p>
          </div>

          <div className="pt-6 mt-auto border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Starting from</span>
              <span className="text-2xl md:text-3xl font-black text-primary tracking-tighter leading-none">
                ${formatPrice(product.price)}
              </span>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-soft border-lux shadow-sm hover:shadow-lux"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
