"use client"

import Link from "next/link"
import { Globe, Camera, Send, Play, Mail, Phone, MapPin, Clock } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

import { useEffect, useState } from "react"

export default function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<any>({
    address: "Building 230, St. 271, Sangkat Toul Tompong II, Khan Chamkamon, Phnom Penh.",
    contact_phone: "010 / 011 / 012 / 070: 309 302",
    contact_email: "yeungshigroup123@gmail.com"
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const res = await fetch(`${API_URL}/api/public/settings`)
        const { data } = await res.json()
        if (data) {
          setSettings((prev: any) => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err)
      }
    }
    fetchSettings()
  }, [])

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
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-40 md:pb-16 border-t border-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          <div className="space-y-8">
            <Link href="/" className="flex items-center group">
              <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-14 w-auto object-contain group-hover:opacity-80 transition-opacity duration-300" />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs font-normal text-slate-500">
              ក្រុមហ៊ុនយ៉ាងស៊ីគ្រុប — Yeung Shi Group Co., Ltd. Premium industrial machinery and equipment supplier in Cambodia.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, Camera, Send, Play].map((Icon, i) => (
                <a key={i} href={[
                  "https://www.facebook.com/YeungShiGroupHeadOffice/",
                  "https://www.youtube.com/channel/UCeml0xmg8lf6Kt8w25dOGWA",
                  "#",
                  "#"
                ][i]} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-slate-900 transition-all duration-300 border-2 border-slate-800 hover:border-slate-900 hover:-translate-y-1 hover:shadow-hard-primary">
                  <Icon className="w-4.5 h-4.5 transition-transform duration-500 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-8">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-sm font-normal text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300 flex items-center gap-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-glow" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-8">
            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-8">{t("contactUs") || "Contact Specialist"}</h3>
            <div className="space-y-6">
              <div className="flex gap-4 group">
                <div className="w-10 h-10 bg-slate-900 flex items-center justify-center shrink-0 border-2 border-slate-800 transition-all group-hover:border-primary group-hover:bg-primary/10">
                  <MapPin className="w-4.5 h-4.5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-bold mb-1 uppercase tracking-tight">Headquarters</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold tracking-wide leading-relaxed hover:text-primary transition-colors"
                  >
                    {settings.address}
                  </a>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 bg-slate-900 flex items-center justify-center shrink-0 border-2 border-slate-800 transition-all group-hover:border-primary group-hover:bg-primary/10">
                  <Clock className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-bold mb-1 uppercase tracking-tight">Working Hours</p>
                  <p className="font-normal text-slate-500">8:00 am – 5:30 pm (Mon – Sat)</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 bg-slate-900 flex items-center justify-center shrink-0 border-2 border-slate-800 transition-all group-hover:border-primary group-hover:bg-primary/10">
                  <Phone className="w-4.5 h-4.5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-bold mb-1 uppercase tracking-tight">Phone</p>
                  <a
                    href={`tel:${settings.contact_phone?.replace(/\s/g, "")}`}
                    className="text-sm font-bold tracking-wide hover:text-primary transition-colors"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 bg-slate-900 flex items-center justify-center shrink-0 border-2 border-slate-800 transition-all group-hover:border-primary group-hover:bg-primary/10">
                  <Mail className="w-4.5 h-4.5 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-sm">
                  <p className="text-white font-bold mb-1 uppercase tracking-tight">Email</p>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-sm font-bold tracking-wide hover:text-primary transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              </div>
              {/* WhatsApp */}
              {settings.whatsapp_url && (
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 bg-slate-900 flex items-center justify-center shrink-0 border-2 border-slate-800 transition-all group-hover:border-green-500 group-hover:bg-green-500/10">
                    <span className="text-green-400 text-lg">💬</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-bold mb-1 uppercase tracking-tight">WhatsApp</p>
                    <a
                      href={`https://wa.me/${settings.whatsapp_url.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold tracking-wide hover:text-green-400 transition-colors"
                    >
                      {settings.whatsapp_url}
                    </a>
                  </div>
                </div>
              )}
              {/* Telegram */}
              {settings.telegram_url && (
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 bg-slate-900 flex items-center justify-center shrink-0 border-2 border-slate-800 transition-all group-hover:border-sky-500 group-hover:bg-sky-500/10">
                    <span className="text-sky-400 text-lg">✈️</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-bold mb-1 uppercase tracking-tight">Telegram</p>
                    <a
                      href={settings.telegram_url.startsWith("http") ? settings.telegram_url : `https://t.me/${settings.telegram_url.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold tracking-wide hover:text-sky-400 transition-colors"
                    >
                      {settings.telegram_url}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold tracking-[0.2em] text-slate-600 uppercase">
            © {currentYear} Yeung Shi Group Co., Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
