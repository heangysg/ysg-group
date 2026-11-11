"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { ArrowLeft, Loader2, Printer } from 'lucide-react'

interface OrderItem {
  name: string
  nameKhmer?: string
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
  name: 'YEUNG SHI GROUP',
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
        stampClass: 'border-emerald-700 text-emerald-800'
      }
    case 'confirmed':
    case 'processing':
      return {
        en: 'CONFIRMED',
        kh: 'បានបញ្ជាក់',
        stampClass: 'border-blue-800 text-blue-900'
      }
    case 'shipped':
      return {
        en: 'SHIPPED',
        kh: 'កំពុងដឹកជញ្ជូន',
        stampClass: 'border-slate-700 text-slate-800'
      }
    case 'delivered':
      return {
        en: 'DELIVERED',
        kh: 'បានដឹកដល់',
        stampClass: 'border-emerald-700 text-emerald-800'
      }
    case 'cancelled':
      return {
        en: 'CANCELLED',
        kh: 'បានបោះបង់',
        stampClass: 'border-red-700 text-red-800'
      }
    default:
      return {
        en: 'UNPAID / PENDING',
        kh: 'រង់ចាំទូទាត់',
        stampClass: 'border-amber-700 text-amber-800'
      }
  }
}

const formatPaymentMethod = (method?: string, isKh = false) => {
  if (!method) return isKh ? 'សាច់ប្រាក់ / ផ្ទេរប្រាក់តាមធនាគារ' : 'Cash / Bank Transfer'
  const lower = method.toLowerCase()
  if (lower.includes('khqr') || lower.includes('bakong')) return 'Bakong KHQR'
  if (lower.includes('cod') || lower.includes('cash')) {
    return isKh ? 'ទូទាត់ពេលទទួលទំនិញ (COD)' : 'Cash on Delivery (COD)'
  }
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
              name:
                s.site_name && s.site_name !== 'YSG Machinery'
                  ? s.site_name.toUpperCase()
                  : prev.name,
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
      <div className="min-h-screen flex items-center justify-center bg-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-[#004691]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-200 text-slate-800 px-4">
        <p className="text-base font-bold">
          {isKh ? 'មិនមានការបញ្ជាទិញនេះទេ' : 'Order Not Found'}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
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
  const formattedDate = issueDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  // Pad with blank ledger rows so short invoices retain authentic paper proportions
  const minRows = 6
  const emptyRowsCount = Math.max(0, minRows - items.length)

  return (
    <div className="min-h-screen bg-slate-300/70 py-6 sm:py-8 print:py-0 print:bg-white text-slate-900 font-sans">
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

      {/* Screen-only Action Toolbar */}
      <div className="max-w-[210mm] mx-auto mb-4 px-4 sm:px-0 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-md text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isKh ? 'ត្រឡប់ក្រោយ' : 'Back'}</span>
          </button>
          <span className="hidden sm:inline-block px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono font-bold text-slate-700">
            INV-{invoiceShortId}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-white border border-slate-300 rounded-md p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                !isKh ? 'bg-[#004691] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('kh')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                isKh ? 'bg-[#004691] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              ខ្មែរ
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-[#004691] hover:bg-[#003570] text-white px-5 py-2 rounded-md text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isKh ? 'បោះពុម្ព / រក្សាទុក PDF' : 'Print / Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* Authentic A4 Commercial Invoice Sheet */}
      <div className="bg-white mx-auto max-w-[210mm] min-h-[297mm] print:min-h-[275mm] shadow-xl print:shadow-none border border-slate-400 print:border-0 flex flex-col justify-between p-6 sm:p-10 print:p-4">
        <div>
          {/* Official Company Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-5 border-b-2 border-slate-900">
            {/* Left: Logo + Company Details */}
            <div className="flex items-start gap-4 max-w-md">
              <img
                src="/logo.png"
                alt="Yeung Shi Group Logo"
                className="w-16 h-16 object-contain shrink-0 mt-0.5"
              />
              <div className="text-xs leading-relaxed text-slate-800">
                <p className="text-sm font-bold text-slate-900">{company.khmerName}</p>
                <h1 className="text-xl font-black tracking-tight text-[#004691] leading-tight">
                  {company.name}
                </h1>
                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                  {company.tagline}
                </p>
                <p>
                  <span className="font-bold">{isKh ? 'អាសយដ្ឋាន៖ ' : 'Address: '}</span>
                  {company.address}
                </p>
                <p>
                  <span className="font-bold">{isKh ? 'ទូរស័ព្ទ៖ ' : 'Tel: '}</span>
                  {company.phone}
                </p>
                <p>
                  <span className="font-bold">{isKh ? 'អ៊ីមែល៖ ' : 'Email: '}</span>
                  {company.email}
                </p>
              </div>
            </div>

            {/* Right: Document Title + Stamp + Metadata */}
            <div className="w-full sm:w-[245px] shrink-0">
              <div className="flex sm:flex-col sm:items-end justify-between items-center mb-3">
                <div className="sm:text-right">
                  <p className="text-sm font-bold text-slate-900">វិក្កយបត្រ</p>
                  <h2 className="text-3xl font-black tracking-widest text-slate-900 leading-none">
                    INVOICE
                  </h2>
                </div>
                <span
                  className={`mt-0 sm:mt-2 inline-block px-2.5 py-0.5 border-2 text-[10px] font-black tracking-widest uppercase ${statusInfo.stampClass}`}
                >
                  {isKh ? statusInfo.kh : statusInfo.en}
                </span>
              </div>

              <table className="w-full text-xs border border-slate-400 border-collapse">
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 px-2.5 py-1.5 font-bold text-slate-700 w-[44%] border-r border-slate-300">
                      {isKh ? 'លេខវិក្កយបត្រ' : 'Invoice No.'}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono font-bold text-slate-900 text-right">
                      INV-{invoiceShortId}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="bg-slate-100 px-2.5 py-1.5 font-bold text-slate-700 border-r border-slate-300">
                      {isKh ? 'លេខបញ្ជាទិញ' : 'Order Ref.'}
                    </td>
                    <td className="px-2.5 py-1.5 font-mono font-semibold text-slate-900 text-right">
                      #{order.id}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-100 px-2.5 py-1.5 font-bold text-slate-700 border-r border-slate-300">
                      {isKh ? 'កាលបរិច្ឆេទ' : 'Date'}
                    </td>
                    <td className="px-2.5 py-1.5 font-semibold text-slate-900 text-right tabular-nums">
                      {formattedDate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Double rule accent */}
          <div className="h-[2px] bg-slate-300 mt-0.5 mb-5" />

          {/* Bill To & Delivery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-slate-400 divide-y sm:divide-y-0 sm:divide-x divide-slate-400 mb-6 text-xs">
            <div>
              <div className="bg-slate-100 border-b border-slate-400 px-3 py-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-900">
                {isKh ? 'អតិថិជន / Bill To' : 'Bill To / អតិថិជន'}
              </div>
              <div className="p-3 space-y-1 text-slate-800">
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <p>
                  <span className="font-semibold text-slate-600">
                    {isKh ? 'ទូរស័ព្ទ៖ ' : 'Tel: '}
                  </span>
                  <span className="font-medium tabular-nums">{order.customerPhone || 'N/A'}</span>
                </p>
                {order.customerEmail && (
                  <p className="break-all">
                    <span className="font-semibold text-slate-600">
                      {isKh ? 'អ៊ីមែល៖ ' : 'Email: '}
                    </span>
                    <span>{order.customerEmail}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="bg-slate-100 border-b border-slate-400 px-3 py-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-900">
                {isKh ? 'ការដឹកជញ្ជូន និងការទូទាត់' : 'Delivery & Payment Details'}
              </div>
              <div className="p-3 space-y-1.5 text-slate-800">
                <p className="leading-snug">
                  <span className="font-semibold text-slate-600">
                    {isKh ? 'អាសយដ្ឋាន៖ ' : 'Ship To: '}
                  </span>
                  <span>
                    {order.address ||
                      (isKh ? 'មកទទួលផ្ទាល់នៅហាង' : 'Store Pickup / Address not provided')}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-slate-600">
                    {isKh ? 'ការទូទាត់៖ ' : 'Payment Method: '}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatPaymentMethod(order.paymentMethod, isKh)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Accounting Table */}
          <table className="w-full border border-slate-800 border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-900">
                <th className="py-2.5 px-2.5 text-center font-bold uppercase tracking-wider border-r border-slate-400 w-11">
                  {isKh ? 'ល.រ' : 'No.'}
                </th>
                <th className="py-2.5 px-3 text-left font-bold uppercase tracking-wider border-r border-slate-400">
                  {isKh ? 'បរិយាយមុខទំនិញ (Description)' : 'Description of Goods'}
                </th>
                <th className="py-2.5 px-2.5 text-center font-bold uppercase tracking-wider border-r border-slate-400 w-16">
                  {isKh ? 'ចំនួន' : 'Qty'}
                </th>
                <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider border-r border-slate-400 w-28">
                  {isKh ? 'តម្លៃរាយ' : 'Unit Price'}
                </th>
                <th className="py-2.5 px-3 text-right font-bold uppercase tracking-wider w-32">
                  {isKh ? 'ទឹកប្រាក់សរុប' : 'Amount (USD)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {items.map((item, idx) => {
                const qty = Number(item.quantity) || 1
                const price = Number(item.price) || 0
                const lineTotal = price * qty
                const displayName =
                  isKh && item.nameKhmer ? item.nameKhmer : item.name

                return (
                  <tr key={idx}>
                    <td className="py-2.5 px-2.5 text-center font-semibold text-slate-700 border-r border-slate-300 tabular-nums align-top">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-300 align-top">
                      <p className="font-bold text-slate-900 leading-snug">{displayName}</p>
                      {(item.sku || item.variant) && (
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {item.sku ? `SKU: ${item.sku}` : ''}
                          {item.sku && item.variant ? ' | ' : ''}
                          {item.variant || ''}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-semibold text-slate-900 border-r border-slate-300 tabular-nums align-top">
                      {qty}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-800 border-r border-slate-300 tabular-nums align-top">
                      {formatCurrency(price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums align-top">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                )
              })}

              {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-9">
                  <td className="border-r border-slate-300">&nbsp;</td>
                  <td className="border-r border-slate-300">&nbsp;</td>
                  <td className="border-r border-slate-300">&nbsp;</td>
                  <td className="border-r border-slate-300">&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Notes & Totals Attached Footer Block */}
          <div className="grid grid-cols-1 sm:grid-cols-12 border-x border-b border-slate-800 text-xs">
            {/* Left: Terms & Notes */}
            <div className="sm:col-span-7 p-3.5 border-b sm:border-b-0 sm:border-r border-slate-800 flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  {isKh ? 'កំណត់ចំណាំ និងលក្ខខណ្ឌ' : 'Terms & Warranty Conditions'}
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">
                  {isKh
                    ? '១. សូមរក្សាទុកវិក្កយបត្រនេះសម្រាប់សេវាកម្មធានា និងការផ្ទៀងផ្ទាត់។\n២. សូមពិនិត្យទំនិញឱ្យបានត្រឹមត្រូវមុនពេលចុះហត្ថលេខាទទួល។'
                    : '1. Please keep this original invoice for warranty service and verification.\n2. Goods sold should be inspected upon delivery before signing.'}
                </p>
              </div>
              <p className="text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800">
                  {isKh ? 'គេហទំព័រ៖ ' : 'Website: '}
                </span>
                {company.website}
              </p>
            </div>

            {/* Right: Accounting Totals */}
            <div className="sm:col-span-5 divide-y divide-slate-300">
              <div className="flex justify-between px-3.5 py-2 text-slate-800">
                <span className="font-semibold">
                  {isKh ? 'សរុបរង (Subtotal)' : 'Subtotal'}
                </span>
                <span className="font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {shippingOrDiff > 0 && (
                <div className="flex justify-between px-3.5 py-2 text-slate-800">
                  <span className="font-semibold">
                    {isKh ? 'ថ្លៃដឹកជញ្ជូន (Delivery)' : 'Delivery Fee'}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(shippingOrDiff)}
                  </span>
                </div>
              )}
              <div className="flex justify-between px-3.5 py-2 text-slate-800">
                <span className="font-semibold">{isKh ? 'ពន្ធ (VAT 0%)' : 'Tax / VAT (0%)'}</span>
                <span className="font-semibold tabular-nums">$0.00</span>
              </div>
              <div className="flex justify-between items-center px-3.5 py-2.5 bg-slate-100 border-t-2 border-slate-900">
                <span className="font-black text-xs sm:text-sm uppercase tracking-wide text-slate-900">
                  {isKh ? 'សរុបរួម (TOTAL)' : 'TOTAL (USD)'}
                </span>
                <span className="font-black text-base sm:text-lg text-slate-900 tabular-nums underline decoration-double underline-offset-4">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Handwritten Signature Lines */}
          <div className="grid grid-cols-2 gap-10 sm:gap-20 mt-14 px-4 sm:px-8 text-xs">
            <div className="text-center">
              <div className="h-14" />
              <div className="border-t border-slate-700 pt-2 space-y-0.5">
                <p className="font-bold text-slate-900">
                  {isKh ? 'ហត្ថលេខាអ្នកលក់ / Authorized Signature' : 'Authorized Signature'}
                </p>
                <p className="text-[11px] text-slate-600">{company.name}</p>
                <p className="text-[11px] text-slate-500 pt-1">
                  {isKh ? 'កាលបរិច្ឆេទ៖ ____ / ____ / ______' : 'Date: ____ / ____ / ______'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="h-14" />
              <div className="border-t border-slate-700 pt-2 space-y-0.5">
                <p className="font-bold text-slate-900">
                  {isKh ? 'ហត្ថលេខាអ្នកទិញ / Customer Signature' : 'Customer Signature'}
                </p>
                <p className="text-[11px] text-slate-600">
                  {isKh ? 'បានពិនិត្យ និងទទួលទំនិញត្រឹមត្រូវ' : 'Received in good condition'}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  {isKh ? 'កាលបរិច្ឆេទ៖ ____ / ____ / ______' : 'Date: ____ / ____ / ______'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Printed Document Footer */}
        <div className="mt-10 pt-3 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-600">
          <p>
            {isKh
              ? 'សូមអរគុណសម្រាប់ការគាំទ្រ និងការជឿទុកចិត្តមកលើ Yeung Shi Group!'
              : 'Thank you for your business with Yeung Shi Group!'}
          </p>
          <p className="font-mono">
            INV-{invoiceShortId} • {company.phone}
          </p>
        </div>
      </div>
    </div>
  )
}
