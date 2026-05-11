"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, Globe, User as UserIcon } from "lucide-react"
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user)
    })
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
      {/* 📱 Clean & Professional Sidebar */}
      <div className={`fixed inset-0 z-[200] transition-opacity duration-500 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div 
          className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        <div className={`absolute top-0 right-0 bottom-0 w-[280px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          <div className="p-6 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="text-[12px] font-bold text-slate-900 tracking-tight uppercase">YSG Portal</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-950 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-8 no-scrollbar">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all duration-300 ${
                      isActive 
                        ? "bg-slate-50 text-primary" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? "text-primary" : "text-slate-400"}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-slate-50 space-y-4">
            {user ? (
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                  <button onClick={handleLogout} className="text-[10px] font-bold text-primary uppercase hover:underline">Sign Out</button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-4 rounded-xl bg-slate-950 text-white font-bold text-[12px] uppercase tracking-widest hover:bg-primary transition-all duration-300"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => {
                setLanguage(language === "en" ? "kh" : "en")
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all duration-300"
            >
              <div className="w-5 h-3 rounded-sm overflow-hidden border border-slate-200">
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

      {/* 🚀 Slim & Professional Header */}
      {!hideNav && (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled ? "bg-white/90 backdrop-blur-md h-14 shadow-sm" : "bg-transparent h-20"
        }`}>
          <div className="max-w-6xl mx-auto px-6 h-full">
            <div className="flex justify-between items-center h-full">
              
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-primary/20 transition-all duration-300">
                  <img src="/logo.png" alt="Logo" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-[15px] md:text-[18px] font-bold tracking-tight text-slate-900 uppercase">
                    YSG Machinery
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-0.5">
                    Industrial Solutions
                  </span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
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

              <div className="hidden lg:flex items-center gap-5">
                <button
                  onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all duration-300 border border-slate-100"
                >
                  <div className="w-4 h-2.5 rounded-sm overflow-hidden border border-slate-200">
                    <img 
                      src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                      alt={language}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase">
                    {language === "en" ? "KH" : "EN"}
                  </span>
                </button>

                <div className="flex items-center gap-4">
                  {user ? (
                    <Link href="/account" className="flex items-center gap-2.5 px-4 py-2 bg-slate-950 text-white rounded-xl hover:bg-primary transition-all duration-300">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-[12px] font-bold uppercase">{user.user_metadata?.full_name?.split(' ')[0] || t("account")}</span>
                    </Link>
                  ) : (
                    <Link href="/login" className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-[12px] font-bold uppercase hover:bg-primary transition-all duration-300">
                      {t("login")}
                    </Link>
                  )}

                  <Link href="/checkout" className="relative p-2.5 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-100 hover:border-primary/20 transition-all duration-300">
                    <ShoppingCart className="w-4.5 h-4.5 text-slate-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              <div className="flex lg:hidden items-center gap-2">
                <Link href="/checkout" className="relative p-2.5 bg-slate-950 text-white rounded-xl active:scale-95 transition-all duration-300">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-slate-950">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2.5 bg-white text-slate-900 rounded-xl border border-slate-100 active:scale-95 transition-all duration-300"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`transition-all ${!hideNav ? "pt-12 md:pt-24 pb-20 md:pb-0" : ""} min-h-screen`}>
        <div className="max-w-6xl mx-auto">
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
