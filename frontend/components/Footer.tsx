"use client"

import Link from "next/link"
import { Globe, Camera, Send, Play, Mail, Phone, MapPin, ArrowRight } from "lucide-react"
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
    <footer className="bg-white text-slate-500 pt-20 pb-40 md:pb-16 border-t border-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center p-2 shadow-sm border border-slate-100 transition-all duration-300 group-hover:border-primary/20">
                <img src="/logo.png" alt="YSG Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-slate-900 font-bold text-lg tracking-tight uppercase">YSG Machinery</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Industrial Solutions</span>
              </div>
            </Link>
            <p className="text-[14px] leading-relaxed max-w-xs font-medium text-slate-400">
              The premium standard in heavy equipment. Professional industrial solutions for the world's most ambitious projects.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Camera, Send, Play].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300 border border-slate-100 shadow-sm">
                  <Icon className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-slate-950 font-bold text-[11px] uppercase tracking-widest mb-8">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-[13px] font-semibold text-slate-400 hover:text-primary transition-all duration-300 flex items-center gap-2 group">
                      <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-8">
            <h3 className="text-slate-950 font-bold text-[11px] uppercase tracking-widest mb-8">{t("contactUs") || "Contact Specialist"}</h3>
            <div className="space-y-6">
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 transition-colors">
                  <MapPin className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-[13px]">
                  <p className="text-slate-900 font-bold mb-0.5 uppercase tracking-tight">Headquarters</p>
                  <p className="font-medium text-slate-400">Phnom Penh, Cambodia</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 transition-colors">
                  <Phone className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-[13px]">
                  <p className="text-slate-900 font-bold mb-0.5 uppercase tracking-tight">Sales Hotline</p>
                  <p className="font-medium text-slate-400">+855 12 345 678</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
            © {currentYear} YSG Industrial Solutions.
          </p>
          <div className="flex items-center gap-8 text-[9px] font-bold uppercase tracking-widest text-slate-400">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
