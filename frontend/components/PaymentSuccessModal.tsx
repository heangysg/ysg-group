"use client"

import { CheckCircle2, Package, Home, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  amount: number
  items?: any[]
}

export default function PaymentSuccessModal({ isOpen, onClose, orderId, amount, items }: PaymentSuccessModalProps) {
  const { t, language } = useLanguage()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="solid-card relative w-full max-w-xl bg-white overflow-hidden animate-in zoom-in-95 fade-in duration-300 ease-out flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-10 text-center space-y-6 shrink-0 border-b-4 border-slate-900">
          
          {/* Success Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping duration-[2000ms]" />
            <div className="relative flex items-center justify-center w-20 h-20 bg-emerald-400 text-slate-900 border-4 border-slate-900 shadow-hard-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-widest">
              {language === "kh" ? "ការទូទាត់ជោគជ័យ!" : "Payment Successful!"}
            </h2>
            <p className="text-sm text-slate-900 font-bold max-w-md mx-auto leading-relaxed">
              {language === "kh" 
                ? "សូមអរគុណសម្រាប់ការវិនិយោគរបស់អ្នក។ គ្រឿងម៉ាស៊ីនរបស់អ្នកកំពុងត្រូវបានរៀបចំ។" 
                : "Thank you for your investment. We are now preparing your equipment manifest for logistics."}
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 md:p-10 space-y-8 bg-slate-50">
          
          {/* Mini Summary */}
          <div className="bg-white border-2 border-slate-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-hard-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language === "kh" ? "លេខបញ្ជាទិញ" : "Order ID"}</span>
              <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">#{orderId.slice(0, 10)}</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{language === "kh" ? "ចំនួនទឹកប្រាក់" : "Amount Paid"}</span>
              <p className="text-xl font-black text-primary tracking-tighter">${amount.toLocaleString()}</p>
            </div>
          </div>

          {/* Product Items */}
          {items && items.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                {language === "kh" ? "គ្រឿងម៉ាស៊ីន" : "Equipment Manifest"}
              </h3>
              <div className="bg-white border-2 border-slate-900 shadow-hard-sm divide-y-2 divide-slate-900">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-100 shrink-0 border-2 border-slate-900 overflow-hidden">
                      <img src={item.image.includes('cloudinary.com') ? item.image.replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 uppercase truncate">
                        {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 uppercase">
                        {language === "kh" ? "ចំនួន" : "Qty"}: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link 
              href={`/orders/${orderId}`}
              onClick={onClose}
              className="btn-primary flex-[1.5] py-4 text-xs flex items-center justify-center gap-2"
            >
              {language === "kh" ? "មើលព័ត៌មានលម្អិត" : "View Details"}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/"
              onClick={onClose}
              className="flex-1 py-4 bg-white text-slate-900 border-2 border-slate-900 font-bold text-xs uppercase tracking-widest hover:-translate-y-1 hover:shadow-hard transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              {language === "kh" ? "ត្រឡប់ទៅដើម" : "Home"}
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-slate-900 py-3 text-center shrink-0">
          <p className="text-[10px] font-bold text-slate-50 uppercase tracking-[0.2em]">
            YSG Machinery • Industrial Solutions
          </p>
        </div>
      </div>
    </div>
  )
}
