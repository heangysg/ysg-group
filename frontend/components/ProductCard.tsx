"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Package, ShoppingCart, ArrowUpRight, Heart } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useWishlist } from "../contexts/WishlistContext"
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
    model?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language, t } = useLanguage()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  
  const inWishlist = isInWishlist(product.id)

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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  let imageUrl = product.images && product.images[0] ? product.images[0] : product.thumbnail
  if (imageUrl && imageUrl.includes("cloudinary.com")) {
    imageUrl = imageUrl.replace("/upload/f_auto,q_auto/", "/upload/w_300,c_fill,f_auto,q_auto/")
  }

  return (
    <div className="group flex flex-col h-full relative bg-white rounded-lg border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
      
      {/* 🖼️ Clean Image Container */}
      <div className="relative aspect-square w-full bg-[#FAFBFD] border-b border-slate-100 overflow-hidden p-4 flex items-center justify-center">
        {imageUrl && imageUrl !== "" ? (
          <Image 
            src={imageUrl} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Package className="w-10 h-10 text-slate-300 group-hover:text-slate-600 transition-colors" />
          </div>
        )}
        
        {/* Wishlist Button */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button 
            onClick={handleToggleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border shadow-2xs ${
              inWishlist 
                ? "text-red-500 border-red-200 bg-red-50" 
                : "text-slate-400 border-slate-200/80 bg-white/90 hover:text-red-500 hover:border-red-200 hover:bg-white"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* 📝 Clean Product Info */}
      <div className="p-3.5 md:p-4 flex flex-col flex-1 relative z-10 pointer-events-none">
        <div className="space-y-1 mb-3 flex-1">
          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {product.brand || "YSG Group"}
          </span>
          <h3 className="text-[13px] md:text-[14px] font-semibold text-slate-900 leading-snug line-clamp-2 min-h-[38px] group-hover:text-primary transition-colors duration-200">
            {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
          </h3>
          {product.model && (
            <p className="text-[11px] text-slate-400 font-normal">
              {product.model}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("price") || "Price"}</span>
            <span className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              ${formatPrice(product.price)}
            </span>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="h-8 md:h-9 px-3 bg-slate-900 hover:bg-primary text-white rounded-md flex items-center gap-1.5 text-[11px] font-semibold transition-all duration-200 shadow-2xs active:scale-95"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{language === "kh" ? "ទិញ" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
