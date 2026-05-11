"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../lib/supabase/client"
import { ArrowRight, Headphones, Package, Shield, Zap } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import ProductCard from "./ProductCard"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()
  const [categories, setCategories] = useState<any[]>([])

  const stats = [
    { label: t("equipmentSold") || "Units Sold", value: "500+" },
    { label: t("trustedBrands") || "Brands", value: "50+" },
    { label: t("countriesServed") || "Regions", value: "25+" },
    { label: t("yearsExperience") || "Years", value: "15+" },
  ]

  const features = [
    { 
      title: "Global Standards", 
      desc: "Machinery certified for international safety and performance.",
      icon: Shield
    },
    { 
      title: "High Performance", 
      desc: "Designed to optimize your industrial production ROI.",
      icon: Zap
    },
    { 
      title: "24/7 Support", 
      desc: "Dedicated technical assistance for all our partners.",
      icon: Headphones
    }
  ]

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
    <div className="bg-white">
      {/* 🚀 Clean & Sharp Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-24 overflow-hidden border-b border-slate-50">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-slate-100">
              <span className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Industrial Excellence</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tighter uppercase leading-[1.1]">
              The Precision of <br />
              <span className="text-primary italic">Modern Industry</span>
            </h1>
            
            <p className="text-lg text-slate-500 leading-relaxed font-medium max-w-lg">
              Elite industrial solutions curated for performance and reliability. Discover the machinery that powers the future.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/products" className="group bg-primary text-white px-10 py-5 rounded-full font-bold text-[12px] uppercase tracking-widest flex items-center gap-3 hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/10">
                {t("browseEquipment")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/contact" className="bg-white text-slate-900 px-10 py-5 rounded-full font-bold text-[12px] uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all duration-300">
                {t("contactSales")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Clean Stats Section */}
      <section className="py-16 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏷️ Professional Categories */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Collections</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">Categories</h2>
            </div>
            <Link href="/products" className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">See All</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`}
                className="group space-y-4"
              >
                <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <Package className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider group-hover:text-primary transition-colors text-center">
                  {language === 'kh' && cat.nameKhmer ? cat.nameKhmer : cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🏗️ Sharp Showroom Grid */}
      <section className="py-24 md:py-32 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Spotlight</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">{t("featuredEquipment")}</h2>
            </div>
            <Link href="/products" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-primary transition-all duration-300">
              {t("allProducts")} 
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              [1, 2, 3].map((n) => <div key={n} className="aspect-[4/5] bg-white rounded-3xl animate-pulse" />)
            ) : (
              featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>

      {/* 🛠️ Clean Features */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-10 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 hover:border-primary/20 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-slate-500 text-[14px] leading-relaxed font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
