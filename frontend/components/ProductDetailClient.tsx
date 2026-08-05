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
  const [inquiryForm, setInquiryForm] = useState({ customerName: "", customerPhone: "", message: "" })
  const [submittingInquiry, setSubmittingInquiry] = useState(false)
  const [copied, setCopied] = useState(false)

  const inWishlist = product ? isInWishlist(product.id) : false

  const handleShare = async () => {
    const url = window.location.href
    const productName = language === "kh" && product.nameKhmer ? product.nameKhmer : product.name
    if (navigator.share) {
      try {
        await navigator.share({ title: productName, text: `Check out ${productName} on YSG Machinery`, url })
      } catch { }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success(language === "kh" ? "លីងត្រូវបានចម្លង!" : "Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAddToCart = () => {
    addToCart(product)
    const productName = language === "kh" && product.nameKhmer ? product.nameKhmer : product.name
    const message = language === "kh" ? `បានបន្ថែម ${productName} ទៅកន្ត្រក!` : `${productName} added to cart!`
    toast.success(message)
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

  useEffect(() => {
    async function fetchProduct() {
      if (initialProduct) {
        setLoading(false)
        fetchRelated(initialProduct.categoryId, initialProduct.id)
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      try {
        const res = await fetch(`${API_URL}/api/public/products/${slug}`, { cache: 'no-store' })
        if (!res.ok) throw new Error("Product not found")
        const { data } = await res.json()
        setProduct(data)
        fetchRelated(data.categoryId, data.id)
      } catch (error) {
        toast.error("Product not found")
      } finally {
        setLoading(false)
      }
    }

    async function fetchRelated(categoryId: string, currentId: string) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      try {
        const res = await fetch(`${API_URL}/api/public/products`, { cache: 'no-store' })
        if (res.ok) {
          const { data } = await res.json()
          const related = data
            .filter((p: any) => p.categoryId === categoryId && p.id !== currentId)
            .slice(0, 4)
          setRelatedProducts(related)
        }
      } catch (error) {
        console.error("Failed to fetch related products")
      }
    }

    fetchProduct()
  }, [slug, initialProduct])

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

  const images = product.images || (product.thumbnail ? [product.thumbnail] : [])

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white md:bg-[#F8FAFC] pb-24 pt-0 md:pt-8">
        <Toaster position="top-center" reverseOrder={false} />

        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block max-w-6xl mx-auto px-4 md:px-8 mb-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-primary transition-colors">{t("products")}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">{language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}</span>
          </div>
        </div>

        {/* Mobile App Style Header */}
        <div className="md:hidden absolute top-4 left-4 z-50">
          <Link href="/products" className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-slate-900 border border-slate-200/50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-0 md:px-8">
          <div className="bg-white md:rounded-2xl p-0 md:p-8 lg:p-12 md:shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:border md:border-slate-100 grid lg:grid-cols-2 gap-0 md:gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-[#F8FAFC] md:rounded-xl aspect-square md:aspect-[4/3] relative group overflow-hidden md:border md:border-slate-100 shadow-inner">
                {images.length > 0 && images[activeImage] ? (
                  <Image
                    src={images[activeImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1200px) 100vw, 50vw"
                    className="object-contain transition-all duration-700 hover:scale-105"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                    <Package className="w-20 h-20" />
                    <span className="font-medium text-xs">No Image Available</span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3 md:gap-4 px-4 md:px-0">
                  {images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square rounded-lg overflow-hidden transition-all duration-300 border-2 ${activeImage === i ? "border-primary shadow-md shadow-primary/20 scale-105" : "border-transparent hover:border-slate-200"
                        }`}
                    >
                      <div className="relative w-full h-full bg-[#F8FAFC]">
                        <Image src={img} alt={`${product.name} ${i}`} fill sizes="20vw" className="object-cover" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col px-5 py-6 md:p-0">
              <div className="flex flex-col mb-4 md:mb-6">
                <div className="flex flex-col gap-1 md:gap-1.5 mb-2 md:mb-3">
                  <span className="text-[12px] font-black text-primary uppercase tracking-widest">
                    {product.brand}
                  </span>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
                    {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center gap-4 text-slate-500 font-semibold text-sm bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                    <span>Model: {product.model || "Standard"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-2 rounded-lg text-[11px] font-bold border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                    {t("qualityAssured")}
                  </div>
                  {product.isFeatured && (
                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-2 rounded-lg text-[11px] font-bold border border-primary/20">
                      <Star className="w-4 h-4 fill-primary" />
                      {t("featured")}
                    </div>
                  )}
                </div>

                <div className="h-px w-full bg-slate-100 mb-3" />

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-black text-primary drop-shadow-sm">
                    {product.price ? `$${Number(product.price).toLocaleString()}` : "Price on Request"}
                  </span>

                  <button
                    onClick={handleToggleWishlist}
                    className={`ml-auto flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 active:scale-95 ${inWishlist
                        ? "bg-red-50 border-red-100 text-red-500 shadow-[0_8px_30px_rgb(239,68,68,0.2)]"
                        : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50"
                      }`}
                  >
                    <Heart className={`w-5 h-5 md:w-6 md:h-6 ${inWishlist ? "fill-red-500" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="bg-slate-900 text-white py-4 px-8 rounded-xl font-bold hover:bg-primary transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 text-sm shadow-sm"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t("placeOrder")}
                </button>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="bg-white text-slate-900 border-2 border-slate-200 py-4 px-8 rounded-xl font-bold hover:border-slate-900 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 text-sm"
                >
                  <Send className="w-5 h-5" />
                  {t("contactSales")}
                </button>
              </div>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 mb-4 md:mb-6 text-xs font-bold text-slate-600 hover:text-primary bg-slate-50 hover:bg-slate-100 py-3 rounded-2xl transition-all w-full border border-slate-100"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                {copied ? (language === "kh" ? "ចម្លងហើយ!" : "Copied!") : (language === "kh" ? "ចែករំលែក​ផលិតផល" : "Share Product")}
              </button>

              {/* Mobile Sticky Actions */}
              <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-4 z-[90] flex gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] rounded-t-3xl">
                <button
                  onClick={handleAddToCart}
                  className="bg-primary text-white rounded-2xl flex-[1.5] py-3.5 flex items-center justify-center gap-2 text-[12px] font-bold shadow-lg shadow-primary/30"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t("placeOrder")}
                </button>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="flex-1 bg-white text-slate-900 border border-slate-200 rounded-2xl py-3.5 font-bold text-[12px] hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-primary" />
                  {t("contactSales")}
                </button>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 pt-4 md:pt-6 border-t border-slate-100">
                <h3 className="text-slate-900 font-black text-lg md:text-xl">{t("description")}</h3>
                <div className="text-slate-500 text-[15px] leading-relaxed whitespace-pre-line font-medium bg-slate-50 p-6 rounded-xl border border-slate-100">
                  {language === "kh" && product.descriptionKhmer ? product.descriptionKhmer.trim() : product.description?.trim()}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-8 md:mt-12 px-4 md:px-0">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{t("relatedProducts")}</h2>
                <Link href="/products" className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100 text-slate-600 font-bold text-xs hover:text-primary hover:border-primary transition-all group">
                  View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 md:gap-8">
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
                <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">{t("fullName") || "Full Name"}</label>
                <input required value={inquiryForm.customerName} onChange={(e) => setInquiryForm({ ...inquiryForm, customerName: e.target.value })} type="text" className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 text-[13px]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">{t("phone") || "Phone Number"}</label>
                <input required value={inquiryForm.customerPhone} onChange={(e) => setInquiryForm({ ...inquiryForm, customerPhone: e.target.value })} type="tel" className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 text-[13px]" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-2 uppercase tracking-wider">{t("message") || "Message"}</label>
                <textarea required value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} rows={4} className="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900 text-[13px] resize-none"></textarea>
              </div>
              <button disabled={submittingInquiry} type="submit" className="w-full bg-primary text-white rounded-xl py-4 font-bold text-[13px] mt-6 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/30">
                {submittingInquiry ? t("loading") || "Sending..." : t("send") || "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
