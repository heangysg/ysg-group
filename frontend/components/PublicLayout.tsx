"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, User as UserIcon, Truck, Heart, Search, ChevronRight } from "lucide-react"
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

  const [categories, setCategories] = useState<any[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    fetch(`${API_URL}/api/public/categories`).then(r => r.json()).then(res => {
      if (res.data) setCategories(res.data)
    }).catch(err => console.error("Failed to fetch categories for menu", err))
  }, [])

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
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-[300px] bg-white border-r border-slate-200 flex flex-col shadow-2xl z-[210]"
            >
              {/* Drawer Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-200 bg-white">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-8 w-auto object-contain" />
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-500 hover:text-slate-900 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                
                {/* Search inside drawer */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('search') as HTMLInputElement;
                    if (input?.value.trim()) {
                      router.push(`/products?search=${encodeURIComponent(input.value.trim())}`);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center bg-slate-100 rounded-full px-3 py-2 text-xs border border-slate-200"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input 
                    name="search"
                    type="text" 
                    placeholder={language === "kh" ? "តើអ្នកកំពុងស្វែងរកអ្វី?" : "What are you looking for?"}
                    className="w-full bg-transparent border-none outline-none text-slate-800 text-[11px]"
                  />
                </form>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-1">
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-[13px] font-bold text-slate-900 uppercase hover:bg-slate-100 rounded-md"
                  >
                    {t("allProducts")}
                  </Link>

                  {/* Category Tree Accordions */}
                  {categories.filter(c => !c.parentId).map(cat => {
                    const subCats = categories.filter(sub => sub.parentId === cat.id)
                    const hasSubs = subCats.length > 0
                    const isExpanded = expandedCategories.includes(cat.slug)

                    return (
                      <div key={cat.id} className="flex flex-col">
                        <div className="flex items-center justify-between px-3 py-2.5 text-[12px] font-semibold text-slate-800 hover:bg-slate-50 rounded-md">
                          <Link 
                            href={`/products?category=${cat.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 text-left"
                          >
                            {language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}
                          </Link>
                          {hasSubs && (
                            <button
                              onClick={() => {
                                setExpandedCategories(prev => 
                                  prev.includes(cat.slug) ? prev.filter(s => s !== cat.slug) : [...prev, cat.slug]
                                )
                              }}
                              className="p-1 text-slate-400 hover:text-slate-900"
                            >
                              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90 text-[#004691]' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Nested Subcategories */}
                        {hasSubs && isExpanded && (
                          <div className="ml-4 pl-3 border-l border-slate-200 flex flex-col gap-1 my-1">
                            {subCats.map(sub => (
                              <Link
                                key={sub.id}
                                href={`/products?category=${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-2 py-1.5 text-[11px] text-slate-600 hover:text-[#004691] rounded-md"
                              >
                                {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </nav>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <button
                  onClick={() => {
                    setLanguage(language === "en" ? "kh" : "en")
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200 rounded-md text-[12px] font-bold text-slate-800"
                >
                  <span>{language === "en" ? "Switch to ភាសាខ្មែរ" : "Switch to English"}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#004691] text-white rounded-xs">
                    {language === "en" ? "KH" : "EN"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 Sleek Header (Optimized for Mobile & Laptop) */}
      {!hideNav && (
        <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            
            {/* 📱 Mobile Single Header Bar (< lg) */}
            <div className="flex lg:hidden items-center justify-between h-14 gap-2">
              <Link href="/" className="flex items-center shrink-0">
                <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-7 w-auto object-contain" />
              </Link>

              {/* Mobile Pill Search Input */}
              <div className="flex-1 mx-2">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('search') as HTMLInputElement;
                    if (input?.value.trim()) {
                      router.push(`/products?search=${encodeURIComponent(input.value.trim())}`);
                    }
                  }} 
                  className="w-full flex items-center bg-slate-100 rounded-full px-3 py-1 text-xs border border-transparent focus-within:border-[#004691] focus-within:bg-white"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                  <input 
                    name="search"
                    type="text" 
                    placeholder={language === "kh" ? "ស្វែងរក..." : "Search..."}
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-[11px] font-medium"
                  />
                </form>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                  className="px-2 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-800"
                >
                  {language === "en" ? "KH" : "EN"}
                </button>

                <Link href="/checkout" className="relative p-1.5 text-slate-700">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-[#004691] text-white text-[8px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 text-slate-700"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 💻 Desktop Dual-Row Header (>= lg) */}
            <div className="hidden lg:block">
              {/* Row 1: Search + Language + Actions */}
              <div className="flex items-center justify-between h-12 border-b border-slate-100 py-2">
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

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-full border border-slate-200 text-[11px] font-bold">
                    <button 
                      onClick={() => setLanguage("en")}
                      className={`px-3 py-1 rounded-full transition-all ${language === "en" ? "bg-[#004691] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => setLanguage("kh")}
                      className={`px-3 py-1 rounded-full transition-all ${language === "kh" ? "bg-[#004691] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      ភាសាខ្មែរ
                    </button>
                  </div>

                  {user ? (
                    <Link href="/account" className="p-1.5 text-slate-700 hover:text-[#004691]">
                      {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                        <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </Link>
                  ) : (
                    <Link href="/login" className="p-1.5 text-slate-700 hover:text-[#004691]">
                      <UserIcon className="w-4 h-4" />
                    </Link>
                  )}

                  <Link href="/wishlist" className="relative p-1.5 text-slate-700 hover:text-red-500">
                    <Heart className="w-4 h-4" />
                    {wishlistItems && wishlistItems.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>

                  <Link href="/checkout" className="relative p-1.5 text-slate-700 hover:text-[#004691]">
                    <ShoppingCart className="w-4 h-4" />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 bg-[#004691] text-white text-[9px] font-bold min-w-[15px] h-[15px] flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Row 2: Logo + Category Navigation */}
              <div className="flex items-center justify-between h-14">
                <Link href="/" className="flex items-center shrink-0">
                  <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-8 w-auto object-contain" />
                </Link>

                <nav className="flex items-center gap-8 text-[12px] font-bold tracking-wider uppercase">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`transition-colors py-1 border-b-2 ${
                          isActive 
                            ? "text-[#004691] border-[#004691]" 
                            : "text-slate-700 border-transparent hover:text-[#004691]"
                        }`}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>

          </div>
        </header>
      )}

      <main className={`transition-all ${!hideNav ? "pt-16 lg:pt-[116px] pb-[calc(72px+env(safe-area-inset-bottom)+1rem)] md:pb-0" : ""} min-h-screen`}>
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
