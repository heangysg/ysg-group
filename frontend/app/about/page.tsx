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
      <main className="pb-24 pt-12 md:pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-20">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">{t("about")} YSG Machinery</h1>
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
              YSG Machinery is a leading provider of premium heavy equipment solutions, dedicated to excellence in construction, mining, and industrial sectors since 2010.
            </p>
          </div>

          <div className="relative rounded-[3rem] overflow-hidden bg-gray-900 p-8 md:p-16 mb-24">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent z-0" />
            <div className="relative z-10 max-w-2xl space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Your Trusted Partner Since 2010</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                With over a decade of experience, we have built a reputation for reliability, quality, and exceptional customer service, serving businesses across Southeast Asia and beyond.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((item, i) => (
              <div key={i} className="bg-gray-50 p-10 rounded-[2rem] border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-black text-2xl text-gray-900 mb-4 tracking-tight">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
