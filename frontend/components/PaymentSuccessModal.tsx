"use client"

import { Check, ExternalLink, Home, Printer, Receipt } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "../contexts/LanguageContext"
import { getOptimizedImageUrl } from "../lib/imageUtils"
import Portal from "./Portal"

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  amount: number
  items?: any[]
  customerName?: string
  customerPhone?: string
  paymentMethod?: string
  paidAt?: string
}

const formatCurrency = (value: number) =>
  `$${(Number.isFinite(Number(value)) ? Number(value) : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  orderId,
  amount,
  items,
  customerName,
  customerPhone,
  paymentMethod = "Bakong KHQR",
  paidAt,
}: PaymentSuccessModalProps) {
  const { language } = useLanguage()
  const isKh = language === "kh"

  if (!isOpen) return null

  const shortRef = orderId ? orderId.slice(0, 8).toUpperCase() : "--------"
  const timestamp = paidAt ? new Date(paidAt) : new Date()
  const formattedDate = Number.isNaN(timestamp.getTime())
    ? ""
    : timestamp.toLocaleString(isKh ? "en-GB" : "en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

  const normalizedItems = Array.isArray(items) ? items : []
  const itemsSubtotal = normalizedItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  )
  const totalPaid = Number(amount) || itemsSubtotal

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Clean Digital Receipt Modal */}
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 fade-in duration-300 ease-out flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Confirmation Header with Circular Tick */}
          <div className="px-6 pt-7 pb-5 text-center bg-gradient-to-b from-emerald-50/70 to-white border-b border-slate-100 shrink-0">
            {/* Circular Tick Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center mb-3.5">
              <div className="absolute inset-1 rounded-full bg-emerald-400/30 animate-ping [animation-duration:2.2s]" />
              <div className="relative w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-[6px] ring-emerald-100">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {isKh ? "ការទូទាត់បានជោគជ័យ" : "Payment Confirmed"}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {isKh
                ? "ប្រតិបត្តិការរបស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់ដោយជោគជ័យ"
                : "Your transaction has been verified and recorded"}
            </p>
          </div>

          {/* Scrollable Official Receipt Card */}
          <div className="overflow-y-auto px-5 sm:px-6 py-5 bg-slate-50/80 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
              {/* Merchant Strip */}
              <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="/logo.png"
                    alt="Yeung Shi Group"
                    className="w-7 h-7 object-contain shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#004691] leading-tight truncate">
                      YEUNG SHI GROUP
                    </p>
                    <p className="text-[10px] font-medium text-slate-500">
                      {isKh ? "បង្កាន់ដៃទូទាត់ប្រាក់ផ្លូវការ" : "Official Payment Receipt"}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isKh ? "បានទូទាត់" : "Paid"}
                </span>
              </div>

              {/* Total Paid Highlight */}
              <div className="px-4 py-4 text-center border-b border-dashed border-slate-200">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {isKh ? "ចំនួនទឹកប្រាក់បានទូទាត់" : "Total Amount Paid"}
                </p>
                <p className="text-3xl font-bold text-slate-900 tabular-nums mt-0.5 tracking-tight">
                  {formatCurrency(totalPaid)}
                </p>
              </div>

              {/* Receipt Metadata Rows */}
              <div className="px-4 py-3 space-y-2 text-xs border-b border-dashed border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 font-medium">
                    {isKh ? "លេខបង្កាន់ដៃ / បញ្ជាទិញ" : "Receipt / Order No."}
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    #{shortRef}
                  </span>
                </div>

                {formattedDate && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">
                      {isKh ? "កាលបរិច្ឆេទ" : "Date & Time"}
                    </span>
                    <span className="font-semibold text-slate-800 tabular-nums text-right">
                      {formattedDate}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 font-medium">
                    {isKh ? "វិធីសាស្ត្រទូទាត់" : "Payment Method"}
                  </span>
                  <span className="font-semibold text-slate-800">{paymentMethod}</span>
                </div>

                {customerName && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">
                      {isKh ? "អតិថិជន" : "Customer"}
                    </span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                      {customerName}
                      {customerPhone ? ` • ${customerPhone}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Itemized Goods Breakdown */}
              {normalizedItems.length > 0 && (
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-2">
                    <span>{isKh ? "មុខទំនិញ" : "Items"}</span>
                    <span>{isKh ? "ទឹកប្រាក់" : "Amount"}</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {normalizedItems.map((item, idx) => {
                      const qty = Number(item.quantity) || 1
                      const price = Number(item.price) || 0
                      const displayName =
                        isKh && item.nameKhmer ? item.nameKhmer : item.name
                      return (
                        <div key={idx} className="py-2.5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                            <img
                              src={
                                getOptimizedImageUrl(item.image, "thumb") ||
                                "https://res.cloudinary.com/dn4ciyses/image/upload/w_200,h_200,c_limit,f_auto,q_auto/v1786777638/pwjj4fnchbrhzo69dmom.webp"
                              }
                              alt={displayName}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src =
                                  "https://res.cloudinary.com/dn4ciyses/image/upload/w_200,h_200,c_limit,f_auto,q_auto/v1786777638/pwjj4fnchbrhzo69dmom.webp"
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-slate-500 tabular-nums">
                              {formatCurrency(price)} × {qty}
                            </p>
                          </div>
                          <p className="text-xs font-bold text-slate-900 tabular-nums shrink-0">
                            {formatCurrency(price * qty)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Receipt Total Summary */}
              <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  {isKh ? "សរុបរួម" : "Total Paid (USD)"}
                </span>
                <span className="font-bold text-sm text-[#004691] tabular-nums">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/orders/${orderId}/invoice`}
                  target="_blank"
                  className="py-2.5 px-3 bg-[#004691] hover:bg-[#003570] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
                >
                  <Printer className="w-3.5 h-3.5 shrink-0" />
                  <span>{isKh ? "បង្កាន់ដៃ / បោះពុម្ព" : "Print Receipt"}</span>
                  <ExternalLink className="w-3 h-3 opacity-80 shrink-0" />
                </Link>

                <Link
                  href={`/orders/${orderId}`}
                  onClick={onClose}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#004691] shrink-0" />
                  <span>{isKh ? "មើលការបញ្ជាទិញ" : "Order Details"}</span>
                </Link>
              </div>

              <Link
                href="/"
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{isKh ? "ត្រឡប់ទៅទំព័រដើម" : "Back to Home"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
