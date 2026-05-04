"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "../lib/supabase/client"
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

  const handleAddToCart = () => {
    addToCart(product)
    toast.success(`${product.name} added to cart!`)
  }

  useEffect(() => {
    async function fetchProduct() {
      if (initialProduct) {
        setLoading(false)
        fetchRelated(initialProduct.categoryId, initialProduct.id)
        return
      }
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from("Product")
        .select(`
          *,
          Category (
            id,
            name,
            nameKhmer
          )
        `)
        .eq("slug", slug)
        .single()

      if (error) {
        toast.error("Product not found")
      } else {
        setProduct(data)
        fetchRelated(data.categoryId, data.id)
      }
      setLoading(false)
    }

    async function fetchRelated(categoryId: string, currentId: string) {
      const supabase = createClient()
      const { data: related } = await supabase
        .from("Product")
        .select("*")
        .eq("categoryId", categoryId)
        .neq("id", currentId)
        .limit(4)
      
      setRelatedProducts(related || [])
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
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
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
      <main className="min-h-screen bg-white pb-24 pt-8 md:pt-12">
        <Toaster position="top-center" reverseOrder={false} />
        
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 mb-10">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap pb-2">
            <Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-primary transition-colors">{t("products")}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">{language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Gallery */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl overflow-hidden aspect-[4/3] border border-slate-100 relative group">
                {images.length > 0 && images[activeImage] ? (
                  <img 
                    src={images[activeImage]} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-all duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                    <Package className="w-20 h-20" />
                    <span className="font-bold uppercase tracking-widest text-xs">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-6 left-6">
                  <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm border border-slate-100">
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
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === i ? "border-primary shadow-md" : "border-transparent hover:border-slate-200"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t("qualityAssured")}
                  </div>
                  {product.isFeatured && (
                    <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-primary/10">
                      <Star className="w-3.5 h-3.5 fill-primary" />
                      {t("featured")}
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                  {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
                </h1>
                
                <div className="flex items-center gap-6 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <span>{product.brand}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200" />
                  <span>Model: {product.model || "Standard"}</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-5xl font-bold text-primary">
                    {product.price ? `$${Number(product.price).toLocaleString()}` : "Price on Request"}
                  </span>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-2 gap-4 mb-12">
                <button
                  onClick={handleAddToCart}
                  className="bg-slate-900 text-white py-4 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t("placeOrder")}
                </button>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="bg-white text-slate-900 border border-slate-200 py-4 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Send className="w-5 h-5 text-primary" />
                  {t("contactSales")}
                </button>
              </div>

              {/* Mobile Sticky Actions */}
              <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 z-[90] flex gap-3 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button
                  onClick={handleAddToCart}
                  className="flex-[1.5] bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t("placeOrder")}
                </button>
                <button
                  onClick={() => setShowInquiry(true)}
                  className="flex-1 bg-white text-slate-900 border border-slate-200 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-primary" />
                  {t("contactSales")}
                </button>
              </div>

              {/* Description */}
              <div className="space-y-4 pt-10 border-t border-slate-100">
                <h3 className="text-slate-900 font-bold text-lg uppercase tracking-widest">{t("description")}</h3>
                <div className="text-slate-500 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {language === "kh" && product.descriptionKhmer ? product.descriptionKhmer : product.description}
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-32">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t("relatedProducts")}</h2>
                <Link href="/products" className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] group">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in duration-200 border border-slate-100">
            <button onClick={() => setShowInquiry(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-all">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{t("contactSales")}</h2>
            <p className="text-sm text-slate-400 mb-8 font-medium">Get a quote for <span className="text-primary font-bold">{product.name}</span></p>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("fullName")}</label>
                <input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("phone")}</label>
                <input type="tel" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("message")}</label>
                <textarea rows={4} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl transition-all mt-4">{t("send") || "Send Message"}</button>
            </form>
          </div>
        </div>
      )}
    </PublicLayout>
  )
}
