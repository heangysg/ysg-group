"use client"

import Link from "next/link"
import { Globe, Camera, Send, Play, Mail, Phone, MapPin, ArrowRight, Package } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

export default function Footer() {
  const { t, language } = useLanguage()
  const currentYear = new Date().getFullYear()

  const sections = [
    {
      title: t("quickLinks") || "Quick Links",
      links: [
        { name: t("home"), href: "/" },
        { name: t("allProducts"), href: "/products" },
        { name: t("categories"), href: "/categories" },
        { name: t("about"), href: "/about" },
        { name: t("contact"), href: "/contact" },
      ]
    },
    {
      title: t("support") || "Support",
      links: [
        { name: t("helpCenter") || "Help Center", href: "/help" },
        { name: t("privacyPolicy") || "Privacy Policy", href: "/privacy" },
        { name: t("termsOfService") || "Terms of Service", href: "/terms" },
        { name: t("shippingInfo") || "Shipping Information", href: "/shipping" },
      ]
    }
  ]

  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-32 md:pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1.5 transition-transform group-hover:scale-110">
                <img src="/logo.png" alt="YSG Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-tight">YSG MACHINERY</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Premium Solutions</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs font-medium">
              Your trusted partner for premium heavy machinery and specialized equipment solutions worldwide.
            </p>
            <div className="flex items-center gap-4">
              {[Globe, Camera, Send, Play].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6">{t("contactUs") || "Contact Us"}</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm leading-relaxed">
                  <p className="text-white font-bold mb-1">Global Headquarters</p>
                  <p>123 Machinery Ave, Industrial Zone</p>
                  <p>Phnom Penh, Cambodia</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-bold mb-1">Sales Hotline</p>
                  <p>+855 12 345 678</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-bold mb-1">Email Support</p>
                  <p>contact@ysgmachinery.com</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium">
            © {currentYear} YSG Machinery. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
