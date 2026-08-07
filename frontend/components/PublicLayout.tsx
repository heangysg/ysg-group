"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart, Menu, X, User as UserIcon, Heart, Search, ChevronRight, HelpCircle } from "lucide-react"
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
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
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

                  <Link
                    href={user ? "/account" : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-[#004691] rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <span>{user ? (language === "kh" ? "គណនីរបស់ខ្ញុំ" : "My Account") : (language === "kh" ? "ចូលគណនី" : "Sign In")}</span>
                  </Link>

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
                                  prev.includes(cat.slug) ? prev.filter(s => s !== cat.slug) : [...prev, cat.slug]
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
                              className="px-2.5 py-2 text-xs md:text-sm font-bold text-slate-500 hover:text-[#004691] hover:bg-slate-50 rounded-md"
                            >
                              {language === "kh" ? `ទំនិញទាំងអស់ក្នុង ${cat.nameKhmer || cat.name}` : `All ${cat.name}`}
                            </Link>

                            {subCats.map(sub => (
                              <Link
                                key={sub.id}
                                href={`/products/category/${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-2.5 py-2 text-xs md:text-sm font-medium text-slate-700 hover:text-[#004691] rounded-md"
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
              <div className="lg:hidden pb-3 pt-1 border-t border-slate-100 relative">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/products/search/${encodeURIComponent(searchQuery.trim())}`);
                      setMobileSearchOpen(false);
                      setSearchOpen(false);
                    }
                  }} 
                  className="w-full flex items-center bg-slate-100 rounded-full px-4 py-2 text-xs border border-transparent focus-within:border-[#004691] focus-within:bg-white"
                >
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input 
                    name="search"
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSearchOpen(true)
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder={language === "kh" ? "តើអ្នកកំពុងស្វែងរកអ្វី?" : "What are you looking for?"}
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs font-medium"
                    autoFocus
                  />
                  <button type="button" onClick={() => {
                    setMobileSearchOpen(false)
                    setSearchOpen(false)
                    setSearchQuery("")
                  }} className="p-1 text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </form>

                {/* 🛍️ Live Instant Search Product Modal Mobile (One Row per Product) */}
                <AnimatePresence>
                  {searchOpen && searchQuery.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                      <div className="text-[11px] font-extrabold text-slate-400 px-3 py-1.5 uppercase tracking-wider flex justify-between items-center border-b border-slate-100 pb-2">
                        <span>{language === "kh" ? "លទ្ធផលស្វែងរក" : "Live Product Results"}</span>
                        {isSearching ? (
                          <span className="text-xs font-bold text-[#004691] animate-pulse">
                            {language === "kh" ? "កំពុងស្វែងរក..." : "Searching..."}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-50 text-[#004691] px-2 py-0.5 rounded-full font-bold">
                            {searchResults.length} {language === "kh" ? "ផល" : "found"}
                          </span>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto py-1">
                        {searchResults.length > 0 ? (
                          searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              onClick={() => {
                                setSearchOpen(false)
                                setMobileSearchOpen(false)
                                setSearchQuery("")
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-blue-50/60 rounded-xl transition-all group"
                            >
                              {/* Product Thumbnail Row Image */}
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                {getValidImages(product)[0] ? (
                                  <img src={getOptimizedImageUrl(getValidImages(product)[0], 'thumb')} alt={product.name} className="w-full h-full object-contain" />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400" />
                                )}
                              </div>

                              {/* Product Info Row Title & Category */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
                                </p>
                                <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full inline-block">
                                  {product.category?.name || "Equipment"}
                                </span>
                              </div>

                              {/* Row Price */}
                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-[#004691]">
                                  ${parseFloat(product.price).toFixed(2)}
                                </span>
                              </div>
                            </Link>
                          ))
                        ) : !isSearching ? (
                          <div className="p-4 text-center text-xs font-semibold text-slate-500">
                            {language === "kh" ? "រកមិនឃើញផលិតផលទេ" : "No matching products found"}
                          </div>
                        ) : null}
                      </div>

                      <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                        <button
                          onClick={() => {
                            router.push(`/products/search/${encodeURIComponent(searchQuery.trim())}`)
                            setSearchOpen(false)
                            setMobileSearchOpen(false)
                          }}
                          className="w-full py-1.5 text-xs font-bold text-[#004691] hover:bg-blue-100/60 rounded-lg transition-colors text-center"
                        >
                          {language === "kh" ? `មើលលទ្ធផលទាំងអស់ (${searchResults.length})` : `View all results for "${searchQuery}"`}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                <nav className="flex items-center gap-8 text-sm md:text-base font-bold tracking-wide">
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
                  {/* Search Input Box with Live Popup Modal */}
                  <div className="relative">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (searchQuery.trim()) {
                          router.push(`/products/search/${encodeURIComponent(searchQuery.trim())}`);
                          setSearchOpen(false);
                        }
                      }} 
                      className="flex items-center bg-slate-100/80 hover:bg-slate-100 rounded-lg px-3.5 py-2 text-xs border border-slate-200/80 focus-within:border-[#004691] focus-within:bg-white w-56 transition-all"
                    >
                      <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input 
                        name="search"
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setSearchOpen(true)
                        }}
                        onFocus={() => setSearchOpen(true)}
                        placeholder={language === "kh" ? "ស្វែងរក..." : "Search..."}
                        className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs font-medium"
                      />
                      {searchQuery && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setSearchQuery("")
                            setSearchOpen(false)
                          }}
                          className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
                        >
                          ✕
                        </button>
                      )}
                    </form>

                    {/* 🛍️ Live Instant Search Product Modal (One Row per Product) */}
                    <AnimatePresence>
                      {searchOpen && searchQuery.trim().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                        >
                          <div className="text-[11px] font-extrabold text-slate-400 px-3 py-1.5 uppercase tracking-wider flex justify-between items-center border-b border-slate-100 pb-2">
                            <span>{language === "kh" ? "លទ្ធផលស្វែងរក" : "Live Product Results"}</span>
                            {isSearching ? (
                              <span className="text-xs font-bold text-[#004691] animate-pulse">
                                {language === "kh" ? "កំពុងស្វែងរក..." : "Searching..."}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-blue-50 text-[#004691] px-2 py-0.5 rounded-full font-bold">
                                {searchResults.length} {language === "kh" ? "ផល" : "found"}
                              </span>
                            )}
                          </div>

                          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto py-1">
                            {searchResults.length > 0 ? (
                              searchResults.map((product) => (
                                <Link
                                  key={product.id}
                                  href={`/products/${product.id}`}
                                  onClick={() => {
                                    setSearchOpen(false)
                                    setSearchQuery("")
                                  }}
                                  className="flex items-center gap-3 p-2.5 hover:bg-blue-50/60 rounded-xl transition-all group"
                                >
                                  {/* Product Thumbnail Row Image */}
                                  <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[#004691] transition-colors">
                                    {getValidImages(product)[0] ? (
                                      <img src={getOptimizedImageUrl(getValidImages(product)[0], 'thumb')} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                                    ) : (
                                      <Package className="w-5 h-5 text-slate-400" />
                                    )}
                                  </div>

                                  {/* Product Info Row Title & Category */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-[#004691] transition-colors">
                                      {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
                                    </p>
                                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                      {product.category?.name || "Equipment"}
                                    </span>
                                  </div>

                                  {/* Row Price */}
                                  <div className="text-right shrink-0">
                                    <span className="text-xs sm:text-sm font-extrabold text-[#004691]">
                                      ${parseFloat(product.price).toFixed(2)}
                                    </span>
                                  </div>
                                </Link>
                              ))
                            ) : !isSearching ? (
                              <div className="p-6 text-center text-xs font-semibold text-slate-500">
                                {language === "kh" ? "រកមិនឃើញផលិតផលដែលត្រូវគ្នានឹងការស្វែងរករបស់អ្នកទេ" : "No matching products found"}
                              </div>
                            ) : null}
                          </div>

                          <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                            <button
                              onClick={() => {
                                router.push(`/products/search/${encodeURIComponent(searchQuery.trim())}`)
                                setSearchOpen(false)
                              }}
                              className="w-full py-2 text-xs font-bold text-[#004691] hover:bg-blue-100/60 rounded-lg transition-colors text-center"
                            >
                              {language === "kh" ? `មើលលទ្ធផលទាំងអស់សម្រាប់ "${searchQuery}"` : `View all results for "${searchQuery}"`}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Single Flag Toggle Language Switcher Button */}
                  <button 
                    onClick={() => setLanguage(language === "en" ? "kh" : "en")}
                    title={language === "en" ? "Switch to ភាសាខ្មែរ" : "Switch to English"}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 group cursor-pointer"
                  >
                    {language === "en" ? (
                      <>
                        <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-4 h-3 object-cover rounded-xs shrink-0" />
                        <span className="text-xs font-black text-slate-800 group-hover:text-[#004691]">EN</span>
                      </>
                    ) : (
                      <>
                        <img src="https://flagcdn.com/w40/kh.png" alt="Khmer" className="w-4 h-3 object-cover rounded-xs shrink-0" />
                        <span className="text-xs font-black text-slate-800 group-hover:text-[#004691]">KH</span>
                      </>
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
