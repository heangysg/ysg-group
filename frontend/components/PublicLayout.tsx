"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, User as UserIcon, Heart, Search, ChevronRight, ChevronDown, HelpCircle } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"
import { useWishlist } from "../contexts/WishlistContext"
import { createClient } from "../lib/supabase/client"
import BottomNav from "./BottomNav"
import Footer from "./Footer"
import CartDrawer from "./CartDrawer"
import { motion, AnimatePresence } from "framer-motion"

let _searchCache: any[] | null = null
let _isFetchingSearch = false
import { Toaster } from "react-hot-toast"
import { getValidImages, getOptimizedImageUrl } from "../lib/imageUtils"

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
  const { items: wishlistItems } = useWishlist()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        if (!_searchCache && !_isFetchingSearch) {
          _isFetchingSearch = true
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
          const res = await fetch(`${API_URL}/api/public/products`)
          if (res.ok) {
            const { data } = await res.json()
            if (data) _searchCache = data
          }
          _isFetchingSearch = false
        }
        
        if (_searchCache) {
          const q = searchQuery.toLowerCase().trim()
          const filtered = _searchCache.filter((p: any) => 
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.nameKhmer && p.nameKhmer.toLowerCase().includes(q)) ||
            (p.category?.name && p.category.name.toLowerCase().includes(q))
          )
          setSearchResults(filtered.slice(0, 5))
        }
      } catch (err) {
        console.error("Live search error:", err)
        _isFetchingSearch = false
      } finally {
        setIsSearching(false)
      }
    }, 150) // Reduced delay for snappier feel

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const [isAuthChecking, setIsAuthChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setIsAuthChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setIsAuthChecking(false)
    })

    if (typeof window !== "undefined") {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual'
      }
      window.scrollTo(0, 0)
    }

    if (typeof window !== "undefined" && window.location.search.includes("code=")) {
      const url = new URL(window.location.href)
      url.searchParams.delete("code")
      const newUrl = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : "")
      window.history.replaceState(null, "", newUrl)
    }

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  const navItems = [
    { name: t("home"), href: "/", icon: Home },
    { name: t("allProducts"), href: "/products", icon: Package },
    { name: t("categories"), href: "/categories", icon: FolderOpen },
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
                  <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-7 w-auto object-contain" />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>



              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* 📌 Main Pages Section */}
                <div className="flex flex-col gap-1 pb-3 border-b border-slate-200">
                  <span className="px-3 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                    {language === "kh" ? "ទំព័រចម្បង" : "Main Pages"}
                  </span>

                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                  >
                    <Home className="w-4 h-4 text-slate-500" />
                    <span>{t("home")}</span>
                  </Link>

                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                  >
                    <Package className="w-4 h-4 text-slate-500" />
                    <span>{t("allProducts")}</span>
                  </Link>

                  <Link
                    href="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                  >
                    <FolderOpen className="w-4 h-4 text-slate-500" />
                    <span>{t("categories")}</span>
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-4 h-4 text-slate-500" />
                      <span>{t("wishlist")}</span>
                    </div>
                    {wishlistItems && wishlistItems.length > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>

                  {isAuthChecking ? (
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse" />
                      <div className="w-24 h-4 rounded bg-slate-200 animate-pulse" />
                    </div>
                  ) : (
                    <Link
                      href={user ? "/account" : "/login"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>{user ? (language === "kh" ? "គណនីរបស់ខ្ញុំ" : "My Account") : (language === "kh" ? "ចូលគណនី" : "Sign In")}</span>
                    </Link>
                  )}

                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                  >
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>{t("about")}</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                  >
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>{t("contact")}</span>
                  </Link>

                  <Link
                    href="/help"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>{language === "kh" ? "មជ្ឈមណ្ឌលជំនួយ" : "Help Center"}</span>
                  </Link>
                </div>

                {/* 📂 Category Tree Accordions */}
                <div className="flex flex-col gap-1">
                  <span className="px-3 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                    {language === "kh" ? "ប្រភេទទំនិញ" : "Product Categories"}
                  </span>
                  {categories.filter(c => !c.parentId).map(cat => {
                    const subCats = categories.filter(sub => sub.parentId === cat.id)
                    const hasSubs = subCats.length > 0
                    const isExpanded = expandedCategories.includes(cat.slug)

                    return (
                      <div key={cat.id} className="flex flex-col">
                        <div className="flex items-center justify-between rounded-md transition-all hover:bg-slate-50">
                          {hasSubs ? (
                            <button
                              onClick={() => {
                                setExpandedCategories(prev => 
                                  prev.includes(cat.slug) ? [] : [cat.slug]
                                )
                              }}
                              className="flex-1 flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-slate-800 text-left"
                            >
                              <span>{language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}</span>
                              <ChevronRight className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90 text-[#004691]' : 'text-slate-400'}`} />
                            </button>
                          ) : (
                            <Link 
                              href={`/products/category/${cat.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex-1 text-left px-3.5 py-2.5 text-sm font-bold text-slate-800"
                            >
                              {language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}
                            </Link>
                          )}
                        </div>

                        {/* Nested Subcategories */}
                        {hasSubs && isExpanded && (
                          <div className="ml-4 pl-3 border-l-2 border-[#004691]/20 flex flex-col gap-1 my-1">
                            <Link
                              href={`/products/category/${cat.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="px-2.5 py-2 text-sm md:text-base font-bold text-slate-500 hover:text-[#004691] hover:bg-slate-50 rounded-md"
                            >
                              {language === "kh" ? `ទំនិញទាំងអស់ក្នុង ${cat.nameKhmer || cat.name}` : `All ${cat.name}`}
                            </Link>

                            {subCats.map(sub => (
                              <Link
                                key={sub.id}
                                href={`/products/category/${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-2.5 py-2 text-sm md:text-base font-medium text-slate-700 hover:text-[#004691] rounded-md"
                              >
                                {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 transition-all active:scale-98"
                >
                  <span className="text-slate-500">{language === "kh" ? "ភាសា:" : "Language:"}</span>
                  <div className="flex items-center gap-2 font-extrabold text-slate-900">
                    <img 
                      src={language === "en" ? "https://flagcdn.com/w40/gb.png" : "https://flagcdn.com/w40/kh.png"} 
                      alt="Flag" 
                      className="w-4 h-3 object-cover rounded-xs" 
                    />
                    <span>{language === "en" ? "English" : "ភាសាខ្មែរ"}</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 Top Navigation Header */}
      {!hideNav && (
        <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200 shadow-2xs">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            
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

                {isAuthChecking ? (
                  <div className="p-1.5 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                ) : user ? (
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

            {/* Unified Centered Modal Pop-up Search (Mobile & Desktop) */}
            <AnimatePresence>
              {mobileSearchOpen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-16 md:pt-24 p-4"
                  onClick={() => {
                    setMobileSearchOpen(false)
                    setSearchOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: -20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-xl bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh]"
                  >
                    <div className="p-4 md:p-5 pb-0 border-b border-slate-100 shrink-0">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg md:text-xl font-black text-slate-900">
                          {language === "kh" ? "ស្វែងរកផលិតផល" : "Search Products"}
                        </h2>
                        <button 
                          onClick={() => {
                            setMobileSearchOpen(false)
                            setSearchOpen(false)
                            setSearchQuery("")
                          }} 
                          className="p-1.5 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>
                      
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (searchQuery.trim()) {
                            router.push(`/products/search/${encodeURIComponent(searchQuery.trim())}`);
                            setMobileSearchOpen(false);
                            setSearchOpen(false);
                          }
                        }} 
                        className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-[#004691] focus-within:bg-white transition-all w-full mb-5 shadow-inner"
                      >
                        <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-400 mr-3 shrink-0" />
                        <input 
                          name="search"
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setSearchOpen(true)
                          }}
                          onFocus={() => setSearchOpen(true)}
                          placeholder={language === "kh" ? "វាយបញ្ចូលឈ្មោះផលិតផល..." : "Type a product name..."}
                          className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-base md:text-base font-medium"
                          autoFocus
                        />
                      </form>
                    </div>

                    {/* Live Results Display Area */}
                    <div className="overflow-y-auto p-4 md:p-5 bg-slate-50/50 flex-1">
                      {searchOpen && searchQuery.trim().length > 0 ? (
                        <>
                          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex justify-between items-center mb-3">
                            <span>{language === "kh" ? "លទ្ធផលស្វែងរក" : "Live Results"}</span>
                            {isSearching ? (
                              <span className="text-[#004691] animate-pulse">
                                {language === "kh" ? "កំពុងស្វែងរក..." : "Searching..."}
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-[#004691] px-2 py-0.5 rounded-full font-bold">
                                {searchResults.length} {language === "kh" ? "ផល" : "found"}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {searchResults.length > 0 ? (
                              searchResults.slice(0, 6).map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/products/${product.id}`}
                                  onClick={() => {
                                    setSearchOpen(false)
                                    setMobileSearchOpen(false)
                                    setSearchQuery("")
                                  }}
                                  className="flex items-center gap-3 p-2 bg-white border border-slate-200 hover:border-[#004691] hover:shadow-sm rounded-lg transition-all group"
                                >
                                  <div className="w-12 h-12 rounded-md bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                                    {getValidImages(product)[0] ? (
                                      <img src={getOptimizedImageUrl(getValidImages(product)[0], 'thumb')} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                    ) : (
                                      <Package className="w-4 h-4 text-slate-300" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-[#004691] transition-colors leading-tight mb-0.5">
                                      {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
                                    </h4>
                                    <span className="text-[11px] font-extrabold text-red-600 block">
                                      ${parseFloat(product.price).toFixed(2)}
                                    </span>
                                  </div>
                                </Link>
                              ))
                            ) : !isSearching ? (
                              <div className="col-span-1 sm:col-span-2 p-6 text-center text-slate-400 font-bold text-xs bg-white rounded-lg border border-slate-200 border-dashed">
                                {language === "kh" ? "រកមិនឃើញផលិតផលដែលត្រូវគ្នានឹងការស្វែងរករបស់អ្នកទេ" : "No matching products found"}
                              </div>
                            ) : null}
                          </div>

                          {searchResults.length > 6 && (
                            <div className="text-center mt-5">
                              <button
                                onClick={() => {
                                  router.push(`/products/search/${encodeURIComponent(searchQuery.trim())}`)
                                  setSearchOpen(false)
                                  setMobileSearchOpen(false)
                                }}
                                className="px-6 py-2 text-sm bg-[#004691] text-white hover:bg-[#003066] rounded-full font-bold transition-colors shadow-md"
                              >
                                {language === "kh" ? "មើលផលិតផលបន្ថែម" : "View more products"}
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-24 flex items-center justify-center text-slate-400 font-medium text-sm">
                          {language === "kh" ? "ចាប់ផ្តើមវាយដើម្បីស្វែងរកផលិតផល..." : "Start typing to search products..."}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 💻 Desktop Header (Clean Single-Row Gyeon Style Layout) */}
            <div className="hidden lg:block">
              <div className="flex items-center h-20">
                
                {/* Logo */}
                <div className="flex-1 flex justify-start">
                  <Link href="/" className="flex items-center shrink-0">
                    <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-9 w-auto object-contain" />
                  </Link>
                </div>

                {/* Center Navigation Menu */}
                <div className="shrink-0">
                  <nav className="flex items-center gap-4 lg:gap-6 text-sm md:text-base font-bold tracking-wide">
                    {navItems.map((item) => {
                    const isActive = pathname === item.href
                    
                    if (item.href === "/categories") {
                      return (
                        <div key={item.href} className="group relative py-6 -my-6">
                          <Link
                            href={item.href}
                            className={`transition-colors py-2 border-b-2 font-semibold flex items-center gap-1 whitespace-nowrap ${
                              isActive 
                                ? "text-[#004691] border-[#004691]" 
                                : "text-slate-700 border-transparent group-hover:text-[#004691]"
                            }`}
                          >
                            {item.name}
                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-[#004691] group-hover:rotate-180 transition-all duration-300" />
                          </Link>

                          {/* Mega Menu Dropdown */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[900px] max-w-[90vw] bg-white border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,70,145,0.1)] rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[110] p-8 cursor-default">
                            <div className="grid grid-cols-4 gap-x-8 gap-y-10">
                              {categories.filter(c => !c.parentId).map(mainCat => {
                                const subs = categories.filter(sub => sub.parentId === mainCat.id)
                                return (
                                  <div key={mainCat.id} className="flex flex-col">
                                    <Link 
                                      href={`/products/category/${mainCat.slug}`}
                                      className="font-black text-slate-800 text-[15px] mb-3 hover:text-[#004691] transition-colors flex items-center justify-between gap-2 border-b border-slate-100 pb-2 group/main"
                                    >
                                      <span className="truncate">{language === "kh" && mainCat.nameKhmer ? mainCat.nameKhmer : mainCat.name}</span>
                                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover/main:text-[#004691] transition-colors shrink-0" />
                                    </Link>
                                    <div className="flex flex-col gap-2">
                                      {subs.map(sub => (
                                        <Link
                                          key={sub.id}
                                          href={`/products/category/${sub.slug}`}
                                          className="text-[13px] font-semibold text-slate-500 hover:text-[#004691] hover:bg-blue-50/50 px-2 -mx-2 py-1 rounded transition-colors flex items-center gap-2 group/sub"
                                        >
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/sub:bg-[#004691] transition-colors shrink-0" />
                                          <span className="truncate">{language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}</span>
                                        </Link>
                                      ))}
                                      {subs.length === 0 && (
                                        <span className="text-[12px] italic text-slate-400 px-2 -mx-2 py-1">
                                          {language === "kh" ? "គ្មានប្រភេទរងទេ" : "No subcategories"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`transition-colors py-2 border-b-2 font-semibold flex items-center gap-1.5 ${
                          isActive 
                            ? "text-[#004691] border-[#004691]" 
                            : "text-slate-700 border-transparent hover:text-[#004691]"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                  </nav>
                </div>

                {/* Right Side: Search + Language + Wishlist + Cart + Account */}
                <div className="flex-1 flex justify-end">
                  <div className="flex items-center gap-4 shrink-0">
                  <button 
                    onClick={() => {
                      setMobileSearchOpen(!mobileSearchOpen)
                      if (!mobileSearchOpen) {
                        setTimeout(() => {
                          const input = document.querySelector('input[name="search"]') as HTMLInputElement
                          if (input) input.focus()
                        }, 100)
                      }
                    }}
                    className="p-2 text-slate-700 hover:text-[#004691] transition-colors bg-slate-50 hover:bg-slate-100 rounded-full"
                    title={language === "kh" ? "ស្វែងរក" : "Search"}
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Single Flag Toggle Language Switcher Button */}
                  <button 
                    onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                    title={language === "en" ? "Switch to ភាសាខ្មែរ" : "Switch to English"}
                    className="flex items-center justify-center w-9 h-9 bg-slate-50 hover:bg-slate-100 rounded-full transition-all active:scale-95 group cursor-pointer"
                  >
                    {language === "en" ? (
                      <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-5 h-3.5 object-cover rounded-[2px]" />
                    ) : (
                      <img src="https://flagcdn.com/w40/kh.png" alt="Khmer" className="w-5 h-3.5 object-cover rounded-[2px]" />
                    )}
                  </button>

                  {/* Wishlist Icon Link */}
                  <Link href="/wishlist" className="relative p-2 text-slate-700 hover:text-[#004691] transition-colors">
                    <Heart className="w-5 h-5 stroke-[1.8]" />
                    {wishlistItems && wishlistItems.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-extrabold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border border-white">
                          {wishlistItems.length}
                      </span>
                    )}
                  </Link>

                  {/* Cart Icon Link */}
                  <button onClick={openCart} className="relative p-2 text-slate-700 hover:text-[#004691] transition-colors">
                    <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-extrabold min-w-[16px] h-[16px] flex items-center justify-center rounded-full border border-white">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  {/* Account Link */}
                  {isAuthChecking ? (
                    <div className="p-2 ml-1 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse" />
                    </div>
                  ) : user ? (
                    <Link href="/account" className="p-2 text-slate-700 hover:text-[#004691] transition-colors">
                      {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                        <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-5 h-5 rounded-full object-cover shadow-2xs" referrerPolicy="no-referrer" />
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
