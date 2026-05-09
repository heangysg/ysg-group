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
    async function initialFetch() {
      setLoading(true)
      const supabase = createClient()
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase
            .from("Product")
            .select("*")
            .eq("isPublished", true)
            .eq("isFeatured", true)
            .limit(6),
          supabase
            .from("Category")
            .select("*")
            .order("sortOrder", { ascending: true })
            .limit(10)
        ])
        
        setFeaturedProducts(prodRes.data || [])
        setCategories(catRes.data || [])
      } catch (err) {
        console.error("Home Data Fetch Error:", err)
      } finally {
        setLoading(false)
      }
    }
    initialFetch()
  }, [])

  return (
    <div className="overflow-x-hidden bg-white">
      {/* 🌬️ Airy Luxury Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-[#F8FAFC] overflow-hidden">
        {/* Subtle Luxury Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#003485_1px,transparent_1px)] [background-size:32px_32px]" />
        
        <div className="max-w-7xl mx-auto px-6 py-32 md:py-48 relative z-10 w-full">
          <div className="flex flex-col items-center text-center space-y-12">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white border-lux text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-lux">
              <Star className="w-3.5 h-3.5 text-primary" />
              {t("qualityAssured") || "Global Excellence"}
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter max-w-5xl">
              {t("heroTitle").split(" ").map((word, i) => (
                <span key={i} className={i === 1 ? "text-primary block md:inline" : ""}>{word} </span>
              ))}
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl leading-relaxed font-medium">
              {t("heroSubtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Link href="/products" className="btn-luxury px-12 py-5 shadow-lux">
                {t("browseEquipment")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center px-12 py-5 rounded-2xl bg-white border-lux text-slate-900 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-soft shadow-lux">
                {t("contactSales")}
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Floating Shapes */}
        <div className="absolute -left-20 top-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -right-20 bottom-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </section>

      {/* 📊 Minimalist Stats Dashboard */}
      <section className="relative -mt-20 z-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[3rem] shadow-lux border-lux p-10 md:p-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="text-center space-y-3 group">
                  <div className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter group-hover:text-primary transition-soft">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🏷️ Categories: Clean App Feel */}
      <section className="py-32 md:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-16 px-2">
            <div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block">Categories</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{t("browseByCategory") || "Engineered Solutions"}</h2>
            </div>
            <Link href="/categories" className="hidden md:flex items-center gap-3 text-slate-400 hover:text-primary transition-soft text-[10px] font-black uppercase tracking-widest">
              {t("viewAll") || "Explore All"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 snap-x">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`}
                className="flex-shrink-0 w-44 md:w-56 snap-start group"
              >
                <div className="aspect-[4/5] bg-[#FDFDFD] rounded-[2.5rem] border-lux flex items-center justify-center mb-6 group-hover:shadow-lux transition-soft overflow-hidden relative shadow-sm">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-soft group-hover:scale-105" />
                  ) : (
                    <Package className="w-12 h-12 text-slate-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-soft" />
                </div>
                <h3 className="text-xs font-black text-slate-900 text-center uppercase tracking-widest px-4 leading-relaxed group-hover:text-primary transition-soft">
                  {language === 'kh' && cat.nameKhmer ? cat.nameKhmer : cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🏗️ Featured Showcase: Extreme Whitespace */}
      <section className="py-32 md:py-48 bg-[#FCFCFD] border-y border-lux">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 px-2">
            <div className="max-w-2xl space-y-4">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Showcase</span>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">{t("featuredEquipment")}</h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed">{t("discoverPopular")}</p>
            </div>
            <Link href="/products" className="btn-luxury px-10 group shadow-lux">
              {t("allProducts")} 
              <ArrowRight className="w-4 h-4 transition-soft group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map((n) => (
                <div key={n} className="aspect-[4/5] bg-white rounded-[3rem] shadow-lux animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 💎 Elite Value Proposition */}
      <section className="py-48 md:py-64 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-16">
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-10 group">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-primary shadow-lux border-lux group-hover:-translate-y-2 transition-soft">
                  <feature.icon className="w-10 h-10" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-widest">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-loose max-w-xs mx-auto font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
