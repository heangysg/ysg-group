"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import PublicLayout from '../../../components/PublicLayout'
import { CheckCircle2, Clock, MapPin, Phone, User, Package, ArrowRight, CreditCard, Loader2, Receipt, Truck } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { generateBakongQR } from '../../../lib/bakong'
import BakongQRModal from '../../../components/BakongQRModal'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { t, language } = useLanguage()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [qrData, setQrData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!id) return

    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("Order")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching order:", error)
        toast.error("Order not found")
      } else {
        setOrder(data)
        if (data.status === "pending" && data.paymentMethod === "Bakong") {
          const orderExpiresAt = new Date(data.createdAt).getTime() + (5 * 60 * 1000)
          const cacheKey = `bakong_qr_${data.id}`
          const cachedStr = localStorage.getItem(cacheKey)
          let cachedQR = cachedStr ? JSON.parse(cachedStr) : null

          if (cachedQR && Date.now() < cachedQR.expiresAt) {
            setQrData(cachedQR)
          } else {
            const expirationToUse = Date.now() < orderExpiresAt ? orderExpiresAt : Date.now() + (5 * 60 * 1000)
            const generated = generateBakongQR(data.totalAmount, data.id, expirationToUse)
            const qrPayload = { ...generated, expiresAt: expirationToUse }
            setQrData(qrPayload)
            localStorage.setItem(cacheKey, JSON.stringify(qrPayload))
          }
          setShowQR(true)
        }
      }
      setLoading(false)
    }

    fetchOrder()

    const subscription = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'Order',
        filter: `id=eq.${id}`
      }, (payload) => {
        setOrder(payload.new)
        if (payload.new.status === "paid") {
          setShowQR(false)
          toast.success("Payment Received!")
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [id])

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-white">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </PublicLayout>
    )
  }

  if (!order) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-white">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Order Not Found</h2>
            <Link href="/products" className="inline-flex items-center gap-2 text-primary text-[13px] font-bold hover:underline">
              Back to Products <ArrowRight className="w-4 h-4" />
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

  const refreshQR = () => {
    if (order) {
      const expirationToUse = Date.now() + (5 * 60 * 1000)
      const generated = generateBakongQR(order.totalAmount, order.id, expirationToUse)
      const qrPayload = { ...generated, expiresAt: expirationToUse }
      setQrData(qrPayload)
      localStorage.setItem(`bakong_qr_${order.id}`, JSON.stringify(qrPayload))
      toast.success("QR Code Refreshed")
    }
  }

  return (
    <PublicLayout>
      <Toaster position="top-center" />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          
          {/* 💎 Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Link href="/" className="hover:text-primary transition-colors">{t("home")}</Link>
                <span>/</span>
                <span className="text-slate-900">{language === "kh" ? "ព័ត៌មានលម្អិតការបញ្ជាទិញ" : "Order Detail"}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">
                {language === "kh" ? "ការបញ្ជាទិញ" : "Order"} <span className="text-primary">#{order.id}</span>
              </h1>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest border shadow-sm ${
              order.status === "paid"
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}>
              {order.status === "paid" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === "kh" ? "បានបង់ប្រាក់" : "Paid"}
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  {language === "kh" ? "កំពុងរង់ចាំ" : "Pending"}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8 space-y-10">
              
              {/* 🏗️ Status Banner */}
              {order.status === "paid" ? (
                <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 flex items-start gap-6">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                     <h2 className="text-xl font-bold text-slate-900 uppercase">
                       {language === "kh" ? "ការទូទាត់ជោគជ័យ" : "Payment Successful"}
                     </h2>
                     <p className="text-[14px] text-slate-500 font-medium">
                       {language === "kh" ? "សូមអរគុណសម្រាប់ការវិនិយោគរបស់អ្នក។ គ្រឿងចក្រឧស្សាហកម្មរបស់អ្នកឥឡូវនេះកំពុងត្រូវបានរៀបចំសម្រាប់ដឹកជញ្ជូន។" : "Thank you for your investment. Your industrial machinery is now being prepared for logistics."}
                     </p>
                  </div>
                </div>
              ) : (
                <div className="bg-primary rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group shadow-xl shadow-primary/20">
                  <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold tracking-tight uppercase">
                        {language === "kh" ? "តម្រូវឱ្យទូទាត់ប្រាក់" : "Payment Required"}
                      </h2>
                      <p className="text-white/80 text-[14px] font-medium max-w-md">
                        {language === "kh" ? "សូមបញ្ចប់ការទូទាត់របស់អ្នកតាមរយៈ Bakong KHQR ដើម្បីបញ្ចប់ការបញ្ជាទិញរបស់អ្នក។" : "Please complete your payment via Bakong KHQR to finalize your order."}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowQR(true)}
                      className="inline-flex items-center gap-3 bg-white text-primary px-6 py-3 rounded-lg font-bold text-[12px] uppercase tracking-widest hover:bg-slate-50 transition-all duration-300"
                    >
                      <CreditCard className="w-4 h-4" />
                      {language === "kh" ? "បង្ហាញ QR កូដ" : "Show QR Code"}
                    </button>
                  </div>
                </div>
              )}

              {/* 📦 Manifest */}
              <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                  <Package className="w-4 h-4 text-primary" />
                  {language === "kh" ? "បញ្ជីគ្រឿងចក្រ" : "Equipment Manifest"}
                </h3>
                <div className="divide-y divide-slate-50">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="py-6 flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <h4 className="text-[15px] font-bold text-slate-900 uppercase tracking-tight">
                          {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {item.brand} • {language === "kh" ? "ចំនួន" : "Qty"}: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-bold text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                      {language === "kh" ? "ការវិនិយោគសរុប" : "Total Investment"}
                    </span>
                    <p className="text-slate-400 text-[11px] font-medium italic">
                      {language === "kh" ? "រួមបញ្ចូលរាល់ការបញ្ជាក់" : "Incl. all certifications"}
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 tracking-tighter">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="text-[11px] font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  {language === "kh" ? "ការដឹកជញ្ជូន" : "Logistics"}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{language === "kh" ? "អតិថិជន" : "Client"}</p>
                    <p className="text-[14px] font-bold text-slate-900 uppercase">{order.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{language === "kh" ? "ទំនាក់ទំនង" : "Contact"}</p>
                    <p className="text-[14px] font-bold text-slate-900">{order.customerPhone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{language === "kh" ? "អាសយដ្ឋានដឹកជញ្ជូន" : "Site Address"}</p>
                    <p className="text-[14px] font-bold text-slate-900 leading-relaxed uppercase">{order.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
                  {language === "kh" ? "ត្រូវការជំនួយ?" : "Need Help?"}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                  {language === "kh" ? "ផ្នែកគាំទ្ររបស់យើងគឺសកម្ម ២៤/៧ សម្រាប់ការសាកសួរបច្ចេកទេស។" : "Our support is active 24/7 for technical queries."}
                </p>
                <a href="tel:+85512345678" className="flex items-center justify-center w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] uppercase tracking-widest hover:bg-primary transition-all duration-300">
                   {language === "kh" ? "ទាក់ទងអ្នកជំនាញ" : "Contact Specialist"}
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
          }}
          onExpire={refreshQR}
        />
      )}
    </PublicLayout>
  )
}
