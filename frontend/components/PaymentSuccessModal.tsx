"use client"

import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  amount: number
}

export default function PaymentSuccessModal({ isOpen, onClose, orderId, amount }: PaymentSuccessModalProps) {
  const { t, language } = useLanguage()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-500 ease-out">
        <div className="p-8 md:p-12 text-center space-y-8">
          
          {/* Success Icon */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping duration-[2000ms]" />
            <div className="relative flex items-center justify-center w-24 h-24 bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900 uppercase tracking-tight">
              {language === "kh" ? "ការទូទាត់ជោគជ័យ!" : "Payment Successful!"}
            </h2>
            <p className="text-[14px] text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
              {language === "kh" 
                ? "សូមអរគុណ! ការបញ្ជាទិញរបស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់ដោយជោគជ័យ។ គ្រឿងចក្ររបស់អ្នកកំពុងត្រូវបានរៀបចំសម្រាប់ដឹកជញ្ជូន។" 
                : "Thank you! Your industrial investment has been successfully verified. We are now preparing your equipment manifest for logistics."}
            </p>
          </div>

          {/* Mini Summary */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 divide-y divide-slate-200/50">
            <div className="flex justify-between items-center pb-4">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{language === "kh" ? "លេខបញ្ជាទិញ" : "Order ID"}</span>
              <span className="text-[13px] font-medium text-slate-900 uppercase tracking-tight">#{orderId.slice(0, 10)}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{language === "kh" ? "ចំនួនទឹកប្រាក់" : "Amount Paid"}</span>
              <span className="text-xl font-medium text-primary tracking-tighter">${amount.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link 
              href="/account"
              className="flex-1 px-8 py-4 bg-slate-950 text-white rounded-xl font-medium text-[11px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-200/50 active:scale-95 flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              {language === "kh" ? "មើលការបញ្ជាទិញ" : "View My Orders"}
            </Link>
            <Link 
              href="/"
              className="flex-1 px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-xl font-medium text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              {language === "kh" ? "ត្រឡប់ទៅដើម" : "Back to Home"}
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-slate-50 py-4 border-t border-slate-100 text-center">
          <p className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em]">
            YSG Machinery • Industrial Solutions
          </p>
        </div>
      </div>
    </div>
  )
}
