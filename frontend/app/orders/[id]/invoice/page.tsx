"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { Loader2, Printer } from 'lucide-react'

export default function InvoicePage() {
  const params = useParams()
  const rawId = params?.id
  const orderId = Array.isArray(rawId) ? rawId[0] : (rawId as string || '').trim()
  const { language } = useLanguage()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) return

    let isMounted = true
    const fetchOrder = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderId)}`)
        if (!response.ok) return
        const data = await response.json()
        
        if (data && !data.error) {
          if (typeof data.items === 'string') {
            try { data.items = JSON.parse(data.items) } catch {}
          }
          if (isMounted) setOrder(data)
        }
      } catch {
        // Handle error quietly
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchOrder()
    return () => { isMounted = false }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-500">
        {language === "kh" ? "មិនមានការបញ្ជាទិញនេះទេ" : "Order Not Found"}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-200 py-8 print:py-0 print:bg-white text-black font-sans">
      
      {/* Print Button (Hidden in Print Mode) */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-end print:hidden px-4">
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          {language === "kh" ? "បោះពុម្ពវិក្កយបត្រ" : "Print Invoice"}
        </button>
      </div>

      {/* A4 Paper Container */}
      <div className="bg-white mx-auto max-w-[210mm] min-h-[297mm] p-[20mm] shadow-md print:shadow-none print:p-0 relative box-border">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-12">
          {/* Company Details (Top Left) */}
          <div>
            <h1 className="text-3xl font-bold text-[#004691] mb-2 uppercase tracking-wide">Yeung Shi Group</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Building 230, St. 271, Sangkat Toul Tompong II<br />
              Khan Chamkamon, Phnom Penh.<br />
              Phone: 010 / 011 / 012 / 070 : 309 302<br />
              Email: yeungshigroup123@gmail.com
            </p>
          </div>
          
          {/* Invoice Title & Meta (Top Right) */}
          <div className="text-right">
            <h2 className="text-4xl font-light text-slate-800 tracking-wider mb-4 uppercase">
              Invoice
              <div className="text-lg text-slate-500 font-normal mt-1">វិក្កយបត្រ</div>
            </h2>
            <table className="ml-auto text-sm">
              <tbody>
                <tr>
                  <td className="pr-4 font-semibold text-slate-600 text-right pb-1">Invoice No:</td>
                  <td className="text-slate-900 pb-1 uppercase font-medium">{order.id.split('-')[0]}</td>
                </tr>
                <tr>
                  <td className="pr-4 font-semibold text-slate-600 text-right pb-1">Date:</td>
                  <td className="text-slate-900 pb-1 font-medium">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                </tr>
                <tr>
                  <td className="pr-4 font-semibold text-slate-600 text-right">Status:</td>
                  <td className="font-bold uppercase text-slate-800">
                    {order.status === 'paid' ? 'PAID / បានទូទាត់' : order.status === 'pending' ? 'PENDING / រង់ចាំ' : order.status}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="flex justify-between gap-12 border-t border-b border-slate-200 py-6 mb-10">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">Bill To / វិក្កយបត្រទៅកាន់:</h3>
            <div className="text-sm text-slate-700 leading-relaxed">
              <p className="font-bold text-base text-slate-900 mb-1">{order.customerName}</p>
              <p>{order.customerPhone}</p>
              {order.customerEmail && <p>{order.customerEmail}</p>}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase mb-3">Ship To / ដឹកជញ្ជូនទៅកាន់:</h3>
            <div className="text-sm text-slate-700 leading-relaxed">
              <p className="font-medium max-w-xs">{order.address}</p>
              <p className="mt-3"><span className="font-bold">Payment Method:</span> {order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <table className="w-full text-left mb-10 border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="py-3 px-4 text-xs font-bold text-slate-700 uppercase">Item Description / បរិយាយ</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-700 uppercase text-center w-24">Qty / ចំនួន</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-700 uppercase text-right w-32">Unit Price / តម្លៃ</th>
              <th className="py-3 px-4 text-xs font-bold text-slate-700 uppercase text-right w-32">Amount / សរុប</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {order.items && order.items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b border-slate-100">
                <td className="py-4 px-4 font-medium text-slate-800">{item.name}</td>
                <td className="py-4 px-4 text-center text-slate-700">{item.quantity}</td>
                <td className="py-4 px-4 text-right text-slate-700">${Number(item.price).toFixed(2)}</td>
                <td className="py-4 px-4 text-right font-medium text-slate-800">${(Number(item.price) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoice Totals */}
        <div className="flex justify-end mb-24">
          <div className="w-72">
            <div className="flex justify-between py-2 text-sm border-b border-slate-100">
              <span className="font-medium text-slate-600">Subtotal / សរុបរង</span>
              <span className="text-slate-800">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm border-b border-slate-100">
              <span className="font-medium text-slate-600">Tax / ពន្ធ (0%)</span>
              <span className="text-slate-800">$0.00</span>
            </div>
            <div className="flex justify-between py-3 mt-1 bg-slate-50 px-4 rounded-sm">
              <span className="font-bold text-slate-900 text-lg">Total / សរុប</span>
              <span className="font-bold text-[#004691] text-lg">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-20 mt-12 px-8">
          <div className="text-center">
            <div className="border-t border-slate-400 pt-3">
              <p className="text-sm font-bold text-slate-800">Authorized Signature</p>
              <p className="text-xs text-slate-500 mt-1">Yeung Shi Group</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-slate-400 pt-3">
              <p className="text-sm font-bold text-slate-800">Customer Signature</p>
              <p className="text-xs text-slate-500 mt-1">Received in good condition</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] border-t border-slate-200 pt-4 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Thank you for your business! If you have any questions concerning this invoice, please contact us.
          </p>
          <p className="text-xs text-slate-400 mt-1">www.ysg-group.com</p>
        </div>

      </div>
    </div>
  )
}
