"use client"

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import PublicLayout from '../../../components/PublicLayout'
import { CheckCircle2, Clock, MapPin, Phone, User, Package, ArrowRight, ArrowLeft, CreditCard, Loader2, Receipt, Truck, XCircle, Printer } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { generateBakongQR } from '../../../lib/bakong'
import BakongQRModal from '../../../components/BakongQRModal'
import PaymentSuccessModal from '../../../components/PaymentSuccessModal'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function OrderDetailsPage() {
  const params = useParams()
  const rawId = params?.id
  const orderId = Array.isArray(rawId) ? rawId[0] : (rawId as string || '').trim()
  const { t, language } = useLanguage()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [qrData, setQrData] = useState<any>(null)

  // 1. Fetch Order Details
  useEffect(() => {
    if (!orderId) return

    let isMounted = true

    const fetchOrder = async () => {
      setLoading(true)
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderId)}`)
        if (!response.ok) {
          if (isMounted) setOrder(null)
          return
        }
        const data = await response.json()
        if (!data || data.error) {
          if (isMounted) setOrder(null)
          return
        }

        if (typeof data.items === 'string') {
          try {
            data.items = JSON.parse(data.items)
          } catch {}
        }

        if (isMounted) {
          setOrder(data)
        }
      } catch {
        if (isMounted) setOrder(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      isMounted = false
    }
  }, [orderId])

  // 2. Handle Bakong KHQR generation if order is pending
  useEffect(() => {
    if (!order || order.status !== "pending" || order.paymentMethod !== "Bakong") return

    let isMounted = true

    const setupBakongQR = async () => {
      try {
        const orderExpiresAt = new Date(order.createdAt).getTime() + (5 * 60 * 1000)
        const cacheKey = `bakong_qr_${order.id}`
        const cachedStr = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null
        let cachedQR = null
        if (cachedStr) {
          try {
            cachedQR = JSON.parse(cachedStr)
          } catch {
            localStorage.removeItem(cacheKey)
          }
        }

        if (cachedQR && Date.now() < cachedQR.expiresAt) {
          if (isMounted) {
            setQrData(cachedQR)
            const isPaid = await checkBakongTransaction(cachedQR.md5, order.id)
            if (isPaid) {
              setOrder((prev: any) => prev ? { ...prev, status: "paid" } : prev)
            } else {
              setShowQR(true)
            }
          }
        } else {
          const expirationToUse = Date.now() < orderExpiresAt ? orderExpiresAt : Date.now() + (5 * 60 * 1000)
          const generated = await generateBakongQR(order.totalAmount, order.id, expirationToUse)
          if (generated && generated.qrString && isMounted) {
            const qrPayload = { ...generated, expiresAt: expirationToUse }
            setQrData(qrPayload)
            if (typeof window !== "undefined") {
              localStorage.setItem(cacheKey, JSON.stringify(qrPayload))
            }
            setShowQR(true)
          }
        }
      } catch {
        // QR generation issue handled gracefully without breaking order state
      }
    }

    setupBakongQR()

    return () => {
      isMounted = false
    }
  }, [order?.id, order?.status, order?.paymentMethod])

  // 3. Success Handler triggered by BakongQRModal
  const handlePaymentSuccess = () => {
    setOrder((prev: any) => prev ? { ...prev, status: "paid" } : prev)
    setShowQR(false)
    setShowSuccessModal(true)
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white gap-3">
          <Loader2 className="w-8 h-8 text-[#004691] animate-spin" />
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            {language === "kh" ? "កំពុងទាញយកព័ត៌មានការបញ្ជាទិញ..." : "Loading order details..."}
          </p>
        </div>
      </PublicLayout>
    )
  }

 if (!order) {
 return (
 <PublicLayout>
 <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
 <div className="text-center space-y-4">
 <h2 className="text-xl font-bold text-slate-900 ">
 {language === "kh" ? "រកមិនឃើញការបញ្ជាទិញទេ" : "Order Not Found"}
 </h2>
 <Link href="/products" className="inline-flex items-center gap-2 text-[#004691] text-sm font-bold hover:underline">
 {language === "kh" ? "ត្រឡប់ទៅផលិតផល" : "Back to Products"} <ArrowRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </PublicLayout>
 )
 }

 const formatPrice = (price: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 }).format(price)
 }

 const refreshQR = async () => {
 if (order) {
 const expirationToUse = Date.now() + (5 * 60 * 1000)
 const generated = await generateBakongQR(order.totalAmount, order.id, expirationToUse)
 if (generated && generated.qrString) {
 const qrPayload = { ...generated, expiresAt: expirationToUse }
 setQrData(qrPayload)
 localStorage.setItem(`bakong_qr_${order.id}`, JSON.stringify(qrPayload))
 toast.success("QR Code Refreshed", { id: "qr_refresh" })
 } else {
 toast.error(language === "kh" ? "មិនអាចបង្កើតកូដ QR ថ្មីបានទេ" : "Failed to refresh payment QR");
 }
 }
 }

 const getStatusText = (status: string) => {
 const s = status?.toLowerCase()
 if (s === "paid" || s === "completed") {
 return language === "kh" ? "បានទូទាត់ប្រាក់" : "Paid"
 }
 if (s === "pending") {
 return language === "kh" ? "កំពុងរង់ចាំ" : "Pending"
 }
 if (s === "cancelled") {
 return language === "kh" ? "បានបោះបង់" : "Cancelled"
 }
 return status
 }

 const isPaid = order.status?.toLowerCase() === "paid" || order.status?.toLowerCase() === "completed"
 const isCancelled = order.status?.toLowerCase() === "cancelled"

 return (
 <PublicLayout>
 <Toaster position="top-center" />
 <div className="bg-white min-h-screen pb-24 pt-4 md:pt-8 font-sans">
 <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-6">
 
 {/* Header Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
 <div className="space-y-1">
 <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 mb-1">
 <Link href="/" className="hover:text-[#004691] transition-colors">{t("home")}</Link>
 <span>/</span>
 <Link href="/account" className="hover:text-[#004691] transition-colors">{language === "kh" ? "គណនី" : "Account"}</Link>
 <span>/</span>
 <span className="text-slate-900 font-bold">{language === "kh" ? "ព័ត៌មានលម្អិត" : "Order Details"}</span>
 </div>
 <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 ">
 {language === "kh" ? "ការបញ្ជាទិញ" : "Order"} <span className="text-[#004691]">#{order.id}</span>
 </h1>
 <p className="text-xs sm:text-sm font-medium text-slate-500">
 {language === "kh" ? "កាលបរិច្ឆេទ:" : "Date:"} <span className="font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString()}</span>
 </p>
 </div>

 {/* Status Badge & Print Invoice Action */}
 <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 self-start sm:self-center">
 <button
 onClick={() => window.print()}
 className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-all shadow-2xs cursor-pointer active:scale-95 print:hidden whitespace-nowrap shrink-0"
 >
 <Printer className="w-4 h-4 text-slate-600 shrink-0" />
 <span className="whitespace-nowrap">{language === "kh" ? "បោះពុម្ពវិក្កយបត្រ" : "Print Invoice"}</span>
 </button>

 <div className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-md border shadow-2xs whitespace-nowrap shrink-0 ${
 isPaid
 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
 : isCancelled
 ? "bg-rose-50 text-rose-700 border-rose-200"
 : "bg-amber-50 text-amber-700 border-amber-200"
 }`}>
 {isPaid ? (
 <>
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
 <span className="whitespace-nowrap">{getStatusText(order.status)}</span>
 </>
 ) : isCancelled ? (
 <>
 <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
 <span className="whitespace-nowrap">{getStatusText(order.status)}</span>
 </>
 ) : (
 <>
 <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
 <span className="whitespace-nowrap">{getStatusText(order.status)}</span>
 </>
 )}
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
 
 {/* Left Content Area */}
 <div className="lg:col-span-8 space-y-6">
 
 {/* Payment Action Callout if Pending */}
 {!isPaid && !isCancelled && (
 <div className="bg-blue-50 border border-blue-200 p-6 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div className="space-y-1">
 <h3 className="text-base font-bold text-slate-900">
 {language === "kh" ? "តម្រូវឱ្យទូទាត់ប្រាក់" : "Payment Required"}
 </h3>
 <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md">
 {language === "kh" ? "សូមបញ្ចប់ការទូទាត់របស់អ្នកតាមរយៈ Bakong KHQR ដើម្បីបញ្ចប់ការបញ្ជាទិញរបស់អ្នក។" : "Please complete your payment via Bakong KHQR to finalize your order."}
 </p>
 </div>
 <button
 onClick={() => setShowQR(true)}
 className="px-6 py-3 bg-[#004691] hover:bg-[#003366] text-white font-bold text-xs sm:text-sm rounded-md shadow-md transition-all shrink-0 flex items-center gap-2 active:scale-95"
 >
 <CreditCard className="w-4 h-4" />
 <span>{language === "kh" ? "បង្ហាញ QR កូដ" : "Show QR Code"}</span>
 </button>
 </div>
 )}

 {/* Items Card */}
 <div className="bg-white rounded-md border border-slate-200 p-5 md:p-6 shadow-2xs space-y-4">
 <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 pb-3 border-b border-slate-100">
 <Package className="w-5 h-5 text-[#004691]" />
 <span>{language === "kh" ? "ការបញ្ជាទិញរបស់អ្នក" : "Your Order"}</span>
 </h3>

 <div className="divide-y divide-slate-100">
 {order.items?.map((item: any, idx: number) => (
 <div key={idx} className="py-4 flex items-center gap-4">
 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-md border border-slate-100 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                  <img 
                    src={item.image || "https://res.cloudinary.com/dn4ciyses/image/upload/w_300,c_fill,f_auto,q_auto/v1786777638/pwjj4fnchbrhzo69dmom.webp"} 
                    alt={item.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://res.cloudinary.com/dn4ciyses/image/upload/w_300,c_fill,f_auto,q_auto/v1786777638/pwjj4fnchbrhzo69dmom.webp"
                    }}
                  />
                </div>

 <div className="flex-1 min-w-0">
 <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate mb-1">
 {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
 </h4>
 <p className="text-xs sm:text-sm font-semibold text-slate-500">
 {language === "kh" ? "តម្លៃ:" : "Price:"} <span className="text-slate-900">${item.price.toLocaleString()}</span> • {language === "kh" ? "ចំនួន:" : "Qty:"} <span className="text-slate-900 font-bold">{item.quantity}</span>
 </p>
 </div>

 <div className="text-right shrink-0">
 <p className="text-sm sm:text-base font-bold text-slate-900">
 ${(item.price * item.quantity).toLocaleString()}
 </p>
 </div>
 </div>
 ))}
 </div>

 {/* Subtotal & Total */}
 <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
 <span className="text-sm sm:text-base font-bold text-slate-700">
 {language === "kh" ? "សរុបចុងក្រោយ:" : "Total Amount:"}
 </span>
 <span className="text-xl sm:text-2xl font-bold text-[#004691]">
 {formatPrice(order.totalAmount)}
 </span>
 </div>
 </div>

 </div>

 {/* Right Sidebar */}
 <div className="lg:col-span-4 space-y-6">
 
 {/* Delivery / Shipping Info Card */}
 <div className="bg-white rounded-md border border-slate-200 p-5 md:p-6 shadow-2xs space-y-4">
 <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5 pb-3 border-b border-slate-100">
 <Truck className="w-5 h-5 text-[#004691]" />
 <span>{language === "kh" ? "ព័ត៌មានដឹកជញ្ជូន" : "Delivery Details"}</span>
 </h3>

 <div className="space-y-3.5 text-xs sm:text-sm">
 <div>
 <p className="font-bold text-slate-400 uppercase text-[11px] tracking-wider mb-0.5">{language === "kh" ? "ឈ្មោះអតិថិជន" : "Customer Name"}</p>
 <p className="font-bold text-slate-900 text-sm sm:text-base">{order.customerName}</p>
 </div>

 <div>
 <p className="font-bold text-slate-400 uppercase text-[11px] tracking-wider mb-0.5">{language === "kh" ? "លេខទូរស័ព្ទ" : "Phone Number"}</p>
 <p className="font-bold text-slate-900 text-sm sm:text-base">{order.customerPhone}</p>
 </div>

 {order.customerEmail && (
 <div>
 <p className="font-bold text-slate-400 uppercase text-[11px] tracking-wider mb-0.5">{language === "kh" ? "អ៊ីមែល" : "Email Address"}</p>
 <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{order.customerEmail}</p>
 </div>
 )}

 <div>
 <p className="font-bold text-slate-400 uppercase text-[11px] tracking-wider mb-0.5">{language === "kh" ? "អាសយដ្ឋានដឹកជញ្ជូន" : "Delivery Address"}</p>
 <p className="font-semibold text-slate-800 text-xs sm:text-sm leading-relaxed">{order.address}</p>
 </div>
 </div>
 </div>

 {/* Need Help Box */}
 <div className="bg-slate-50 rounded-md border border-slate-200 p-5 space-y-3">
 <h4 className="text-sm font-bold text-slate-900">
 {language === "kh" ? "ត្រូវការជំនួយ?" : "Need Help?"}
 </h4>
 <p className="text-xs text-slate-600 leading-relaxed font-medium">
 {language === "kh" ? "ផ្នែកគាំទ្ររបស់យើងគឺសកម្ម ២៤/៧ សម្រាប់ការសាកសួរបច្ចេកទេស។" : "Our support team is active 24/7 for order questions."}
 </p>
 <a 
 href="tel:+85512345678" 
 className="w-full py-3 bg-white border border-slate-200 text-[#004691] hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-md flex items-center justify-center gap-2 transition-all shadow-2xs"
 >
 <Phone className="w-4 h-4" />
 <span>{language === "kh" ? "ទាក់ទងអ្នកជំនាញ" : "Contact Support"}</span>
 </a>
 </div>

 </div>

 </div>
 </div>
 </div>

 {qrData && (
 <BakongQRModal
 isOpen={showQR}
 onClose={() => setShowQR(false)}
 qrString={qrData.qrString}
 amount={order.totalAmount}
 orderId={order.id}
 md5={qrData.md5}
 expiresAt={qrData.expiresAt}
 onSuccess={() => {
 setShowQR(false)
 setShowSuccessModal(true)
 if (order) {
 setOrder({ ...order, status: "paid" })
 }
 }}
 onExpire={refreshQR}
 />
 )}

 <PaymentSuccessModal
 isOpen={showSuccessModal}
 onClose={() => setShowSuccessModal(false)}
 orderId={order.id}
 amount={order.totalAmount}
 items={order.items}
 />
 </PublicLayout>
 )
}
