"use client"

import Link from "next/link"
import { MapPin, Phone, Mail, Send, Clock, CreditCard } from "lucide-react"
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

  return (
    <footer className="bg-[#00224a] text-slate-200 pt-16 pb-24 md:pb-8 mt-12 font-sans selection:bg-white/20 selection:text-white">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 lg:gap-x-12 gap-y-12 mb-16">
          
          {/* Column 1: Logo & Description */}
          <div className="flex flex-col gap-6 lg:col-span-3">
            <Link href="/" className="inline-block w-[160px] hover:scale-105 transition-transform origin-left">
              <img 
                src="/logo/ysg-logo.png" 
                alt="Yeung Shi Group" 
                className="w-full h-auto object-contain" 
              />
            </Link>
            <p className="text-sm md:text-[15px] leading-relaxed opacity-90 font-medium">
              ក្រុមហ៊ុនយ៉ាងស៊ីគ្រុប — Yeung Shi Group Co., Ltd.<br/>
              Premium industrial machinery and equipment supplier in Cambodia.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-5">
            <h3 className="text-lg md:text-xl font-black mb-6 tracking-wide text-white">
              {language === "kh" ? "ផ្សេងៗ" : "Quick Links"}
            </h3>
            <ul className="grid grid-cols-2 gap-y-4 gap-x-4">
              <li>
                <Link href="/" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "ទំព័រដើម" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "ផលិតផលទាំងអស់" : "Products"}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "ប្រភេទផលិតផល" : "Categories"}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "អំពីយើង" : "About Us"}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "ទំនាក់ទំនង" : "Contact"}
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "តាមដានការបញ្ជាទិញ" : "Track Order"}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "មជ្ឈមណ្ឌលជំនួយ" : "Help Center"}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "គោលការណ៍ឯកជនភាព" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" /> {language === "kh" ? "លក្ខខណ្ឌសេវាកម្ម" : "Terms of Service"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Follow Us */}
          <div className="lg:col-span-2">
            <h3 className="text-lg md:text-xl font-black mb-6 tracking-wide text-white">
              {language === "kh" ? "តាមដានពួកយើង" : "Follow Us"}
            </h3>
            <ul className="space-y-4">
              {settings.facebook_url && (
                <li>
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-3">
                    <FontAwesomeIcon icon={faFacebook} className="w-5 h-5 text-[#1877F2]" /> Facebook
                  </a>
                </li>
              )}
              {settings.youtube_url && (
                <li>
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-3">
                    <FontAwesomeIcon icon={faYoutube} className="w-5 h-5 text-[#FF0000]" /> YouTube
                  </a>
                </li>
              )}
              {settings.telegram_url && (
                <li>
                  <a href={settings.telegram_url.startsWith("http") ? settings.telegram_url : `https://t.me/${settings.telegram_url.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-sm md:text-[15px] font-medium opacity-80 hover:opacity-100 hover:text-white transition-all flex items-center gap-3">
                    <FontAwesomeIcon icon={faTelegram} className="w-5 h-5 text-[#229ED9]" /> Telegram
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="lg:col-span-2">
            <h3 className="text-lg md:text-xl font-black mb-6 tracking-wide text-white">
              {language === "kh" ? "ទាក់ទងមកពួកយើង" : "Contact Us"}
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 opacity-90 hover:opacity-100 transition-opacity">
                <Phone className="w-5 h-5 shrink-0 mt-0.5 text-white/70" />
                <a href={`tel:${settings.contact_phone?.replace(/\s/g, "")}`} className="text-sm md:text-[15px] font-medium">
                  {settings.contact_phone}
                </a>
              </li>
              <li className="flex items-start gap-3 opacity-90 hover:opacity-100 transition-opacity">
                <Mail className="w-5 h-5 shrink-0 mt-0.5 text-white/70" />
                <a href={`mailto:${settings.contact_email}`} className="text-sm md:text-[15px] font-medium">
                  {settings.contact_email}
                </a>
              </li>
              <li className="flex items-start gap-3 opacity-90 hover:opacity-100 transition-opacity">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-white/70" />
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} target="_blank" rel="noopener noreferrer" className="text-sm md:text-[15px] font-medium leading-relaxed">
                  {settings.address}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs md:text-sm font-medium opacity-80 text-center md:text-left">
            រក្សាសិទ្ធិ © {currentYear} ដោយ Yeung Shi Group. រក្សាសិទ្ធិគ្រប់យ៉ាង.
          </p>
          <div className="flex items-center gap-4 text-xs md:text-sm font-medium opacity-80">
            <span>{language === "kh" ? "ទទួលយកការទូទាត់:" : "Payment accepted:"}</span>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <CreditCard className="w-4 h-4" />
              <span>ABA Pay / KHQR</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
