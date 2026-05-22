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
    { label: language === "kh" ? "គ្រឿងចក្រដែលលក់ចេញ" : "Equipment Sold", value: "500+" },
    { label: language === "kh" ? "ម៉ាកផលិតផល" : "Trusted Brands", value: "50+" },
    { label: language === "kh" ? "តំបន់បម្រើសេវា" : "Regions Served", value: "25+" },
    { label: language === "kh" ? "ឆ្នាំនៃបទពិសោធន៍" : "Years Experience", value: "30+" },
  ]

  const features = [
    { 
      title: language === "kh" ? "ស្តង់ដារសកល" : "Global Standards", 
      desc: language === "kh" ? "គ្រឿងចក្រដែលទទួលបានវិញ្ញាបនបត្រសុវត្ថិភាព និងប្រសិទ្ធភាពកម្រិតអន្តរជាតិ។" : "Machinery certified for international safety and performance standards.",
      icon: Shield
    },
    { 
      title: language === "kh" ? "ប្រសិទ្ធភាពខ្ពស់" : "High Performance", 
      desc: language === "kh" ? "រចនាឡើងដើម្បីបង្កើនផលិតកម្ម និងកាត់បន្ថយការចំណាយសម្រាប់អាជីវកម្មរបស់អ្នក។" : "Designed to optimize your industrial production and maximize ROI.",
      icon: Zap
    },
    { 
      title: language === "kh" ? "ការគាំទ្រ ២៤/៧" : "24/7 Support", 
      desc: language === "kh" ? "ក្រុមការងារបច្ចេកទេសជំនាញដែលត្រៀមខ្លួនជួយអ្នកជានិច្ច។" : "Dedicated technical assistance for all our elite industrial partners.",
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
      <section className="relative flex items-start pt-6 md:pt-10 pb-12 md:pb-24 overflow-hidden bg-white border-b border-slate-50">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <div className="max-w-3xl space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-medium text-slate-900 tracking-tight uppercase leading-[1.1]">
              {language === "kh" ? (
                <>ភាពច្បាស់លាស់នៃ <br /><span className="text-primary italic">ឧស្សាហកម្មទំនើប</span></>
              ) : (
                <>The Precision of <br /><span className="text-primary italic">Modern Industry</span></>
              )}
            </h1>
            
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              {language === "kh" 
                ? "ដំណោះស្រាយឧស្សាហកម្មលំដាប់ខ្ពស់ ដែលត្រូវបានជ្រើសរើសយ៉ាងសម្រិតសម្រាំងសម្រាប់ប្រសិទ្ធភាព និងភាពជឿជាក់។ ស្វែងរកគ្រឿងចក្រដែលជួយពង្រីកអាជីវកម្មរបស់អ្នក។" 
                : "Elite industrial solutions curated for peak performance and absolute reliability. Discover the machinery that powers the future of industry."}
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/products" className="group bg-slate-950 text-white px-8 py-4 rounded-xl font-medium text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-primary transition-all duration-300 shadow-xl shadow-slate-200/50">
                {t("browseEquipment")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/contact" className="bg-white text-slate-900 px-8 py-4 rounded-xl font-medium text-[11px] uppercase tracking-widest border border-slate-200 hover:border-primary/20 transition-all duration-300">
                {t("contactSales")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Clean Stats Section */}
      <section className="py-12 md:py-16 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-[10px] md:text-[11px] font-medium text-slate-600 uppercase tracking-widest leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏷️ Professional Categories */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 md:mb-16">
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-primary uppercase tracking-widest">{language === "kh" ? "ផ្នែកផលិតផល" : "Departments"}</span>
              <h2 className="text-xl md:text-2xl font-medium text-slate-900 tracking-tight uppercase">{t("categories")}</h2>
            </div>
            <Link href="/categories" className="text-[10px] font-medium uppercase tracking-widest text-slate-400 hover:text-primary transition-colors flex items-center gap-2">
              {language === "kh" ? "មើលទាំងអស់" : "View All"} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`}
                className="group space-y-4"
              >
                <div className="aspect-square bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/5">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <Package className="w-8 h-8 text-slate-200" />
                  )}
                </div>
                <h3 className="text-[12px] md:text-[13px] font-medium text-slate-700 uppercase tracking-wide group-hover:text-primary transition-colors text-center truncate px-2">
                  {language === 'kh' && cat.nameKhmer ? cat.nameKhmer : cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 🏗️ Sharp Showroom Grid */}
      <section className="py-20 md:py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-primary uppercase tracking-widest">{language === "kh" ? "ផលិតផលលេចធ្លោ" : "Elite Selection"}</span>
              <h2 className="text-xl md:text-2xl font-medium text-slate-900 tracking-tight uppercase">{t("featuredEquipment")}</h2>
            </div>
            <Link href="/products" className="bg-slate-950 text-white px-6 py-3 rounded-xl font-medium text-[10px] uppercase tracking-widest hover:bg-primary transition-all duration-300">
              {t("allProducts")} 
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {loading ? (
              [1, 2, 3, 4].map((n) => <div key={n} className="aspect-[4/5] bg-white rounded-3xl animate-pulse border border-slate-100" />)
            ) : (
              featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>

      {/* 🛠️ Clean Features */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-8 md:p-10 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 space-y-6 hover:border-primary/20 transition-all duration-300 group">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                  <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-[15px] md:text-base font-medium text-slate-800 uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-slate-600 text-[13px] md:text-[14px] leading-relaxed font-normal">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
