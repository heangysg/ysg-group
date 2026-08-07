/* eslint-disable */
"use client"

import Link from "next/link"
import { Globe, Camera, Send, Play, Mail, Phone, MapPin, Clock } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

import { useEffect, useState } from "react"

export default function Footer() {
  const { t, language } = useLanguage()
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<any>({
    address: "Building 230, St. 271, Yothapol Khemarak Phoumin Boulevard, Phnom Penh.",
    contact_phone: "010 / 011 / 012 / 070: 309 302",
    contact_email: "yeungshigroup123@gmail.com"
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const res = await fetch(`${API_URL}/api/public/settings`)
        if (res.ok) {
          const { data } = await res.json()
          if (data) {
            setSettings((prev: any) => ({ ...prev, ...data }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err)
      }
    }
    fetchSettings()
  }, [])

  const sections = [
    {
      title: language === "kh" ? "លីងរហ័ស" : "Quick Links",
      links: [
        { name: language === "kh" ? "ទំព័រដើម" : "Home", href: "/" },
        { name: language === "kh" ? "ផលិតផលទាំងអស់" : "Products", href: "/products" },
        { name: language === "kh" ? "ប្រភេទផលិតផល" : "Categories", href: "/categories" },
        { name: language === "kh" ? "អំពីយើង" : "About Us", href: "/about" },
        { name: language === "kh" ? "ទំនាក់ទំនង" : "Contact", href: "/contact" },
      ]
    },
    {
      title: language === "kh" ? "ផ្នែកជំនួយ" : "Support",
      links: [
        { name: language === "kh" ? "តាមដានការបញ្ជាទិញ" : "Track Order", href: "/orders" },
        { name: language === "kh" ? "មជ្ឈមណ្ឌលជំនួយ" : "Help Center", href: "/help" },
        { name: language === "kh" ? "គោលការណ៍ឯកជនភាព" : "Privacy Policy", href: "/help" },
        { name: language === "kh" ? "លក្ខខណ្ឌសេវាកម្ម" : "Terms of Service", href: "/help" },
      ]
    }
  ]

  return (
    <footer className="bg-white text-slate-600 pt-16 pb-32 md:pb-12 border-t border-slate-100 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <Link href="/" className="flex items-center group">
              <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-10 w-auto object-contain invert brightness-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
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
                ][i]} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-colors shadow-sm">
                  <Icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>

          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="text-slate-900 font-bold text-sm mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-2 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-6">
            <h3 className="text-slate-900 font-bold text-sm mb-6">{language === "kh" ? "ទំនាក់ទំនងយើងខ្ញុំ" : "Contact Us"}</h3>
            <div className="space-y-5">
              <div className="flex gap-4 group">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-slate-900 font-bold mb-0.5">{language === "kh" ? "ការិយាល័យកណ្តាល" : "Headquarters"}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-500 leading-relaxed hover:text-primary transition-colors"
                  >
                    {settings.address}
                  </a>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-slate-900 font-bold mb-0.5">{language === "kh" ? "ម៉ោងធ្វើការ" : "Working Hours"}</p>
                  <p className="font-medium text-slate-500">{language === "kh" ? "៨:០០ ព្រឹក – ៥:៣០ ល្ងាច (ចន្ទ – សៅរ៍)" : "8:00 am – 5:30 pm (Mon – Sat)"}</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-slate-900 font-bold mb-0.5">{language === "kh" ? "លេខទូរស័ព្ទ" : "Phone"}</p>
                  <a
                    href={`tel:${settings.contact_phone?.replace(/\s/g, "")}`}
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-slate-900 font-bold mb-0.5">{language === "kh" ? "អ៊ីមែល" : "Email"}</p>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              </div>
              {/* WhatsApp */}
              {settings.whatsapp_url && (
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <span className="text-green-500 text-lg">💬</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-900 font-bold mb-0.5">WhatsApp</p>
                    <a
                      href={`https://wa.me/${settings.whatsapp_url.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-500 hover:text-green-600 transition-colors"
                    >
                      {settings.whatsapp_url}
                    </a>
                  </div>
                </div>
              )}
              {/* Telegram */}
              {settings.telegram_url && (
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                    <span className="text-sky-500 text-lg">✈️</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-900 font-bold mb-0.5">Telegram</p>
                    <a
                      href={settings.telegram_url.startsWith("http") ? settings.telegram_url : `https://t.me/${settings.telegram_url.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors"
                    >
                      {settings.telegram_url}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-slate-500">
            © {currentYear} Yeung Shi Group Co., Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium text-slate-500">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
