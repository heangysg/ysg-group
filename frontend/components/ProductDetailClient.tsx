"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import toast, { Toaster } from "react-hot-toast"
import PublicLayout from "./PublicLayout"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { ArrowLeft, MapPin, Calendar, Clock, CheckCircle2, ChevronRight, Send, X, Package, ShieldCheck, Star, ArrowRight, ShoppingCart } from "lucide-react"
import ProductCard from "./ProductCard"

export default function ProductDetailClient({ initialProduct }: { initialProduct: any }) {
  const { slug } = useParams()
  const [product, setProduct] = useState<any>(initialProduct)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(!initialProduct)
  const [showInquiry, setShowInquiry] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const { t, language } = useLanguage()
  const { addToCart } = useCart()
  const [inquiryForm, setInquiryForm] = useState({ customerName: "", customerPhone: "", message: "" })
  const [submittingInquiry, setSubmittingInquiry] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
    const productName = language === "kh" && product.nameKhmer ? product.nameKhmer : product.name
    const message = language === "kh" ? `បានបន្ថែម ${productName} ទៅកន្ត្រក!` : `${productName} added to cart!`
    toast.success(message)
  }

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingInquiry(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const res = await fetch(`${API_URL}/api/public/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...inquiryForm, productId: product?.id })
    })
    
    if (!res.ok) {
      toast.error(language === "kh" ? "ការបញ្ជូនបានបរាជ័យ" : "Failed to send inquiry")
    } else {
      toast.success(language === "kh" ? "សារត្រូវបានផ្ញើដោយជោគជ័យ!" : "Inquiry sent successfully!")
      setShowInquiry(false)
      setInquiryForm({ customerName: "", customerPhone: "", message: "" })
    }
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
        const res = await fetch(`${API_URL}/api/public/products/${slug}`)
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
        const res = await fetch(`${API_URL}/api/public/products`)
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-medium mb-4">Product Not Found</h1>
          <Link href="/products" className="text-primary hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>
      </PublicLayout>
    )
  }

  const images = product.images || (product.thumbnail ? [product.thumbnail] : [])

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white pb-24 pt-6 md:pt-8">
        <Toaster position="top-center" reverseOrder={false} />
        
        {/* Desktop Breadcrumbs */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 mb-10">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">{t("home")}</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-slate-900 transition-colors">{t("products")}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">{language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}</span>
          </div>
        </div>

        {/* Mobile App Style Header */}
        <div className="md:hidden max-w-7xl mx-auto px-4 mb-6">
          <Link href="/products" className="inline-flex items-center gap-3 text-slate-900 font-bold text-sm uppercase tracking-widest">
            <div className="w-10 h-10 flex items-center justify-center bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            {language === "kh" ? "ត្រលប់ក្រោយ" : "Back"}
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Gallery */}
            <div className="space-y-6">
              <div className="bg-slate-50 border-4 border-slate-900 aspect-[4/3] relative group shadow-hard">
                {images.length > 0 && images[activeImage] ? (
                  <Image 
                    src={images[activeImage]} 
                    alt={product.name} 
                    fill
                    sizes="(max-width: 1200px) 100vw, 50vw"
                    className="object-cover transition-all duration-700" 
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                    <Package className="w-20 h-20" />
                    <span className="font-medium uppercase tracking-widest text-xs">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-slate-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-hard-primary border border-primary">
                    {product.brand}
                  </span>
                </div>
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-4">
                  {images.map((img: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square border-2 transition-all ${
                        activeImage === i ? "border-primary shadow-hard-primary" : "border-slate-200 hover:border-slate-900"
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image src={img} alt={`${product.name} ${i}`} fill sizes="20vw" className="object-cover" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="space-y-4 md:space-y-6 mb-4 md:mb-12">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-medium uppercase tracking-widest border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t("qualityAssured")}
                  </div>
                  {product.isFeatured && (
                    <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1 rounded-lg text-[9px] font-medium uppercase tracking-widest border border-primary/10">
                      <Star className="w-3.5 h-3.5 fill-primary" />
                      {t("featured")}
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl lg:text-5xl font-medium text-slate-900 tracking-tight leading-tight">
                  {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
                </h1>
                
                <div className="flex items-center gap-6 text-slate-400 font-medium uppercase tracking-widest text-[10px]">
                  <span>{product.brand}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span>Model: {product.model || "Standard"}</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-5xl font-medium text-primary">
                    {product.price ? `$${Number(product.price).toLocaleString()}` : "Price on Request"}
                  </span>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-2 gap-4 mb-12">
                <button
                  onClick={handleAddToCart}
                  className="bg-slate-900 text-white py-4 px-8 font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:translate-y-1 shadow-hard-primary border-2 border-slate-900 flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t("placeOrder")}
                </button>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="bg-white text-slate-900 border-2 border-slate-900 py-4 px-8 font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:translate-y-1 shadow-hard flex items-center justify-center gap-3"
                >
                  <Send className="w-5 h-5 text-primary" />
                  {t("contactSales")}
                </button>
              </div>

              {/* Mobile Sticky Actions */}
              <div className="md:hidden fixed bottom-[72px] left-0 right-0 bg-white border-t-2 border-slate-900 p-3 z-[90] flex gap-3 shadow-hard-primary">
                <button
                  onClick={handleAddToCart}
                  className="btn-primary flex-[1.5] py-3.5 flex items-center justify-center gap-2 text-[10px]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t("placeOrder")}
                </button>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="flex-1 bg-slate-50 text-slate-900 border-2 border-slate-900 py-3.5 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:translate-y-1 shadow-hard flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-primary" />
                  {t("contactSales")}
                </button>
              </div>

              {/* Description */}
              <div className="space-y-3 pt-4 md:space-y-4 md:pt-10 border-t-2 border-slate-900">
                <h3 className="text-slate-900 font-bold text-base md:text-lg uppercase tracking-widest">{t("description")}</h3>
                <div className="text-slate-500 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {language === "kh" && product.descriptionKhmer ? product.descriptionKhmer.trim() : product.description?.trim()}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-32">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-medium text-slate-900 tracking-tight">{t("relatedProducts")}</h2>
                <Link href="/products" className="flex items-center gap-2 text-primary font-medium uppercase tracking-widest text-[10px] group">
                  View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowInquiry(false)}></div>
          <div className="solid-card bg-white w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowInquiry(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 border-2 border-transparent hover:border-slate-900 transition-all">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-medium text-slate-900 mb-1">{t("contactSales")}</h2>
            <p className="text-sm text-slate-400 mb-8 font-medium">Get a quote for <span className="text-primary font-medium">{product.name}</span></p>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">{t("fullName") || "Full Name"}</label>
                <input required value={inquiryForm.customerName} onChange={(e) => setInquiryForm({...inquiryForm, customerName: e.target.value})} type="text" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-900 focus:border-primary outline-none transition-all font-bold text-slate-900 text-[11px] uppercase tracking-widest" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">{t("phone") || "Phone Number"}</label>
                <input required value={inquiryForm.customerPhone} onChange={(e) => setInquiryForm({...inquiryForm, customerPhone: e.target.value})} type="tel" className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-900 focus:border-primary outline-none transition-all font-bold text-slate-900 text-[11px] uppercase tracking-widest" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-widest">{t("message") || "Message"}</label>
                <textarea required value={inquiryForm.message} onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})} rows={4} className="w-full px-5 py-3 bg-slate-50 border-2 border-slate-900 focus:border-primary outline-none transition-all font-bold text-slate-900 text-[11px] resize-none uppercase tracking-widest"></textarea>
              </div>
              <button disabled={submittingInquiry} type="submit" className="btn-primary w-full py-4 text-xs mt-4 flex items-center justify-center gap-2">{submittingInquiry ? t("loading") || "Sending..." : t("send") || "Send Message"}</button>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
