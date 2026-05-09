"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, ChevronDown, Globe, User as UserIcon, LogOut } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { createClient } from "../lib/supabase/client"
import BottomNav from "./BottomNav"
import Footer from "./Footer"

export default function PublicLayout({ 
  children, 
  hideNav = false 
}: { 
  children: React.ReactNode,
  hideNav?: boolean
}) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
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
    const supabase = createClient()
    
    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className={`min-h-screen bg-white selection:bg-primary/10 selection:text-primary ${language === "kh" ? "khmer-mode" : ""}`}>
      {/* 📱 Premium App-Native Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[200] animate-in fade-in duration-500">
          {/* Solid Backdrop: Clarity Mode */}
          <div 
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Content: Pure White & Sharp Dock */}
          <div className="absolute top-0 right-0 w-[75%] max-w-xs h-full bg-white shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            
            {/* 1. Branded Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                  <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-[13px] font-bold text-slate-900 tracking-tighter uppercase">YSG MACHINERY</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-soft border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. User Profile: Only if Logged In */}
            {user && (
              <div className="p-5 bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-slate-200" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Authenticated</span>
                    <span className="text-sm font-bold text-slate-900 tracking-tight truncate max-w-[140px]">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {/* 3. High-Contrast Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
              <nav className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-5 py-2 rounded-xl text-[15px] font-bold uppercase tracking-widest transition-soft ${
                        isActive 
                          ? "bg-primary/5 text-primary" 
                          : "text-slate-900 active:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-5.5 h-5.5 ${isActive ? "text-primary" : "text-slate-900"}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* 4. Bottom Footer Actions */}
            <div className="p-4 border-t border-slate-50 space-y-2">
              <button
                onClick={() => {
                  setLanguage(language === "en" ? "kh" : "en")
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-3 px-5 py-2.5 rounded-xl text-[15px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-soft w-full text-left"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5.5 h-5.5 text-primary" />
                  {language === "en" ? "ភាសាខ្មែរ" : "English"}
                </div>
                <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm ml-auto">
                  <img 
                    src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                    alt="flag"
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>

              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100 text-red-500 font-bold text-xs uppercase tracking-widest active:scale-95 transition-soft shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center p-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-soft"
                >
                  Access Account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Slim & Sharp Minimalist Header */}
      {!hideNav && (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-soft bg-white border-b border-slate-100 ${
          scrolled ? "h-14 md:h-16 shadow-sm" : "h-16 md:h-20"
        }`}>
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full">
            <div className="flex justify-between items-center h-full">
              
              {/* Logo: Compact & Sharp */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-50 group-hover:scale-105 transition-soft">
                  <img src="/logo.png" alt="Logo" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[14px] md:text-[16px] font-bold tracking-tighter text-slate-900 uppercase">
                    YSG MACHINERY
                  </span>
                  <span className="text-[7px] md:text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-0.5">
                    Premium Solutions
                  </span>
                </div>
              </Link>

              {/* Desktop Nav: High-Contrast & Clear */}
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-5 py-2 rounded-lg text-[15px] font-bold uppercase tracking-widest transition-soft ${
                        isActive 
                          ? "text-primary bg-primary/5" 
                          : "text-slate-900 hover:text-primary hover:bg-slate-50"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-6">
                <button
                  onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                  className="flex items-center gap-2.5 px-4 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-soft border border-slate-50"
                >
                  <div className="w-4 h-3 rounded-sm overflow-hidden shadow-sm">
                    <img 
                      src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                      alt={language}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[12px] font-bold text-slate-900 tracking-widest uppercase">
                    {language === "en" ? "KH" : "EN"}
                  </span>
                </button>

                <div className="flex items-center gap-4">
                  {user ? (
                    <div className="relative group">
                      <button className="flex items-center gap-2.5 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-primary transition-soft shadow-sm">
                        <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
                          {user.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-3 h-3" />
                          )}
                        </div>
                        <span className="text-[13px] font-bold uppercase tracking-widest">{user.user_metadata?.full_name?.split(' ')[0] || t("account")}</span>
                      </button>
                    </div>
                  ) : (
                    <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[13px] font-bold uppercase tracking-[0.15em] hover:bg-primary transition-soft shadow-sm">
                      {t("login")}
                    </Link>
                  )}

                  <Link href="/checkout" className="relative group">
                    <div className="p-2 bg-white text-slate-900 rounded-xl shadow-sm hover:bg-slate-50 transition-soft border border-slate-50">
                      <ShoppingCart className="w-4.5 h-4.5 text-primary" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                          {cartCount}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </div>

              {/* Mobile Actions: Compact */}
              <div className="flex lg:hidden items-center gap-3">
                <Link href="/checkout" className="relative p-2.5 bg-slate-900 text-white rounded-xl">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[8px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2.5 bg-white text-slate-900 rounded-xl border border-slate-100 shadow-sm"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`transition-soft ${!hideNav ? "pt-20 md:pt-28 pb-20 md:pb-0" : ""} min-h-screen`}>
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>

      {!hideNav && (
        <>
          <Footer />
          <BottomNav />
        </>
      )}
    </div>
  )
}
