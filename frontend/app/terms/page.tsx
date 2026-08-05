"use client"

import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { FileText } from "lucide-react"

export default function TermsPage() {
  const { language } = useLanguage()

  const sections = language === "kh" ? [
    { title: "ការទទួលយកលក្ខខណ្ឌ", body: "ដោយការប្រើប្រាស់គេហទំព័រ ysg-group.com អ្នកយល់ព្រមគោរពតាមលក្ខខណ្ឌប្រើប្រាស់ទាំងនេះ។ ប្រសិនបើអ្នកមិនយល់ព្រម សូមមិនប្រើប្រាស់គេហទំព័ររបស់យើង។" },
    { title: "ផលិតផល និងតម្លៃ", body: "YSG Group រក្សាសិទ្ធិក្នុងការផ្លាស់ប្តូរតម្លៃ ទំហំ ឬភាពស្ទូចស្ទើររបស់ផលិតផលដោយគ្មានការជូនដំណឹងជាមុន។ ទំព័រផលិតផលគ្រប់ទំព័រផ្តល់ព័ត៌មានបន្ថែម។" },
    { title: "ការបញ្ជាទិញ", body: "ការបញ្ជាទិញទាំងអស់ត្រូវបានបញ្ជាក់ ហើយត្រូវបានទទួលស្គាល់ Subject to availability។ ប្រសិនបើផលិតផលដែលអ្នកបញ្ជាទិញអស់ស្តុក យើងនឹងទំនាក់ទំនងអ្នកដើម្បីកំណត់ទំព័រជំនួស។" },
    { title: "ការទូទាត់", body: "ការទូទាត់ត្រូវអនុវត្ត ហើយការបញ្ជាទិញរបស់អ្នកនឹងបញ្ជូនបន្ទាប់ពីទទួលបានការទូទាត់ពេញលេញ លើកលែងករណីដែលមានការព្រមព្រៀងជាលាយលក្ខណ៍អក្សរ។" },
    { title: "ករណីទទួលខុសត្រូវ", body: "YSG Group ខំប្រឹងផ្តល់ព័ត៌មានត្រឹមត្រូវ ប៉ុន្តែ មិនទទួលខុសត្រូវចំពោះការខូចខាតដែលបណ្តាលពីការប្រើប្រាស់ ឬការពឹងផ្អែកលើព័ត៌មាននៅលើគេហទំព័រ។" },
    { title: "ច្បាប់គ្រប់គ្រង", body: "លក្ខខណ្ឌទាំងនេះគ្រប់គ្រងដោយច្បាប់ជាធរមាននៃព្រះរាជាណាចក្រកម្ពុជា។ ជម្លោះណាមួយនឹងដោះស្រាយដោយពិគ្រោះ ឬតុលាការតាមច្បាប់ Cambodia ។" }
  ] : [
    { title: "Acceptance of Terms", body: "By using ysg-group.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website." },
    { title: "Products & Pricing", body: "YSG Group reserves the right to change prices, availability, or product specifications without prior notice. Each product page provides the most up-to-date information." },
    { title: "Orders", body: "All orders are subject to confirmation and product availability. If an ordered item is out of stock, we will contact you to arrange an alternative or cancellation." },
    { title: "Payments", body: "Payment is required before shipment, unless otherwise agreed in writing. We reserve the right to cancel orders in the event of payment failure." },
    { title: "Limitation of Liability", body: "YSG Group strives to provide accurate information but is not liable for any damages arising from use of or reliance on information published on the website." },
    { title: "Governing Law", body: "These terms are governed by the laws of the Kingdom of Cambodia. Any disputes will be resolved through negotiation or Cambodian courts." }
  ]

  return (
    <PublicLayout>
      <div className="bg-[#F8FAFC] min-h-screen pb-20">
        <div className="bg-white border-b border-slate-100 py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">YSG Group</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              {language === "kh" ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms of Service"}
            </h1>
            <p className="text-slate-500 text-sm">
              {language === "kh" ? "ចុងក្រោយធ្វើបច្ចុប្បន្នភាព: ២០២៥" : "Last updated: 2025"}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
          <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100">
            {sections.map((section, i) => (
              <div key={i} className="px-6 md:px-8 py-6">
                <h2 className="font-black text-slate-900 text-base mb-2">{section.title}</h2>
                <p className="text-slate-500 text-sm leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
