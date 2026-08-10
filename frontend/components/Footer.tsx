"use client"

import Link from "next/link"
import { MapPin, Phone, Mail, CreditCard } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook, faYoutube, faTelegram } from "@fortawesome/free-brands-svg-icons"
import { useLanguage } from "../contexts/LanguageContext"
import { useEffect, useState } from "react"

export default function Footer() {
  const { t, language } = useLanguage()
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<any>({
    address: "Building 230, St. 271, Yothapol Khemarak Phoumin Boulevard, Phnom Penh.",
    contact_phone: "010 / 011 / 012 / 070: 309 302",
    contact_email: "yeungshigroup123@gmail.com",
    facebook_url: "https://www.facebook.com/YeungShiGroupHeadOffice/",
    youtube_url: "https://www.youtube.com/channel/UCeml0xmg8lf6Kt8w25dOGWA",
    telegram_url: ""
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const res = await fetch(`${API_URL}/api/public/settings`)
        if (res.ok) {
          const { data } = await res.json()
          if (data) setSettings((prev: any) => ({ ...prev, ...data }))
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err)
      }
    }
    fetchSettings()
  }, [])

  const linkClass = "text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"
  const dot = <span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />

  return (
    <footer className="bg-[#00224a] text-slate-200 pt-12 pb-24 md:pb-10 mt-12 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10">

        {/* Main Grid: 2-col mobile → 4-col desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10 mb-10">

          {/* Col 1: Branding — full width on mobile */}
          <div className="col-span-2 lg:col-span-4 flex flex-col gap-4">
            <Link href="/" className="inline-block w-[140px] hover:opacity-80 transition-opacity">
              <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="w-full h-auto object-contain" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 font-medium max-w-xs">
              ក្រុមហ៊ុនយ៉ាងស៊ីគ្រុប — Yeung Shi Group Co., Ltd.<br />
              Premium industrial machinery and equipment supplier in Cambodia.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="col-span-1 lg:col-span-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/50 mb-4">
              {language === "kh" ? "ផ្សេងៗ" : "Quick Links"}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: language === "kh" ? "ទំព័រដើម" : "Home" },
                { href: "/products", label: language === "kh" ? "ផលិតផលទាំងអស់" : "All Products" },
                { href: "/categories", label: language === "kh" ? "ប្រភេទផលិតផល" : "Categories" },
                { href: "/about", label: language === "kh" ? "អំពីយើង" : "About Us" },
                { href: "/contact", label: language === "kh" ? "ទំនាក់ទំនង" : "Contact" },
                { href: "/track-order", label: language === "kh" ? "តាមដានការបញ្ជាទិញ" : "Track Order" },
                { href: "/help", label: language === "kh" ? "មជ្ឈមណ្ឌលជំនួយ" : "Help Center" },
                { href: "/privacy", label: language === "kh" ? "គោលការណ៍ឯកជនភាព" : "Privacy Policy" },
                { href: "/terms", label: language === "kh" ? "លក្ខខណ្ឌសេវាកម្ម" : "Terms" },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>{dot}{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Social + Contact */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-8">
            {/* Follow Us */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/50 mb-4">
                {language === "kh" ? "តាមដានពួកយើង" : "Follow Us"}
              </h3>
              <ul className="space-y-3">
                {settings.facebook_url && (
                  <li>
                    <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      <FontAwesomeIcon icon={faFacebook} className="w-4 h-4 text-[#1877F2]" /> Facebook
                    </a>
                  </li>
                )}
                {settings.youtube_url && (
                  <li>
                    <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      <FontAwesomeIcon icon={faYoutube} className="w-4 h-4 text-[#FF0000]" /> YouTube
                    </a>
                  </li>
                )}
                {settings.telegram_url && (
                  <li>
                    <a href={settings.telegram_url.startsWith("http") ? settings.telegram_url : `https://t.me/${settings.telegram_url.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      <FontAwesomeIcon icon={faTelegram} className="w-4 h-4 text-[#229ED9]" /> Telegram
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/50 mb-4">
                {language === "kh" ? "ទាក់ទងមកពួកយើង" : "Contact Us"}
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href={`tel:${settings.contact_phone?.replace(/\s/g, "")}`} className={linkClass}>
                    <Phone className="w-4 h-4 text-white/50 shrink-0" />
                    <span className="break-all">{settings.contact_phone}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${settings.contact_email}`} className={linkClass}>
                    <Mail className="w-4 h-4 text-white/50 shrink-0" />
                    <span className="break-all">{settings.contact_email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{settings.address}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400">
          <p className="text-center sm:text-left font-medium">
            រក្សាសិទ្ធិ © {currentYear} ដោយ Yeung Shi Group. រក្សាសិទ្ធិគ្រប់យ៉ាង.
          </p>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{language === "kh" ? "ទទួលយកការទូទាត់:" : "Accepted:"} ABA Pay / KHQR</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
