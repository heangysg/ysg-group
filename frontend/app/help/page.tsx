"use client"

import PublicLayout from "../../components/PublicLayout"
import Link from "next/link"
import { useLanguage } from "../../contexts/LanguageContext"
import { HelpCircle, ChevronDown } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    q_en: "How do I place an order?",
    a_en: "Browse our product catalog, click on any product, and press 'Place Order' or 'Contact Sales'. Our team will follow up with you to confirm the order details and pricing.",
    q_kh: "តើខ្ញុំបញ្ជាទិញបែបណា?",
    a_kh: "រុករកកាតាឡុករបស់យើង ចុចលើផលិតផល ហើយចុច 'បញ្ជាទិញ' ឬ 'ទំនាក់ទំនងផ្នែកលក់'។ ក្រុមការងារយើងនឹងទំនាក់ទំនងអ្នកដើម្បីបញ្ជាក់ការបញ្ជាទិញ។"
  },
  {
    q_en: "What payment methods do you accept?",
    a_en: "We accept bank transfers, KHQR (Bakong), and cash on delivery for local orders. Contact our sales team for details on large equipment purchases.",
    q_kh: "តើអ្នកទទួលការបង់ប្រាក់បែបណា?",
    a_kh: "យើងទទួលការផ្ទេរប្រាក់តាមធនាគារ KHQR (Bakong) និងការបង់ប្រាក់ជាសាច់ប្រាក់។ ទំនាក់ទំនងផ្នែកលក់សម្រាប់ការទិញគ្រឿងចក្រធំ។"
  },
  {
    q_en: "Can I return a product?",
    a_en: "If you receive a product that is damaged or defective, please contact us within 24 hours with photos. We will arrange a replacement or refund based on the situation.",
    q_kh: "តើខ្ញុំអាចប្រគល់ផលិតផលត្រឡប់ទៅវិញបានទេ?",
    a_kh: "ប្រសិនបើអ្នកទទួលផលិតផលខូចខាត សូមទំនាក់ទំនងក្នុងរយៈពេល ២៤ ម៉ោង ជាមួយរូបថត។ យើងនឹងរៀបចំការជំនួស ឬសងប្រាក់វិញ។"
  },
  {
    q_en: "Do you offer warranties?",
    a_en: "Yes. All products sold by YSG Group come with a quality guarantee. Specific warranty terms vary by product type — please check the product description or ask our sales team.",
    q_kh: "តើអ្នកផ្តល់ការធានាទេ?",
    a_kh: "បាទ/ចាស។ ផលិតផលទាំងអស់របស់ YSG Group មានការធានាគុណភាព។ លក្ខខណ្ឌការធានាខុសៗគ្នា — សូមមើលការពណ៌នា ឬសួរក្រុមការងាររបស់យើង។"
  },
  {
    q_en: "How can I track my order?",
    a_en: "You can track your order on the Track Order page using your order ID. You can also contact our sales team directly for real-time updates.",
    q_kh: "តើខ្ញុំអាចតាមដានការបញ្ជាទិញរបស់ខ្ញុំដោយរបៀបណា?",
    a_kh: "អ្នកអាចតាមដានការបញ្ជាទិញតាមទំព័រ 'តាមដានការបញ្ជាទិញ' ដោយប្រើ ID របស់អ្នក ឬទំនាក់ទំនងក្រុមការងារ។"
  },
  {
    q_en: "Do you ship outside of Cambodia?",
    a_en: "Currently our primary service area is Cambodia. For international shipping inquiries, please contact us directly to discuss availability and costs.",
    q_kh: "តើអ្នកដឹកជញ្ជូនក្រៅប្រទេសកម្ពុជាទេ?",
    a_kh: "បច្ចុប្បន្ន តំបន់សេវាកម្មចម្បងរបស់យើងគឺប្រទេសកម្ពុជា។ សម្រាប់ការដឹកជញ្ជូនអន្តរជាតិ សូមទំនាក់ទំនងដោយផ្ទាល់។"
  }
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-900 text-sm pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const { language } = useLanguage()

  return (
    <PublicLayout>
      <div className="bg-[#F8FAFC] min-h-screen pb-20">
        <div className="bg-white border-b border-slate-100 py-10 md:py-14">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">YSG Group</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              {language === "kh" ? "មជ្ឈមណ្ឌលជំនួយ" : "Help Center"}
            </h1>
            <p className="text-slate-500 text-base max-w-xl">
              {language === "kh"
                ? "ចម្លើយចំពោះសំណួរដែលសួរជាញឹកញាប់"
                : "Answers to our most frequently asked questions."}
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                q={language === "kh" ? faq.q_kh : faq.q_en}
                a={language === "kh" ? faq.a_kh : faq.a_en}
              />
            ))}
          </div>

          <div className="mt-10 bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <p className="font-black text-slate-900 text-base mb-1">
                {language === "kh" ? "នៅតែមានសំណួរ?" : "Still have questions?"}
              </p>
              <p className="text-slate-500 text-sm">
                {language === "kh" ? "ក្រុមការងារ YSG Group ត្រៀមខ្លួនជួយអ្នក ២៤/៧" : "Our team is available to help you."}
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
