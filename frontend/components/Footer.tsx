"use client"

import Link from "next/link"
import { Globe, Camera, Send, Play, Mail, Phone, MapPin, Clock } from "lucide-react"
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
            <Link href="/" className="flex items-center group">
              <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-12 w-auto object-contain group-hover:opacity-90 transition-opacity duration-300" />
            </Link>
            <p className="text-[14px] leading-relaxed max-w-xs font-normal text-slate-600">
              ក្រុមហ៊ុនយ៉ាងស៊ីគ្រុប — Yeung Shi Group Co., Ltd. Premium industrial machinery and equipment supplier in Cambodia.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Camera, Send, Play].map((Icon, i) => (
                <a key={i} href={[
                  "https://www.facebook.com/YeungShiGroupHeadOffice/",
                  "https://www.youtube.com/channel/UCeml0xmg8lf6Kt8w25dOGWA",
                  "#",
                  "#"
                ][i]} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all duration-300 border border-slate-200 shadow-sm">
                  <Icon className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-slate-950 font-medium text-[11px] uppercase tracking-widest mb-8">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-[13px] font-normal text-slate-600 hover:text-primary transition-all duration-300 flex items-center gap-2 group">
                      <div className="w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-8">
            <h3 className="text-slate-950 font-medium text-[11px] uppercase tracking-widest mb-8">{t("contactUs") || "Contact Specialist"}</h3>
            <div className="space-y-6">
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 transition-colors">
                  <MapPin className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-[13px]">
                  <p className="text-slate-700 font-medium mb-0.5 uppercase tracking-tight">Headquarters</p>
                  <p className="font-normal text-slate-600">Building 230, St. 271, Sangkat Toul Tompong II, Khan Chamkamon, Phnom Penh.</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 transition-colors">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="text-[13px]">
                  <p className="text-slate-700 font-medium mb-0.5 uppercase tracking-tight">Working Hours</p>
                  <p className="font-normal text-slate-600">8:00 am – 5:30 pm (Mon – Sat)</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 transition-colors">
                  <Phone className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-[13px]">
                  <p className="text-slate-700 font-medium mb-0.5 uppercase tracking-tight">Phone</p>
                  <p className="font-normal text-slate-600">010 / 011 / 012 / 070: 309 302</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 transition-colors">
                  <Mail className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-[13px]">
                  <p className="text-slate-700 font-medium mb-0.5 uppercase tracking-tight">Email</p>
                  <p className="font-normal text-slate-600">yeungshigroup123@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-medium tracking-[0.2em] text-slate-500 uppercase">
            © {currentYear} Yeung Shi Group Co., Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-[9px] font-medium uppercase tracking-widest text-slate-400">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
