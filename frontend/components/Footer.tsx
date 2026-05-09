"use client"

import Link from "next/link"
import { Globe, Camera, Send, Play, Mail, Phone, MapPin, ArrowRight, Package } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

export default function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  const sections = [
    {
      title: t("quickLinks") || "Quick Links",
      links: [
        { name: t("home") || "Home", href: "/" },
        { name: t("allProducts") || "Products", href: "/products" },
        { name: t("categories") || "Categories", href: "/categories" },
        { name: t("about") || "About Us", href: "/about" },
        { name: t("contact") || "Contact", href: "/contact" },
      ]
    },
    {
      title: t("support") || "Support",
      links: [
        { name: t("helpCenter") || "Help Center", href: "/help" },
        { name: t("privacyPolicy") || "Privacy Policy", href: "/privacy" },
        { name: t("termsOfService") || "Terms of Service", href: "/terms" },
        { name: t("shippingInfo") || "Shipping", href: "/shipping" },
      ]
    }
  ]

  return (
    <footer className="bg-slate-950 text-slate-400 pt-24 pb-32 md:pb-12 border-t border-slate-900 font-nunito">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* 🏗️ Brand Soul */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-premium group-hover:scale-105 transition-soft">
                <img src="/logo.png" alt="YSG Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-xl tracking-tight uppercase">YSG MACHINERY</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] opacity-70">Premium Solutions</span>
              </div>
            </Link>
            <p className="text-[13px] leading-relaxed max-w-xs font-medium text-slate-500">
              Setting the global standard for heavy machinery excellence. We provide specialized industrial solutions for the world's most ambitious projects.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Camera, Send, Play].map((Icon, i) => (
                <a key={i} href="#" className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-soft border border-transparent hover:border-primary/20 group">
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-soft" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Segments */}
          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">{section.title}</h3>
              <ul className="space-y-5">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-[13px] font-bold text-slate-500 hover:text-white transition-soft flex items-center gap-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-soft" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Modern Contact Hub */}
          <div className="space-y-8">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">{t("contactUs") || "Contact"}</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="text-[13px]">
                  <p className="text-white font-black mb-1 tracking-wide">Headquarters</p>
                  <p className="font-medium text-slate-500 leading-relaxed">Industrial Zone, Phnom Penh, Cambodia</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="text-[13px]">
                  <p className="text-white font-black mb-1 tracking-wide">Sales Hotline</p>
                  <p className="font-medium text-slate-500">+855 12 345 678</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 💳 Bottom Bar: Clean & Minimal */}
        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[11px] font-bold tracking-wider text-slate-600">
            © {currentYear} YSG MACHINERY SOLUTIONS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-soft">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-soft">Terms</Link>
            <Link href="/sitemap" className="hover:text-white transition-soft">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
