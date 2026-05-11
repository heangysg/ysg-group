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
    <div className="overflow-x-hidden bg-nichhy">
      {/* 🌬️ Airy Luxury Hero Section (Nichhy Style) */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-32 md:py-48">
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
          <div className="flex flex-col items-center space-y-12">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-sm">
              <Star className="w-3.5 h-3.5 text-primary fill-primary/10" />
              {t("qualityAssured") || "Global Excellence"}
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-slate-950 leading-[0.95] tracking-tighter max-w-5xl">
              {t("heroTitle").split(" ").map((word, i) => (
                <span key={i} className={i === 1 ? "text-primary block md:inline" : ""}>{word} </span>
              ))}
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-500 max-w-2xl leading-relaxed font-bold italic opacity-80">
              {t("heroSubtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-10">
              <Link href="/products" className="bg-primary text-white px-14 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-soft hover:-translate-y-1">
                {t("browseEquipment")}
                <ArrowRight className="w-5 h-5 ml-2 inline-block" />
              </Link>
              <Link href="/contact" className="bg-white text-slate-950 px-14 py-6 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.2em] border border-slate-100 shadow-sm hover:bg-slate-50 transition-soft hover:-translate-y-1">
                {t("contactSales")}
              </Link>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Accents */}
        <div className="absolute top-1/4 -left-20 w-[40%] h-[40%] bg-primary/5 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-[30%] h-[30%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* 📊 High-Performance Stats Dashboard */}
      <section className="relative -mt-24 z-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-[4rem] shadow-lux-deep border border-slate-100 p-12 md:p-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center space-y-4 group">
                  <div className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter group-hover:text-primary transition-soft">{stat.value}</div>
                  <div className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🏷️ Boutique Categories Bubble Grid */}
      <section className="py-48 md:py-64">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 space-y-6">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block">Expertise</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase">{t("browseByCategory") || "Engineered Solutions"}</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 md:gap-14">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center space-y-8"
              >
                <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full border border-slate-100 flex items-center justify-center shadow-sm group-hover:shadow-lux-deep group-hover:-translate-y-3 transition-soft overflow-hidden relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-soft group-hover:scale-110" />
                  ) : (
                    <Package className="w-12 h-12 text-slate-100" />
                  )}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-soft" />
                </div>
                <h3 className="text-[11px] font-black text-slate-950 text-center uppercase tracking-[0.2em] px-4 group-hover:text-primary transition-soft leading-tight">
                  {language === 'kh' && cat.nameKhmer ? cat.nameKhmer : cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🏗️ Premium Showcase: Industrial Luxury */}
      <section className="py-48 md:py-64 bg-white rounded-[5rem] md:rounded-[8rem] shadow-lux-deep mx-4 md:mx-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-10">
            <div className="max-w-2xl space-y-6">
              <span className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">Elite Collection</span>
              <h2 className="text-4xl md:text-7xl font-black text-slate-950 leading-[0.9] tracking-tighter uppercase">{t("featuredEquipment")}</h2>
              <p className="text-slate-500 text-lg md:text-xl font-bold italic opacity-80">{t("discoverPopular")}</p>
            </div>
            <Link href="/products" className="bg-slate-50 text-slate-950 px-12 py-6 rounded-full font-black text-[12px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-soft flex items-center gap-4 group">
              {t("allProducts")} 
              <ArrowRight className="w-5 h-5 transition-soft group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-20">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[4/5] bg-slate-50 rounded-[3rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-24">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 💎 World-Class Standards */}
      <section className="py-48 md:py-64 bg-nichhy">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-20">
            {features.map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-12 group">
                <div className="w-28 h-28 bg-white rounded-[3rem] flex items-center justify-center text-primary shadow-lux-deep border border-slate-100 group-hover:-translate-y-3 transition-soft">
                  <feature.icon className="w-12 h-12" />
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl md:text-2xl font-black text-slate-950 uppercase tracking-widest">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-loose max-w-xs mx-auto font-bold opacity-80">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
