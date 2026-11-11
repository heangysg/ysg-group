"use client"

import Link from "next/link"
import { MapPin, Phone, Mail, Clock, ChevronRight, ShieldCheck, CreditCard } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook, faYoutube, faTelegram } from "@fortawesome/free-brands-svg-icons"
import { useLanguage } from "../contexts/LanguageContext"
import { useEffect, useState } from "react"

export default function Footer() {
  const { language } = useLanguage()
  const isKh = language === "kh"
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<any>({
    address: "Building 230, St. 271, Sangkat Toul Tompong II, Khan Chamkamon, Phnom Penh.",
    contact_phone: "010 / 011 / 012 / 070 : 309 302",
    contact_email: "yeungshigroup123@gmail.com",
    working_hours: "8 : 00 am – 5:30pm ( Mon – Sat )",
    facebook_url: "https://www.facebook.com/YeungShiGroupHeadOffice/",
    youtube_url: "https://www.youtube.com/channel/UCeml0xmg8lf6Kt8w25dOGWA",
    telegram_url: ""
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const res = await fetch(`${API_URL}/api/public/settings`)
        if (res.ok) {
          const { data } = await res.json()
          if (data) setSettings((prev: any) => ({ ...prev, ...data }))
        }
      } catch {
        // Silently fallback to default settings on network errors
      }
    }
    fetchSettings()
  }, [])

  const navLinks = [
    { href: "/", label: isKh ? "ទំព័រដើម" : "Home" },
    { href: "/products", label: isKh ? "ផលិតផលទាំងអស់" : "All Products" },
    { href: "/categories", label: isKh ? "ប្រភេទផលិតផល" : "Categories" },
    { href: "/about", label: isKh ? "អំពីយើង" : "About Us" },
    { href: "/contact", label: isKh ? "ទំនាក់ទំនង" : "Contact Us" },
  ]

  const supportLinks = [
    { href: "/inquiry", label: isKh ? "ស្នើសុំតម្លៃ / ព័ត៌មាន" : "Request Inquiry" },
    { href: "/track-order", label: isKh ? "តាមដានការបញ្ជាទិញ" : "Track Order" },
    { href: "/shipping", label: isKh ? "ការដឹកជញ្ជូន" : "Shipping Info" },
    { href: "/help", label: isKh ? "មជ្ឈមណ្ឌលជំនួយ" : "Help Center" },
  ]

  const linkClass =
    "group inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-300 hover:text-white transition-colors"

  return (
    <footer className="relative bg-[#071e38] text-slate-200 mt-14 font-sans border-t-4 border-[#004691]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-14 pb-10">

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 pb-12 border-b border-white/10">

          {/* Col 1: Brand & Social */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link
              href="/"
              className="inline-flex items-center w-fit bg-white px-3.5 py-2 rounded-lg shadow-sm hover:opacity-95 transition-opacity"
            >
              <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-9 w-auto object-contain" />
            </Link>

            <p className="text-[13px] leading-relaxed text-slate-300 max-w-sm">
              {isKh ? (
                <>
                  <strong className="text-white">ក្រុមហ៊ុន យ៉ាង ស៊ី គ្រុប (Yeung Shi Group)</strong> ត្រូវបានបង្កើតឡើងតាំងពីទសវត្សរ៍ឆ្នាំ ១៩៩០ និងពង្រីកប្រតិបត្តិការមកកម្ពុជានៅឆ្នាំ ២០០៥ ដោយផ្គត់ផ្គង់ម៉ាស៊ីន និងឧបករណ៍ឧស្សាហកម្មគុណភាពខ្ពស់។
                </>
              ) : (
                <>
                  <strong className="text-white">Yeung Shi Group Co., Ltd.</strong> — established in Guangzhou in the 1990s and operating in Cambodia since 2005, supplying reliable industrial, food, and packaging machinery.
                </>
              )}
            </p>

            {/* Social Channels */}
            <div className="flex items-center gap-2.5 pt-1">
              {settings.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-slate-200 hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-slate-200 hover:bg-[#FF0000] hover:border-[#FF0000] hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faYoutube} className="w-4 h-4" />
                </a>
              )}
              {settings.telegram_url && (
                <a
                  href={
                    settings.telegram_url.startsWith("http")
                      ? settings.telegram_url
                      : `https://t.me/${settings.telegram_url.replace("@", "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 flex items-center justify-center text-slate-200 hover:bg-[#229ED9] hover:border-[#229ED9] hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTelegram} className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-white mb-4 pb-2 border-b border-white/10">
              {isKh ? "តំណរភ្ជាប់" : "Company"}
            </h3>
            <ul className="flex flex-col gap-y-2.5">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400/70 group-hover:translate-x-0.5 group-hover:text-white transition-transform" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Support */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-white mb-4 pb-2 border-b border-white/10">
              {isKh ? "សេវាកម្មអតិថិជន" : "Support"}
            </h3>
            <ul className="flex flex-col gap-y-2.5">
              {supportLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400/70 group-hover:translate-x-0.5 group-hover:text-white transition-transform" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact Information & Payment Badges */}
          <div className="lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-white mb-4 pb-2 border-b border-white/10">
              {isKh ? "ព័ត៌មានទំនាក់ទំនង" : "Contact & Showroom"}
            </h3>
            <ul className="flex flex-col gap-y-3">
              <li>
                <a
                  href={`tel:${settings.contact_phone?.replace(/\s/g, "")}`}
                  className="group flex items-start gap-2.5 text-[13px] text-slate-300 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span className="font-medium tracking-wide">{settings.contact_phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="group flex items-start gap-2.5 text-[13px] text-slate-300 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span className="break-all font-medium">{settings.contact_email}</span>
                </a>
              </li>
              {settings.address && (
                <li className="flex items-start gap-2.5 text-[13px] text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{settings.address}</span>
                </li>
              )}
              <li className="flex items-start gap-2.5 text-[13px] text-slate-300">
                <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{settings.working_hours || "8 : 00 am – 5:30pm ( Mon – Sat )"}</span>
              </li>
            </ul>

            {/* Payment & Trust Badges */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/15 text-[11px] font-semibold text-slate-200">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                {isKh ? "ទូទាត់តាម KHQR" : "KHQR Payment"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/15 text-[11px] font-semibold text-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                {isKh ? "ធានាគុណភាព និងសេវាកម្ម" : "Warranty & Support"}
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-300">
          <p className="text-center sm:text-left">
            &copy; {currentYear} <span className="text-white font-semibold">Yeung Shi Group Co., Ltd.</span>{" "}
            {isKh ? "រក្សាសិទ្ធិគ្រប់យ៉ាង។" : "All rights reserved."}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">
              {isKh ? "គោលការណ៍ឯកជនភាព" : "Privacy Policy"}
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">
              {isKh ? "លក្ខខណ្ឌសេវាកម្ម" : "Terms of Service"}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
