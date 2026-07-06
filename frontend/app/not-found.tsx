"use client"

import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16 md:py-24">
      {/* Big 404 */}
      <div className="relative select-none mb-6">
        <span className="text-[7rem] sm:text-[10rem] md:text-[14rem] font-black text-slate-100 leading-none tracking-tighter">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex p-3 sm:p-5 bg-primary border-4 border-slate-900 shadow-hard">
              <Search className="w-6 h-6 sm:w-10 sm:h-10 text-slate-900" />
            </div>
          </div>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight text-center mb-3 px-4">
        {language === "kh" ? "រក​មិន​ឃើញ​ទំព័រ" : "Page Not Found"}
      </h1>
      <p className="text-slate-500 font-medium text-center max-w-sm text-sm mb-8 px-4">
        {language === "kh"
          ? "ទំព័រដែលអ្នកកំពុងស្វែងរក​មិន​ដំណើរការ ឬ​ត្រូវ​បាន​យក​ចេញ​ហើយ។"
          : "The page you're looking for doesn't exist or has been moved."}
      </p>

      {/* Actions */}
      <div className="flex flex-col w-full max-w-xs gap-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-3 px-6 py-4 bg-primary border-2 border-slate-900 shadow-hard text-slate-900 font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all"
        >
          <Home className="w-4 h-4" />
          {language === "kh" ? "ទៅទំព័រដើម" : "Go to Homepage"}
        </Link>
        <Link
          href="/products"
          className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-900 shadow-hard text-slate-900 font-bold text-xs uppercase tracking-widest hover:-translate-y-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === "kh" ? "មើល​ផលិតផល" : "Browse Products"}
        </Link>
      </div>

      {/* YSG Brand */}
      <div className="mt-16 text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          YSG Machinery — {language === "kh" ? "ក្រុមហ៊ុន យ៉ឺង ស៊ី" : "Yeung Shi Group"}
        </p>
      </div>
    </div>
  )
}
