"use client"

import { useState, useEffect } from "react"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Target, Eye, Award, Users, MapPin, Globe, ShieldCheck, Zap } from "lucide-react"

export default function AboutPage() {
  const { t, language } = useLanguage()

  const [settings, setSettings] = useState<any>({})

  useEffect(() => {
    async function fetchSettings() {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      try {
        const res = await fetch(`${API_URL}/api/public/settings`)
        const data = await res.json()
        setSettings(data.data || {})
      } catch (err) {
        console.error("Failed to fetch settings:", err)
      }
    }
    fetchSettings()
  }, [])

  const stats = [
    { label: language === "kh" ? "ឆ្នាំនៃបទពិសោធន៍" : "Years Experience", value: settings?.stat_years || "30+" },
    { label: language === "kh" ? "សាខាសរុប" : "Total Branches", value: settings?.stat_branches || "10" },
    { label: language === "kh" ? "ផលិតផលគ្រឿងម៉ាស៊ីន" : "Machinery Units", value: settings?.stat_machinery || "5000+" },
    { label: language === "kh" ? "អតិថិជនជឿជាក់" : "Trusted Clients", value: settings?.stat_clients || "15k+" },
  ]

  const values = [
    {
      icon: ShieldCheck,
      title: language === "kh" ? "គុណភាព និងភាពជឿជាក់" : "Quality & Reliability",
      desc: language === "kh" ? "ក្រុមហ៊ុនតែងតែផ្តោតលើគុណភាព សេវាកម្ម និងភាពជឿជាក់ ដើម្បីរក្សាភាពស្មោះត្រង់ពីអតិថិជន។" : "We focus on quality, service, and reliability to maintain customer loyalty and trust."
    },
    {
      icon: Target,
      title: language === "kh" ? "គាំទ្រអាជីវកម្ម" : "Empowering Business",
      desc: language === "kh" ? "ជួយអតិថិជនចាប់ផ្តើម និងពង្រីកអាជីវកម្ម តាមរយៈការផ្តល់ជូនគ្រឿងម៉ាស៊ីនដែលសមស្របតាមតម្រូវការ។" : "Helping customers start and expand their businesses through specialized machinery solutions."
    },
    {
      icon: Users,
      title: language === "kh" ? "ការប្រឹក្សាជំនាញ" : "Expert Consultation",
      desc: language === "kh" ? "ផ្តល់សេវាកម្មល្អ និងការប្រឹក្សាជំនាញ ដើម្បីធានាថាអតិថិជនទទួលបានផលិតផលត្រឹមត្រូវ។" : "Providing elite service and professional consultation to ensure clients get the right equipment."
    },
    {
      icon: Zap,
      title: language === "kh" ? "ដំណោះស្រាយអនឡាញ" : "Online Solutions",
      desc: language === "kh" ? "បង្កើនភាពងាយស្រួលក្នុងការទិញ និងស្វែងរកព័ត៌មានផលិតផលតាមរយៈគេហទំព័រទំនើប។" : "Increasing ease of purchase and product information access through our advanced web portal."
    },
  ]

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white pb-24 pt-6 md:pt-8">

        {/* 🏆 Hero Section */}
        <section className="pt-6 md:pt-10 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">{language === "kh" ? "ប្រវត្តិក្រុមហ៊ុន YSG Group" : "YSG Group Legacy"}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-medium text-slate-900 tracking-tight uppercase leading-[1.1] mb-8 max-w-4xl">
              {language === "kh"
                ? "ប្រវត្តិនៃការបង្កើតក្រុមហ៊ុន YSG Group"
                : "The Heritage of YSG Group (Yeung Shi Group)"}
            </h1>
            <p className="text-slate-600 font-normal text-lg md:text-xl leading-relaxed max-w-3xl mb-12">
              {language === "kh"
                ? "ក្រុមហ៊ុន YSG Group ត្រូវបានបង្កើតឡើងដំបូងនៅប្រទេសចិន ក្នុងទីក្រុងក្វាងចូវ ចាប់តាំងពីទសវត្សរ៍ឆ្នាំ 1990 ហើយយើងបានចាប់ផ្តើមដំណើរការក្រុមហ៊ុននៅប្រទេសកម្ពុជាក្នុងឆ្នាំ 2005 ដោយក្តីស្រមៃរបស់យើងគឺស្វែងរកទីផ្សារគោលដៅក្នុងប្រទេសកម្ពុជា។"
                : "Yeung Shi Group company was establish in china at GuangZhou city since 1990s, and we started to process the company in Cambodia in 2005, our passion is trying to figure out a target market in Cambodia."}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y-2 border-slate-900">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tighter">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 🏔️ Story Section */}
        <section className="py-20 bg-slate-50 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
              <div className="solid-card bg-white p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 border-2 border-slate-900" />
                <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-widest relative z-10">
                  {language === "kh" ? "ដំណើរការនៅកម្ពុជា" : "Presence in Cambodia"}
                </h3>
                <p className="text-slate-900 font-bold leading-relaxed mb-6 relative z-10">
                  {language === "kh"
                    ? "ក្រុមហ៊ុន YSG Group ត្រូវបានចុះបញ្ជីអាជីវកម្មត្រឹមត្រូវស្របច្បាប់នៅកម្ពុជា។ ការិយាល័យកណ្ដាលស្ថិតនៅ អគារលេខ 230 ផ្លូវ 271 សង្កាត់ទួលទំពូងទី២ ខណ្ឌចំការមន រាជធានីភ្នំពេញ។"
                    : "YSG Group is a fully legally registered entity in Cambodia. Our headquarters is located at Building 230, St. 271, Sangkat Toul Tompong II, Khan Chamkamon, Phnom Penh."}
                </p>
                <div className="flex items-center gap-3 text-slate-900 font-bold text-[11px] uppercase tracking-widest relative z-10">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{language === "kh" ? "មាន ១០ សាខាទូទាំងប្រទេស" : "10 Branches Nationwide"}</span>
                </div>
              </div>

              <div className="solid-card bg-slate-900 p-10 text-white space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-widest text-primary">
                  {language === "kh" ? "គុណតម្លៃស្នូល" : "Core Philosophy"}
                </h3>
                <p className="text-white font-bold leading-relaxed">
                  {language === "kh"
                    ? "ក្រុមហ៊ុន YSG Group គឺជាក្រុមហ៊ុនដែលដំណើរការតាមច្បាប់ និងមានការចុះបញ្ជីត្រឹមត្រូវ មិនមានការលក់ផលិតផលគ្មានគុណភាព ឬបន្លំអតិថិជនឡើយ។"
                    : "YSG Group is a fully registered legal entity. we strictly maintain a policy against low-quality or fraudulent products."}
                </p>
                <div className="pt-4 border-t-2 border-slate-800 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">{language === "kh" ? "គុណភាព ១០០%" : "100% Quality"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white">{language === "kh" ? "ស្តង់ដារសកល" : "Global Standards"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-10 animate-in fade-in slide-in-from-right duration-700">
              <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">
                {language === "kh" ? "ផលិតផលចម្បងរបស់យើង" : "Our Major Product Lines"}
              </h2>
              <div className="grid gap-4">
                {[
                  language === "kh" ? "ម៉ាស៊ីនផលិតអាហារ និងភេសជ្ជៈ" : "Food & Beverage Machinery",
                  language === "kh" ? "ម៉ាស៊ីនកសិកម្ម" : "Agricultural Machinery",
                  language === "kh" ? "ម៉ាស៊ីនវេចខ្ចប់" : "Packaging Machinery",
                  language === "kh" ? "ឧបករណ៍សម្រាប់សណ្ឋាគារ និងភោជនីយដ្ឋាន" : "Hotel & Restaurant Equipment",
                  language === "kh" ? "ម៉ាស៊ីនឧស្សាហកម្ម និងឧបករណ៍ពាណិជ្ជកម្ម" : "Industrial & Commercial Tools"
                ].map((item, i) => (
                  <div key={i} className="solid-card flex items-center gap-4 p-4 bg-slate-50 hover:bg-primary hover:text-slate-900 transition-all cursor-pointer group">
                    <div className="w-3 h-3 bg-slate-900 border-2 border-slate-900 group-hover:bg-white" />
                    <span className="font-bold text-slate-900 uppercase text-[12px] tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 🎯 Mission Section */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900 uppercase tracking-tight mb-4">
              {language === "kh" ? "គោលបំណងរបស់យើង" : "Our Mission & Purpose"}
            </h2>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, i) => (
              <div key={i} className="solid-card bg-white p-8 group flex flex-col items-center text-center hover:bg-primary transition-colors">
                <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-primary mb-8 border-2 border-slate-900 shadow-hard group-hover:shadow-none group-hover:translate-y-1 group-hover:translate-x-1 transition-all">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-[16px] text-slate-900 mb-4 tracking-widest uppercase">{item.title}</h3>
                <p className="text-slate-900 font-bold leading-relaxed text-[13px]">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🚀 Problem Solving Banner */}
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <div className="solid-card bg-primary p-12 md:p-20 text-slate-900 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white border-l-2 border-slate-900 -skew-x-12 translate-x-1/2" />
            <div className="relative z-10 max-w-2xl space-y-6">
              <span className="text-xs font-bold text-slate-900 bg-white px-3 py-1 border-2 border-slate-900 uppercase tracking-[0.3em] inline-block">{language === "kh" ? "ដោះស្រាយបញ្ហាឧស្សាហកម្ម" : "Solving Industrial Challenges"}</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">
                {language === "kh" ? "ហេតុអ្វីបានជាយើងមានគេហទំព័រនេះ?" : "Bridging the Gap with Technology"}
              </h2>
              <p className="text-slate-900 font-bold text-lg leading-relaxed">
                {language === "kh"
                  ? "គេហទំព័រ YSG Group មានតួនាទីសំខាន់ក្នុងការផ្សព្វផ្សាយផលិតផល និងជួយអតិថិជនស្វែងរកព័ត៌មានលម្អិតអំពីម៉ាស៊ីននីមួយៗបានយ៉ាងងាយស្រួល ដើម្បីកាត់បន្ថយបញ្ហានៃការស្វែងរកព័ត៌មាន និងការកុម្មង់ផលិតផល។"
                  : "The YSG Portal was engineered to solve accessibility challenges, providing detailed technical specifications and a full online ordering system to empower your business growth."}
              </p>
              <div className="pt-6">
                <button className="btn-primary px-8 py-4 bg-slate-900 text-white font-bold uppercase tracking-widest text-xs hover:-translate-y-1 transition-all border-2 border-slate-900">
                  {language === "kh" ? "ស្វែងរកគ្រឿងម៉ាស៊ីន" : "Explore Equipment"}
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>
    </PublicLayout>
  )
}
