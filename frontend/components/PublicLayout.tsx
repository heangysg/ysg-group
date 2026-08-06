"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, User as UserIcon, Truck, Heart, Search } from "lucide-react"
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

      {/* 🚀 Gyeon Cambodia Dual-Row Header */}
      {!hideNav && (
        <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            
            {/* Row 1 (Top Utility Bar): Pill Search + Language Switcher + Icons */}
            <div className="flex items-center justify-between h-12 md:h-14 gap-4 border-b border-slate-100 py-2">
              
              {/* Desktop Pill Search Input */}
              <div className="flex flex-1 max-w-md">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('search') as HTMLInputElement;
                    if (input?.value.trim()) {
                      router.push(`/products?search=${encodeURIComponent(input.value.trim())}`);
                    }
                  }} 
                  className="w-full flex items-center bg-slate-100 hover:bg-slate-200/80 rounded-full px-4 py-1.5 text-xs border border-transparent focus-within:border-[#004691] focus-within:bg-white transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input 
                    name="search"
                    type="text" 
                    placeholder={language === "kh" ? "តើអ្នកកំពុងស្វែងរកអ្វី?" : "What are you looking for?"}
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-[12px] font-medium"
                  />
                </form>
              </div>

              {/* Top Right Utilities */}
              <div className="flex items-center gap-3 shrink-0">
                
                {/* Language Switcher Pill */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[11px] font-bold">
                  <button 
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${language === "en" ? "bg-[#004691] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <span>English</span>
                  </button>
                  <button 
                    onClick={() => setLanguage("kh")}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${language === "kh" ? "bg-[#004691] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    <span>ភាសាខ្មែរ</span>
                  </button>
                </div>

                {/* Account Link */}
                {user ? (
                  <Link href="/account" className="p-1.5 text-slate-700 hover:text-[#004691] transition-colors" title={t("account")}>
                    {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                      <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </Link>
                ) : (
                  <Link href="/login" className="p-1.5 text-slate-700 hover:text-[#004691] transition-colors" title={t("login")}>
                    <UserIcon className="w-4 h-4" />
                  </Link>
                )}

                {/* Wishlist Icon */}
                <Link href="/wishlist" className="relative p-1.5 text-slate-700 hover:text-red-500 transition-colors" title={t("wishlist")}>
                  <Heart className="w-4 h-4" />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                {/* Cart Icon */}
                <Link href="/checkout" className="relative p-1.5 text-slate-700 hover:text-[#004691] transition-colors" title={t("cart")}>
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#004691] text-white text-[9px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-1.5 text-slate-700 hover:text-slate-900"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Row 2 (Main Navigation Bar - Gyeon Clone): Logo + Category Menu */}
            <div className="flex items-center justify-between h-14 md:h-16">
              
              {/* Logo on Row 2 Left */}
              <Link href="/" className="flex items-center shrink-0">
                <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-8 md:h-10 w-auto object-contain" />
              </Link>

              {/* Center Category Navigation Menu */}
              <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[12px] font-bold tracking-wider uppercase">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`transition-colors duration-150 py-1 border-b-2 ${
                        isActive 
                          ? "text-[#004691] border-[#004691]" 
                          : "text-slate-700 border-transparent hover:text-[#004691] hover:border-slate-300"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Right empty spacer or contact phone */}
              <div className="hidden lg:flex items-center text-[12px] font-semibold text-slate-500">
                <span>012 345 678</span>
              </div>

            </div>

          </div>
        </header>
      )}

      <main className={`transition-all ${!hideNav ? "pt-24 md:pt-[124px] pb-[calc(72px+env(safe-area-inset-bottom)+1rem)] md:pb-0" : ""} min-h-screen`}>
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
