"use client"

import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Target, Eye, Award, Users } from "lucide-react"

export default function AboutPage() {
  const { t } = useLanguage()

  const values = [
    { icon: Target, title: t("ourMission"), desc: t("missionDesc") || "To deliver premium heavy equipment solutions that empower businesses." },
    { icon: Eye, title: t("ourVision"), desc: t("visionDesc") || "To be the leading heavy equipment partner across Southeast Asia." },
    { icon: Award, title: t("qualityAssured"), desc: t("qualityDesc") },
    { icon: Users, title: t("support247"), desc: t("supportDesc") },
  ]

  return (
    <PublicLayout>
      <main className="pb-32 pt-24 md:pt-40 px-6 bg-nichhy min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {/* 💎 Boutique Brand Intro */}
          <div className="max-w-4xl mb-24 animate-in fade-in slide-in-from-top duration-700">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] block mb-6">Our Legacy</span>
            <h1 className="text-5xl md:text-8xl font-black text-slate-950 mb-10 tracking-tighter leading-[0.9] uppercase">
              {t("about")} <br/> <span className="text-primary">YSG MACHINERY</span>
            </h1>
            <p className="text-slate-500 text-xl md:text-2xl font-bold italic opacity-80 leading-relaxed max-w-2xl">
              YSG Machinery is the premier destination for elite industrial equipment, setting the standard for excellence across Southeast Asia since 2010.
            </p>
          </div>

          {/* 🏗️ Heavy Industrial Boutique Banner */}
          <div className="relative rounded-[4rem] overflow-hidden bg-white border border-slate-100 shadow-lux-deep p-12 md:p-24 mb-32 group animate-in fade-in zoom-in duration-1000">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50/50 -skew-x-12 translate-x-1/2 group-hover:translate-x-1/3 transition-soft duration-1000" />
            <div className="relative z-10 max-w-2xl space-y-8">
              <div className="w-16 h-1.5 bg-primary rounded-full" />
              <h2 className="text-4xl md:text-6xl font-black text-slate-950 leading-none uppercase tracking-tighter">Your Trusted <br/>Partner Since 2010</h2>
              <p className="text-slate-500 text-lg md:text-xl font-bold italic opacity-80 leading-relaxed">
                With over a decade of elite experience, we have engineered a reputation for absolute reliability, quality, and world-class industrial service.
              </p>
            </div>
          </div>

          {/* 🧩 Modular Boutique Values */}
          <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom duration-1000">
            {values.map((item, i) => (
              <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-lux-deep transition-soft group">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-primary mb-10 shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-soft">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="font-black text-3xl text-slate-950 mb-6 tracking-tighter uppercase">{item.title}</h3>
                <p className="text-slate-500 font-bold italic opacity-80 leading-relaxed text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
