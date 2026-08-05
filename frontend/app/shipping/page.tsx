"use client"

import PublicLayout from "../../components/PublicLayout"
import Link from "next/link"
import { useLanguage } from "../../contexts/LanguageContext"
import { Truck, Clock, MapPin, PackageCheck, AlertCircle, Phone } from "lucide-react"

export default function ShippingPage() {
  const { language } = useLanguage()

  const sections = [
    {
      icon: Truck,
      title: language === "kh" ? "ការដឹកជញ្ជូន" : "Delivery Coverage",
      content: language === "kh"
        ? "យើងធ្វើការដឹកជញ្ជូនទូទាំងប្រទេសកម្ពុជា។ ការដឹកជញ្ជូនទៅដល់ភ្នំពេញ និងខេត្តនានា អាស្រ័យទៅលើទំហំ និងទម្ងន់នៃផលិតផល។"
        : "We deliver across Cambodia including Phnom Penh and all provinces. Delivery availability depends on the size and weight of the equipment ordered."
    },
    {
      icon: Clock,
      title: language === "kh" ? "រយៈពេលដឹកជញ្ជូន" : "Delivery Timeframes",
      content: language === "kh"
        ? "ការបញ្ជាទិញធម្មតាត្រូវចំណាយពេល ២–៧ ថ្ងៃធ្វើការ។ គ្រឿងចក្រ ឬម៉ាស៊ីនធ្ងន់ប្រហែល ១–២ សប្តាហ៍ អាស្រ័យទៅលើទីតាំង។"
        : "Standard orders take 2–7 business days. Heavy machinery or bulk orders may take 1–2 weeks depending on location and logistics arrangements."
    },
    {
      icon: MapPin,
      title: language === "kh" ? "ការដឹកជញ្ជូនបន្ថែមទំហំ" : "Oversized Item Shipping",
      content: language === "kh"
        ? "ផលិតផលធ្ងន់ ឬមានទំហំធំ ដូចជាម៉ាស៊ីនឧស្សាហ៍កម្ម ត្រូវដឹកជញ្ជូនតាមការសម្របសម្រួលពិសេស។ ទំនាក់ទំនងផ្នែកលក់ដើម្បីរៀបចំផែនការ។"
        : "Large or heavy industrial machinery requires special logistics arrangements. Please contact our sales team to plan delivery, including site access requirements."
    },
    {
      icon: PackageCheck,
      title: language === "kh" ? "ការត្រួតពិនិត្យផលិតផល" : "Inspection Upon Delivery",
      content: language === "kh"
        ? "យើងណែនាំឱ្យពិនិត្យផលិតផលភ្លាមៗនៅពេលទទួល។ ប្រសិនបើមានខូចខាត សូមរាយការណ៍ក្នុងរយៈពេល ២៤ ម៉ោង។"
        : "We recommend inspecting all items immediately upon delivery. If any damage is found, please report it within 24 hours of receipt with photos for a warranty claim."
    },
    {
      icon: AlertCircle,
      title: language === "kh" ? "ព័ត៌មានបន្ថែម" : "Important Notes",
      content: language === "kh"
        ? "ថ្លៃដឹកជញ្ជូនអាចប្រែប្រួលអាស្រ័យលើទំហំ ទម្ងន់ និងទីតាំង។ ការបញ្ជាក់ចុងក្រោយអំពីថ្លៃ និងម៉ោងដឹកជញ្ជូននឹងត្រូវបញ្ជូនបន្ទាប់ពីការបញ្ជាទិញ។"
        : "Shipping costs may vary based on size, weight, and destination. Final shipping fees and estimated arrival will be confirmed after your order is placed."
    },
    {
      icon: Phone,
      title: language === "kh" ? "ទំនាក់ទំនង" : "Contact for Shipping",
      content: language === "kh"
        ? "សម្រាប់ការបញ្ជូនធ្ងន់ ឬដើម្បីដឹងថ្លៃដឹកជញ្ជូនដែលមានភាពពិតប្រាកដ សូមទំនាក់ទំនងក្រុមការងារលក់របស់យើង។"
        : "For bulk orders or to get an accurate shipping quote, please contact our sales team directly via phone, Telegram, or our contact form."
    }
  ]

  return (
    <PublicLayout>
      <div className="bg-[#F8FAFC] min-h-screen pb-20">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 py-10 md:py-14">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">YSG Group</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              {language === "kh" ? "ព័ត៌មានការដឹកជញ្ជូន" : "Shipping Information"}
            </h1>
            <p className="text-slate-500 text-base max-w-xl">
              {language === "kh"
                ? "ស្វែងយល់អំពីការដឹកជញ្ជូន និងការចែកចាយផលិតផលរបស់ YSG Group"
                : "Everything you need to know about how YSG Group handles delivery and logistics."}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
          <div className="grid gap-4">
            {sections.map((section, i) => {
              const Icon = section.icon
              return (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 flex gap-5">
                  <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 mb-2">{section.title}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed">{section.content}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <p className="font-black text-slate-900 text-base mb-1">
                {language === "kh" ? "មានសំណួរបន្ថែម?" : "Have more questions?"}
              </p>
              <p className="text-slate-500 text-sm">
                {language === "kh" ? "ក្រុមការងារ YSG Group ត្រៀមខ្លួនជួយអ្នក" : "Our team is ready to help you with any shipping inquiry."}
              </p>
            </div>
            <Link href="/contact" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary transition-all whitespace-nowrap">
              {language === "kh" ? "ទំនាក់ទំនង" : "Contact Us"}
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
