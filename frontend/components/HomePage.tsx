"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../lib/supabase/client"
import { ArrowRight, Headphones, Package, Shield, Zap } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import ProductCard from "./ProductCard"
import { motion } from "framer-motion"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()
  const [categories, setCategories] = useState<any[]>([])

  const stats = [
    { label: language === "kh" ? "គ្រឿងម៉ាស៊ីនដែលលក់ចេញ" : "Equipment Sold", value: "500+" },
    { label: language === "kh" ? "ម៉ាកផលិតផល" : "Trusted Brands", value: "50+" },
    { label: language === "kh" ? "តំបន់បម្រើសេវា" : "Regions Served", value: "25+" },
    { label: language === "kh" ? "ឆ្នាំនៃបទពិសោធន៍" : "Years Experience", value: "30+" },
  ]

  const features = [
    { 
      title: language === "kh" ? "ស្តង់ដារសកល" : "Global Standards", 
      desc: language === "kh" ? "គ្រឿងម៉ាស៊ីនដែលទទួលបានវិញ្ញាបនបត្រសុវត្ថិភាព និងប្រសិទ្ធភាពកម្រិតអន្តរជាតិ។" : "Machinery certified for international safety and performance standards.",
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
    <div className="bg-slate-50 min-h-screen">
      {/* 🚀 Dynamic Premium Hero Section */}
      <section className="relative flex items-center justify-center pt-24 md:pt-32 pb-24 md:pb-32 overflow-hidden bg-slate-900 border-b border-slate-800 min-h-[85vh]">
        <div className="absolute inset-0 w-full h-full">
          <img src="/hero-machinery.png" alt="Machinery Hero" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 w-full z-10 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl space-y-6 md:space-y-8 flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight uppercase leading-[1.1]">
              {language === "kh" ? (
                <>ភាពច្បាស់លាស់នៃ <br /><span className="text-primary-light italic">ឧស្សាហកម្មទំនើប</span></>
              ) : (
                <>The Precision of <br /><span className="text-primary-light italic">Modern Industry</span></>
              )}
            </h1>
            
            <p className="text-base md:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl">
              {language === "kh" 
                ? "ដំណោះស្រាយឧស្សាហកម្មលំដាប់ខ្ពស់ ដែលត្រូវបានជ្រើសរើសយ៉ាងសម្រិតសម្រាំងសម្រាប់ប្រសិទ្ធភាព និងភាពជឿជាក់។ ស្វែងរកគ្រឿងម៉ាស៊ីនដែលជួយពង្រីកអាជីវកម្មរបស់អ្នក។" 
                : "Elite industrial solutions curated for peak performance and absolute reliability. Discover the machinery that powers the future of industry."}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Link href="/products" className="group bg-primary text-white px-10 py-4 rounded-xl font-semibold text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-primary-light transition-all duration-300 shadow-glow hover:-translate-y-1">
                {t("browseEquipment")}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/contact" className="glass-panel text-white px-10 py-4 rounded-xl font-semibold text-sm uppercase tracking-widest hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                {t("contactSales")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 📊 Floating Stats Section */}
      <section className="relative -mt-12 md:-mt-16 z-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card bg-white/90 backdrop-blur-2xl rounded-3xl p-8 md:p-12 shadow-lux-deep"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-2 text-center md:text-left">
                  <div className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-[11px] md:text-xs font-semibold text-primary uppercase tracking-widest leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🏷️ Premium Categories */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-end mb-12 md:mb-16"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{language === "kh" ? "ផ្នែកផលិតផល" : "Departments"}</span>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">{t("categories")}</h2>
            </div>
            <Link href="/categories" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors flex items-center gap-2 group">
              {language === "kh" ? "មើលទាំងអស់" : "Explore All"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {categories.filter(c => !c.parentId).map((cat, idx) => {
              const subCats = categories.filter(sub => sub.parentId === cat.id)
              const displaySubs = subCats.slice(0, 3)
              const remainingSubs = subCats.length - 3

              return (
                <motion.div 
                  key={cat.id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex"
                >
                  <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-lux border border-slate-100 flex flex-col w-full group hover:shadow-lux-deep transition-all duration-500 hover:-translate-y-2">
                    {/* Image */}
                    <div className="w-full h-48 md:h-56 rounded-2xl bg-slate-50 overflow-hidden mb-6 flex items-center justify-center border border-slate-100">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <Package className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
                      {language === 'kh' && cat.nameKhmer ? cat.nameKhmer : cat.name}
                    </h3>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-2">
                      {language === 'kh' && cat.descriptionKhmer ? cat.descriptionKhmer : (cat.description || "Explore our comprehensive range of high-performance machinery, specialized equipment, and genuine spare parts.")}
                    </p>
                    
                    {/* Subcategories */}
                    <div className="mt-auto">
                      <ul className="space-y-3 mb-8">
                        {displaySubs.map(sub => (
                          <li key={sub.id} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {language === 'kh' && sub.nameKhmer ? sub.nameKhmer : sub.name}
                          </li>
                        ))}
                        {remainingSubs > 0 && (
                          <li className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            +{remainingSubs}
                          </li>
                        )}
                      </ul>
                      
                      <Link href={`/categories/${cat.slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest hover:text-primary-dark transition-colors group/link">
                        viewCollection
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 🏗️ Elite Showroom Grid */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">{language === "kh" ? "ផលិតផលលេចធ្លោ" : "Elite Selection"}</span>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">{t("featuredEquipment")}</h2>
            </div>
            <Link href="/products" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-primary transition-all duration-300 shadow-lux hover:shadow-glow hover:-translate-y-1">
              {t("allProducts")} 
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {loading ? (
              [1, 2, 3, 4].map((n) => <div key={n} className="aspect-[3/4] bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100" />)
            ) : (
              featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 🛠️ Premium Features */}
      <section className="py-20 md:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-10 md:p-12 rounded-[2.5rem] space-y-8 hover:bg-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-glow">
                  <feature.icon className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-normal group-hover:text-slate-300 transition-colors">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
