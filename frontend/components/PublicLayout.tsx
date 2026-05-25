"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, User as UserIcon } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { createClient } from "../lib/supabase/client"
import BottomNav from "./BottomNav"
import Footer from "./Footer"
import { motion, AnimatePresence } from "framer-motion"

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
    <div className={`min-h-screen bg-slate-50 selection:bg-primary/10 selection:text-primary ${language === "kh" ? "khmer-mode" : ""}`}>
      {/* 📱 Clean & Professional Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[200]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-white shadow-lux-deep flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-10 w-auto object-contain" />
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-8 no-scrollbar">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item, i) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        key={item.href}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            isActive 
                              ? "bg-primary text-white shadow-glow" 
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                          {item.name}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>

              <div className="p-6 border-t border-slate-100 space-y-4 bg-slate-50">
                {user ? (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                      {user.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                      <button onClick={handleLogout} className="text-[10px] font-bold text-primary uppercase hover:underline">Sign Out</button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-4 rounded-xl bg-slate-900 text-white font-bold text-[11px] uppercase tracking-widest hover:bg-primary hover:shadow-glow transition-all duration-300"
                  >
                    Sign In
                  </Link>
                )}

                <button
                  onClick={() => {
                    setLanguage(language === "en" ? "kh" : "en")
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-100 transition-all duration-300 shadow-sm"
                >
                  <div className="w-6 h-4 rounded-sm overflow-hidden border border-slate-200 shadow-sm">
                    <img 
                      src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                      alt="flag"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="flex-1 text-left">{language === "en" ? "ភាសាខ្មែរ" : "English"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 Slim & Professional Header */}
      {!hideNav && (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
          scrolled ? "bg-white/80 backdrop-blur-xl h-16 md:h-20 shadow-lux border-b border-slate-100" : "bg-transparent h-24"
        }`}>
          <div className="max-w-7xl mx-auto px-6 h-full">
            <div className="flex justify-between items-center h-full">
              
              <Link href="/" className="flex items-center group">
                <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-12 md:h-14 w-auto object-contain" />
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-2 bg-white/40 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-white/60 shadow-sm">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                        isActive 
                          ? "text-primary" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-100"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="hidden lg:flex items-center gap-4">
                <button
                  onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                  className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-md hover:bg-white rounded-xl transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-md"
                >
                  <div className="w-5 h-3.5 rounded-[2px] overflow-hidden shadow-sm">
                    <img 
                      src={language === "en" ? "https://flagcdn.com/w40/kh.png" : "https://flagcdn.com/w40/gb.png"} 
                      alt={language}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
                    {language === "en" ? "KH" : "EN"}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  {user ? (
                    <Link href="/account" className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-primary transition-all duration-300 shadow-lux hover:shadow-glow hover:-translate-y-0.5">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">{user.user_metadata?.full_name?.split(' ')[0] || t("account")}</span>
                    </Link>
                  ) : (
                    <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all duration-300 shadow-lux hover:shadow-glow hover:-translate-y-0.5">
                      {t("login")}
                    </Link>
                  )}

                  <Link href="/checkout" className="relative p-3 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 hover:border-primary hover:text-primary transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-white shadow-sm px-1">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              <div className="flex lg:hidden items-center gap-3">
                <Link href="/checkout" className="relative p-2.5 bg-white text-slate-900 rounded-xl shadow-sm border border-slate-200 active:scale-95 transition-all duration-300">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white shadow-sm px-1">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2.5 bg-slate-900 text-white rounded-xl active:scale-95 transition-all duration-300 shadow-sm"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`transition-all ${!hideNav ? "pt-20 md:pt-24 pb-20 md:pb-0" : ""} min-h-screen`}>
        {children}
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
