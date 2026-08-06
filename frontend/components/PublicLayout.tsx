"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, User as UserIcon, Truck, Heart } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useWishlist } from "../contexts/WishlistContext"
import { createClient } from "../lib/supabase/client"
import BottomNav from "./BottomNav"
import Footer from "./Footer"
import { motion, AnimatePresence } from "framer-motion"
import { Toaster } from "react-hot-toast"

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
  const { wishlistItems } = useWishlist()

  const navItems = [
    { name: t("home"), href: "/", icon: Home },
    { name: t("allProducts"), href: "/products", icon: Package },
    { name: t("categories"), href: "/categories", icon: FolderOpen },
    { name: t("wishlist"), href: "/wishlist", icon: Heart },
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
    
    if (window.location.search.includes('code=') || window.location.hash.includes('access_token=')) {
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 1000);
    }

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
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-slate-50 border-l border-slate-100 flex flex-col shadow-[-10px_0_30px_rgb(0,0,0,0.1)] rounded-l-3xl"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-200 bg-white">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-10 w-auto object-contain" />
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-6 h-6" />
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
                          className={`flex items-center gap-4 px-5 py-3.5 text-[13px] font-bold transition-all duration-300 rounded-xl ${
                            isActive 
                              ? "bg-primary/10 text-primary" 
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                          {item.name}
                        </Link>
                      </motion.div>
                    )
                  })}
                </nav>
              </div>

              <div className="p-6 border-t border-slate-200 space-y-4 bg-slate-100">
                {user ? (
                  <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border border-slate-100">
                      {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                        <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                    className="btn-primary w-full flex items-center justify-center py-4 text-[11px]"
                  >
                    Sign In
                  </Link>
                )}

                <button
                  onClick={() => {
                    setLanguage(language === "en" ? "kh" : "en")
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-5 py-4 bg-white border border-slate-100 rounded-xl text-[13px] font-bold text-slate-700 hover:shadow-sm hover:text-primary transition-all duration-300 mt-2"
                >
                  <div className="w-6 h-4 rounded-sm overflow-hidden shadow-sm">
                    <img 
                      src={language === "en" ? "/image/kh.png" : "/image/gb.png"} 
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

      {/* 🚀 Sleek Professional Header */}
      {!hideNav && (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-200 ${
          scrolled ? "bg-white/95 backdrop-blur-md h-14 md:h-16 shadow-xs border-b border-slate-200" : "bg-white h-16 md:h-18 border-b border-slate-200/80"
        }`}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-full">
            <div className="flex justify-between items-center h-full">
              
              <Link href="/" className="flex items-center group">
                <div className="relative flex items-center justify-center">
                  <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-9 md:h-11 w-auto object-contain" />
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-[13px] font-bold tracking-wide transition-colors duration-150 py-1 border-b-2 ${
                        isActive 
                          ? "text-primary border-primary" 
                          : "text-slate-700 border-transparent hover:text-primary hover:border-slate-300"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-all text-slate-800 text-[11px] font-bold border border-slate-200/60"
                >
                  <div className="w-4 h-3 rounded-xs overflow-hidden shadow-2xs">
                    <img 
                      src={language === "en" ? "/image/kh.png" : "/image/gb.png"} 
                      alt={language}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{language === "en" ? "KH" : "EN"}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {user ? (
                    <Link href="/account" className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-all text-[12px] font-bold">
                      {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                        <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-slate-600" />
                      )}
                      <span>{user.user_metadata?.full_name?.split(' ')[0] || t("account")}</span>
                    </Link>
                  ) : (
                    <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 text-slate-800 transition-all text-[12px] font-bold">
                      <UserIcon className="w-4 h-4 text-slate-600" />
                      <span>{t("login")}</span>
                    </Link>
                  )}

                  <Link href="/wishlist" className="relative p-2 text-slate-700 hover:text-red-500 rounded-md hover:bg-slate-100 transition-all">
                    <Heart className="w-4 h-4" />
                    {wishlistItems && wishlistItems.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>

                  <Link href="/checkout" className="relative p-2 text-slate-700 hover:text-primary rounded-md hover:bg-slate-100 transition-all">
                    <ShoppingCart className="w-4 h-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              <div className="flex lg:hidden items-center gap-2">
                <Link href="/checkout" className="relative p-2 bg-slate-50 text-slate-700 rounded-full hover:bg-primary hover:text-white transition-all duration-300">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 bg-slate-50 text-slate-700 rounded-full hover:bg-slate-100 transition-all duration-300 border border-slate-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`transition-all ${!hideNav ? "pt-16 md:pt-[88px] pb-[calc(72px+env(safe-area-inset-bottom)+1rem)] md:pb-0" : ""} min-h-screen`}>
        <Toaster position="top-center" />
        {children}
      </main>

      {!hideNav && (
        <>
          <div className="hidden md:block">
            <Footer />
          </div>
          <BottomNav />
        </>
      )}
    </div>
  )
}
