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
      <main className="pb-24 pt-6 md:pt-8 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero Header */}
          <div className="mb-16 md:mb-24 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">
                {t("categories") || "Categories"}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-medium text-slate-900 mb-6 tracking-tight uppercase">
              {t("categories")}
            </h1>
            <p className="text-slate-600 font-normal leading-relaxed">
              {language === "kh" 
                ? "ស្វែងរកផលិតផលជាច្រើនរបស់យើង រួមមានគ្រឿងម៉ាស៊ីនដែលមានប្រសិទ្ធភាពខ្ពស់ ឧបករណ៍ឯកទេស និងគ្រឿងបន្លាស់ពិតប្រាកដ។" 
                : "Explore our comprehensive range of high-performance machinery, specialized equipment, and genuine spare parts."}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-[4/5] bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {mainCategories.map((mainCat: any) => {
                const subCats = categories.filter(c => c.parentId === mainCat.id)
                
                return (
                  <div key={mainCat.id} className="group flex flex-col">
                    <Link href={`/categories/${mainCat.slug}`} className="block relative h-full">
                        <div className="solid-card bg-white border-2 border-slate-900 hover:-translate-y-2 hover:shadow-hard transition-all duration-300 flex flex-col h-full group">
                          {/* Image Header */}
                          <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden border-b-2 border-slate-900">
                            {mainCat.image ? (
                              <img 
                                src={mainCat.image} 
                                alt={mainCat.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <Package className="w-12 h-12 stroke-[1.5]" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 p-4 border-t-2 border-slate-900">
                              <h3 className="text-lg md:text-xl font-bold text-white tracking-widest uppercase">
                                {language === "kh" && mainCat.nameKhmer ? mainCat.nameKhmer : mainCat.name}
                              </h3>
                            </div>
                          </div>

                        {/* Content Section */}
                        <div className="p-6 md:p-8 flex flex-col flex-grow bg-slate-50">
                          <div className="space-y-4 mb-8">
                            <p className="text-slate-900 text-[13px] font-bold leading-relaxed line-clamp-2">
                              {mainCat.description || (language === "kh" ? `ស្វែងរកដំណោះស្រាយដ៏ល្អបំផុតនៅក្នុងប្រភេទ ${mainCat.nameKhmer || mainCat.name}។` : `Explore elite solutions in the ${mainCat.name.toLowerCase()} category.`)}
                            </p>
                            
                            {/* Subcategories List */}
                            <div className="flex flex-wrap gap-2">
                              {subCats.slice(0, 3).map((sub) => (
                                <span key={sub.id} className="px-3 py-1 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest border-2 border-slate-900">
                                  {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                                </span>
                              ))}
                              {subCats.length > 3 && (
                                <span className="px-3 py-1 bg-slate-200 text-slate-900 text-[10px] font-bold uppercase tracking-widest border-2 border-slate-900">
                                  +{subCats.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto pt-6 border-t-2 border-slate-900 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{t("viewCollection") || "View Collection"}</span>
                            <div className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-colors border-2 border-slate-900">
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
