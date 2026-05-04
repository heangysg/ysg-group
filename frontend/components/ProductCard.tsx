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
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col h-full relative">
        {/* Image Section */}
        <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative overflow-hidden shrink-0">
          {imageUrl && imageUrl !== "" ? (
            <img 
              src={imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
            />
          ) : (
            <div className="text-slate-200 flex flex-col items-center gap-2">
              <Package className="w-12 h-12 stroke-[1.5]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
            </div>
          )}
          
          {/* Top Tags */}
          <div className="absolute top-3 inset-x-3 flex justify-between items-start z-10">
            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-900 border border-slate-100 shadow-sm">
              {product.brand}
            </span>
            
            {product.status === "available" && (
              <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg shadow-emerald-500/20">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                <span>Available</span>
              </div>
            )}
          </div>

          {/* Quick View Icon */}
          <div className="absolute bottom-3 right-3 p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg border border-slate-100">
            <ArrowUpRight className="w-4 h-4 text-primary" />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 md:p-6 flex flex-col flex-grow">
          <div className="space-y-1 mb-3 md:mb-4">
            <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {product.model || "Standard Series"}
            </p>
            <h3 className="font-bold text-sm md:text-lg text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug h-10 md:h-14">
              {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
            </h3>
          </div>
          
          <div className="mt-auto pt-3 md:pt-5 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{t("price") || "Price"}</span>
              <div className="flex items-baseline gap-0.5 md:gap-1 text-primary font-bold text-sm md:text-xl">
                <span className="text-[10px] md:text-xs opacity-60">$</span>
                {formatPrice(product.price)}
              </div>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="p-2 md:p-2.5 bg-slate-900 text-white rounded-lg md:rounded-xl hover:bg-primary transition-all active:scale-95 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5 md:w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
