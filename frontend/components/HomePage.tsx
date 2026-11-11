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
import { getOptimizedImageUrl } from "../lib/imageUtils";

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
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % bannerData.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goPrev = () => setIndex((prev) => (prev - 1 + bannerData.length) % bannerData.length);
  const goNext = () => setIndex((prev) => (prev + 1) % bannerData.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={bannerData[index].src}
            alt={`Banner ${index + 1}`}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/15 sm:via-black/45 sm:to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-12 sm:px-16 md:px-20 pb-5 sm:pb-6 max-w-2xl md:max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-white text-lg sm:text-3xl md:text-4xl lg:text-[44px] font-black uppercase tracking-tight mb-1.5 sm:mb-3 leading-snug sm:leading-tight"
            >
              {language === 'kh' ? bannerData[index].titleKhmer : bannerData[index].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-white/90 text-xs sm:text-sm md:text-base font-medium mb-3.5 sm:mb-6 max-w-md sm:max-w-lg line-clamp-2 leading-relaxed"
            >
              {language === 'kh' ? bannerData[index].subtitleKhmer : bannerData[index].subtitle}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onClick={() => router.push(bannerData[index].href)}
              className="w-fit bg-[#004691] hover:bg-[#003570] text-white font-bold py-2 px-4 sm:py-2.5 sm:px-6 md:py-3 md:px-7 text-xs sm:text-sm rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <span>{language === 'kh' ? bannerData[index].ctaKhmer : bannerData[index].cta}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10">
        {bannerData.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 sm:h-2 rounded-full transition-all shadow-sm cursor-pointer ${
              i === index
                ? "bg-white w-5 sm:w-7"
                : "bg-white/45 hover:bg-white/75 w-1.5 sm:w-2"
            }`}
          />
        ))}
      </div>

      {/* Previous / Next Controls */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={goPrev}
        className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center opacity-80 sm:opacity-70 group-hover:opacity-100 transition-all z-10 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={goNext}
        className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center opacity-80 sm:opacity-70 group-hover:opacity-100 transition-all z-10 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
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
    // Hydrate instantly from sessionStorage snapshot if module cache is empty (e.g., hard reload)
    if (_cachedPopularProducts.length === 0 && typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("ysg_home_cache_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed?.categories) && parsed.categories.length > 0) {
            _cachedTopCategories = parsed.categories;
            setTopCategories(parsed.categories);
          }
          if (Array.isArray(parsed?.hot) && Array.isArray(parsed?.popular) && parsed.popular.length > 0) {
            _cachedHotProducts = parsed.hot;
            _cachedPopularProducts = parsed.popular;
            setHotProducts(parsed.hot);
            setPopularProducts(parsed.popular);
            setLoading(false);
            setIsReady(true);
          }
        }
      } catch {}
    }

    async function fetchHomeData() {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      try {
        const safeFetch = async (url: string) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return { data: [] };
            return await res.json();
          } catch {
            return { data: [] };
          }
        };

        const [catData, prodData] = await Promise.all([
          safeFetch(`${API_URL}/api/public/categories`),
          safeFetch(`${API_URL}/api/public/products`),
        ]);

        let nextCats = _cachedTopCategories;
        let nextHot = _cachedHotProducts;
        let nextPopular = _cachedPopularProducts;

        if (catData?.data && Array.isArray(catData.data) && catData.data.length > 0) {
          nextCats = catData.data.filter((c: any) => !c.parentId);
          _cachedTopCategories = nextCats;
          setTopCategories(nextCats);
        }

        if (prodData?.data && Array.isArray(prodData.data) && prodData.data.length > 0) {
          const prods = prodData.data;
          nextHot = prods.filter((p: any) => p.isFeatured === true);
          nextPopular = prods.filter((p: any) => !p.isFeatured);
          _cachedHotProducts = nextHot;
          _cachedPopularProducts = nextPopular;
          setHotProducts(nextHot);
          setPopularProducts(nextPopular);
        }

        if (typeof window !== "undefined" && (nextCats.length > 0 || nextPopular.length > 0)) {
          try {
            sessionStorage.setItem(
              "ysg_home_cache_v1",
              JSON.stringify({ categories: nextCats, hot: nextHot, popular: nextPopular })
            );
          } catch {}
        }
      } catch {
        // Quietly fallback to existing cached categories/products
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

    // 2. Debounce scroll persistence so synchronous sessionStorage writes never stutter scrolling
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (window.scrollY > 10) {
          sessionStorage.setItem("ysg_home_scroll", window.scrollY.toString());
        }
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [isReady]);

  if (!isReady) {
    return (
      <div className="bg-white min-h-screen pb-24 font-sans">
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4 md:pt-6 space-y-6 md:space-y-10">
          {/* Hero skeleton */}
          <div className="rounded-xl bg-slate-100 animate-pulse h-[230px] sm:h-[300px] md:h-[360px] lg:h-[400px]" />
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
        <section className="relative rounded-xl overflow-hidden bg-slate-100 h-[230px] sm:h-[300px] md:h-[360px] lg:h-[400px] shadow-2xs border border-slate-200 group">
          <BannerSlider />
        </section>

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-slate-400" />
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 ">
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
                          src={getOptimizedImageUrl(cat.image, 'thumb')}
                          alt={cat.name}
                          loading="lazy"
                          className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-50 relative z-10 flex items-center justify-center">
                          <LayoutGrid className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm md:text-[15px] font-medium text-slate-700 text-center leading-tight line-clamp-2 w-full px-0.5 group-hover:text-[#004691] transition-colors">
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
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 ">
                  {t("featuredEquipment") || "Featured Machines"}
                </h2>
              </div>
              <Link
                href="/products/featured"
                className="flex items-center gap-1 md:gap-2 text-[11px] sm:text-xs md:text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"
              >
                {t("viewAll") || "View All"}
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
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 ">
                {t("discoverMore") || "Discover More"}
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
                    {t("viewAllProductsCatalog") || "View All Products Catalog"}
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
