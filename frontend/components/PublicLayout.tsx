"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, User as UserIcon, Heart, Search, ChevronRight } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useWishlist } from "../contexts/WishlistContext"
import BottomNav from "./BottomNav"
import Footer from "./Footer"
import CartDrawer from "./CartDrawer"
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const { cartCount, openCart } = useCart()
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-[#004691]/10 selection:text-[#004691]">
      
      {/* 📱 Mobile Drawer Menu (Slides from Left) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[200] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute top-0 left-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col z-[210]"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                  <img src="/logo/ysg-logo.png" alt="YSG Machinery" className="h-7 w-auto object-contain" />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>



              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4">
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
                            href={`/products/category/${cat.slug}`}
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
                                href={`/products/category/${sub.slug}`}
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

      {/* 🚀 Top Navigation Header */}
      {!hideNav && (
        <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            
            {/* 📱 Mobile Top Header Bar (100% Match with Gyeon Image) */}
            <div className="flex lg:hidden items-center justify-between h-14 relative px-1">
              
              {/* Left Side: Hamburger Box + Search Icon */}
              <div className="flex items-center gap-2 z-10">
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-slate-800 bg-white shadow-2xs hover:bg-slate-50 transition-all"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <button 
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                  className="p-2 text-slate-700 hover:text-[#004691] transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Center: Centered Brand Logo */}
              <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-7 w-auto object-contain" />
              </Link>

              {/* Right Side: Wishlist + Cart Badge + Account */}
              <div className="flex items-center gap-2 z-10">
                <Link href="/wishlist" className="relative p-1.5 text-slate-700 hover:text-[#004691]">
                  <Heart className="w-5 h-5 stroke-[1.8]" />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-extrabold min-w-[15px] h-[15px] flex items-center justify-center rounded-full border border-white">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                <button onClick={openCart} className="relative p-1.5 text-slate-700 hover:text-[#004691]">
                  <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-extrabold min-w-[15px] h-[15px] flex items-center justify-center rounded-full border border-white">
                      {cartCount}
                    </span>
                  )}
                </button>

                {user ? (
                  <Link href="/account" className="p-1.5 text-slate-700 hover:text-[#004691]">
                    {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                      <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-5 h-5 stroke-[1.8]" />
                    )}
                  </Link>
                ) : (
                  <Link href="/login" className="p-1.5 text-slate-700 hover:text-[#004691]">
                    <UserIcon className="w-5 h-5 stroke-[1.8]" />
                  </Link>
                )}
              </div>

            </div>

            {/* Mobile Expandable Search Bar */}
            {mobileSearchOpen && (
              <div className="lg:hidden pb-3 pt-1 border-t border-slate-100">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const input = form.elements.namedItem('search') as HTMLInputElement;
                    if (input?.value.trim()) {
                      router.push(`/products?search=${encodeURIComponent(input.value.trim())}`);
                      setMobileSearchOpen(false);
                    }
                  }} 
                  className="w-full flex items-center bg-slate-100 rounded-full px-4 py-2 text-xs border border-transparent focus-within:border-[#004691] focus-within:bg-white"
                >
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input 
                    name="search"
                    type="text" 
                    placeholder={language === "kh" ? "តើអ្នកកំពុងស្វែងរកអ្វី?" : "What are you looking for?"}
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs font-medium"
                    autoFocus
                  />
                  <button type="button" onClick={() => setMobileSearchOpen(false)} className="p-1 text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* 💻 Desktop Header (Clean Single-Row Gyeon Style Layout) */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between h-20 gap-6">
                
                {/* Logo */}
                <Link href="/" className="flex items-center shrink-0">
                  <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-9 w-auto object-contain" />
                </Link>

                {/* Center Navigation Menu */}
                <nav className="flex items-center gap-8 text-[13px] font-bold tracking-wide">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`transition-colors py-2 border-b-2 font-semibold ${
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

                {/* Right Side: Search + Language + Wishlist + Cart + Account */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* Search Input Box */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const input = form.elements.namedItem('search') as HTMLInputElement;
                      if (input?.value.trim()) {
                        router.push(`/products?search=${encodeURIComponent(input.value.trim())}`);
                      }
                    }} 
                    className="flex items-center bg-slate-100/80 hover:bg-slate-100 rounded-lg px-3.5 py-2 text-xs border border-slate-200/80 focus-within:border-[#004691] focus-within:bg-white w-52 transition-all"
                  >
                    <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input 
                      name="search"
                      type="text" 
                      placeholder={language === "kh" ? "ស្វែងរក..." : "Search..."}
                      className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs font-medium"
                    />
                  </form>

                  {/* Clean Language Switcher (EN | KH) */}
                  <div className="flex items-center text-xs font-bold text-slate-600 gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                    <button 
                      onClick={() => setLanguage("en")}
                      className={`hover:text-[#004691] transition-colors ${language === "en" ? "text-[#004691] font-black" : "text-slate-500"}`}
                    >
                      EN
                    </button>
                    <span className="text-slate-300">|</span>
                    <button 
                      onClick={() => setLanguage("kh")}
                      className={`hover:text-[#004691] transition-colors ${language === "kh" ? "text-[#004691] font-black" : "text-slate-500"}`}
                    >
                      KH
                    </button>
                  </div>

                  {/* Wishlist Icon Link */}
                  <Link href="/wishlist" className="relative p-2 text-slate-700 hover:text-[#004691] transition-colors">
                    <Heart className="w-5 h-5 stroke-[1.8]" />
                    {wishlistItems && wishlistItems.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-extrabold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border border-white">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>

                  {/* Cart Icon Button */}
                  <button onClick={openCart} className="relative p-2 text-slate-700 hover:text-[#004691] transition-colors">
                    <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-extrabold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border border-white">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  {/* Account Link */}
                  {user ? (
                    <Link href="/account" className="p-2 text-slate-700 hover:text-[#004691] transition-colors">
                      {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                        <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-5 h-5 stroke-[1.8]" />
                      )}
                    </Link>
                  ) : (
                    <Link href="/login" className="p-2 text-slate-700 hover:text-[#004691] transition-colors">
                      <UserIcon className="w-5 h-5 stroke-[1.8]" />
                    </Link>
                  )}

                </div>

              </div>
            </div>

          </div>
        </header>
      )}

      <main className={`transition-all ${!hideNav ? "pt-16 lg:pt-20 pb-[calc(72px+env(safe-area-inset-bottom)+1rem)] md:pb-0" : ""} min-h-screen`}>
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

      {/* Sliding Side Cart Drawer */}
      <CartDrawer />
    </div>
  )
}
