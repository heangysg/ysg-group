"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, ChevronDown, Globe } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import BottomNav from "./BottomNav"
import Footer from "./Footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { cartCount } = useCart()

  const navItems = [
    { name: t("home"), href: "/", icon: Home },
    { name: t("allProducts"), href: "/products", icon: Package },
    { name: t("categories"), href: "/categories", icon: FolderOpen },
    { name: t("contact"), href: "/contact", icon: Mail },
    { name: t("about"), href: "/about", icon: Info },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className={`min-h-screen bg-white ${language === "kh" ? "khmer-mode" : ""}`}>
      {/* Clean Professional Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 md:h-20 shadow-sm" 
          : "bg-white border-b border-slate-100 h-20 md:h-24"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 group-hover:border-primary/20 transition-all">
                <img 
                  src="/logo.png" 
                  alt="YSG Logo" 
                  className="w-8 md:w-10 h-auto object-contain transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">YSG MACHINERY</span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">Premium Solutions</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                      isActive 
                        ? "text-primary bg-primary/5" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="h-6 w-px bg-slate-200" />
              
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 group"
              >
                <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-300">
                  <img 
                    src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                    alt={language}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600">
                  {language === "en" ? "KHMER" : "ENGLISH"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors" />
              </button>

              {/* Cart */}
              <Link href="/checkout" className="relative">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-primary transition-all shadow-lg shadow-slate-900/10 hover:shadow-primary/20">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center gap-3">
              <Link href="/checkout" className="relative p-2.5 bg-slate-900 text-white rounded-xl">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm ${
                    pathname === item.href ? "bg-primary/5 text-primary" : "text-slate-600 active:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              <div className="h-px bg-slate-100 my-2" />
              <button
                onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  {language === "en" ? "Switch to Khmer" : "ប្តូរទៅភាសាអង់គ្លេស"}
                </div>
                <div className="w-6 h-4 rounded overflow-hidden border border-slate-300">
                  <img 
                    src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                    alt="flag"
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Padding */}
      <main className="pt-20 md:pt-24 pb-24 md:pb-0 min-h-[calc(100vh-80px)]">
        {children}
      </main>

      <Footer />

      {/* Mobile Bottom Navigation (optional, used if defined) */}
      <BottomNav />
    </div>
  )
}
