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
      <div className="flex flex-col h-full overflow-hidden bg-white rounded-[2.5rem] transition-all duration-700 hover:shadow-lux-deep border border-slate-100 relative">
        {/* 🖼️ High-Impact Image */}
        <div className="relative aspect-[16/10] bg-slate-50 overflow-hidden">
          {imageUrl && imageUrl !== "" ? (
            <img 
              src={imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <Package className="w-12 h-12 text-slate-200" />
            </div>
          )}
          
          {/* Badge: Bright & Sharp */}
          <div className="absolute top-5 left-5">
            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-slate-950 shadow-sm border border-slate-100">
              {product.brand || "Industrial"}
            </span>
          </div>
        </div>

        {/* 📝 Info Grid */}
        <div className="p-6 flex flex-col flex-1">
          <div className="space-y-1 mb-4">
            <h3 className="text-[16px] font-bold text-slate-900 leading-tight tracking-tight line-clamp-1 uppercase group-hover:text-primary transition-colors">
              {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
            </h3>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 {product.model || "Standard"}
               </span>
               <div className="w-1 h-1 bg-slate-200 rounded-full" />
               <div className="flex items-center gap-1">
                 <MapPin className="w-3 h-3 text-slate-300" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{product.location || "Cambodia"}</span>
               </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-1">Price Est.</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-slate-900 tracking-tighter">$</span>
                <span className="text-xl font-bold text-slate-900 tracking-tighter">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="w-11 h-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/10 active:scale-95 border border-slate-100"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
