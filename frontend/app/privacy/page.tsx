"use client"

import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
 const { language } = useLanguage()

 const sections = language === "kh" ? [
 { title: "ព័ត៌មានដែលយើងប្រមូល", body: "យើងប្រមូលព័ត៌មានដែលអ្នកផ្តល់ដោយផ្ទាល់ ដូចជា ឈ្មោះ អ៊ីមែល លេខទូរស័ព្ទ និងអាសយដ្ឋានដឹកជញ្ជូន នៅពេលអ្នកបញ្ជាទិញ ឬទំនាក់ទំនងក្រុមការងាររបស់យើង។" },
 { title: "របៀបប្រើប្រាស់ព័ត៌មាន", body: "ព័ត៌មានរបស់អ្នកត្រូវបានប្រើសម្រាប់ការដំណើរការការបញ្ជាទិញ ការដឹកជញ្ជូន ការទំនាក់ទំនង និងការកែលម្អសេវាកម្ម។ យើងមិនលក់ ឬចែករំលែកទិន្នន័យរបស់អ្នកជាមួយភាគីទីបី ដោយគ្មានការអនុញ្ញាតរបស់អ្នក។" },
 { title: "សុវត្ថិភាពទិន្នន័យ", body: "យើងប្រើប្រព័ន្ធសុវត្ថិភាព SSL encryption ដើម្បីការពារទិន្នន័យរបស់អ្នកអំឡុងពេលបញ្ជូន និងផ្ទុក។ ព័ត៌មានរបស់អ្នកត្រូវបានផ្ទុកនៅលើម៉ាស៊ីនមេដែលមានសុវត្ថិភាព។" },
 { title: "ខូឃីស៍", body: "គេហទំព័ររបស់យើងប្រើខូឃីស៍ដើម្បីកែលម្អបទពិសោធ ។ អ្នកអាចបិទខូឃីស៍តាមការកំណត់ browser ប៉ុន្តែអាចប៉ះពាល់ដល់ការប្រើប្រាស់គេហទំព័រ។" },
 { title: "សិទ្ធិរបស់អ្នក", body: "អ្នកមានសិទ្ធិចូលប្រើ កែប្រែ ឬលុបព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក។ ដើម្បីធ្វើសំណើ សូមទំនាក់ទំនងខ្ញុំ។" },
 { title: "ការផ្លាស់ប្តូរគោលនយោបាយ", body: "យើងរក្សាសិទ្ធិកែប្រែគោលនយោបាយភាពឯកជននៅពេលណាក៏ដោយ។ ការផ្លាស់ប្តូរសំខាន់ៗនឹងត្រូវជូនដំណឹងតាមរយៈគេហទំព័ររបស់យើង។" }
 ] : [
 { title: "Information We Collect", body: "We collect information you provide directly, such as your name, email, phone number, and delivery address when you place an order or contact our team." },
 { title: "How We Use Your Information", body: "Your information is used to process orders, arrange delivery, communicate with you, and improve our services. We do not sell or share your data with third parties without your consent." },
 { title: "Data Security", body: "We use SSL encryption to protect your data during transmission and storage. Your information is stored on secured servers." },
 { title: "Cookies", body: "Our website uses cookies to improve your experience. You can disable cookies in your browser settings, but this may affect some functionality." },
 { title: "Your Rights", body: "You have the right to access, correct, or delete your personal information. To make a request, please contact us via our contact page." },
 { title: "Changes to This Policy", body: "We reserve the right to update this privacy policy at any time. Significant changes will be announced via our website." }
 ]

 return (
 <PublicLayout>
 <div className="bg-[#F8FAFC] min-h-screen pb-20">
 <div className="bg-white border-b border-slate-100 py-10 md:py-14">
 <div className="max-w-3xl mx-auto px-4 md:px-8">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 bg-primary/10 text-primary rounded-md flex items-center justify-center">
 <Shield className="w-5 h-5" />
 </div>
 <span className="text-xs font-bold text-primary font-medium">YSG Group</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
 {language === "kh" ? "គោលនយោបាយភាពឯកជន" : "Privacy Policy"}
 </h1>
 <p className="text-slate-500 text-sm">
 {language === "kh" ? "ចុងក្រោយធ្វើបច្ចុប្បន្នភាព: ២០២៥" : "Last updated: 2025"}
 </p>
 </div>
 </div>

 <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
 <div className="bg-white border border-slate-100 rounded-md divide-y divide-slate-100">
 {sections.map((section, i) => (
 <div key={i} className="px-6 md:px-8 py-6">
 <h2 className="font-bold text-slate-900 text-base mb-2">{section.title}</h2>
 <p className="text-slate-500 text-sm leading-relaxed">{section.body}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </PublicLayout>
 )
}
