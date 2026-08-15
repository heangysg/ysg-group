"use client"

import Link from "next/link"
import { MapPin, Phone, Mail, CreditCard, Clock } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook, faYoutube, faTelegram } from "@fortawesome/free-brands-svg-icons"
import { useLanguage } from "../contexts/LanguageContext"
import { useEffect, useState } from "react"

export default function Footer() {
 const { t, language } = useLanguage()
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

 const linkClass = "text-[13px] sm:text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2"

 return (
 <footer className="bg-[#00224a] text-slate-300 pt-16 pb-24 md:pb-12 mt-12 font-sans border-t border-white/10">
 <div className="max-w-7xl mx-auto px-6 md:px-10">

 {/* Main Grid: 1-col mobile → 4-col desktop */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12 mb-12">

 {/* Col 1: Branding */}
 <div className="lg:col-span-4 flex flex-col gap-5">
 <Link href="/" className="inline-block w-[140px] hover:opacity-80 transition-opacity">
 <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="w-full h-auto object-contain" />
 </Link>
 <div className="text-sm leading-relaxed text-slate-400 max-w-sm mt-2">
 {language === "kh" ? (
 <p>
 <strong className="text-white">ក្រុមហ៊ុនយ៉ាងស៊ីគ្រុប (Yeung Shi Group)</strong> ត្រូវបានបង្កើតឡើងនៅទីក្រុងក្វាងចូវ ប្រទេសចិនតាំងពីទសវត្សរ៍ឆ្នាំ ១៩៩០ និងបានពង្រីកប្រតិបត្តិការមកកាន់ប្រទេសកម្ពុជានៅឆ្នាំ ២០០៥។ យើងគឺជាអ្នកផ្គត់ផ្គង់គ្រឿងម៉ាស៊ីន និងឧបករណ៍ឧស្សាហកម្មឈានមុខគេនៅកម្ពុជា។
 </p>
 ) : (
 <p>
 <strong className="text-white">Yeung Shi Group Co., Ltd.</strong> was established in Guangzhou, China in the 1990s and expanded to Cambodia in 2005. We are a premium industrial machinery and equipment supplier in Cambodia.
 </p>
 )}
 </div>
 </div>

 {/* Col 2: Quick Links */}
 <div className="lg:col-span-3">
 <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-white mb-6">
 {language === "kh" ? "តំណរភ្ជាប់" : "Quick Links"}
 </h3>
 <ul className="flex flex-col gap-y-3.5">
 {[
 { href: "/", label: language === "kh" ? "ទំព័រដើម" : "Home" },
 { href: "/products", label: language === "kh" ? "ផលិតផលទាំងអស់" : "All Products" },
 { href: "/categories", label: language === "kh" ? "ប្រភេទផលិតផល" : "Categories" },
 { href: "/about", label: language === "kh" ? "អំពីយើង" : "About Us" },
 { href: "/contact", label: language === "kh" ? "ទំនាក់ទំនង" : "Contact Us" },
 { href: "/track-order", label: language === "kh" ? "តាមដានការបញ្ជាទិញ" : "Track Order" },
 { href: "/help", label: language === "kh" ? "មជ្ឈមណ្ឌលជំនួយ" : "Help Center" },
 ].map(item => (
 <li key={item.href}>
 <Link href={item.href} className={linkClass}>{item.label}</Link>
 </li>
 ))}
 </ul>
 </div>

 {/* Col 3: Contact */}
 <div className="lg:col-span-3">
 <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-white mb-6">
 {language === "kh" ? "ទំនាក់ទំនង" : "Contact Us"}
 </h3>
 <ul className="flex flex-col gap-y-4">
 <li>
 <a href={`tel:${settings.contact_phone?.replace(/\s/g, "")}`} className="group flex items-start gap-3 text-sm text-slate-400 hover:text-white transition-colors">
 <Phone className="w-[18px] h-[18px] text-slate-500 group-hover:text-white transition-colors mt-0.5" />
 <span className="font-[family-name:var(--font-inter)] tracking-wide">{settings.contact_phone}</span>
 </a>
 </li>
 <li>
 <a href={`mailto:${settings.contact_email}`} className="group flex items-start gap-3 text-sm text-slate-400 hover:text-white transition-colors">
 <Mail className="w-[18px] h-[18px] text-slate-500 group-hover:text-white transition-colors mt-0.5" />
 <span className="break-all font-[family-name:var(--font-inter)] tracking-wide">{settings.contact_email}</span>
 </a>
 </li>
 <li>
 <div className="flex items-start gap-3 text-sm text-slate-400">
 <Clock className="w-[18px] h-[18px] text-slate-500 mt-0.5" />
 <span className="font-[family-name:var(--font-inter)] tracking-wide">{settings.working_hours || "8 : 00 am – 5:30pm ( Mon – Sat )"}</span>
 </div>
 </li>
 </ul>
 </div>

 {/* Col 4: Social */}
 <div className="lg:col-span-2">
 <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-white mb-6">
 {language === "kh" ? "តាមដានពួកយើង" : "Follow Us"}
 </h3>
 <div className="flex flex-wrap gap-4">
 {settings.facebook_url && (
 <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" 
    className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center hover:bg-white hover:border-white group transition-all">
 <FontAwesomeIcon icon={faFacebook} className="w-[18px] h-[18px] text-white group-hover:text-[#00224a] transition-colors" />
 </a>
 )}
 {settings.youtube_url && (
 <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" 
    className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center hover:bg-white hover:border-white group transition-all">
 <FontAwesomeIcon icon={faYoutube} className="w-[18px] h-[18px] text-white group-hover:text-[#00224a] transition-colors" />
 </a>
 )}
 {settings.telegram_url && (
 <a href={settings.telegram_url.startsWith("http") ? settings.telegram_url : `https://t.me/${settings.telegram_url.replace("@", "")}`} target="_blank" rel="noopener noreferrer" 
    className="w-10 h-10 rounded-full border border-slate-600 flex items-center justify-center hover:bg-white hover:border-white group transition-all">
 <FontAwesomeIcon icon={faTelegram} className="w-[18px] h-[18px] text-white group-hover:text-[#00224a] transition-colors" />
 </a>
 )}
 </div>
 </div>

 </div>

 {/* Bottom Bar */}
 <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
 <p className="text-xs text-slate-500 text-center md:text-left">
 &copy; {currentYear} Yeung Shi Group Co., Ltd. {language === "kh" ? "រក្សាសិទ្ធិគ្រប់យ៉ាង។" : "All rights reserved."}
 </p>
 <div className="flex items-center gap-6">
 <Link href="/privacy" className="text-xs text-slate-500 hover:text-white transition-colors">
 {language === "kh" ? "គោលការណ៍ឯកជនភាព" : "Privacy Policy"}
 </Link>
 <Link href="/terms" className="text-xs text-slate-500 hover:text-white transition-colors">
 {language === "kh" ? "លក្ខខណ្ឌសេវាកម្ម" : "Terms of Service"}
 </Link>
 </div>
 </div>
 </div>
 </footer>
 )
}
