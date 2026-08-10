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
      className="group flex flex-col h-full relative bg-white transition-all duration-300 border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-[#004691]/5"
    >
      <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={`View ${product.name}`} />
      
      {/* 🖼️ Image Container */}
      <div className="relative aspect-square w-full bg-white flex items-center justify-center p-4">
        {imageUrl && imageUrl !== "" ? (
          <Image 
            src={imageUrl} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
        )}
      </div>

      {/* 📝 Product Info & Actions */}
      <div className="flex flex-col flex-1 p-3 pt-1 z-10 pointer-events-none">
        
        {/* Title */}
        <h3 className="text-[13px] sm:text-sm font-semibold text-slate-800 leading-snug truncate group-hover:text-[#004691] transition-colors duration-300 mb-2">
          {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
        </h3>
        
        {/* Bottom Row: Price & Buttons */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-y-2 gap-x-1">
          
          {/* Price */}
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] sm:text-lg font-bold text-red-500 tracking-tight leading-none">
              ${formatPrice(product.price)}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
            <button 
              onClick={handleAddToCart}
              className="w-6 h-6 sm:w-7 sm:h-7 bg-[#00224a] hover:bg-[#004691] text-white rounded-full flex items-center justify-center transition-colors shadow-xs hover:scale-105 active:scale-95"
              title={language === "kh" ? "បន្ថែមទៅកន្ត្រក" : "Add to Cart"}
            >
              <ShoppingCart className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
            </button>
            <button 
              onClick={handleToggleWishlist}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-colors shadow-xs hover:scale-105 active:scale-95 ${
                inWishlist 
                  ? "bg-blue-50 text-[#004691] border border-[#004691]" 
                  : "bg-[#00224a] hover:bg-[#004691] text-white border border-transparent"
              }`}
              title={language === "kh" ? "បញ្ជីចំណូលចិត្ត" : "Wishlist"}
            >
              <Heart className={`w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] ${inWishlist ? "fill-[#004691]" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
