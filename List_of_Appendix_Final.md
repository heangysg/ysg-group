បញ្ជីឧបសម្ព័ន្ធ 
(List of Appendix)
ឧបសម្ព័ន្ធ ក
ការបង្កើត Table ក្នុង PostgreSQL (Supabase)
ក.១ Database Table
រូបភាព ក.១ Table User (អ្នកប្រើប្រាស់)
(បញ្ចូលរូបថត Table User ពី Supabase នៅទីនេះ)
រូបភាព ក.២ Table Role (តួនាទី)
(បញ្ចូលរូបថត Table Role ពី Supabase នៅទីនេះ)
រូបភាព ក.៣ Table Category (ប្រភេទផលិតផល)
(បញ្ចូលរូបថត Table Category ពី Supabase នៅទីនេះ)
រូបភាព ក.៤ Table Subcategory (ប្រភេទរងផលិតផល)
(បញ្ចូលរូបថត Table Subcategory ពី Supabase នៅទីនេះ)
រូបភាព ក.៥ Table Product (ផលិតផល/ម៉ាស៊ីន)
(បញ្ចូលរូបថត Table Product ពី Supabase នៅទីនេះ)
រូបភាព ក.៦ Table ProductDetail (ព័ត៌មានលម្អិតផលិតផល)
(បញ្ចូលរូបថត Table ProductDetail ពី Supabase នៅទីនេះ)
រូបភាព ក.៧ Table ProductImage (រូបភាពផលិតផល)
(បញ្ចូលរូបថត Table ProductImage ពី Supabase នៅទីនេះ)
រូបភាព ក.៨ Table Order (ការបញ្ជាទិញ)
(បញ្ចូលរូបថត Table Order ពី Supabase នៅទីនេះ)
រូបភាព ក.៩ Table Inquiry (ការសាកសួរព័ត៌មាន)
(បញ្ចូលរូបថត Table Inquiry ពី Supabase នៅទីនេះ)
រូបភាព ក.១០ Table ContactMessage (សារទំនាក់ទំនង)
(បញ្ចូលរូបថត Table ContactMessage ពី Supabase នៅទីនេះ)
រូបភាព ក.១១ Table Page (ទំព័រគេហទំព័រ)
(បញ្ចូលរូបថត Table Page ពី Supabase នៅទីនេះ)
រូបភាព ក.១២ Table AuditLog (កំណត់ត្រាសកម្មភាព)
(បញ្ចូលរូបថត Table AuditLog ពី Supabase នៅទីនេះ)
រូបភាព ក.១៣ Table Setting (ការកំណត់ប្រព័ន្ធ)
(បញ្ចូលរូបថត Table Setting ពី Supabase នៅទីនេះ)

ឧបសម្ព័ន្ធ ខ
ការសរសេរកូដ (Coding)

ខ.១ ទំព័រដើម (Home Page)
រូបភាព ខ.១ ទំព័រដើម (Home Page)
(បញ្ចូលរូបថត Screenshot ទំព័រដើម Website នៅទីនេះ)

• កូដផ្នែកខាងមុខ (Front-End)
```tsx
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

let _cachedTopCategories: any[] = [];
let _cachedHotProducts: any[] = [];
let _cachedPopularProducts: any[] = [];

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

    if (_cachedPopularProducts.length === 0) {
      const readyTimer = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(readyTimer);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const navEntries = window.performance.getEntriesByType("navigation");
    const isReload =
      navEntries.length > 0 &&
      (navEntries[0] as PerformanceNavigationTiming).type === "reload";

    if (isReload) {
      sessionStorage.removeItem("ysg_home_scroll");
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {

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

    const handleScroll = () => {

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
          
          <div className="rounded-md md:rounded-md bg-slate-100 animate-pulse h-[180px] sm:h-[240px] md:h-[380px]" />
          
          <div className="flex overflow-x-auto gap-3 pb-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="min-w-[96px] flex flex-col items-center gap-2"
              >
                <div className="w-[80px] h-[80px] rounded-md bg-slate-100 animate-pulse" />
                <div className="w-16 h-3 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
          
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
        
        <section className="relative rounded-md md:rounded-md overflow-hidden bg-slate-100 h-[180px] sm:h-[240px] md:h-[380px] shadow-2xs border border-slate-200 flex items-center justify-center">
          <img
            src="/banner.png"
            alt="Banner"
            className="w-full h-full object-cover"
            onError={(e) => {

              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.innerHTML =
                '<div class="text-slate-400 font-bold">Please place banner.png in the public folder</div>';
            }}
          />
        </section>

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
                    <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[120px] md:h-[120px] bg-slate-100 rounded-md md:rounded-md animate-pulse" />
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
                      <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] md:w-[120px] md:h-[120px] bg-white rounded-md md:rounded-md shadow-2xs border border-slate-200 flex items-center justify-center p-2 sm:p-3 md:p-4 group-hover:border-[#004691] transition-all duration-300 overflow-hidden relative">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full rounded-md bg-gradient-to-br from-slate-100 to-slate-50 relative z-10 flex items-center justify-center">
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

```

ខ.២ Form Login
រូបភាព ខ.២ Form Login
(បញ្ចូលរូបថត Screenshot Form Login នៅទីនេះ)

• កូដផ្នែកខាងមុខ (Front-End)
```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, ArrowRight } from "lucide-react"
import { logActivity } from "../../../lib/audit"
import { motion } from "framer-motion"

export default function AdminLogin() {
 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [error, setError] = useState("")
 const [loading, setLoading] = useState(false)
 const router = useRouter()

 const handleLogin = async (e: React.FormEvent) => {
   e.preventDefault()
   setLoading(true)
   setError("")

   try {
     const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
     const res = await fetch(`${API_URL}/api/admin/login`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ email, password })
     })
     const data = await res.json()

     if (!res.ok) {
       setError(data.error || "Login failed")
     } else {
       localStorage.setItem("ysg_admin_user", JSON.stringify(data.user))
       localStorage.setItem("ysg_admin_token", data.token)
       
       try {
         await logActivity({
           action: "login",
           entityType: "auth",
           details: { email: data.user.email, role: data.user.isSuperAdmin ? "Superadmin" : "Admin" }
         })
       } catch (e) {}

       router.push("/admin/dashboard")
     }
   } catch (err) {
     setError("An error occurred during login")
   }

   setLoading(false)
 }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          
          <div className="bg-white p-8 sm:p-10 rounded-md shadow-sm border border-slate-200">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="YSG Icon" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-md" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                អ្នកគ្រប់គ្រងជាន់ខ្ពស់
              </h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base mt-2">
                វិបផតថលគ្រប់គ្រង
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 font-bold text-xs sm:text-sm mb-6 rounded-md border border-red-100 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                    អ៊ីមែល
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                    ពាក្យសម្ងាត់
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm sm:text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ចូលគណនី</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <div className="text-center py-4 text-xs font-semibold text-slate-400">
        &copy; {new Date().getFullYear()} Yeung Shi Group Management System
      </div>
    </div>
  )
}

```

• កូដផ្នែកខាងក្រោយ (Back-End)
```typescript
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPgClient } from '../lib/db';

const router = Router();

router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { email, password } = req.body;
    
    if (!email || typeof email !== 'string' || email.length > 255) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }
    
    if (!password || typeof password !== 'string' || password.length > 255) {
      res.status(400).json({ error: "Invalid password format" });
      return;
    }
    pgClient = await getPgClient();

    const { rows } = await pgClient.query('SELECT * FROM "User" WHERE email = $1 LIMIT 1', [email]);
    const user = rows[0];

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
      
      if (isMatch) {
        const hashedPw = await bcrypt.hash(password, 10);
        await pgClient.query('UPDATE "User" SET password = $1 WHERE id = $2', [hashedPw, user.id]);
      }
    }

    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isSuperAdmin: user.isSuperAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
        avatar: user.avatar,
        image: user.image
      }
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (pgClient) await pgClient.release();
  }
});
```

ខ.៣ Form បញ្ជាទិញ (Order/Checkout)
រូបភាព ខ.៣ Form បញ្ជាទិញ
(បញ្ចូលរូបថត Screenshot Form បញ្ជាទិញ នៅទីនេះ)

• កូដផ្នែកខាងមុខ (Front-End)
```tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../../contexts/CartContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PublicLayout from "../../components/PublicLayout"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, Truck, User, Phone, MapPin, Package, Check, ArrowRight, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { getValidImages, getOptimizedImageUrl } from "../../lib/imageUtils"

export default function CheckoutPage() {
 const { items, cartTotal, removeFromCart, updateQuantity, clearCart, isLoaded } = useCart()
 const { t, language } = useLanguage()
 const router = useRouter()
 const [loading, setLoading] = useState(false)
 const [formData, setFormData] = useState({
 customerName: "",
 customerPhone: "",
 customerEmail: "",
 address: "",
 paymentMethod: "Bakong"
 })

 useEffect(() => {
 const fetchUser = async () => {
 const supabase = createClient()
 const { data: { user } } = await supabase.auth.getUser()
 if (user) {
 setFormData(prev => ({
 ...prev,
 customerName: user.user_metadata?.full_name || prev.customerName,
 customerPhone: user.user_metadata?.phone || prev.customerPhone,
 customerEmail: user.email || prev.customerEmail
 }))
 }
 }
 fetchUser()
 }, [])

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target
 setFormData(prev => ({ ...prev, [name]: value }))
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!formData.customerName || !formData.customerPhone || !formData.address) {
 toast.error(language === "kh" ? "សូមបំពេញព័ត៌មានដែលបានតម្រូវ" : "Please fill in all required fields")
 return
 }

 setLoading(true)
 try {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const response = await fetch(`${API_URL}/api/orders/checkout`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 ...formData,
 items: items.map(item => ({
 id: item.id,
 slug: item.slug,
 name: item.name,
 price: item.price,
 quantity: item.quantity
 }))
 })
 })

 const data = await response.json()

 if (response.ok && data.order) {
 clearCart()
 toast.success(language === "kh" ? "ការបញ្ជាទិញបានជោគជ័យ!" : "Order placed successfully!")
 router.push(`/orders/${data.order.id}`)
 } else {
 toast.error(data.error || (language === "kh" ? "មានបញ្ហាក្នុងការបញ្ជាទិញ" : "Failed to place order"))
 }
 } catch (err: any) {
 console.error("Checkout Error:", err)
 toast.error(language === "kh" ? "មានបញ្ហាក្នុងការបញ្ជាទិញ" : "Failed to process checkout")
 } finally {
 setLoading(false)
 }
 }

 if (isLoaded && items.length === 0) {
 return (
 <PublicLayout>
 <div className="bg-white min-h-screen pt-16 sm:pt-20 md:pt-12 pb-32 font-sans">
 <div className="max-w-2xl mx-auto px-4 text-center">
 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-center mx-auto mb-5 shadow-2xs">
 <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
 </div>
 <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2">
 {language === "kh" ? "កន្ត្រកទំនិញរបស់អ្នកទទេ" : "Your cart is empty"}
 </h1>
 <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
 {language === "kh" ? "សូមជ្រើសរើសផលិតផល និងបន្ថែមទៅកន្ត្រកដើម្បីបន្តទូទាត់" : "Browse our inventory and add items to your cart before checking out."}
 </p>
 <Link
 href="/products"
 className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#004691] hover:bg-[#003366] text-white font-bold rounded-md text-xs sm:text-sm transition-all shadow-2xs active:scale-95"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>{language === "kh" ? "រុករកផលិតផល" : "Browse Products"}</span>
 </Link>
 </div>
 </div>
 </PublicLayout>
 )
 }

 return (
 <PublicLayout>
 <Toaster position="top-center" />
 <div className="bg-white min-h-screen pb-24 pt-4 md:pt-6 font-sans">
 <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">

 <div className="flex items-center gap-2 text-sm sm:text-base text-slate-600 font-medium mb-4 overflow-hidden whitespace-nowrap">
 <Link href="/" className="hover:text-[#004691] shrink-0 transition-colors">{t("home")}</Link>
 <span className="shrink-0 text-slate-400">/</span>
 <Link href="/cart" className="hover:text-[#004691] shrink-0 transition-colors">{language === "kh" ? "កន្ត្រកទំនិញ" : "Cart"}</Link>
 <span className="shrink-0 text-slate-400">/</span>
 <span className="text-slate-900 font-bold truncate min-w-0">{language === "kh" ? "ការទូទាត់ប្រាក់" : "Checkout"}</span>
 </div>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200">
 <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#004691] ">
 {language === "kh" ? "ការទូទាត់ប្រាក់" : "Checkout"}
 </h1>
 <span className="text-xs sm:text-sm font-semibold text-slate-500">
 {items.length} {language === "kh" ? "មុខទំនិញ" : "items in cart"}
 </span>
 </div>

 <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

 <div className="lg:col-span-7 space-y-4 sm:space-y-6">

 <div className="bg-slate-50 border border-slate-200 rounded-md p-4 sm:p-8 space-y-4 sm:space-y-5 shadow-2xs">
 <div className="flex items-center gap-3 border-b border-slate-200 pb-3 sm:pb-4">
 <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 text-[#004691] rounded-md flex items-center justify-center font-bold shrink-0">
 <User className="w-4 h-4 sm:w-5 sm:h-5" />
 </div>
 <div>
 <h2 className="text-base sm:text-lg font-bold text-slate-900">
 {language === "kh" ? "ព័ត៌មានអតិថិជន និងការដឹកជញ្ជូន" : "Customer & Delivery Details"}
 </h2>
 <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
 {language === "kh" ? "សូមបញ្ចូលព័ត៌មានទំនាក់ទំនងរបស់អ្នកសម្រាប់ការដឹកជញ្ជូន" : "Enter your contact info for order delivery"}
 </p>
 </div>
 </div>

 <div className="space-y-3 sm:space-y-4 pt-1">
 
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 block">
 {language === "kh" ? "ឈ្មោះពេញ *" : "Full Name *"}
 </label>
 <div className="relative">
 <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 name="customerName"
 required
 value={formData.customerName}
 onChange={handleInputChange}
 placeholder={language === "kh" ? "បញ្ចូលឈ្មោះរបស់អ្នក" : "e.g. Sok Dara"}
 className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 transition-all"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 block">
 {language === "kh" ? "លេខទូរស័ព្ទ *" : "Phone Number *"}
 </label>
 <div className="relative">
 <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
 <input
 type="tel"
 name="customerPhone"
 required
 value={formData.customerPhone}
 onChange={handleInputChange}
 placeholder="e.g. 012 345 678"
 className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 transition-all"
 />
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 block">
 {language === "kh" ? "អ៊ីមែល (មិនបាច់បំពេញក៏បាន)" : "Email Address (Optional)"}
 </label>
 <div className="relative">
 <input
 type="email"
 name="customerEmail"
 value={formData.customerEmail}
 onChange={handleInputChange}
 placeholder="e.g. client@example.com"
 className="w-full px-4 py-3 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 transition-all"
 />
 </div>
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-slate-700 block">
 {language === "kh" ? "អាសយដ្ឋានដឹកជញ្ជូន *" : "Delivery Address *"}
 </label>
 <div className="relative">
 <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
 <textarea
 name="address"
 required
 rows={3}
 value={formData.address}
 onChange={handleInputChange}
 placeholder={language === "kh" ? "ផ្ទះលេខ ផ្លូវ សង្កាត់ ខណ្ឌ រាជធានី/ខេត្ត" : "House/Street, Sangkat, Khan, City/Province"}
 className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/20 transition-all resize-none"
 />
 </div>
 </div>
 </div>
 </div>

 <div className="bg-slate-50 border border-slate-200 rounded-md p-4 sm:p-8 space-y-4 shadow-2xs">
 <div className="flex items-center gap-3 border-b border-slate-200 pb-3 sm:pb-4">
 <div className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-50 text-[#E1232E] rounded-md flex items-center justify-center font-bold shrink-0">
 <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
 </div>
 <div>
 <h2 className="text-base sm:text-lg font-bold text-slate-900">
 {language === "kh" ? "វិធីសាស្ត្រទូទាត់ប្រាក់" : "Payment Method"}
 </h2>
 <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
 {language === "kh" ? "ជ្រើសរើសវិធីសាស្ត្រទូទាត់ប្រាក់ដែលអ្នកពេញចិត្ត" : "Select your preferred payment method"}
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
 
 <label
 onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "Bakong" }))}
 className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-md border-2 cursor-pointer transition-all ${
 formData.paymentMethod === "Bakong"
 ? "bg-[#E1232E]/5 border-[#E1232E] shadow-2xs"
 : "bg-white border-slate-200 hover:border-slate-300"
 }`}
 >
 <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#E1232E] rounded-md flex items-center justify-center shrink-0">
 <img src="/logo/KHQR Logo.png" alt="KHQR" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
 </div>
 <div className="flex-1 min-w-0">
 <span className="text-xs font-bold text-slate-900 block">
 {language === "kh" ? "បាគង KHQR" : "Bakong KHQR"}
 </span>
 <span className="text-[10px] text-slate-500 font-semibold block">
 {language === "kh" ? "ស្កេនទូទាត់ជាមួយកម្មវិធីធនាគារ" : "Scan with any KHQR App"}
 </span>
 </div>
 <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
 formData.paymentMethod === "Bakong" ? "border-[#E1232E] bg-[#E1232E]" : "border-slate-300"
 }`}>
 {formData.paymentMethod === "Bakong" && <Check className="w-3 h-3 text-white stroke-[3]" />}
 </div>
 </label>

 <label
 onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "Cash" }))}
 className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-md border-2 cursor-pointer transition-all ${
 formData.paymentMethod === "Cash"
 ? "bg-blue-50/70 border-[#004691] shadow-2xs"
 : "bg-white border-slate-200 hover:border-slate-300"
 }`}
 >
 <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 text-[#004691] rounded-md flex items-center justify-center shrink-0 font-bold">
 <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
 </div>
 <div className="flex-1 min-w-0">
 <span className="text-xs font-bold text-slate-900 block">
 {language === "kh" ? "ទូទាត់ពេលប្រគល់" : "Cash / Transfer"}
 </span>
 <span className="text-[10px] text-slate-500 font-semibold block">
 {language === "kh" ? "ទូទាត់ប្រាក់ពេលទទួលបានទំនិញ" : "Pay upon order confirmation"}
 </span>
 </div>
 <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
 formData.paymentMethod === "Cash" ? "border-[#004691] bg-[#004691]" : "border-slate-300"
 }`}>
 {formData.paymentMethod === "Cash" && <Check className="w-3 h-3 text-white stroke-[3]" />}
 </div>
 </label>
 </div>
 </div>
 </div>

 <div className="lg:col-span-5 space-y-6">
 <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xs lg:sticky lg:top-24">
 <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
 {language === "kh" ? "សេចក្តីសង្ខេបការបញ្ជាទិញ" : "Order Summary"}
 </h2>

 <div className="divide-y divide-slate-100 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
 {items.map((item) => (
 <div key={item.id} className="py-2.5 sm:py-3 flex items-center gap-3">
 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 border border-slate-200 rounded-md p-1 shrink-0 flex items-center justify-center overflow-hidden">
 {getValidImages(item)[0] ? (
 <img src={getOptimizedImageUrl(getValidImages(item)[0], 'thumb')} alt={item.name} className="w-full h-full object-contain" />
 ) : (
 <Package className="w-4 h-4 text-slate-400" />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold text-slate-900 truncate">
 {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
 </p>
 <span className="text-[11px] text-slate-500 font-semibold block">
 ${item.price?.toLocaleString()} × {item.quantity}
 </span>
 </div>
 <span className="text-xs font-bold text-red-600 shrink-0">
 ${(item.price * item.quantity).toLocaleString()}
 </span>
 </div>
 ))}
 </div>

 <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs sm:text-sm font-semibold text-slate-600">
 <div className="flex justify-between">
 <span>{language === "kh" ? "សរុបរង (Subtotal):" : "Subtotal:"}</span>
 <span className="font-bold text-slate-900">${cartTotal.toLocaleString()}</span>
 </div>
 <div className="flex justify-between">
 <span>{language === "kh" ? "ថ្លៃដឹកជញ្ជូន:" : "Shipping:"}</span>
 <span className="text-emerald-600 font-bold">{language === "kh" ? "ឥតគិតថ្លៃ / ពិភាក្សា" : "Free / Discussed"}</span>
 </div>
 <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-base sm:text-lg">
 <span className="font-bold text-slate-900">{language === "kh" ? "សរុបចុងក្រោយ:" : "Total:"}</span>
 <span className="font-bold text-[#004691] text-xl sm:text-2xl">${cartTotal.toLocaleString()}</span>
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full py-3.5 sm:py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {loading ? (
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
 ) : (
 <>
 <span>{language === "kh" ? "បញ្ជាក់ការបញ្ជាទិញ" : "Place Order Now"}</span>
 <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
 </>
 )}
 </button>

 <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400 pt-0.5">
 <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
 <span>{language === "kh" ? "ការទូទាត់ប្រកបដោយសុវត្ថិភាព ១០០%" : "100% Encrypted & Secure Checkout"}</span>
 </div>
 </div>
 </div>

 </form>

 </div>
 </div>
 </PublicLayout>
 )
}

```

• កូដផ្នែកខាងក្រោយ (Back-End)
```typescript
import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase } from '../lib/supabase';
import { getPgClient } from '../lib/db';

const router = Router();

router.post('/checkout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, customerPhone, customerEmail, address, paymentMethod, items } = req.body;

    if (!customerName || String(customerName).length > 100) return res.status(400).json({ error: "Invalid or overly long customer name (max 100)" }) as any;
    if (!customerPhone || String(customerPhone).length > 20) return res.status(400).json({ error: "Invalid or overly long phone number (max 20)" }) as any;
    if (customerEmail && String(customerEmail).length > 100) return res.status(400).json({ error: "Overly long email (max 100)" }) as any;
    if (!address || String(address).length > 500) return res.status(400).json({ error: "Invalid or overly long address (max 500)" }) as any;
    if (!paymentMethod || String(paymentMethod).length > 50) return res.status(400).json({ error: "Invalid payment method" }) as any;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "No items provided" });
      return;
    }

    if (items.length > 50) {
      res.status(400).json({ error: "Too many items in a single order (Max 50 allowed)." });
      return;
    }

    let totalAmount = 0;
    const validatedItems = [];

    const pgClient = await getPgClient();
    try {
      const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));

      for (const item of items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          res.status(400).json({ error: `Invalid quantity detected for item: ${item.name || item.id}` });
          return;
        }

        const identifier = item.id || item.slug;
        let product = null;

        if (isUUID(identifier)) {
          const { rows } = await pgClient.query('SELECT id, name, price, thumbnail FROM "Product" WHERE id = $1 LIMIT 1', [identifier]);
          product = rows[0];
        }

        if (!product) {
          const { rows } = await pgClient.query('SELECT id, name, price, thumbnail FROM "Product" WHERE slug = $1 LIMIT 1', [identifier]);
          product = rows[0];
        }
          
        if (!product) {
           res.status(404).json({ error: `Product not found: ${item.name || identifier}` });
           return;
        }

        if (product.price === null || product.price === undefined || product.price <= 0) {
           res.status(400).json({ error: `Product '${product.name}' cannot be purchased directly. Please submit an inquiry for a custom quote.` });
           return;
        }

        totalAmount += product.price * item.quantity;
        validatedItems.push({
          ...item,
          price: product.price,
          image: product.thumbnail || item.image
        });
      }

      if (totalAmount <= 0) {
        res.status(400).json({ error: "Order total must be greater than zero" });
        return;
      }

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const shortId = Array.from({ length: 10 }, () => alphabet.charAt(crypto.randomInt(0, alphabet.length))).join('');
      
      const query = `
        INSERT INTO "Order" (id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING *;
      `;
      const values = [
        shortId, 
        customerName, 
        customerPhone, 
        customerEmail || null, 
        address, 
        paymentMethod, 
        totalAmount, 
        JSON.stringify(validatedItems), 
        "pending"
      ];
      
      const result = await pgClient.query(query, values);
      const newOrder = result.rows[0];
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (botToken && chatId) {
        const itemsText = validatedItems.map(i => `- ${i.name} (x${i.quantity}) - $${(i.price * i.quantity).toFixed(2)}`).join('\n');
        const tgText = `️ *ការបញ្ជាទិញថ្មី (NEW ORDER)* ️\n\n*Order ID:* \`${newOrder.id}\`\n*Customer:* ${customerName}\n*Phone:* ${customerPhone}\n*Payment:* ${paymentMethod}\n*Total:* $${totalAmount.toFixed(2)}\n\n*Items:*\n${itemsText}`;
        
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: tgText, parse_mode: 'Markdown' })
        }).catch(err => console.error("Telegram Order Alert Error:", err));
      }

      res.json({ order: newOrder });
    } finally {
      await pgClient.release();
    }
    
  } catch (err: any) {
    console.error("Checkout Error:", err);
    res.status(500).json({ error: "Failed to process checkout" });
  }
});

router.get('/user/find', async (req: Request, res: Response): Promise<void> => {
  const email = (req.query.email as string || '').trim();
  const phone = (req.query.phone as string || '').trim();
  const userId = (req.query.userId as string || '').trim();

  if (!email && !phone && !userId) {
    res.json({ data: [] });
    return;
  }

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE ($1 <> '' AND "customerEmail" ILIKE $1)
         OR ($2 <> '' AND "customerPhone" = $2)
         OR ($3 <> '' AND id = $3)
      ORDER BY "createdAt" DESC
    `;
    const { rows } = await pgClient.query(query, [email, phone, userId]);
    res.json({ data: rows });
  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch user orders" });
  } finally {
    await pgClient.release();
  }
});

router.get('/user/:identifier', async (req: Request, res: Response): Promise<void> => {
  const { identifier } = req.params;
  
  if (!identifier || typeof identifier !== 'string') {
    res.status(400).json({ error: "Invalid user identifier" });
    return;
  }

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE "customerEmail" ILIKE $1 OR "customerPhone" = $1 OR id = $1
      ORDER BY "createdAt" DESC
    `;
    const { rows } = await pgClient.query(query, [identifier]);
    
    res.json({ data: rows });
  } catch (error) {
    console.error("Fetch User Orders Error:", error);
    res.status(500).json({ error: "Failed to fetch user orders" });
  } finally {
    await pgClient.release();
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE id = $1 
      LIMIT 1
    `;
    const { rows } = await pgClient.query(query, [id]);
    
    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Fetch Order Error:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  } finally {
    await pgClient.release();
  }
});

router.post('/track', async (req: Request, res: Response): Promise<void> => {
  const { orderId, phone } = req.body;
  
  if (!orderId || !phone) {
    res.status(400).json({ error: "Order ID and Phone number are required" });
    return;
  }

  const pgClient = await getPgClient();
  try {
    const query = `
      SELECT id, "customerName", "customerPhone", "customerEmail", address, "paymentMethod", "totalAmount", items, status, "createdAt"
      FROM "Order" 
      WHERE id = $1 AND "customerPhone" = $2
      LIMIT 1
    `;
    const { rows } = await pgClient.query(query, [orderId, phone]);
    
    if (rows.length === 0) {
      res.status(404).json({ error: "Order not found or phone number does not match." });
      return;
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Track Order Error:", error);
    res.status(500).json({ error: "Failed to track order" });
  } finally {
    await pgClient.release();
  }
});

export default router;

```

ខ.៤ ទំព័រគ្រប់គ្រងផលិតផល (Admin Product Management)
រូបភាព ខ.៤ ទំព័រគ្រប់គ្រងផលិតផល
(បញ្ចូលរូបថត Screenshot ទំព័រគ្រប់គ្រងផលិតផល នៅទីនេះ)

• កូដផ្នែកខាងមុខ (Front-End)
```tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { logActivity } from "../../../lib/audit"
import { Plus, Eye, Edit, Trash2, Search, Filter, Package, ChevronRight, MoreHorizontal, X } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminProducts() {
 const [products, setProducts] = useState<any[]>([])
 const [categories, setCategories] = useState<any[]>([])
 const [search, setSearch] = useState("")
 const [selectedCategory, setSelectedCategory] = useState("")
 const [statusFilter, setStatusFilter] = useState("all")
 const [loading, setLoading] = useState(true)
 const [currentPage, setCurrentPage] = useState(1)
 const [totalPages, setTotalPages] = useState(1)
 const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null)
 const [selectedProducts, setSelectedProducts] = useState<string[]>([])
 const [bulkActionLoading, setBulkActionLoading] = useState(false)
 const { t, language } = useLanguage()

 useEffect(() => {
 async function initialFetch() {
 setLoading(true)
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const token = localStorage.getItem("ysg_admin_token")
 const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
 try {
 const catRes = await fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Category", order: { column: "sortOrder", ascending: true } }) }).then(r => r.json())
 setCategories(catRes.data || [])
 await fetchProducts(1)
 } catch (err) {
 console.error("Initial Fetch Error:", err)
 } finally {
 setLoading(false)
 }
 }
 initialFetch()
 }, [])

 useEffect(() => {
 setCurrentPage(1)
 if (!loading) {
 fetchProducts(1)
 }
 }, [search, selectedCategory, statusFilter])

 useEffect(() => {
 if (!loading) {
 fetchProducts(currentPage)
 }
 }, [currentPage])

 async function fetchProducts(page: number) {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const token = localStorage.getItem("ysg_admin_token")
 const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
 const pageSize = 10
 const start = (page - 1) * pageSize

 const body: any = {
 table: "Product",
 countExact: true,
 order: { column: "createdAt", ascending: false },
 limit: pageSize,
 offset: start
 }
 
 if (search) {
 body.or = `name.ilike.%${search}%,nameKhmer.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`
 }
 if (selectedCategory) {
 body.eq = body.eq || {}
 body.eq.categoryId = selectedCategory
 }
 
 if (statusFilter === "published") {
 body.eq = body.eq || {}
 body.eq.isPublished = true
 } else if (statusFilter === "hidden") {
 body.eq = body.eq || {}
 body.eq.isPublished = false
 }
 body.eq = body.eq || {}
 body.eq.isActive = true

 const res = await fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify(body) })
 const { data, count } = await res.json()
 setProducts(data || [])
 if (count !== null && count !== undefined) {
 setTotalPages(Math.ceil(count / pageSize) || 1)
 }
 }

 async function deleteProduct(id: string, name: string) {
 const token = localStorage.getItem("ysg_admin_token")
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const res = await fetch(`${API_URL}/api/admin/crud`, {
 method: "POST",
 headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
 body: JSON.stringify({ 
 table: "Product", 
 action: "update", 
 match: { id },
 data: { isActive: false }
 })
 })
 setDeleteConfirm(null)
 if (!res.ok) {
 toast.error("Failed to move product to trash")
 } else {
 await logActivity({ action: "delete", entityType: "product", entityId: id, details: { name, type: "soft_delete" } })
 toast.success("Product moved to trash")
 fetchProducts(currentPage)
 }
 }

 async function toggleVisibility(id: string, currentStatus: boolean, name: string) {
 const token = localStorage.getItem("ysg_admin_token")
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const newStatus = !currentStatus
 setProducts(products.map(p => p.id === id ? { ...p, isPublished: newStatus } : p))
 
 const res = await fetch(`${API_URL}/api/admin/crud`, {
 method: "POST",
 headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
 body: JSON.stringify({ 
 table: "Product", 
 action: "update", 
 match: { id },
 data: { isPublished: newStatus }
 })
 })

 if (!res.ok) {
 toast.error("Failed to update status")
 setProducts(products.map(p => p.id === id ? { ...p, isPublished: currentStatus } : p))
 } else {
 await logActivity({ action: "update", entityType: "product", entityId: id, details: { name, status: newStatus ? "published" : "hidden" } })
 toast.success(newStatus ? "Product published" : "Product hidden")
 }
 }

 const formatPrice = (price: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 }).format(price)
 }

 const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.checked) setSelectedProducts(products.map(p => p.id))
 else setSelectedProducts([])
 }

 const toggleSelect = (id: string) => {
 if (selectedProducts.includes(id)) setSelectedProducts(selectedProducts.filter(pId => pId !== id))
 else setSelectedProducts([...selectedProducts, id])
 }

 const handleBulkAction = async (action: 'delete' | 'publish' | 'unpublish') => {
 if (selectedProducts.length === 0) return
 if (action === 'delete' && !confirm(t("confirmBulkDelete") || "Are you sure you want to delete selected products?")) return

 setBulkActionLoading(true)
 const token = localStorage.getItem("ysg_admin_token")
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 let successCount = 0

 try {
 await Promise.all(selectedProducts.map(id => {
 const payload = action === 'delete' 
 ? { table: "Product", action: "update", match: { id }, data: { isActive: false } }
 : { table: "Product", action: "update", match: { id }, data: { isPublished: action === 'publish' } }
 
 return fetch(`${API_URL}/api/admin/crud`, {
 method: "POST",
 headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
 body: JSON.stringify(payload)
 }).then(r => { if(r.ok) successCount++ })
 }))

 toast.success(`${successCount} products ${action === 'delete' ? 'moved to trash' : 'updated'}`)
 setSelectedProducts([])
 fetchProducts(currentPage)
 } catch (err) {
 toast.error("Bulk action failed")
 } finally {
 setBulkActionLoading(false)
 }
 }

 const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))
 const allSelectedPublished = selectedProductsData.length > 0 && selectedProductsData.every(p => p.isPublished !== false)
 const allSelectedHidden = selectedProductsData.length > 0 && selectedProductsData.every(p => p.isPublished === false)

 return (
 <div className="space-y-6 animate-in fade-in duration-500 w-full">
 
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold uppercase text-slate-900">{t("products")}</h2>
 <p className="text-sm font-medium text-slate-500 mt-2">{t("manageProductInventory")}</p>
 </div>
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
 <Link
 href="/admin/products/trash"
 className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-white text-slate-900 border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-xs font-bold font-medium hover:-translate-y-0.5 transition-all"
 >
 <Trash2 className="w-4 h-4" />
 {language === "kh" ? "ធុងសំរាម" : "Trash"}
 </Link>
 <Link
 href="/admin/products/new"
 className="btn-primary w-full sm:w-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-2 text-xs"
 >
 <Plus className="w-4 h-4" />
 {t("addProduct")}
 </Link>
 </div>
 </div>

 {selectedProducts.length > 0 && (
 <div className="solid-card bg-primary p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-white text-slate-900 font-bold text-sm border border-slate-200 shadow-sm">
 {selectedProducts.length}
 </span>
 <span className="text-slate-900 font-bold font-medium text-sm">
 {language === "kh" ? "បានជ្រើសរើស" : "Selected"}
 </span>
 </div>
 <div className="flex flex-wrap items-center gap-3">
 {!allSelectedPublished && (
 <button
 onClick={() => handleBulkAction('publish')}
 disabled={bulkActionLoading}
 className="px-4 py-2 bg-white text-slate-900 font-bold text-xs border border-slate-200 shadow-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50"
 >
 {language === "kh" ? "ផ្សព្វផ្សាយ" : "Publish"}
 </button>
 )}
 {!allSelectedHidden && (
 <button
 onClick={() => handleBulkAction('unpublish')}
 disabled={bulkActionLoading}
 className="px-4 py-2 bg-slate-100 text-slate-900 font-bold text-xs border border-slate-200 shadow-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50"
 >
 {language === "kh" ? "លាក់" : "Unpublish"}
 </button>
 )}
 <button
 onClick={() => handleBulkAction('delete')}
 disabled={bulkActionLoading}
 className="px-4 py-2 bg-red-600 text-white font-bold text-xs border-2 border-red-700 shadow-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50"
 >
 {language === "kh" ? "លុប" : "Delete"}
 </button>
 </div>
 </div>
 )}

 <div className="solid-card bg-white p-4 flex flex-col md:flex-row gap-4 items-center">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input
 type="text"
 placeholder={t("search") || "Search..."}
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-slate-900 font-medium text-xs"
 />
 {search && (
 <button 
 onClick={() => setSearch("")}
 className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-900 hover:text-red-600 transition-colors z-10"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 
 <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
 <div className="relative w-full md:w-48">
 <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-slate-900 font-medium text-xs appearance-none"
 >
 <option value="">{t("allCategories")}</option>
 {categories.map((cat) => (
 <option key={cat.id} value={cat.id}>
 {language === "kh" ? cat.nameKhmer || cat.name : cat.name}
 </option>
 ))}
 </select>
 </div>
 <div className="relative w-full md:w-48">
 <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-slate-900 font-medium text-xs appearance-none"
 >
 <option value="all">{language === "kh" ? "ស្ថានភាពទាំងអស់" : "All Status"}</option>
 <option value="published">{language === "kh" ? "បានផ្សព្វផ្សាយ" : "Published"}</option>
 <option value="hidden">{language === "kh" ? "បានលាក់" : "Hidden"}</option>
 </select>
 </div>
 </div>
 </div>

 <div className="solid-card bg-white overflow-hidden p-0 flex flex-col">
 {loading ? (
 <div className="p-20 flex flex-col items-center justify-center">
 <div className="w-10 h-10 border-4 border-slate-200 border-t-transparent rounded-full animate-spin mb-4" />
 <p className="text-slate-500 font-bold text-xs font-medium">Loading Inventory...</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-primary border-b border-slate-200">
 <th className="px-6 py-4 w-12">
 <input 
 type="checkbox" 
 className="w-5 h-5 border border-slate-200 accent-primary shadow-sm cursor-pointer"
 checked={products.length > 0 && selectedProducts.length === products.length}
 onChange={toggleSelectAll}
 />
 </th>
 <th className="px-6 py-4 text-xs font-bold text-slate-900 font-medium">{t("productInfo")}</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-900 font-medium">{t("category")}</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-900 font-medium">{t("price")}</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-900 font-medium">{t("status")}</th>
 <th className="px-6 py-4 text-xs font-bold text-slate-900 font-medium text-right">{t("actions")}</th>
 </tr>
 </thead>
 <tbody className="divide-y-2 divide-slate-900">
 {products.map((product) => (
 <tr key={product.id} className="group hover:bg-primary/5 transition-all duration-200">
 <td className="px-6 py-4">
 <input 
 type="checkbox" 
 className="w-5 h-5 border border-slate-200 accent-primary shadow-sm cursor-pointer"
 checked={selectedProducts.includes(product.id)}
 onChange={() => toggleSelect(product.id)}
 />
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm transition-transform">
 {product.images && product.images[0] ? (
 <img src={product.images[0].includes('cloudinary.com') ? product.images[0].replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : product.images[0]} alt={product.name} className="w-full h-full object-cover" />
 ) : product.thumbnail ? (
 <img src={product.thumbnail.includes('cloudinary.com') ? product.thumbnail.replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-900">
 <Package className="w-6 h-6" />
 </div>
 )}
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-900 uppercase">
 {language === "kh" ? product.nameKhmer || product.name : product.name}
 </h4>
 <p className="text-xs font-bold text-slate-500 mt-1 font-medium">#{product.id.slice(0, 8)}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="text-xs font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1.5 font-medium shadow-sm">
 {(() => {
 const cat = categories.find(c => c.id === product.categoryId);
 if (!cat) return t("general");
 return language === "kh" ? cat.nameKhmer || cat.name : cat.name;
 })()}
 </span>
 </td>
 <td className="px-6 py-4">
 <p className="text-sm font-bold text-slate-900 tracking-wider">{formatPrice(product.price)}</p>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 border border-slate-200 bg-emerald-500 shadow-sm" />
 <span className="text-xs font-bold text-slate-900 font-medium">{t("inStock") || "In Stock"}</span>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={() => toggleVisibility(product.id, product.isPublished !== false, product.name)}
 className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-md border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
 product.isPublished !== false ? 'bg-blue-600' : 'bg-slate-300'
 }`}
 title={product.isPublished !== false ? "Click to Hide" : "Click to Publish"}
 >
 <span 
 className={`pointer-events-none inline-block h-4 w-4 transform rounded-md bg-white shadow ring-0 transition duration-200 ease-in-out ${
 product.isPublished !== false ? 'translate-x-4' : 'translate-x-0'
 }`} 
 />
 </button>
 <span className={`text-xs font-bold font-medium ${product.isPublished !== false ? "text-blue-600" : "text-slate-500"}`}>
 {product.isPublished !== false ? (language === "kh" ? "បានផ្សព្វផ្សាយ" : "Published") : (language === "kh" ? "បានលាក់" : "Hidden")}
 </span>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-2">
 <Link
 href={`/products/${product.slug}`}
 target="_blank"
 className="p-2 bg-white text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
 title="View on site"
 >
 <Eye className="w-4 h-4" />
 </Link>
 <Link
 href={`/admin/products/edit/${product.slug}`}
 className="p-2 bg-white text-blue-600 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
 title="Edit"
 >
 <Edit className="w-4 h-4" />
 </Link>
 <button
 onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
 className="p-2 bg-white text-red-600 border border-transparent hover:border-slate-200 hover:shadow-sm-red transition-all"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {products.length === 0 && (
 <tr>
 <td colSpan={5} className="py-20 text-center">
 <div className="flex flex-col items-center">
 <Package className="w-12 h-12 text-slate-200 mb-4" />
 <p className="text-slate-400 font-medium italic">No products found</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 )}

 {!loading && totalPages > 1 && (
 <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
 <button 
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs font-medium shadow-sm hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
 >
 {t("previous") || "Previous"}
 </button>
 <span className="text-xs font-bold text-slate-900 font-medium">
 Page {currentPage} of {totalPages}
 </span>
 <button 
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs font-medium shadow-sm hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
 >
 {t("next") || "Next"}
 </button>
 </div>
 )}
 </div>

 {deleteConfirm && (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
 <div className="solid-card bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-md p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
 
 <div className="sm:hidden w-10 h-1 bg-slate-200 rounded-md mx-auto mb-2" />
 <div className="flex items-start gap-4">
 <div className="p-3 bg-red-50 border-2 border-red-500 shrink-0">
 <Trash2 className="w-5 h-5 text-red-600" />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 font-medium">លុបផលិតផល</h3>
 <p className="text-sm text-slate-600 mt-2 leading-relaxed">
 តើអ្នកប្រាកដថាចង់លុប <strong>"{deleteConfirm.name}"</strong> មែនទេ? ផលិតផលនេះនឹងត្រូវបានផ្លាស់ទីទៅធុងសំរាម។
 </p>
 </div>
 </div>
 <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
 <button
 onClick={() => setDeleteConfirm(null)}
 className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-900 text-xs font-bold font-medium shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
 >
 បោះបង់
 </button>
 <button
 onClick={() => deleteProduct(deleteConfirm.id, deleteConfirm.name)}
 className="w-full sm:w-auto px-6 py-3 bg-red-600 border-2 border-red-700 text-white text-xs font-bold font-medium hover:bg-red-700 transition-all"
 >
 លុប (ទៅធុងសំរាម)
 </button>
 </div>
 </div>
 </div>
 )}
 <Toaster position="top-right" />
 </div>
 )
}

```

• កូដផ្នែកខាងក្រោយ (Back-End)
```typescript
import { Router, Response } from 'express';
import { getPgClient } from '../lib/db';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

const ALLOWED_TABLES = ['Product', 'Category', 'Order', 'Inquiry', 'Setting'];

router.post('/', authenticateJWT, async (req: AuthRequest, res: Response): Promise<void> => {
  let pgClient;
  try {
    const { table, action, data, match } = req.body;

    if (!ALLOWED_TABLES.includes(table)) {
      res.status(403).json({ error: `Table '${table}' is not allowed for dynamic CRUD` });
      return;
    }

    if (!['insert', 'update', 'delete'].includes(action)) {
      res.status(400).json({ error: `Invalid action: ${action}` });
      return;
    }

    const isValidIdentifier = (str: string) => /^[a-zA-Z0-9_]+$/.test(str);

    if (data && typeof data === 'object') {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (!isValidIdentifier(key)) {
          console.error(` SQL Injection blocked on column name: ${key}`);
          res.status(400).json({ error: `Invalid column name detected: ${key}` });
          return;
        }
      }
    }

    if (match && Object.keys(match).length > 0) {
      const matchKey = Object.keys(match)[0];
      if (!isValidIdentifier(matchKey)) {
        console.error(` SQL Injection blocked on match criteria: ${matchKey}`);
        res.status(400).json({ error: `Invalid match column detected: ${matchKey}` });
        return;
      }
      
      if (matchKey.toLowerCase() === 'password') {
        res.status(403).json({ error: `Cannot use protected column as match criteria: ${matchKey}` });
        return;
      }
    }

    pgClient = await getPgClient();

    if (action === 'delete') {
      if (table === 'Order') {
        res.status(403).json({ error: "Audit Trail Protection: Orders cannot be permanently deleted. Please mark them as Cancelled instead." });
        return;
      }

      if (!req.user?.isSuperAdmin) {
        res.status(403).json({ error: "Only Super Admins have permission to delete records." });
        return;
      }

      if (!match || !match.id) {
        res.status(400).json({ error: "Missing match.id for delete" });
        return;
      }
      
      const query = `DELETE FROM "${table}" WHERE id = $1 RETURNING *`;
      const { rows } = await pgClient.query(query, [match.id]);
      res.json({ data: rows[0], error: null });
      return;
    }

    if (action === 'insert') {
      if (!data || typeof data !== 'object') {
        res.status(400).json({ error: "Missing data object for insert" });
        return;
      }

      const keys = Object.keys(data);
      const values = Object.values(data);
      
      const columns = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const query = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) RETURNING *`;
      const { rows } = await pgClient.query(query, values);
      res.json({ data: rows, error: null });
      return;
    }

    if (action === 'update') {
      if (!data || typeof data !== 'object') {
        res.status(400).json({ error: "Missing data object for update" });
        return;
      }
      
      let matchKey = 'id';
      let matchVal = match?.id;

      if (match && Object.keys(match).length > 0) {
        matchKey = Object.keys(match)[0];
        matchVal = match[matchKey];
      }

      if (!matchVal) {
        res.status(400).json({ error: "Missing match criteria for update" });
        return;
      }

      let query = `UPDATE "${table}" SET `;
      const values: any[] = [];
      let counter = 1;

      for (const [key, value] of Object.entries(data)) {
        query += `"${key}" = $${counter}, `;
        values.push(value);
        counter++;
      }

      query = query.slice(0, -2);
      
      query += ` WHERE "${matchKey}" = $${counter} RETURNING *`;
      values.push(matchVal);

      const { rows } = await pgClient.query(query, values);
      const updatedRecord = rows[0];

      if (table === 'Order' && data.status) {

        const { sendOrderStatusEmail } = require('../lib/email');
        sendOrderStatusEmail(updatedRecord).catch((e: any) => console.error("Email trigger failed:", e));
      }

      res.json({ data: updatedRecord, error: null });
      return;
    }

  } catch (err: any) {
    console.error(`CRUD Error (${req.body.action} on ${req.body.table}):`, err);
    res.status(500).json({ error: err.message, data: null });
  } finally {
    if (pgClient) await pgClient.release();
  }
});

export default router;

```



ឧបសម្ព័ន្ធ គ
ឯកសារពាក់ព័ន្ធ

គ.១ រចនាសម្ព័ន្ធនៃប្រព័ន្ធគ្រប់គ្រងការលក់
រូបភាព គ.១ រចនាសម្ព័ន្ធនៃប្រព័ន្ធគ្រប់គ្រងការលក់

គ.២ តួនាទីរបស់អ្នកប្រើប្រាស់ និងការអនុញ្ញាត
រូបភាព គ.២ តួនាទីរបស់អ្នកប្រើប្រាស់ និងការអនុញ្ញាត

គ.៣ ព័ត៌មានផលិតផល និងស្តុកទំនិញ
រូបភាព គ.៣ ព័ត៌មានផលិតផល និងស្តុកទំនិញ

គ.៤ ការគ្រប់គ្រងអតិថិជន និងការបញ្ជាទិញ
រូបភាព គ.៤ ការគ្រប់គ្រងអតិថិជន និងការបញ្ជាទិញ

គ.៥ ការទូទាត់ប្រាក់ និងវិក្កយបត្រ
រូបភាព គ.៥ ការទូទាត់ប្រាក់ និងវិក្កយបត្រ

គ.៦ របាយការណ៍លក់ និងចំណូល
រូបភាព គ.៦ របាយការណ៍លក់ និងចំណូល


ឯកសារស្រាវជ្រាវ
BIBLIOGRAPHY 
ឯកសារស្រាវជ្រាវ
(Bibliography)

ក. ឯកសារសៀវភៅ
១. ឯកសារជាតិ
• លោកសាស្ត្រាចារ្យ ប៊ូ ឈុន និងលោកសាស្ត្រាចារ្យ ធុក លីហៀង "System Analysis and Design” សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប ២០២៤
• លោកសាស្ត្រាចារ្យ ប៊ូ ឈុន “Database Managment System” សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប ២០២៤
• កញ្ញា ហ៊ុំ សុន លោក លី រិទ្ធី កញ្ញា ថា រតន:ពិដោរ លោក ថាវ វិជ្ជរ៉ា កញ្ញា យ៉ម នីសារ កញ្ញា ខៅ គិមសៀន (គ្រប់គ្រងការលក់ផលិតផលអនឡាញនៃហាង ប៊ូ ឈុន ស្ដរ) សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប ២០១៩។ 

២. ឯកសារអន្តរជាតិ
• លោក Fred_R.Mefaddem A.Hoffer និងលោក Harray B.Proscoff បោះពុម្ពនៅឆ្នាំ ១៩៩៧ មានចំណងជើងថា Modern Database Management រួមថាដំណើរការនៃការបង្កើត Database (https://www.scribd.com/presentation/38628803/CHAP07R-edited2?utm_source=chatgpt.com)
• លោក Alan Dannise (២០០២) ដែលមានចំណងជើង “Systems Analysis and Design” (https://www.nguyenthihoi.com/TAI%20LIEU%20CHO%20SINH%20VIEN/Systems_Analysis_Design_UML_5th%20ed.pdf?utm_source=chatgpt.com)
• លោក Sir Tim Berners-Lee នៅឆ្នាំ 1989 នៅ CERN “World Wide Web (WWW)” ផ្ដល់សេវាដោយ Web Servers ដែលប្រើប្រាស់ HTTP (Hypertext Transfer Protocol) ឬ HTTPS (HTTP Secure) (https://cds.cern.ch/record/369245/files/dd-89-001.pdf )

ខ. គេហទំព័រ 
១. ស្រាវជ្រាវឯកសារដែលទាក់ទងជាមួយនឹងការប្រើប្រាស់ React JS និង Node js ៖
• https://react.dev/ (១០ សីហា ២០២៦ )
• https://nodejs.org/docs/latest/api/ (១០ សីហា ២០២៦)
• https://nodejs.org/en/learn/getting-started/introduction-to-nodejs (១២ សីហា ២០២៦)

២. ស្រាវជ្រាវឯកសារដែលទាក់ទងជាមួយនឹងការប្រើប្រាស់ Style និង Layout៖
• https://tailwindcss.com/docs  (១២ សីហា ២០២៦)
• https://lucide.dev/icons/ (១២ សីហា ២០២៦)
• HTML, CSS, Javascript, Tailwind https://www.w3schools.com/ (១០ សីហា ២០២៦)

៣. ស្រាវជ្រាវឯកសារដែលទាក់ទងជាមួយនឹងការប្រើប្រាស់ PostgreSQL, SDLC, 3NF, SAD, DFD លំហូរទិន្នន័យ៖
• https://www.postgresql.org/docs/ (១៣ សីហា ២០២៦)
• https://books.google.com/books/about/Modern_Database_Management.html?id=rQa5QgAACAAJ (១៣ សីហា ២០២៦)
• https://www.geeksforgeeks.org/software-engineering/software-development-life-cycle-sdlc/ (១៣ សីហា ២០២៦)
• https://www.tutorialspoint.com/dbms/database_normalization.htm (១៤ សីហា ២០២៦)
• https://www.tutorialspoint.com/system_analysis_and_design/index.htm (១៤ សីហា ២០២៦)
• https://www.lucidchart.com/pages/data-flow-ដ្យាក្រាម (១៤ សីហា ២០២៦)
