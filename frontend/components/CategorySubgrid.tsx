"use client"

import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"
import { Package, ArrowRight } from "lucide-react"

export default function CategorySubgrid({ category, subcategories }: { category: any, subcategories: any[] }) {
  const { t, language } = useLanguage()

  return (
    <main className="pb-24 pt-6 md:pt-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero Header */}
        <div className="mb-4 md:mb-12 text-left md:text-center max-w-2xl mx-auto">
          <div className="hidden md:inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-primary" />
            <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">
              {t("categories")}
            </span>
          </div>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 mb-2 md:mb-4 tracking-tight uppercase">
            {language === "kh" && category.nameKhmer ? category.nameKhmer : category.name}
          </h1>
          <p className="hidden md:block text-slate-600 font-normal leading-relaxed">
            {category.description || (language === "kh" 
              ? `ស្វែងរកដំណោះស្រាយដ៏ល្អបំផុតនៅក្នុងប្រភេទនេះ។` 
              : `Explore elite solutions in this category.`)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {subcategories.map((subCat: any) => (
            <div key={subCat.id} className="group flex flex-col">
              <Link href={`/categories/${subCat.slug}`} className="block relative h-full">
                  <div className="bg-white hover:-translate-y-1 md:hover:-translate-y-2 shadow-sm hover:shadow-md transition-all duration-300 flex flex-row md:flex-col h-full group rounded-2xl md:rounded-3xl overflow-hidden border border-slate-100">
                    {/* Image Header */}
                    <div className="w-[120px] md:w-full shrink-0 md:aspect-[16/10] bg-slate-50 relative overflow-hidden">
                      {subCat.image ? (
                        <img 
                          src={subCat.image} 
                          alt={subCat.name} 
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
                          {language === "kh" && subCat.nameKhmer ? subCat.nameKhmer : subCat.name}
                        </h3>
                      </div>
                    </div>

                  {/* Content Section */}
                  <div className="p-4 md:p-8 flex flex-col flex-grow bg-white md:bg-slate-50 min-w-0">
                    {/* Mobile Title */}
                    <h3 className="md:hidden text-[15px] font-bold text-slate-900 tracking-tight mb-1 truncate">
                      {language === "kh" && subCat.nameKhmer ? subCat.nameKhmer : subCat.name}
                    </h3>
                    
                    <div className="space-y-3 md:space-y-4 mb-4 md:mb-8 flex-grow">
                      <p className="text-slate-500 md:text-slate-900 text-[11px] md:text-[13px] font-medium md:font-bold leading-snug line-clamp-2 md:line-clamp-2">
                        {subCat.description || (language === "kh" ? `ស្វែងរកដំណោះស្រាយដ៏ល្អបំផុតនៅក្នុងប្រភេទ ${subCat.nameKhmer || subCat.name}។` : `Explore elite solutions in the ${subCat.name.toLowerCase()} category.`)}
                      </p>
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
          ))}
        </div>
      </div>
    </main>
  )
}
