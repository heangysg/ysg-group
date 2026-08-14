"use client"

import Link from "next/link"
import Image from "next/image"
import { Package, ShoppingCart, Heart } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useWishlist } from "../contexts/WishlistContext"
import toast from "react-hot-toast"
import { getValidImages, getOptimizedImageUrl } from "../lib/imageUtils"
import { motion } from "framer-motion"

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
}

export default function ProductCard({ product, index = 0, disableAnimation = false }: ProductCardProps) {
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
 <motion.div 
 initial={disableAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-40px" }}
 transition={{ duration: 0.5, ease: "easeOut", delay: disableAnimation ? 0 : Math.min(index * 0.05, 0.3) }}
 className="group flex flex-col h-full relative bg-white transition-all duration-300 border border-slate-200 rounded-md overflow-hidden hover:shadow-xl hover:shadow-[#004691]/5"
 >
 <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
 
  {/* 🖼️ Image Container */}
  <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden group/image">
  {imageUrl && imageUrl !== "" ? (
  <Image 
  src={imageUrl} 
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-110"
  />
  ) : (
  <div className="w-full h-full flex items-center justify-center bg-slate-50">
  <Package className="w-10 h-10 text-slate-300" />
  </div>
  )}

  {/* Floating Wishlist Button */}
  <button 
    onClick={handleToggleWishlist}
    className={`absolute top-2 right-2 w-8 h-8 rounded-md flex items-center justify-center transition-all z-20 pointer-events-auto shadow-sm ${
      inWishlist 
        ? "bg-[#004691] text-white" 
        : "bg-white/90 hover:bg-[#004691] text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0"
    }`}
    title={language === "kh" ? "បញ្ជីចំណូលចិត្ត" : "Wishlist"}
  >
    <Heart className={`w-4 h-4 ${inWishlist ? "fill-white" : ""}`} />
  </button>

  {/* Quick Add Overlay */}
  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 pointer-events-auto">
    <button 
      onClick={handleAddToCart}
      className="w-full bg-[#004691]/90 backdrop-blur-sm hover:bg-[#004691] text-white py-2 sm:py-2.5 rounded-md font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
    >
      <ShoppingCart className="w-4 h-4" />
      {language === "kh" ? "បន្ថែមទៅកន្ត្រក" : "Add to Cart"}
    </button>
  </div>
  </div>

  {/* 📝 Product Info */}
  <div className="flex flex-col flex-1 p-3 z-10 pointer-events-none bg-white">
  
  {/* Title */}
  <h3 className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#004691] transition-colors duration-300 mb-1 sm:mb-2">
  {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
  </h3>
  
  {/* Price */}
  <div className="mt-auto">
  <span className="text-sm sm:text-lg font-bold text-red-600 leading-none block">
  ${formatPrice(product.price)}
  </span>
  </div>
  </div>
  </motion.div>
 )
}
