"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import PublicLayout from "./PublicLayout"
import ProductCard from "./ProductCard"
import { useLanguage } from "../contexts/LanguageContext"
import { Search, SlidersHorizontal, X, Filter, Package, ChevronRight, ChevronDown, Check, ArrowRight, Star } from "lucide-react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

// Module-level cache — survives across route changes (component remounts)
let _cachedProducts: any[] = []
let _cachedCategories: any[] = []

export default function ProductsList({ initialCategory = "all", initialFeatured = false, initialSearch = "" }: { initialCategory?: string, initialFeatured?: boolean, initialSearch?: string }) {
 const { t, language } = useLanguage()
 const router = useRouter()
 const params = useParams()
 const searchParams = useSearchParams()
 const [isPending, startTransition] = useTransition()
 
 const urlCategory = (params?.slug as string) || searchParams.get("category") || initialCategory
 const isFeatured = initialFeatured || searchParams.get("featured") === "true"
 const urlSearch = (params?.query as string) || searchParams.get("search") || initialSearch

 const [allProducts, setAllProducts] = useState<any[]>(_cachedProducts)
 const [categories, setCategories] = useState<any[]>(_cachedCategories)
 const [loading, setLoading] = useState(_cachedProducts.length === 0)
 const [isRestored] = useState(_cachedProducts.length > 0)
 const [searchQuery, setSearchQuery] = useState(urlSearch)
 const [selectedCategory, setSelectedCategory] = useState(urlCategory)
 const [showFilters, setShowFilters] = useState(false)
 const [sortBy, setSortBy] = useState("newest")
 const [sortOpen, setSortOpen] = useState(false)
 const [expandedCategories, setExpandedCategories] = useState<string[]>([])
 const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

 useEffect(() => {
 if (urlCategory) {
 setSelectedCategory(urlCategory)
 }
 }, [urlCategory])

 useEffect(() => {
 async function fetchData() {
 // Only show loading skeleton if we have no cached data yet
 if (_cachedProducts.length === 0) setLoading(true)
 else {
 // Show cached data immediately while refreshing in background
 setAllProducts(_cachedProducts)
 setCategories(_cachedCategories)
 setLoading(false)
 }
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 try {
 const [catRes, prodRes] = await Promise.all([
 fetch(`${API_URL}/api/public/categories`, { cache: 'no-store' }).then(r => r.json()),
 fetch(`${API_URL}/api/public/products${isFeatured ? '?featured=true' : ''}`, { cache: 'no-store' }).then(r => r.json())
 ])
 const cats = catRes.data || []
 const prods = prodRes.data || []
 _cachedProducts = prods
 _cachedCategories = cats
 setCategories(cats)
 setAllProducts(prods)
 } catch (e) {
 console.error("Failed to fetch products page data", e)
 // On error, keep cached data visible
 } finally {
 setLoading(false)
 }
 }
 fetchData()
 }, [isFeatured])

 // 🎯 Bulletproof Manual Scroll Restoration for Products Page
 useEffect(() => {
 if (loading) return

 // 1. Check if this was a page refresh
 const navEntries = window.performance.getEntriesByType("navigation")
 const isReload = navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === "reload"

 if (isReload) {
 sessionStorage.removeItem(`ysg_products_scroll_${selectedCategory}`)
 window.scrollTo({ top: 0, behavior: 'instant' })
 } else {
 // Restore previous scroll position instantly if navigating back
 const savedScroll = sessionStorage.getItem(`ysg_products_scroll_${selectedCategory}`)
 if (savedScroll) {
 setTimeout(() => {
 window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' })
 }, 50)
 }
 }

 // 2. Track scrolling to save for when user hits Back button
 const handleScroll = () => {
 // Prevent Next.js router from overwriting with 0 during page transitions
 if (window.scrollY > 10) {
 sessionStorage.setItem(`ysg_products_scroll_${selectedCategory}`, window.scrollY.toString())
 }
 }

 window.addEventListener('scroll', handleScroll, { passive: true })
 return () => window.removeEventListener('scroll', handleScroll)
 }, [loading, selectedCategory])

 const toggleCategoryExpand = (slug: string, e: React.MouseEvent) => {
 e.stopPropagation()
 e.preventDefault()
 setExpandedCategories(prev => 
 prev.includes(slug) ? [] : [slug]
 )
 }

 const handleCategorySelect = (slug: string, isMobile: boolean = false) => {
 if (isMobile) {
 setShowFilters(false)
 }

 const targetUrl = slug === "all" ? "/products" : `/products/category/${slug}`

 // If we are currently on the Featured page, we must use router.push to actually navigate 
 // away and remount the normal category component.
 if (isFeatured) {
 router.push(targetUrl)
 } else {
 setSelectedCategory(slug)
 // Use pushState for instant client-side URL update between normal categories
 window.history.pushState(null, '', targetUrl)
 }
 }

 // ⚡ Instant Client-Side Category & Search Filtering (Zero Flash / Glitch)
 let filteredProducts = allProducts.filter(p => {
 // 1. Category Filter
 if (selectedCategory !== "all") {
 const mainCat = categories.find((c: any) => c.slug === selectedCategory)
 if (mainCat) {
 const childCategoryIds = categories.filter((c: any) => c.parentId === mainCat.id).map((c: any) => c.id)
 const targetIds = [mainCat.id, ...childCategoryIds]
 if (!targetIds.includes(p.categoryId) && p.categorySlug !== selectedCategory && p.category?.slug !== selectedCategory) {
 return false
 }
 } else {
 if (p.categorySlug !== selectedCategory && p.category?.slug !== selectedCategory) {
 return false
 }
 }
 }

 // 2. Search Query Filter
 if (searchQuery) {
 const q = searchQuery.toLowerCase()
 const matchName = p.name.toLowerCase().includes(q) || (p.nameKhmer && p.nameKhmer.toLowerCase().includes(q))
 const matchDesc = (p.description && p.description.toLowerCase().includes(q)) || (p.descriptionKhmer && p.descriptionKhmer.toLowerCase().includes(q))
 if (!matchName && !matchDesc) return false
 }

 return true
 })

 // Sort Filter
 filteredProducts.sort((a, b) => {
 if (sortBy === "price_asc") return a.price - b.price
 if (sortBy === "price_desc") return b.price - a.price
 if (sortBy === "name_az") return a.name.localeCompare(b.name)
 return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
 })

 const renderCategoryFilters = (isMobile: boolean = false) => (
 <div className="flex flex-col gap-1">
 {/* Featured Machines Sidebar Button (Top) */}
 <button
 onClick={() => {
 if (isMobile) setShowFilters(false)
 router.push('/products/featured')
 }}
 className={`flex items-center justify-between px-3.5 py-2.5 text-base md:text-lg font-bold rounded-md transition-all ${
 isFeatured ? "bg-[#004691] text-white shadow-2xs" : "text-slate-700 hover:bg-slate-100"
 }`}
 >
 <span>{language === "kh" ? "ម៉ាស៊ីនពិសេស" : "Featured Machines"}</span>
 </button>

 {/* All Products Sidebar Button */}
 <button
 onClick={() => handleCategorySelect("all", isMobile)}
 className={`flex items-center justify-between px-3.5 py-2.5 text-base md:text-lg font-bold rounded-md transition-all ${
 selectedCategory === "all" && !isFeatured ? "bg-[#004691] text-white shadow-2xs" : "text-slate-700 hover:bg-slate-100"
 }`}
 >
 <span>{t("allProducts")}</span>
 </button>
 
 {categories.filter(c => !c.parentId).map(cat => {
 const isSelected = selectedCategory === cat.slug
 const subCats = categories.filter(sub => sub.parentId === cat.id)
 const hasSubs = subCats.length > 0
 const isExpanded = expandedCategories.includes(cat.slug) || isSelected || subCats.some(s => s.slug === selectedCategory)

 return (
 <div key={cat.id} className="flex flex-col">
 <div className={`flex items-center justify-between rounded-md transition-all ${
 isSelected ? "bg-[#004691]/10 text-[#004691]" : "text-slate-800 hover:bg-slate-50"
 }`}>
 <button
 onClick={() => {
 handleCategorySelect(cat.slug, isMobile)
 if (hasSubs && !expandedCategories.includes(cat.slug)) {
 setExpandedCategories([cat.slug])
 }
 }}
 className="flex-1 text-left px-3.5 py-2.5 text-base md:text-lg font-bold"
 >
 {language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}
 </button>
 
 {hasSubs && (
 <button
 onClick={(e) => toggleCategoryExpand(cat.slug, e)}
 className="px-3 py-2.5 h-full flex items-center justify-center shrink-0 text-slate-400 hover:text-[#004691]"
 >
 <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-[#004691]' : ''}`} />
 </button>
 )}
 </div>

 {/* Smooth Animated Accordion for Nested Subcategories */}
 <AnimatePresence initial={false}>
 {hasSubs && isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2, ease: "easeInOut" }}
 className="overflow-hidden ml-3 pl-3 border-l-2 border-[#004691]/20 flex flex-col gap-1 my-1"
 >
 {/* Option to view all products under this main category */}
 <button
 onClick={() => handleCategorySelect(cat.slug, isMobile)}
 className={`text-left px-2.5 py-2 text-[15px] md:text-[17px] font-bold rounded-md transition-all ${
 selectedCategory === cat.slug ? "text-[#004691] bg-blue-50" : "text-slate-500 hover:text-[#004691] hover:bg-slate-50"
 }`}
 >
 {language === "kh" ? `ទំនិញទាំងអស់ក្នុង ${cat.nameKhmer || cat.name}` : `All ${cat.name}`}
 </button>

 {subCats.map(sub => (
 <button
 key={sub.id}
 onClick={() => handleCategorySelect(sub.slug, isMobile)}
 className={`text-left px-2.5 py-2 text-[15px] md:text-[17px] rounded-md transition-all ${
 selectedCategory === sub.slug ? "text-[#004691] font-bold bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
 }`}
 >
 {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
 </button>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
 })}
 </div>
 )

 return (
 <PublicLayout>
 <main className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
 <div className="max-w-5xl mx-auto px-4 md:px-8">
 
 {/* 🍞 Mobile Responsive Breadcrumbs */}
 <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
 <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
 <span className="shrink-0 text-slate-400">/</span>
            {isFeatured ? (
              <>
                <Link href="/products" className="hover:text-[#004691] shrink-0 transition-colors">{t("allProducts")}</Link>
                <span className="shrink-0 text-slate-400">/</span>
                <span className="text-slate-900 font-bold shrink-0">{language === "kh" ? "ផលិតផលពិសេស" : "Featured Machines"}</span>
              </>
            ) : selectedCategory === "all" ? (
              <span className="text-slate-900 font-bold shrink-0">{t("allProducts")}</span>
            ) : (
              <Link href="/products" className="hover:text-[#004691] shrink-0 transition-colors">{t("allProducts")}</Link>
            )}
 {selectedCategory !== "all" && !isFeatured && (
 <>
 <span className="shrink-0 text-slate-400">/</span>
 <span className="text-slate-900 font-bold truncate min-w-0">
 {(() => {
 const cat = categories.find(c => c.slug === selectedCategory)
 return cat ? (language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name) : selectedCategory
 })()}
 </span>
 </>
 )}
 </div>

 {/* Header Bar: Category Title + Count + Custom Sort & Filter */}
 <div className="flex flex-row justify-between items-center pb-4 mb-6 border-b border-slate-200 gap-3">
 <div className="min-w-0">
 <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004691] truncate">
 {(() => {
 if (searchQuery) return language === "kh" ? `លទ្ធផលស្វែងរក: "${searchQuery}"` : `Search results: "${searchQuery}"`
 if (isFeatured) return language === "kh" ? "ផលិតផលពិសេស" : "Featured Machines"
 if (selectedCategory === "all") return t("allProducts")
 const cat = categories.find(c => c.slug === selectedCategory)
 if (!cat) return t("allProducts")
 return language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name
 })()}
 </h1>
 </div>

 <div className="flex items-center gap-2 shrink-0 text-sm font-semibold text-slate-700">
 <div className="flex items-center gap-2">
 <span className="hidden sm:inline font-bold text-sm sm:text-base text-slate-800">
 {language === "kh" ? "តម្រៀបតាម" : "Sort by"}:
 </span>
 
 {/* 🤍 Custom White Dropdown Popover */}
 <div className="relative">
 <button
 onClick={() => setSortOpen(!sortOpen)}
 className="flex items-center gap-1.5 py-1.5 px-3 bg-white border border-slate-200 rounded-md text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition-all whitespace-nowrap"
 >
 <span>
 {sortBy === "newest" && (language === "kh" ? "ថ្មីបំផុត" : "Newest")}
 {sortBy === "price_asc" && (language === "kh" ? "តម្លៃ (ទាប→ខ្ពស់)" : "Price ↑")}
 {sortBy === "price_desc" && (language === "kh" ? "តម្លៃ (ខ្ពស់→ទាប)" : "Price ↓")}
 {sortBy === "name_az" && (language === "kh" ? "ឈ្មោះ A-Z" : "Name A-Z")}
 </span>
 <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${sortOpen ? "rotate-180 text-[#004691]" : ""}`} />
 </button>

 <AnimatePresence>
 {sortOpen && (
 <>
 <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
 <motion.div
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 6 }}
 className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-md shadow-xl z-40 py-1.5 overflow-hidden"
 >
 {[
 { value: "newest", label: language === "kh" ? "ថ្មីបំផុត" : "Newest" },
 { value: "price_asc", label: language === "kh" ? "តម្លៃ (ទាប ទៅ ខ្ពស់)" : "Price (Low to High)" },
 { value: "price_desc", label: language === "kh" ? "តម្លៃ (ខ្ពស់ ទៅ ទាប)" : "Price (High to Low)" },
 { value: "name_az", label: language === "kh" ? "ឈ្មោះ A-Z" : "Name A-Z" },
 ].map((option) => (
 <button
 key={option.value}
 onClick={() => {
 setSortBy(option.value)
 setSortOpen(false)
 }}
 className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left font-semibold transition-colors ${
 sortBy === option.value ? "bg-blue-50 text-[#004691] font-bold" : "text-slate-700 hover:bg-slate-50"
 }`}
 >
 <span>{option.label}</span>
 {sortBy === option.value && <Check className="w-4 h-4 text-[#004691]" />}
 </button>
 ))}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>

 {/* Mobile Filter Button */}
 <button 
 onClick={() => setShowFilters(true)}
 className="p-1.5 lg:hidden rounded-md border bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200 transition-all flex items-center gap-1 text-xs sm:text-sm font-bold"
 >
 <Filter className="w-4 h-4 text-[#004691]" />
 <span className="hidden xs:inline">{t("filter") || "Filter"}</span>
 </button>
 </div>
 </div>
 </div>


 <div className="flex flex-col lg:flex-row gap-8">
 {/* Desktop Sidebar Accordion Filters */}
 <aside className="hidden lg:block lg:w-64 shrink-0">
 <div className="bg-white rounded-md border border-slate-200 p-4 sticky top-28 shadow-2xs">
 <h3 className="text-base font-bold text-[#004691] uppercase tracking-wider mb-3 px-2">
 {t("categories")}
 </h3>
 {renderCategoryFilters(false)}
 </div>
 </aside>

 {/* Mobile Filter Side Drawer (Slides from Left) */}
 <AnimatePresence>
 {showFilters && (
 <div className="fixed inset-0 z-[150] lg:hidden">
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
 onClick={() => setShowFilters(false)}
 />

 {/* Sliding Side Drawer */}
 <motion.div
 initial={{ x: "-100%" }}
 animate={{ x: 0 }}
 exit={{ x: "-100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 220 }}
 className="absolute top-0 left-0 bottom-0 w-[290px] bg-white shadow-2xl flex flex-col z-[160]"
 >
 {/* Drawer Header */}
 <div className="p-4 border-b border-slate-100 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Filter className="w-4.5 h-4.5 text-[#004691]" />
 <h3 className="text-base font-bold text-slate-900">
 {t("categories")}
 </h3>
 </div>
 <button
 onClick={() => setShowFilters(false)}
 className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Categories Accordion */}
 <div className="flex-1 overflow-y-auto p-4">
 {renderCategoryFilters(true)}
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* Product Grid */}
 <div className="flex-1">
 {loading ? (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
 {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
 <div key={n} className="aspect-[4/5] bg-white rounded-md border border-slate-100 animate-pulse shadow-sm" />
 ))}
 </div>
 ) : filteredProducts.length === 0 ? (
 <div className="py-32 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
 <div className="w-20 h-20 bg-slate-50 rounded-md flex items-center justify-center mb-6">
 <Package className="w-10 h-10 text-slate-300" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 mb-2">{t("noProductsFound")}</h3>
 <p className="text-slate-400 text-sm max-w-sm">{t("noProductsDescription")}</p>
 </div>
 ) : (() => {
 // Determine if we should group by subcategory
 // Group when: "all" or a specific parent category is selected (not a leaf subcategory)
 const selectedCatObj = categories.find(c => c.slug === selectedCategory)
 const isParentSelected = selectedCategory === "all" || (selectedCatObj && !selectedCatObj.parentId)
 const subCatsOfSelected = selectedCatObj
 ? categories.filter(c => c.parentId === selectedCatObj.id)
 : []
 const shouldGroup = isParentSelected && (selectedCategory === "all" || subCatsOfSelected.length > 0)

 if (!shouldGroup) {
 // Flat grid for a specific subcategory
 return (
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
 {filteredProducts.map((product, idx) => (
 <ProductCard key={product.id} product={product} index={idx} disableAnimation={isRestored} />
 ))}
 </div>
 )
 }

 // Build groups: each parent category that has products under it
 const mainCats = categories.filter(c => !c.parentId)

 // Figure out which cats to group under
 const groupCats = selectedCategory === "all"
 ? mainCats
 : [selectedCatObj!]

 const groups: { cat: any; subLabel: string; products: any[] }[] = []

 groupCats.forEach(parentCat => {
 const subs = categories.filter(c => c.parentId === parentCat.id)

 if (subs.length === 0) {
 // No subcategories — put all products under parent
 const prods = filteredProducts.filter(p =>
 p.categoryId === parentCat.id ||
 p.categorySlug === parentCat.slug ||
 p.category?.slug === parentCat.slug
 )
 if (prods.length > 0) {
 groups.push({ cat: parentCat, subLabel: language === "kh" && parentCat.nameKhmer ? parentCat.nameKhmer : parentCat.name, products: prods })
 }
 } else {
 // Group by each subcategory
 subs.forEach(sub => {
 const prods = filteredProducts.filter(p =>
 p.categoryId === sub.id ||
 p.categorySlug === sub.slug ||
 p.category?.slug === sub.slug
 )
 if (prods.length > 0) {
 groups.push({ cat: sub, subLabel: language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name, products: prods })
 }
 })

 // Removed direct products grouping so they fall into 'Others' fallback
 }
 })

 // Fallback: if grouping left out some products, add them at end
 const groupedIds = new Set(groups.flatMap(g => g.products.map((p: any) => p.id)))
 const ungrouped = filteredProducts.filter(p => !groupedIds.has(p.id))

 const PREVIEW_COUNT = 4 // products shown before "See all"

 return (
 <div className="flex flex-col gap-10">
 {groups.map((group, idx) => {
 const groupKey = group.cat.id + idx
 const isExpanded = expandedGroups.has(groupKey)
 const displayProducts = isExpanded ? group.products : group.products.slice(0, PREVIEW_COUNT)
 const hasMore = group.products.length > PREVIEW_COUNT

 return (
 <div key={groupKey} id={`group-${groupKey}`}>
 {/* ── Subcategory Divider Label ── */}
 <div className="flex items-center gap-3 mb-5">
 <div className="h-[2px] flex-1 bg-slate-300/80 rounded-full" />
 <button
 onClick={() => handleCategorySelect(group.cat.slug)}
 className="flex items-center gap-2 shrink overflow-hidden group max-w-[70%]"
 >
 <span className="text-base sm:text-lg md:text-xl font-bold text-slate-700 group-hover:text-[#004691] transition-colors truncate">
 {group.subLabel}
 </span>
 <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#004691] transition-colors shrink-0" />
 </button>
 <div className="h-[2px] flex-1 bg-slate-300/80 rounded-full" />
 </div>

 {/* Product grid for this group */}
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
 {displayProducts.map((product, idx) => (
 <ProductCard key={product.id} product={product} index={idx} disableAnimation={isRestored} />
 ))}
 </div>

 {/* See all / Collapse button */}
 {hasMore && (
 <div className="mt-4 flex items-center justify-center gap-3">
 <div className="h-px flex-1 bg-slate-200" />
 <button
 onClick={() => {
 if (isExpanded) {
 const el = document.getElementById(`group-${groupKey}`)
 if (el) {
 const y = el.getBoundingClientRect().top + window.scrollY - 150;
 window.scrollTo({ top: y, behavior: 'instant' })
 }
 }
 setExpandedGroups(prev => {
 const next = new Set(prev)
 if (next.has(groupKey)) next.delete(groupKey)
 else next.add(groupKey)
 return next
 })
 }}
 className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] sm:text-xs font-bold text-slate-600 hover:border-[#004691] hover:text-[#004691] transition-all shadow-2xs"
 >
 {isExpanded ? (
 <>{language === "kh" ? "បង្ហាញតិច" : "Show less"}</>
 ) : (
 <>{language === "kh" ? `មើលទាំងអស់ (${group.products.length})` : `See all ${group.products.length}`} <ChevronRight className="w-3 h-3" /></>
 )}
 </button>
 <div className="h-px flex-1 bg-slate-200" />
 </div>
 )}
 </div>
 )
 })}

 {/* Ungrouped fallback */}
 {ungrouped.length > 0 && (() => {
 const isExpanded = expandedGroups.has('ungrouped')
 const displayProducts = isExpanded ? ungrouped : ungrouped.slice(0, PREVIEW_COUNT)
 const hasMore = ungrouped.length > PREVIEW_COUNT

 return (
 <div id="group-ungrouped">
 <div className="flex items-center gap-3 mb-5">
 <div className="h-[2px] flex-1 bg-slate-300/80 rounded-full" />
 <span className="text-base sm:text-lg font-bold text-slate-700 whitespace-nowrap">
 {language === "kh" ? "ផ្សេងទៀត" : "Others"}
 </span>
 <div className="h-[2px] flex-1 bg-slate-300/80 rounded-full" />
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
 {displayProducts.map((product, idx) => (
 <ProductCard key={product.id} product={product} index={idx} disableAnimation={isRestored} />
 ))}
 </div>
 
 {/* See all / Collapse button */}
 {hasMore && (
 <div className="mt-4 flex items-center justify-center gap-3">
 <div className="h-px flex-1 bg-slate-200" />
 <button
 onClick={() => {
 if (isExpanded) {
 const el = document.getElementById('group-ungrouped')
 if (el) {
 const y = el.getBoundingClientRect().top + window.scrollY - 150;
 window.scrollTo({ top: y, behavior: 'instant' })
 }
 }
 setExpandedGroups(prev => {
 const next = new Set(prev)
 if (next.has('ungrouped')) next.delete('ungrouped')
 else next.add('ungrouped')
 return next
 })
 }}
 className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-[11px] sm:text-xs font-bold text-slate-600 hover:border-[#004691] hover:text-[#004691] transition-all shadow-2xs"
 >
 {isExpanded ? (
 <>{language === "kh" ? "បង្ហាញតិច" : "Show less"}</>
 ) : (
 <>{language === "kh" ? `មើលទាំងអស់ (${ungrouped.length})` : `See all ${ungrouped.length}`} <ChevronRight className="w-3 h-3" /></>
 )}
 </button>
 <div className="h-px flex-1 bg-slate-200" />
 </div>
 )}
 </div>
 )
 })()}
 </div>
 )
 })()}
 </div>
 </div>
 </div>
 </main>
 </PublicLayout>
 )
}
