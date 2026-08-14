"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  ChevronRight,
  Star,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
  X,
  LayoutGrid,
  Compass,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";

// Module-level cache to enable instant scroll restoration when navigating back
let _cachedTopCategories: any[] = [];
let _cachedHotProducts: any[] = [];
let _cachedPopularProducts: any[] = [];

const bannerData = [
  {
    src: "/image/banner-1.jpg",
    title: "INDUSTRIAL MACHINERY",
    titleKhmer: "ម៉ាស៊ីនឧស្សាហកម្មគ្រប់ប្រភេទ",
    subtitle: "High-performance industrial equipment for your business needs.",
    subtitleKhmer: "ផ្តល់ជូននូវម៉ាស៊ីនឧស្សាហកម្មគ្រប់ប្រភេទ ធានាគុណភាពខ្ពស់ និងប្រសិទ្ធភាពការងារ។",
    cta: "Explore Now",
    ctaKhmer: "ស្វែងយល់បន្ថែម",
    href: "/products"
  },
  {
    src: "/image/banner-2.jpg",
    title: "GENUINE SPARE PARTS",
    titleKhmer: "គ្រឿងបន្លាស់សុទ្ធ",
    subtitle: "100% authentic parts for maximum reliability.",
    subtitleKhmer: "គ្រឿងបន្លាស់សុទ្ធ 100% សម្រាប់ការប្រើប្រាស់បានយូរអង្វែង",
    cta: "Shop Parts",
    ctaKhmer: "ទិញគ្រឿងបន្លាស់",
    href: "/products/category/spare-parts"
  },
  {
    src: "/image/banner-3.png",
    title: "EXPERT MAINTENANCE",
    titleKhmer: "សេវាកម្មជួសជុលជំនាញ",
    subtitle: "Nationwide service and support you can trust.",
    subtitleKhmer: "សេវាកម្មជួសជុល និងថែទាំទូទាំងប្រទេសដោយទំនុកចិត្ត",
    cta: "Learn More",
    ctaKhmer: "ស្វែងយល់បន្ថែម",
    href: "/contact"
  }
];

function BannerSlider() {
  const [index, setIndex] = useState(0);
  const { language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % bannerData.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={bannerData[index].src}
            alt={`Banner ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-2 sm:mb-4 leading-tight"
            >
              {language === 'kh' ? bannerData[index].titleKhmer : bannerData[index].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-white/90 text-xs sm:text-base md:text-lg font-medium mb-4 sm:mb-8 max-w-xl line-clamp-2"
            >
              {language === 'kh' ? bannerData[index].subtitleKhmer : bannerData[index].subtitle}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              onClick={() => router.push(bannerData[index].href)}
              className="w-fit bg-[#004691] hover:bg-blue-800 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 text-xs sm:text-sm rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
            >
              {language === 'kh' ? bannerData[index].ctaKhmer : bannerData[index].cta} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {bannerData.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all shadow-sm ${
              i === index ? "bg-[#004691] w-6 md:w-8" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
      <button 
        onClick={() => setIndex((prev) => (prev - 1 + bannerData.length) % bannerData.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
      >
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6 rotate-180" />
      </button>
      <button 
        onClick={() => setIndex((prev) => (prev + 1) % bannerData.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity z-10 backdrop-blur-sm"
      >
        <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
      </button>
    </>
  );
}

export default function HomePage() {
  const [topCategories, setTopCategories] =
    useState<any[]>(_cachedTopCategories);
  const [hotProducts, setHotProducts] = useState<any[]>(_cachedHotProducts);
  const [popularProducts, setPopularProducts] = useState<any[]>(
    _cachedPopularProducts,
  );
  const [loading, setLoading] = useState(_cachedPopularProducts.length === 0);
  const [isReady, setIsReady] = useState(_cachedPopularProducts.length > 0);
  const [isRestored] = useState(_cachedPopularProducts.length > 0);
  const [displayLimit, setDisplayLimit] = useState(12);

  const { t, language } = useLanguage();
  const router = useRouter();

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          popularProducts.length > displayLimit
        ) {
          setDisplayLimit((prev) => prev + 12);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, popularProducts.length, displayLimit],
  );

  useEffect(() => {
    async function fetchHomeData() {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/api/public/categories`, { cache: "no-store" }),
          fetch(`${API_URL}/api/public/products`, { cache: "no-store" }),
        ]);

        const catData = catRes.ok ? await catRes.json() : { data: [] };
        const prodData = prodRes.ok ? await prodRes.json() : { data: [] };

        if (catData.data) {
          const mainCats = catData.data.filter((c: any) => !c.parentId);
          _cachedTopCategories = mainCats;
          setTopCategories(mainCats);
        }

        if (prodData.data) {
          const prods = prodData.data;
          const hot = prods.filter((p: any) => p.isFeatured === true);
          const popular = prods.filter((p: any) => !p.isFeatured);
          _cachedHotProducts = hot;
          _cachedPopularProducts = popular;
          setHotProducts(hot);
          setPopularProducts(popular);
        }
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      } finally {
        setLoading(false);
        setIsReady(true);
      }
    }

    fetchHomeData();
    // Small delay to prevent flash/stuck on very first paint only if not cached
    if (_cachedPopularProducts.length === 0) {
      const readyTimer = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(readyTimer);
    }
  }, []);

  // 🎯 Bulletproof Manual Scroll Restoration
  useEffect(() => {
    if (!isReady) return;

    // 1. Check if this was a page refresh
    const navEntries = window.performance.getEntriesByType("navigation");
    const isReload =
      navEntries.length > 0 &&
      (navEntries[0] as PerformanceNavigationTiming).type === "reload";

    if (isReload) {
      sessionStorage.removeItem("ysg_home_scroll");
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      // Restore previous scroll position instantly if navigating back
      const savedScroll = sessionStorage.getItem("ysg_home_scroll");
      if (savedScroll) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedScroll, 10),
            behavior: "instant",
          });
        }, 50);
      }
    }

    // 2. Track scrolling to save for when user hits Back button
    const handleScroll = () => {
      // Prevent Next.js router from overwriting with 0 during page transitions
      if (window.scrollY > 10) {
        sessionStorage.setItem("ysg_home_scroll", window.scrollY.toString());
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="bg-white min-h-screen pb-24 font-sans">
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4 md:pt-6 space-y-6 md:space-y-10">
          {/* Hero skeleton */}
          <div className="rounded-md md:rounded-md bg-slate-100 animate-pulse h-[180px] sm:h-[240px] md:h-[380px]" />
          {/* Category row skeleton */}
          <div className="flex overflow-x-auto gap-3 pb-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="min-w-[96px] flex flex-col items-center gap-2"
              >
                <div className="w-[80px] h-[80px] rounded-full bg-slate-100 animate-pulse" />
                <div className="w-16 h-3 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="rounded-md bg-slate-100 animate-pulse aspect-square"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24 font-sans selection:bg-[#004691]/20">
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4 md:pt-6 relative z-20 space-y-6 md:space-y-10">
        {/* Hero Banner Showcase */}
        <section className="relative rounded-md md:rounded-md overflow-hidden bg-slate-100 h-[180px] sm:h-[240px] md:h-[380px] shadow-2xs border border-slate-200 group">
          <BannerSlider />
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 ">
                {t("categories")}
              </h2>
            </div>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-3 md:gap-6 pb-4 snap-x">
            {loading
              ? [1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="snap-start min-w-[80px] sm:min-w-[100px] md:min-w-[130px] flex flex-col items-center gap-2"
                  >
                    <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[120px] md:h-[120px] bg-slate-100 rounded-full animate-pulse" />
                    <div className="w-14 sm:w-16 h-3 bg-slate-100 rounded animate-pulse" />
                  </div>
                ))
              : topCategories.map((cat, idx) => (
                  <motion.div
                    key={cat.id}
                    initial={isRestored ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isRestored ? 0 : idx * 0.04 }}
                    className="snap-start min-w-[80px] sm:min-w-[100px] md:min-w-[130px]"
                  >
                    <Link
                      href={`/products/category/${cat.slug}`}
                      className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 group"
                    >
                      <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[120px] md:h-[120px] bg-white rounded-full shadow-2xs border border-slate-200 flex items-center justify-center p-2 sm:p-3 md:p-4 group-hover:border-[#004691] transition-all duration-300 overflow-hidden relative">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-50 relative z-10 flex items-center justify-center">
                            <LayoutGrid className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 text-center leading-tight line-clamp-2 w-full px-0.5 group-hover:text-[#004691] transition-colors">
                        {language === "kh" && cat.nameKhmer
                          ? cat.nameKhmer
                          : cat.name}
                      </span>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </section>

        {/* Featured Products Showcase */}
        {(loading || hotProducts.length > 0) && (
          <section className="pt-2 md:pt-4 mb-4 md:mb-8">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <div className="h-6 md:h-8 w-1.5 md:w-2 bg-[#004691] rounded-full"></div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 ">
                  {language === "kh" ? "ផលិតផលពិសេស" : "Featured Machines"}
                </h2>
              </div>
              <Link
                href="/products/featured"
                className="flex items-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
              >
                {language === "kh" ? "មើលទាំងអស់" : "View All"}
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
              {loading
                ? [1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded-md animate-pulse"
                    />
                  ))
                : hotProducts
                    .slice(0, 8)
                    .map((product, idx) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={idx}
                        disableAnimation={isRestored}
                      />
                    ))}
            </div>
          </section>
        )}

        {/* Discover All Products Grid (Limited Initial Count) */}
        <section className="pt-2 md:pt-4">
          <div className="flex items-center justify-between mb-4 md:mb-6 px-1 sm:px-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-[#004691] rounded-md flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 ">
                {language === "kh" ? "រុករកផលិតផល" : "Discover More"}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-4 md:gap-6 -mx-1 sm:mx-0">
            {loading
              ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                  <div
                    key={n}
                    className="aspect-[3/4] bg-slate-50 border border-slate-100 rounded-md animate-pulse"
                  />
                ))
              : popularProducts
                  .slice(0, displayLimit)
                  .map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={idx}
                      disableAnimation={isRestored}
                    />
                  ))}
          </div>

          {/* Infinite Scroll Loader */}
          {!loading && popularProducts.length > displayLimit && (
            <div
              ref={lastElementRef}
              className="mt-10 flex justify-center pb-8"
            >
              <div className="w-8 h-8 border-4 border-[#004691]/30 border-t-[#004691] rounded-full animate-spin" />
            </div>
          )}

          {!loading &&
            popularProducts.length <= displayLimit &&
            popularProducts.length > 0 && (
              <div className="mt-10 flex justify-center pb-8">
                <Link
                  href="/products"
                  className="group bg-[#004691] text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-[#003066] transition-all flex items-center gap-2 shadow-md"
                >
                  <span>
                    {language === "kh"
                      ? "មើលទាំងអស់"
                      : "View All Products Catalog"}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
                </Link>
              </div>
            )}
        </section>
      </div>
    </div>
  );
}
