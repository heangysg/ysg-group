"use client"

import Link from "next/link"
import Image from "next/image"
import { Package, ShoppingCart, Heart } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useWishlist } from "../contexts/WishlistContext"
import toast from "react-hot-toast"
import { getValidImages, getOptimizedImageUrl } from "../lib/imageUtils"

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
 index?: number
 disableAnimation?: boolean
 compact?: boolean
}

export default function ProductCard({ product, index = 0, disableAnimation = false, compact = false }: ProductCardProps) {
 const { language, t } = useLanguage()
 const { addToCart } = useCart()
 const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
 
 const inWishlist = isInWishlist(product.id)

 const formatPrice = (price: number) => {
 return new Intl.NumberFormat("en-US", {
 style: "decimal",
 minimumFractionDigits: 2,
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

 const images = getValidImages(product)
 let imageUrl = getOptimizedImageUrl(images[0] || "", 'card')

 return (
 <div
 style={{ contain: "layout style" }}
 className="group flex flex-col h-full relative bg-white transition-shadow duration-200 border border-slate-200 rounded-md overflow-hidden hover:shadow-xl hover:shadow-[#004691]/5"
 >
 <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
 
  {/* 🖼️ Image Container */}
  <div className={`relative w-full bg-slate-50 flex items-center justify-center overflow-hidden group/image ${
    compact ? "aspect-[6/5] p-3" : "aspect-square p-4"
  }`}>
  {imageUrl && imageUrl !== "" ? (
  <Image 
  src={imageUrl} 
  alt={product.name}
  fill
  decoding="async"
  sizes={compact ? "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 18vw" : "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"}
  className={`object-contain transform-gpu transition-transform duration-300 ease-out group-hover:scale-105 ${
    compact ? "p-2.5" : "p-4"
  }`}
  />
  ) : (
  <div className="w-full h-full flex items-center justify-center bg-slate-50">
  <Package className={`${compact ? "w-8 h-8" : "w-10 h-10"} text-slate-300`} />
  </div>
  )}

  {/* Floating Wishlist Button */}
  <button 
    onClick={handleToggleWishlist}
    className={`absolute top-2 right-2 rounded-md flex items-center justify-center transition-colors transition-opacity duration-200 z-20 pointer-events-auto shadow-sm ${
      compact ? "w-7 h-7" : "w-8 h-8"
    } ${
      inWishlist 
        ? "bg-[#004691] text-white" 
        : "bg-white/95 hover:bg-[#004691] text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0"
    }`}
    title={language === "kh" ? "បញ្ជីចំណូលចិត្ត" : "Wishlist"}
  >
    <Heart className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"} ${inWishlist ? "fill-white" : ""}`} />
  </button>

  {/* Quick Add Overlay */}
  <div className={`absolute bottom-0 left-0 right-0 transform-gpu translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20 pointer-events-auto ${
    compact ? "p-1.5" : "p-2 sm:p-3"
  }`}>
    <button 
      onClick={handleAddToCart}
      className={`w-full bg-[#004691] hover:bg-[#003366] text-white rounded-md font-medium flex items-center justify-center shadow-lg transition-colors ${
        compact ? "py-1.5 text-[11px] gap-1.5" : "py-2 sm:py-2.5 text-xs sm:text-sm gap-2"
      }`}
    >
      <ShoppingCart className={compact ? "w-3.5 h-3.5 shrink-0" : "w-4 h-4 shrink-0"} />
      <span className="truncate">{language === "kh" ? "បន្ថែមទៅកន្ត្រក" : "Add to Cart"}</span>
    </button>
  </div>
  </div>

  {/* 📝 Product Info */}
  <div className={`flex flex-col flex-1 z-10 pointer-events-none bg-white ${
    compact ? "p-2.5" : "p-3"
  }`}>
  
  {/* Title */}
  <h3 className={`font-medium text-slate-800 leading-snug line-clamp-2 group-hover:text-[#004691] transition-colors duration-200 ${
    compact ? "text-xs mb-1.5" : "text-xs sm:text-sm mb-1 sm:mb-2"
  }`}>
  {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
  </h3>
  
  {/* Price */}
  <div className="mt-auto">
  <span className={`font-semibold text-red-600 leading-none block ${
    compact ? "text-sm sm:text-base" : "text-sm sm:text-lg"
  }`}>
  ${formatPrice(product.price)}
  </span>
  </div>
  </div>
  </div>
 )
}
