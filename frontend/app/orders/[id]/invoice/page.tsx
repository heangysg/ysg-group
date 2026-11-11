"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '../../../../contexts/LanguageContext'
import {
  ArrowLeft,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck
} from 'lucide-react'

interface OrderItem {
  name: string
  sku?: string
  price: number | string
  quantity: number
  variant?: string
}

interface CompanySettings {
  site_name?: string
  contact_email?: string
  contact_phone?: string
  address?: string
}

const DEFAULT_COMPANY = {
  name: 'Yeung Shi Group',
  khmerName: 'យើង ស៊ី គ្រុប',
  tagline: 'Industrial Machinery & Equipment Solutions',
  address: 'Building 230, St. 271, Sangkat Toul Tompong II, Khan Chamkamon, Phnom Penh, Cambodia',
  phone: '010 / 011 / 012 / 070 309 302',
  email: 'yeungshigroup123@gmail.com',
  website: 'www.ysg-group.com'
}

const formatCurrency = (amount: number) =>
  `$${(Number.isFinite(amount) ? amount : 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`

const getStatusConfig = (status?: string) => {
  const s = (status || 'pending').toLowerCase()
  switch (s) {
    case 'paid':
    case 'completed':
      return {
        en: 'PAID',
        kh: 'បានទូទាត់',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300'
      }
    case 'confirmed':
    case 'processing':
      return {
        en: 'CONFIRMED',
        kh: 'បានបញ្ជាក់',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-300'
      }
    case 'shipped':
      return {
        en: 'SHIPPED',
        kh: 'កំពុងដឹកជញ្ជូន',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300'
      }
    case 'delivered':
      return {
        en: 'DELIVERED',
        kh: 'បានដឹកដល់',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300'
      }
    case 'cancelled':
      return {
        en: 'CANCELLED',
        kh: 'បានបោះបង់',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-300'
      }
    default:
      return {
        en: 'PENDING',
        kh: 'កំពុងរង់ចាំ',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300'
      }
  }
}

const formatPaymentMethod = (method?: string) => {
  if (!method) return 'Cash / Bank Transfer'
  const lower = method.toLowerCase()
  if (lower.includes('khqr') || lower.includes('bakong')) return 'Bakong KHQR'
  if (lower.includes('cod') || lower.includes('cash')) return 'Cash on Delivery (COD)'
  return method
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const rawId = params?.id
  const orderId = Array.isArray(rawId) ? rawId[0] : ((rawId as string) || '').trim()
  const { language, setLanguage } = useLanguage()
  const isKh = language === 'kh'

  const [order, setOrder] = useState<any>(null)
  const [company, setCompany] = useState(DEFAULT_COMPANY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    let isMounted = true
    const fetchInvoiceData = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      try {
        const [orderResult, settingsResult] = await Promise.allSettled([
          fetch(`${API_URL}/api/orders/${encodeURIComponent(orderId)}`),
          fetch(`${API_URL}/api/settings`)
        ])

        if (orderResult.status === 'fulfilled' && orderResult.value.ok) {
          const data = await orderResult.value.json()
          if (data && !data.error) {
            if (typeof data.items === 'string') {
              try {
                data.items = JSON.parse(data.items)
              } catch {
                data.items = []
              }
            }
            if (isMounted) setOrder(data)
          }
        }

        if (settingsResult.status === 'fulfilled' && settingsResult.value.ok) {
          const settingsJson = await settingsResult.value.json()
          const s: CompanySettings = settingsJson?.data || {}
          if (isMounted) {
            setCompany((prev) => ({
              ...prev,
              name: s.site_name && s.site_name !== 'YSG Machinery' ? s.site_name : prev.name,
              address:
                s.address && s.address !== 'Phnom Penh, Cambodia' ? s.address : prev.address,
              phone:
                s.contact_phone && !s.contact_phone.includes('XX')
                  ? s.contact_phone
                  : prev.phone,
              email:
                s.contact_email && s.contact_email !== 'info@ysgmachinery.com'
                  ? s.contact_email
                  : prev.email
            }))
          }
        }
      } catch {
        // Silently handle fetch error
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchInvoiceData()
    return () => {
      isMounted = false
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-[#004691]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-100 text-slate-800 px-4">
        <p className="text-base font-bold">
          {isKh ? 'មិនមានការបញ្ជាទិញនេះទេ' : 'Order Not Found'}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          {isKh ? 'ត្រឡប់ក្រោយ' : 'Go Back'}
        </button>
      </div>
    )
  }

  const items: OrderItem[] = Array.isArray(order.items) ? order.items : []
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  )
  const grandTotal = Number(order.totalAmount) || itemsSubtotal
  const subtotal = itemsSubtotal > 0 ? itemsSubtotal : grandTotal
  const shippingOrDiff = Math.max(0, grandTotal - subtotal)
  const invoiceShortId = String(order.id).split('-')[0].toUpperCase()
  const statusInfo = getStatusConfig(order.status)
  const issueDate = new Date(order.createdAt)

  return (
    <div className="min-h-screen bg-slate-200/80 py-6 sm:py-8 print:py-0 print:bg-white text-slate-900 font-sans">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Top Action Bar (Screen Only) */}
      <div className="max-w-[210mm] mx-auto mb-5 px-4 sm:px-0 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isKh ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
          </button>
          <span className="hidden sm:inline-block px-3 py-1.5 bg-white/90 border border-slate-300 rounded-lg text-xs font-bold text-slate-700">
            INV-{invoiceShortId}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                !isKh ? 'bg-[#004691] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('kh')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                isKh ? 'bg-[#004691] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              ខ្មែរ
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-[#004691] hover:bg-[#003570] text-white px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isKh ? 'បោះពុម្ព / រក្សាទុក PDF' : 'Print / Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Sheet */}
      <div className="bg-white mx-auto max-w-[210mm] min-h-[297mm] print:min-h-[275mm] shadow-xl print:shadow-none flex flex-col justify-between overflow-hidden rounded-sm print:rounded-none border border-slate-200 print:border-0">
        <div>
          {/* Top Brand Accent Bar */}
          <div className="h-2.5 bg-[#004691] w-full" />

          <div className="p-7 sm:p-11 print:p-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-7 border-b-2 border-slate-200">
              {/* Company Brand & Contact */}
              <div className="flex items-start gap-4 max-w-md">
                <div className="w-16 h-16 shrink-0 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Yeung Shi Group Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1.5">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#004691] tracking-tight leading-none">
                      {company.name}
                    </h1>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {company.khmerName} • {company.tagline}
                    </p>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1 pt-1 leading-snug">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#004691] shrink-0 mt-0.5" />
                      <span>{company.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#004691] shrink-0" />
                      <span>{company.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#004691] shrink-0" />
                      <span>{company.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Title & Meta Card */}
              <div className="w-full sm:w-auto sm:min-w-[235px] flex flex-col sm:items-end">
                <div className="sm:text-right mb-3">
                  <h2 className="text-3xl font-extrabold tracking-wider text-slate-900 uppercase leading-none">
                    INVOICE
                  </h2>
                  <p className="text-sm font-bold text-[#004691] mt-1">វិក្កយបត្រផ្លូវការ</p>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-600">
                      {isKh ? 'លេខវិក្កយបត្រ:' : 'Invoice No:'}
                    </span>
                    <span className="font-bold text-slate-900 font-mono">INV-{invoiceShortId}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-600">
                      {isKh ? 'កាលបរិច្ឆេទ:' : 'Issue Date:'}
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {issueDate.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-200/80">
                    <span className="font-semibold text-slate-600">
                      {isKh ? 'ស្ថានភាព:' : 'Status:'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wide ${statusInfo.badgeClass}`}
                    >
                      {isKh ? statusInfo.kh : statusInfo.en}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#004691] mb-2">
                  Bill To / វិក្កយបត្រជូន
                </p>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <div className="mt-1.5 space-y-0.5 text-xs text-slate-700 font-medium">
                  <p>{order.customerPhone || 'N/A'}</p>
                  {order.customerEmail && <p className="break-all">{order.customerEmail}</p>}
                </div>
              </div>

              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#004691] mb-2">
                  Delivery & Payment / ដឹកជញ្ជូន & ការទូទាត់
                </p>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {order.address || (isKh ? 'មកទទួលផ្ទាល់នៅហាង' : 'Store Pickup / Address not provided')}
                </p>
                <p className="mt-2 pt-2 border-t border-slate-200/70 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">
                    {isKh ? 'វិធីសាស្ត្រទូទាត់:' : 'Payment:'}
                  </span>{' '}
                  <span className="font-semibold text-slate-800">
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-7">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#004691] text-white">
                    <th className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-center w-12">
                      #
                    </th>
                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider">
                      {isKh ? 'បរិយាយទំនិញ (Description)' : 'Item Description'}
                    </th>
                    <th className="py-3 px-3 text-[11px] font-bold uppercase tracking-wider text-center w-20">
                      {isKh ? 'ចំនួន' : 'Qty'}
                    </th>
                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-right w-28">
                      {isKh ? 'តម្លៃរាយ' : 'Unit Price'}
                    </th>
                    <th className="py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-right w-32">
                      {isKh ? 'សរុប' : 'Amount'}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-slate-200">
                  {items.map((item, idx) => {
                    const qty = Number(item.quantity) || 1
                    const price = Number(item.price) || 0
                    const lineTotal = price * qty

                    return (
                      <tr key={idx} className="even:bg-slate-50/70">
                        <td className="py-3.5 px-3 text-center text-slate-600 font-semibold tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 leading-snug">{item.name}</p>
                          {(item.sku || item.variant) && (
                            <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                              {item.sku ? `SKU: ${item.sku}` : ''}
                              {item.sku && item.variant ? ' • ' : ''}
                              {item.variant || ''}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-slate-800 tabular-nums">
                          {qty}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-800 tabular-nums">
                          {formatCurrency(price)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Terms Note & Totals Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
              <div className="sm:col-span-7 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#004691]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{isKh ? 'លក្ខខណ្ឌ និងការធានា' : 'Terms & Warranty Notice'}</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  {isKh
                    ? 'សូមរក្សាទុកវិក្កយបត្រនេះសម្រាប់សេវាកម្មធានា និងការផ្ទៀងផ្ទាត់ទំនិញ។ ទំនិញដែលបានទិញរួចត្រូវពិនិត្យផ្ទៀងផ្ទាត់មុនពេលចុះហត្ថលេខាទទួល។'
                    : 'Please retain this official invoice for warranty service and support. All goods should be inspected upon delivery before signing.'}
                </p>
              </div>

              <div className="sm:col-span-5 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 px-2 text-slate-700 border-b border-slate-200/80">
                  <span className="font-medium">{isKh ? 'សរុបរង (Subtotal)' : 'Subtotal'}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {shippingOrDiff > 0 && (
                  <div className="flex justify-between py-1.5 px-2 text-slate-700 border-b border-slate-200/80">
                    <span className="font-medium">
                      {isKh ? 'ថ្លៃដឹកជញ្ជូន (Delivery)' : 'Delivery Fee'}
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatCurrency(shippingOrDiff)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 px-2 text-slate-700 border-b border-slate-200/80">
                  <span className="font-medium">{isKh ? 'ពន្ធ (Tax 0%)' : 'Tax (0%)'}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">$0.00</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-[#004691] text-white rounded-xl shadow-xs">
                  <span className="font-bold text-sm uppercase tracking-wide">
                    {isKh ? 'សរុបរួម (Total)' : 'Total'}
                  </span>
                  <span className="font-extrabold text-lg tabular-nums">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 sm:gap-20 mt-14 px-2 sm:px-6">
              <div className="text-center">
                <div className="h-14" />
                <div className="border-t border-slate-400 pt-2.5">
                  <p className="text-xs font-bold text-slate-900">
                    {isKh ? 'អ្នកចេញវិក្កយបត្រ (Authorized By)' : 'Authorized Signature'}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{company.name}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="h-14" />
                <div className="border-t border-slate-400 pt-2.5">
                  <p className="text-xs font-bold text-slate-900">
                    {isKh ? 'អតិថិជន (Customer Signature)' : 'Customer Signature'}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {isKh ? 'បានទទួលទំនិញត្រឹមត្រូវ' : 'Received in good condition'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 sm:px-11 pb-6 pt-4 border-t border-slate-200 bg-slate-50/60 text-center space-y-1">
          <p className="text-xs font-semibold text-slate-800">
            {isKh
              ? 'សូមអរគុណសម្រាប់ការជឿទុកចិត្ត និងគាំទ្រ Yeung Shi Group!'
              : 'Thank you for your business with Yeung Shi Group!'}
          </p>
          <p className="text-[11px] text-slate-600">
            {company.website} • {company.phone} • Ref: {order.id}
          </p>
        </div>
      </div>
    </div>
  )
}
