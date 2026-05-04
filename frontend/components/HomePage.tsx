"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../lib/supabase/client"
import { ArrowRight, CheckCircle, Truck, Headphones, Star, Package, Shield, Zap } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import ProductCard from "./ProductCard"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient()
      const { data } = await supabase
        .from("Product")
        .select("*")
        .eq("isPublished", true)
        .eq("isFeatured", true)
        .limit(6)
      
      setFeaturedProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const stats = [
    { label: t("equipmentSold"), value: "500+" },
    { label: t("trustedBrands"), value: "50+" },
    { label: t("countriesServed"), value: "25+" },
    { label: t("yearsExperience"), value: "15+" },
  ]

  const features = [
    { 
      title: "Global Standards", 
      desc: "All machinery meets international quality and safety certifications.",
      icon: Shield
    },
    { 
      title: "Efficient Performance", 
      desc: "High-output systems designed to maximize your production ROI.",
      icon: Zap
    },
    { 
      title: "Lifetime Support", 
      desc: "Dedicated maintenance and technical support for all our clients.",
      icon: Headphones
    }
  ]

  const [categories, setCategories] = useState<any[]>([])
  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase.from("Category").select("*")
      setCategories(data || [])
    }
    fetchCategories()
  }, [])

  return (
    <div className="overflow-x-hidden bg-white">
      {/* Clean Hero Section */}
      <section className="relative min-h-[70vh] flex items-center bg-slate-900 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 -skew-x-12 transform translate-x-1/2 z-0" />
        
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10 w-full">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
              <Star className="w-3 h-3 text-primary fill-primary" />
              {t("qualityAssured")}
            </div>
            <h1 className="text-4xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              {t("heroTitle").split(" ").map((word, i) => (
                <span key={i} className={i === 1 ? "text-primary" : ""}>{word} </span>
              ))}
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-medium">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/products" className="group inline-flex items-center justify-center gap-3 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20">
                {t("browseEquipment")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/5 transition-all backdrop-blur-sm">
                {t("contactSales")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Floating & Clean */}
      <section className="relative -mt-10 z-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center space-y-1">
                  <div className="text-3xl md:text-4xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Scroll - Mobile App Feel */}
      <section className="py-12 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("categories")}</h2>
            <Link href="/categories" className="text-primary text-[10px] font-bold uppercase tracking-widest">{t("viewAll") || "View All"}</Link>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`}
                className="flex-shrink-0 w-32 snap-start group"
              >
                <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-3 group-hover:border-primary/20 transition-all overflow-hidden relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <Package className="w-8 h-8 text-slate-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] font-bold text-slate-900 text-center uppercase tracking-wider line-clamp-1 group-hover:text-primary transition-colors">
                  {language === 'kh' && cat.nameKhmer ? cat.nameKhmer : cat.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - High Whitespace */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">{t("featuredEquipment")}</h2>
              <p className="text-slate-500 text-lg font-medium">{t("discoverPopular")}</p>
            </div>
            <Link href="/products" className="text-primary font-bold text-sm flex items-center gap-2 group">
              {t("allProducts")} 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[4/5] bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us - Simple Clean Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Industry Leaders Choose YSG</h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-100">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
