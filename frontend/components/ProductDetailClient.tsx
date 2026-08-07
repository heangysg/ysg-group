"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import toast, { Toaster } from "react-hot-toast"
import PublicLayout from "./PublicLayout"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useWishlist } from "../contexts/WishlistContext"
import { ArrowLeft, MapPin, Calendar, Clock, CheckCircle2, ChevronRight, Send, X, Package, ShieldCheck, Star, ArrowRight, ShoppingCart, Share2, Copy, Check, Heart } from "lucide-react"
import ProductCard from "./ProductCard"
import ProductNotFound from "./ProductNotFound"
import { getValidImages } from "../lib/imageUtils"

export default function ProductDetailClient({ initialProduct }: { initialProduct: any }) {
  const { slug } = useParams()
  const [product, setProduct] = useState<any>(initialProduct)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(!initialProduct)
  const [showInquiry, setShowInquiry] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const { t, language } = useLanguage()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [inquiryForm, setInquiryForm] = useState({ customerName: "", customerPhone: "", message: "" })
  const [submittingInquiry, setSubmittingInquiry] = useState(false)
  const [copied, setCopied] = useState(false)

  const inWishlist = product ? isInWishlist(product.id) : false

  const handleShare = async () => {
    const url = window.location.href
    const productName = language === "kh" && product.nameKhmer ? product.nameKhmer : product.name
    if (navigator.share) {
      try {
        await navigator.share({ title: productName, text: `Check out ${productName} on Yeung Shi Group`, url })
      } catch { }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(language === "kh" ? "លីងត្រូវបានចម្លង!" : "Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
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

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingInquiry(true)

    const productName = language === "kh" && product.nameKhmer ? product.nameKhmer : product.name
    const tgMessage = `🚨 *ការសាកសួរផលិតផល (Product Inquiry)* 🚨
*ផលិតផល (Product):* ${productName}
*ឈ្មោះ (Name):* ${inquiryForm.customerName}
*លេខទូរស័ព្ទ (Phone):* ${inquiryForm.customerPhone}
*សារ (Message):* ${inquiryForm.message}`

    const telegramUrl = `https://t.me/Emma_Heang?text=${encodeURIComponent(tgMessage)}`

    // Save to DB in the background
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    fetch(`${API_URL}/api/public/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...inquiryForm, productId: product?.id })
    }).catch(err => console.error("Failed to save inquiry to DB", err))

    // Redirect user to Telegram
    window.open(telegramUrl, '_blank')

    toast.success(language === "kh" ? "កំពុងបើក Telegram..." : "Opening Telegram...")
    setShowInquiry(false)
    setInquiryForm({ customerName: "", customerPhone: "", message: "" })
    setSubmittingInquiry(false)
  }

  const [categoryObj, setCategoryObj] = useState<any>(null)

  const fetchCategoryDetails = async (catId: string) => {
    if (!catId) return
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    try {
      const res = await fetch(`${API_URL}/api/public/categories`)
      if (res.ok) {
        const { data } = await res.json()
        if (data) {
          const matched = data.find((c: any) => c.id === catId || c.slug === catId)
          if (matched) setCategoryObj(matched)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    async function fetchProduct() {
      if (initialProduct) {
        setLoading(false)
        fetchRelated(initialProduct.categoryId, initialProduct.id)
        fetchCategoryDetails(initialProduct.categoryId)
        return
      }

      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      try {
        const res = await fetch(`${API_URL}/api/public/products/${slug}`)
        if (res.ok) {
          const { data } = await res.json()
          setProduct(data)
          if (data) {
            fetchRelated(data.categoryId, data.id)
            fetchCategoryDetails(data.categoryId)
          }
        }
      } catch (err) {
        console.error("Fetch Product Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [slug, initialProduct])

  const fetchRelated = async (catId: string, currentId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    try {
      const res = await fetch(`${API_URL}/api/public/products`)
      if (res.ok) {
        const { data } = await res.json()
        if (data) {
          setRelatedProducts(data.filter((p: any) => p.categoryId === catId && p.id !== currentId).slice(0, 4))
        }
      }
    } catch (err) {
      console.error("Fetch Related Error:", err)
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    )
  }

  if (!product) {
    return (
      <PublicLayout>
        <ProductNotFound />
      </PublicLayout>
    )
  }

  const images = getValidImages(product)

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white pb-24 pt-4 md:pt-6 font-sans">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* 📍 Mobile Responsive Breadcrumbs (Increased font size) */}
          <div className="mb-4 md:mb-6 flex items-center gap-2 text-sm sm:text-base font-semibold text-slate-600 overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">
              {language === "kh" ? "ទំព័រដើម" : "Home"}
            </Link>
            <span className="shrink-0 text-slate-400">/</span>
            <Link href={`/products/category/${categoryObj?.slug || 'all'}`} className="hover:text-[#004691] shrink-0 transition-colors">
              {categoryObj 
                ? (language === "kh" && categoryObj.nameKhmer ? categoryObj.nameKhmer : categoryObj.name)
                : (language === "kh" ? "ផលិតផល" : "Products")}
            </Link>
            <span className="shrink-0 text-slate-400">/</span>
            <span className="text-slate-800 font-bold truncate min-w-0">
              {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
            </span>
          </div>

          {/* 🛍️ Main Product Detail Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-12">
            
            {/* Left: Image Showcase & Thumbnails */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl aspect-square relative overflow-hidden flex items-center justify-center p-6 shadow-2xs border border-slate-100">
                {images.length > 0 && images[activeImage] ? (
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1200px) 100vw, 50vw"
                    className="object-contain p-4"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                    <Package className="w-16 h-16" />
                    <span className="text-xs font-medium">No Image Available</span>
                  </div>
                )}
              </div>

              {/* Thumbnails row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 h-20 bg-white rounded-xl overflow-hidden shrink-0 border-2 transition-all p-1 ${
                        activeImage === i ? "border-[#004691] shadow-xs" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info & Actions (100% Gyeon Cambodia Clone) */}
            <div className="flex flex-col space-y-4 pt-2">
              
              {/* Title & Favorite / Share Buttons */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                  {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
                </h1>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={handleToggleWishlist}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                      inWishlist ? "text-[#004691] border-[#004691] bg-blue-50" : "text-slate-400 border-slate-200 hover:text-[#004691] bg-white"
                    }`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${inWishlist ? "fill-[#004691]" : ""}`} />
                  </button>

                  <button 
                    onClick={handleShare}
                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1E3A5F] text-white hover:bg-[#004691] transition-all shadow-2xs"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="text-xs font-semibold text-slate-500">
                <span>{language === "kh" ? "ប្រភេទ: " : "Category: "}</span>
                <Link href={`/products/category/${categoryObj?.slug || product.category?.slug || product.categorySlug || 'all'}`} className="text-slate-800 hover:text-[#004691] font-bold">
                  {(() => {
                    if (categoryObj) {
                      return language === "kh" && categoryObj.nameKhmer ? categoryObj.nameKhmer : categoryObj.name
                    }
                    if (product.category) {
                      return language === "kh" && product.category.nameKhmer ? product.category.nameKhmer : product.category.name
                    }
                    return product.brand || (language === "kh" ? "ម៉ាស៊ីន និង ឧបករណ៍" : "Machinery & Equipment")
                  })()}
                </Link>
              </div>

              {/* Price Tag */}
              <div className="pt-2">
                <span className="text-3xl md:text-4xl font-extrabold text-[#004691] font-sans">
                  ${product.price ? Number(product.price).toLocaleString() : "0.00"}
                </span>
              </div>

              {/* Quantity Selector + Add to Cart Button Row */}
              <div className="flex flex-wrap items-center gap-4 pt-4 pb-2">
                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 px-3 py-1.5">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-slate-600 hover:text-slate-900 font-extrabold text-lg px-2"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm text-slate-900 font-sans">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-slate-600 hover:text-slate-900 font-extrabold text-lg px-2"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[200px] py-3 px-6 bg-[#1E3A5F] hover:bg-[#004691] text-white rounded-lg font-extrabold text-xs md:text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-95 uppercase tracking-wider"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{language === "kh" ? "ដាក់ចូលកន្ត្រកទំនិញ" : "Add to Cart"}</span>
                </button>
              </div>

              {/* Description Details */}
              <div className="pt-4 border-t border-slate-200/80 space-y-3">
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                  {language === "kh" && product.descriptionKhmer ? product.descriptionKhmer.trim() : product.description?.trim()}
                </p>
              </div>

            </div>
          </div>

          {/* 🌟 Related Products Section (Gyeon Style: ផលិតផលដែលអ្នកអាចនឹងចូលចិត្ត) */}
          {relatedProducts.length > 0 && (
            <div className="pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#004691] tracking-tight">
                  {language === "kh" ? "ផលិតផលស្រដៀង" : "Similar Products"}
                </h2>
                <Link href="/products" className="text-xs font-bold text-[#004691] hover:underline">
                  {language === "kh" ? "មើលទាំងអស់" : "View All"}
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Inquiry Modal */}
      {showInquiry && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowInquiry(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 md:p-10 relative animate-in fade-in zoom-in duration-300 shadow-2xl border border-slate-100">
            <button onClick={() => setShowInquiry(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-full transition-all hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
              <Send className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">{t("contactSales")}</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium">Get a quote for <span className="text-primary font-bold">{product.name}</span></p>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">{t("fullName") || "Full Name"}</label>
                <input required value={inquiryForm.customerName} onChange={(e) => setInquiryForm({ ...inquiryForm, customerName: e.target.value })} type="text" className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">{t("phone") || "Phone Number"}</label>
                <input required value={inquiryForm.customerPhone} onChange={(e) => setInquiryForm({ ...inquiryForm, customerPhone: e.target.value })} type="tel" className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">{t("message") || "Message"}</label>
                <textarea required value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} rows={4} className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 text-sm sm:text-base resize-none"></textarea>
              </div>
              <button disabled={submittingInquiry} type="submit" className="w-full bg-primary text-white rounded-xl py-4 font-bold text-sm sm:text-base mt-6 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/30">
                {submittingInquiry ? t("loading") || "Sending..." : t("send") || "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
