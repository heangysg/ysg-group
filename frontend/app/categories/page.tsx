"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../../lib/supabase/client"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { ChevronRight, Package, ArrowRight } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient()
      const { data } = await supabase
        .from("Category")
        .select("*")
        .eq("isActive", true)
        .order("sortOrder", { ascending: true })
      setCategories(data || [])
      setLoading(false)
    }
    fetchCategories()
  }, [])

  // Filter main categories (those without a parent)
  const mainCategories = categories.filter(c => !c.parentId)

  return (
    <PublicLayout>
      <main className="pb-32 px-4 pt-12 md:pt-24 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest mb-6 border border-primary/10">
              <Package className="w-3 h-3" />
              {t("ourDepartments") || "Our Departments"}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">{t("categories")}</h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Explore our comprehensive range of high-performance machinery, specialized equipment, and genuine spare parts.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-[4/5] bg-slate-50 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {mainCategories.map((mainCat: any) => {
                const subCats = categories.filter(c => c.parentId === mainCat.id)
                
                return (
                  <div key={mainCat.id} className="group flex flex-col">
                    {/* Main Category Card */}
                    <Link href={`/categories/${mainCat.slug}`} className="block relative h-full">
                      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col h-full group">
                        {/* Image Header */}
                        <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden">
                          {mainCat.image ? (
                            <img 
                              src={mainCat.image} 
                              alt={mainCat.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                              <Package className="w-16 h-16 stroke-[1]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-2xl font-bold text-white tracking-tight">
                              {language === "kh" && mainCat.nameKhmer ? mainCat.nameKhmer : mainCat.name}
                            </h3>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 flex flex-col flex-grow">
                          <div className="space-y-4 mb-8">
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                              {mainCat.description || `Browse our latest ${mainCat.name.toLowerCase()} solutions for your business needs.`}
                            </p>
                            
                            {/* Subcategories List */}
                            <div className="flex flex-wrap gap-2">
                              {subCats.slice(0, 3).map((sub) => (
                                <span key={sub.id} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                  {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                                </span>
                              ))}
                              {subCats.length > 3 && (
                                <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                  +{subCats.length - 3} More
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t("viewCollection") || "View Collection"}</span>
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </PublicLayout>
  )
}
