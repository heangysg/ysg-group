"use client"

import { PackageX, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"

export default function ProductNotFound() {
  const { language } = useLanguage()

  return (
    <div className="min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center px-4 py-16 md:py-24">
      {/* Big Error Icon */}
      <div className="relative select-none mb-6">
        <div className="text-[7rem] sm:text-[10rem] md:text-[14rem] font-black text-slate-100 leading-none tracking-tighter">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="inline-flex p-3 sm:p-5 bg-white border-4 border-slate-900 shadow-hard">
            <PackageX className="w-10 h-10 sm:w-16 sm:h-16 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight text-center mb-3 px-4">
        {language === "kh" ? "រកមិនឃើញផលិតផល" : "Product Not Found"}
      </h1>
      <p className="text-slate-500 font-medium text-center max-w-sm text-sm mb-8 px-4">
        {language === "kh" 
          ? "យើងមិនអាចស្វែងរកគ្រឿងចក្រ ឬគ្រឿងបន្លាស់ដែលអ្នកកំពុងស្វែងរកបានទេ។ វាអាចត្រូវបានលុបចេញ ឬមិនមានទៀតទេ។" 
          : "We couldn't find the machinery or part you're looking for. It may have been removed or is no longer available."}
      </p>

      {/* Actions */}
      <div className="flex flex-col w-full max-w-xs gap-3">
        <Link
          href="/products"
          className="flex items-center justify-center gap-3 px-6 py-4 bg-primary border-2 border-slate-900 shadow-hard text-slate-900 font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === "kh" ? "ត្រឡប់ទៅកាន់ផលិតផលវិញ" : "Back to Products"}
        </Link>
      </div>
    </div>
  )
}
