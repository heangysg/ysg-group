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
    const message = language === "kh" ? "បានបន្ថែមទៅកន្ត្រកទំនិញ" : "Added to cart"
    toast.success(message, {
      style: {
        background: '#16a34a',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '9999px',
        fontWeight: '600',
        fontSize: '11px'
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#16a34a'
      }
    })
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
    <div className="group flex flex-col h-full relative bg-white transition-all duration-300 p-2 md:p-3 rounded-lg hover:shadow-xs">
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
      
      {/* 🖼️ Floating Clean Image Container */}
      <div className="relative aspect-square w-full bg-white overflow-hidden p-4 flex items-center justify-center mb-3">
        {imageUrl && imageUrl !== "" ? (
          <Image 
            src={imageUrl} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-md">
            <Package className="w-10 h-10 text-slate-300 group-hover:text-slate-600 transition-colors" />
          </div>
        )}
        
        {/* Wishlist Icon (Always Visible) */}
        <div className="absolute top-1 right-1 z-20 transition-opacity duration-200">
          <button 
            onClick={handleToggleWishlist}
            className={`w-7 h-7 rounded-md flex items-center justify-center border bg-white shadow-2xs ${
              inWishlist ? "text-[#004691] border-[#004691] bg-blue-50" : "text-slate-400 border-slate-200 hover:text-[#004691]"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-[#004691]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 📝 Centered Title & Price (Matching Gyeon Image 2) */}
      <div className="flex flex-col items-center text-center flex-1 z-10 pointer-events-none">
        <h3 className="text-[13px] md:text-[14px] font-medium text-slate-900 leading-snug line-clamp-2 min-h-[38px] group-hover:text-[#004691] transition-colors duration-200 mb-1">
          {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
        </h3>
        
        <div className="mt-auto pt-1 flex items-center justify-center gap-2 pointer-events-auto">
          <span className="text-base md:text-lg font-extrabold text-[#004691] tracking-tight">
            ${formatPrice(product.price)}
          </span>
          <button 
            onClick={handleAddToCart}
            className="w-7 h-7 bg-slate-900 hover:bg-[#004691] text-white rounded-full flex items-center justify-center transition-colors shadow-2xs active:scale-95 ml-1"
            title={language === "kh" ? "បន្ថែមទៅកន្ត្រក" : "Add to Cart"}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
