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
    <div className={`min-h-screen bg-nichhy selection:bg-primary selection:text-white ${language === "kh" ? "khmer-mode" : ""}`}>
      {/* 📱 Boutique Slide-out Sidebar (Right) */}
      <div className={`fixed inset-0 z-[200] transition-opacity duration-500 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar Panel */}
        <div className={`absolute top-0 right-0 bottom-0 w-[320px] bg-white shadow-2xl transition-transform duration-500 ease-out border-l border-slate-100 flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          {/* Header */}
          <div className="p-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-[14px] font-black text-slate-950 tracking-tighter uppercase">YSG PORTAL</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-950 active:scale-90 transition-soft"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-8 py-4 no-scrollbar">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">Menu Exploration</p>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-6 px-6 py-5 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] transition-soft group ${
                        isActive 
                          ? "bg-primary text-white shadow-xl shadow-primary/20" 
                          : "text-slate-950 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-primary opacity-30 group-hover:opacity-100"}`} />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Profile/Actions */}
          <div className="p-8 border-t border-slate-50 bg-slate-50/30 space-y-4">
            {user ? (
              <div className="flex items-center gap-5 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-primary/20" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-950 truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                  <button onClick={handleLogout} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Sign Out</button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center p-5 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-lg shadow-primary/20 transition-soft active:scale-95"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => {
                setLanguage(language === "en" ? "kh" : "en")
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-4 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-950 hover:bg-slate-50 transition-soft"
            >
              <div className="w-6 h-4 rounded-sm overflow-hidden border border-slate-200">
                <img 
                  src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                  alt="flag"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="flex-1 text-left">{language === "en" ? "ភាសាខ្មែរ" : "English"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 Slim & Sharp Boutique Header */}
      {!hideNav && (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-soft ${
          scrolled ? "bg-white/80 backdrop-blur-xl h-16 shadow-lux-deep" : "bg-transparent h-20 md:h-24"
        }`}>
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-full">
            <div className="flex justify-between items-center h-full">
              
              {/* Logo: Compact & Sharp */}
              <Link href="/" className="flex items-center gap-4 group">
                <div className="relative w-11 h-11 md:w-14 md:h-14 flex items-center justify-center bg-white rounded-[1.2rem] shadow-sm border border-slate-100 group-hover:scale-105 transition-soft">
                  <img src="/logo.png" alt="Logo" className="w-7 h-7 md:w-9 md:h-9 object-contain" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[14px] md:text-[20px] font-black tracking-tighter text-primary uppercase">
                    YSG MACHINERY
                  </span>
                  <span className="text-[8px] md:text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase mt-1">
                    Elite Industrial Boutique
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
                      className={`px-5 py-2.5 rounded-xl text-[14px] font-bold uppercase tracking-[0.1em] transition-soft ${
                        isActive 
                          ? "text-primary bg-primary/5" 
                          : "text-slate-500 hover:text-primary hover:bg-slate-50/50"
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
                  className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-soft border border-slate-100"
                >
                  <div className="w-5 h-3.5 rounded-sm overflow-hidden shadow-sm border border-slate-200">
                    <img 
                      src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                      alt={language}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 tracking-widest uppercase">
                    {language === "en" ? "KH" : "EN"}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  {user ? (
                    <Link href="/account" className="flex items-center gap-2.5 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-soft shadow-lg shadow-primary/20">
                      <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center overflow-hidden">
                        {user.user_metadata?.avatar_url ? (
                          <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-[12px] font-bold uppercase tracking-widest">{user.user_metadata?.full_name?.split(' ')[0] || t("account")}</span>
                    </Link>
                  ) : (
                    <Link href="/login" className="px-6 py-2.5 bg-primary text-white rounded-xl text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-primary-dark transition-soft shadow-lg shadow-primary/20">
                      {t("login")}
                    </Link>
                  )}

                  <Link href="/checkout" className="relative group p-2.5 bg-white text-slate-900 rounded-xl shadow-sm hover:bg-slate-50 transition-soft border border-slate-100">
                    <ShoppingCart className="w-4.5 h-4.5 text-primary" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Mobile Actions: Precise */}
              <div className="flex lg:hidden items-center gap-2.5">
                <Link href="/checkout" className="relative p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 active:scale-90 transition-soft">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-white text-primary text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2.5 bg-white text-slate-900 rounded-xl border border-slate-100 shadow-sm active:scale-90 transition-soft"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 🚀 Floating Support Action */}
      <Link href="/contact" className="btn-fab md:hidden">
        <Mail className="w-6 h-6" />
      </Link>

      {/* Main Content Area */}
      <main className={`transition-all ${!hideNav ? "pt-14 md:pt-28 pb-20 md:pb-0" : ""} min-h-screen`}>
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
