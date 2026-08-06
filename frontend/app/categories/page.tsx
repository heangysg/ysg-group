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

  const mainCategories = categories.filter(c => !c.parentId)

  return (
    <PublicLayout>
      <main className="pb-24 pt-6 md:pt-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Hero Header */}
          <div className="mb-4 md:mb-24 text-left md:text-center max-w-2xl mx-auto">
            <div className="hidden md:inline-flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">
                {t("categories") || "Categories"}
              </span>
            </div>
            <h1 className="text-xl md:text-4xl font-black text-slate-900 mb-2 md:mb-6 tracking-tight uppercase">
              {t("categories")}
            </h1>
            <p className="hidden md:block text-slate-600 font-normal leading-relaxed">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {mainCategories.map((mainCat: any) => {
                const subCats = categories.filter(c => c.parentId === mainCat.id)
                
                return (
                  <div key={mainCat.id} className="group flex flex-col">
                    <Link href={`/categories/${mainCat.slug}`} className="block relative h-full">
                        <div className="bg-white hover:-translate-y-1 md:hover:-translate-y-2 shadow-sm hover:shadow-md transition-all duration-300 flex flex-row md:flex-col h-full group rounded-2xl md:rounded-3xl overflow-hidden border border-slate-100">
                          {/* Image Header */}
                          <div className="w-[120px] md:w-full shrink-0 md:aspect-[16/10] bg-slate-50 relative overflow-hidden">
                            {mainCat.image ? (
                              <img 
                                src={mainCat.image} 
                                alt={mainCat.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <Package className="w-8 h-8 md:w-12 md:h-12 stroke-[1.5]" />
                              </div>
                            )}
                            {/* Overlay Title (Desktop Only) */}
                            <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent items-end p-6">
                              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                {language === "kh" && mainCat.nameKhmer ? mainCat.nameKhmer : mainCat.name}
                              </h3>
                            </div>
                          </div>

                        {/* Content Section */}
                        <div className="p-4 md:p-8 flex flex-col flex-grow bg-white md:bg-slate-50 min-w-0">
                          {/* Mobile Title */}
                          <h3 className="md:hidden text-[15px] font-bold text-slate-900 tracking-tight mb-1 truncate">
                            {language === "kh" && mainCat.nameKhmer ? mainCat.nameKhmer : mainCat.name}
                          </h3>
                          
                          <div className="space-y-3 md:space-y-4 mb-4 md:mb-8 flex-grow">
                            <p className="text-slate-500 md:text-slate-900 text-[11px] md:text-[13px] font-medium md:font-bold leading-snug line-clamp-2 md:line-clamp-2">
                              {mainCat.description || (language === "kh" ? `ស្វែងរកដំណោះស្រាយដ៏ល្អបំផុតនៅក្នុងប្រភេទ ${mainCat.nameKhmer || mainCat.name}។` : `Explore elite solutions in the ${mainCat.name.toLowerCase()} category.`)}
                            </p>
                            
                            {/* Subcategories List */}
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                              {subCats.slice(0, 3).map((sub: any) => (
                                <span key={sub.id} className="px-2 py-1 md:px-3.5 md:py-1.5 bg-slate-50 md:bg-slate-100 text-slate-600 md:text-slate-700 text-[9px] md:text-[10px] font-bold rounded-lg md:rounded-full whitespace-nowrap">
                                  {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                                </span>
                              ))}
                              {subCats.length > 3 && (
                                <span className="px-2 py-1 md:px-3.5 md:py-1.5 bg-slate-50 md:bg-slate-100 text-slate-400 md:text-slate-500 text-[9px] md:text-[10px] font-bold rounded-lg md:rounded-full">
                                  +{subCats.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto pt-3 md:pt-6 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] md:text-[11px] font-bold text-primary tracking-wide">{t("viewCollection") || "View Collection"}</span>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 text-primary flex items-center justify-center rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
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
