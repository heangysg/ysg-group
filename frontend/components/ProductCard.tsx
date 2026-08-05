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
    <div className="group flex flex-col h-full relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
      
      {/* 🖼️ High-Impact Image Area */}
      <div className="relative aspect-[4/3] w-full bg-white border-b border-slate-100 overflow-hidden p-4 md:p-6 flex items-center justify-center">
        {imageUrl && imageUrl !== "" ? (
          <Image 
            src={imageUrl} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
            <Package className="w-12 h-12 text-slate-300 group-hover:text-primary transition-colors" />
          </div>
        )}
        
        {/* Quick Actions (Wishlist) */}
        <div className="absolute top-3 right-3 z-20">
          <button 
            onClick={handleToggleWishlist}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 border bg-white shadow-sm ${
              inWishlist 
                ? "text-red-500 border-red-100 bg-red-50" 
                : "text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-100"
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* 📝 Info Area */}
      <div className="p-4 md:p-5 flex flex-col flex-1 relative z-10 pointer-events-none">
        
        {/* Brand & Title */}
        <div className="space-y-1 mb-3 flex-1">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {product.brand || "Industrial"}
          </span>
          <h3 className="text-[14px] md:text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 min-h-[44px] group-hover:text-primary transition-colors duration-300">
            {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
          </h3>
          <p className="text-[12px] font-semibold text-slate-500 mt-1">
            Model: {product.model || "Standard"}
          </p>
        </div>

        {/* Price & Cart Action */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Price</span>
            <div className="flex items-baseline gap-0.5 text-primary">
              <span className="text-sm font-bold">$</span>
              <span className="text-lg md:text-xl font-bold tracking-tight">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-primary shadow-md active:scale-95"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
