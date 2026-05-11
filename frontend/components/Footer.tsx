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
    <footer className="bg-white text-slate-500 pt-32 pb-40 md:pb-16 border-t border-slate-50 rounded-t-[4rem] shadow-lux-deep relative z-10">
      <div className="max-w-[1440px] mx-auto px-10 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
          
          {/* 💎 The Brand Boutique */}
          <div className="space-y-10">
            <Link href="/" className="flex items-center gap-5 group">
              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center p-3 shadow-sm border border-slate-100 group-hover:scale-105 transition-soft">
                <img src="/logo.png" alt="YSG Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-950 font-black text-2xl tracking-tighter uppercase leading-none">YSG MACHINERY</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-2 opacity-60">Industrial Boutique</span>
              </div>
            </Link>
            <p className="text-[14px] leading-relaxed max-w-xs font-bold italic text-slate-400 opacity-80">
              Setting the global standard for industrial excellence. We provide elite machinery solutions for the world's most ambitious projects.
            </p>
            <div className="flex items-center gap-4">
              {[Globe, Camera, Send, Play].map((Icon, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-slate-900 hover:bg-primary hover:text-white transition-soft border border-slate-100 group">
                  <Icon className="w-5.5 h-5.5 group-hover:scale-110 transition-soft" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Segments */}
          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-slate-950 font-black text-[12px] uppercase tracking-[0.3em] mb-10">{section.title}</h3>
              <ul className="space-y-6">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-[14px] font-black text-slate-400 hover:text-primary transition-soft flex items-center gap-4 group uppercase tracking-widest">
                      <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-soft" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Boutique Contact Hub */}
          <div className="space-y-10">
            <h3 className="text-slate-950 font-black text-[12px] uppercase tracking-[0.3em] mb-10">{t("contactUs") || "Contact Specialist"}</h3>
            <div className="space-y-8">
              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-[1.2rem] bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary/5 transition-soft">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="text-[14px]">
                  <p className="text-slate-950 font-black mb-1 tracking-tight uppercase">Headquarters</p>
                  <p className="font-bold text-slate-400 leading-relaxed italic">Phnom Penh, Cambodia</p>
                </div>
              </div>
              <div className="flex gap-6 group">
                <div className="w-14 h-14 rounded-[1.2rem] bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary/5 transition-soft">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="text-[14px]">
                  <p className="text-slate-950 font-black mb-1 tracking-tight uppercase">Sales Hotline</p>
                  <p className="font-bold text-slate-400 leading-relaxed italic">+855 12 345 678</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 Precise Bottom Bar */}
        <div className="pt-16 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[11px] font-black tracking-[0.3em] text-slate-300 uppercase">
            © {currentYear} YSG INDUSTRIAL SOLUTIONS. DEFINING EXCELLENCE.
          </p>
          <div className="flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            <Link href="/privacy" className="hover:text-primary transition-soft">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-soft">Terms</Link>
            <Link href="/sitemap" className="hover:text-primary transition-soft">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
