"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import PublicLayout from '../../../components/PublicLayout'
import { CheckCircle2, Clock, MapPin, Phone, User, Package, ArrowRight, ArrowLeft, CreditCard, Loader2, Receipt, Truck } from 'lucide-react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { generateBakongQR } from '../../../lib/bakong'
import BakongQRModal from '../../../components/BakongQRModal'
import PaymentSuccessModal from '../../../components/PaymentSuccessModal'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const { t, language } = useLanguage()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [qrData, setQrData] = useState<any>(null)

  useEffect(() => {
    if (!id) return

    const fetchOrder = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${API_URL}/api/orders/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Order not found");
        }

        if (typeof data.items === 'string') {
          try {
            data.items = JSON.parse(data.items);
          } catch(e) {}
        }

        setOrder(data)
        if (data.status === "pending" && data.paymentMethod === "Bakong") {
          const orderExpiresAt = new Date(data.createdAt).getTime() + (5 * 60 * 1000)
          const cacheKey = `bakong_qr_${data.id}`
          const cachedStr = localStorage.getItem(cacheKey)
          let cachedQR = null;
          if (cachedStr) {
            try {
              cachedQR = JSON.parse(cachedStr);
            } catch (e) {
              console.error("Corrupted QR cache");
              localStorage.removeItem(cacheKey);
            }
          }
          if (cachedQR && Date.now() < cachedQR.expiresAt) {
            setQrData(cachedQR)
            
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
            fetch(`${API_URL}/api/bakong/check-status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ md5: cachedQR.md5, orderId: data.id })
            }).then(r => r.json()).then(res => {
              if (res.responseCode === 0) {
                setOrder((prev: any) => prev ? { ...prev, status: "paid" } : prev)
              } else {
                setShowQR(true)
              }
            }).catch(e => {
              setShowQR(true)
            })
          } else {
            const expirationToUse = Date.now() < orderExpiresAt ? orderExpiresAt : Date.now() + (5 * 60 * 1000)
            const generated = await generateBakongQR(data.totalAmount, data.id, expirationToUse)
            if (generated && generated.qrString) {
              const qrPayload = { ...generated, expiresAt: expirationToUse }
              setQrData(qrPayload)
              localStorage.setItem(cacheKey, JSON.stringify(qrPayload))
              setShowQR(true)
            } else {
              toast.error(language === "kh" ? "មិនអាចបង្កើតកូដ QR បានទេ" : "Failed to generate payment QR");
            }
          }
        }
      } catch (err: any) {
        console.error("Error fetching order:", err)
        toast.error("Order not found")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

  }, [id])

  useEffect(() => {
    if (order?.status !== 'pending' || !qrData || showQR) return;

    let isSubscribed = true;
    let isFetching = false;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    
    const intervalId = setInterval(async () => {
      if (!isSubscribed || isFetching) return;
      
      if (Date.now() > qrData.expiresAt) {
        clearInterval(intervalId);
        return;
      }

      isFetching = true;
      try {
        const response = await fetch(`${API_URL}/api/bakong/check-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ md5: qrData.md5, orderId: order.id })
        });
        const res = await response.json();

        if (res.responseCode === 0 && isSubscribed) {
          setOrder((prev: any) => prev ? { ...prev, status: "paid" } : prev)
          setShowQR(false)
          setShowSuccessModal(true)
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Polling error:", err);
      } finally {
        isFetching = false;
      }
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [order?.status, qrData, order?.id, showQR])

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
            <h2 className="text-xl font-medium tracking-tight">Order Not Found</h2>
            <Link href="/products" className="inline-flex items-center gap-2 text-primary text-[13px] font-medium hover:underline">
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

  return (
    <PublicLayout>
      <Toaster position="top-center" />
      <div className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-6 pt-6 md:pt-8 pb-12 md:pb-24">
          
          {/* 💎 Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-2">
              {/* Desktop Breadcrumbs */}
              <div className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500">
                <Link href="/" className="hover:text-slate-900 transition-colors">{t("home")}</Link>
                <span>/</span>
                <span className="text-slate-900">{language === "kh" ? "ព័ត៌មានលម្អិតការបញ្ជាទិញ" : "Order Detail"}</span>
              </div>
              
              {/* Mobile App Style Header */}
              <div className="md:hidden mb-2">
                <Link href="/account" className="inline-flex items-center gap-3 text-slate-900 font-bold text-sm uppercase tracking-widest">
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-50 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] active:shadow-none active:translate-y-[2px] active:translate-x-[2px] transition-all">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  {language === "kh" ? "ត្រលប់ក្រោយ" : "Back"}
                </Link>
              </div>
              <h1 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight uppercase">
                {language === "kh" ? "ការបញ្ជាទិញ" : "Order"} <span className="text-primary">#{order.id}</span>
              </h1>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest border-2 border-slate-900 shadow-hard ${
              order.status === "paid"
                ? "bg-emerald-400 text-slate-900"
                : "bg-amber-400 text-slate-900"
            }`}>
              {order.status === "paid" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === "kh" ? "បានបង់ប្រាក់" : "Paid"}
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  {language === "kh" ? "កំពុងរង់ចាំ" : "Pending"}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-8 space-y-10">
              
              {/* 🏗️ Status Banner */}
              {order.status === "paid" ? (
                <div className="solid-card bg-emerald-400 p-6 md:p-12 flex flex-col md:flex-row items-start gap-6">
                  <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-emerald-400 shrink-0 border-2 border-slate-900">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                     <h2 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-widest leading-tight">
                       {language === "kh" ? "ការទូទាត់ជោគជ័យ" : "Payment Successful"}
                     </h2>
                     <p className="text-xs md:text-sm text-slate-900 font-bold">
                       {language === "kh" ? "សូមអរគុណសម្រាប់ការវិនិយោគរបស់អ្នក។ គ្រឿងម៉ាស៊ីនឧស្សាហកម្មរបស់អ្នកឥឡូវនេះកំពុងត្រូវបានរៀបចំសម្រាប់ដឹកជញ្ជូន។" : "Thank you for your investment. Your industrial machinery is now being prepared for logistics."}
                     </p>
                  </div>
                </div>
              ) : (
                <div className="solid-card bg-primary p-6 md:p-12 text-slate-900 relative overflow-hidden group">
                  <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold tracking-widest uppercase">
                        {language === "kh" ? "តម្រូវឱ្យទូទាត់ប្រាក់" : "Payment Required"}
                      </h2>
                      <p className="text-slate-900 text-sm font-bold max-w-md">
                        {language === "kh" ? "សូមបញ្ចប់ការទូទាត់របស់អ្នកតាមរយៈ Bakong KHQR ដើម្បីបញ្ចប់ការបញ្ជាទិញរបស់អ្នក។" : "Please complete your payment via Bakong KHQR to finalize your order."}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowQR(true)}
                      className="inline-flex items-center gap-3 bg-slate-900 text-white px-6 py-4 font-bold text-xs uppercase tracking-widest hover:-translate-y-1 hover:shadow-[4px_4px_0px_#primary] transition-all border-2 border-slate-900"
                    >
                      <CreditCard className="w-4 h-4" />
                      {language === "kh" ? "បង្ហាញ QR កូដ" : "Show QR Code"}
                    </button>
                  </div>
                </div>
              )}

              {/* 📦 Manifest */}
                <div className="solid-card bg-white p-6 md:p-12">
                <h3 className="text-sm font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                  <Package className="w-4 h-4 text-primary" />
                  {language === "kh" ? "បញ្ជីគ្រឿងម៉ាស៊ីន" : "Equipment Manifest"}
                </h3>
                <div className="divide-y-2 divide-slate-900">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="py-4 md:py-6 flex items-start md:items-center gap-4 md:gap-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 overflow-hidden shrink-0 border-2 border-slate-900 mt-1 md:mt-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm md:text-[15px] font-bold text-slate-900 uppercase tracking-tight line-clamp-2 leading-tight">
                          {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                        </h4>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
                          {item.brand} • {language === "kh" ? "ចំនួន" : "Qty"}: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right shrink-0 mt-1 md:mt-0">
                        <p className="text-sm md:text-[15px] font-bold text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t-2 border-slate-900 flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {language === "kh" ? "ការវិនិយោគសរុប" : "Total Investment"}
                    </span>
                  </div>
                  <span className="text-3xl font-bold text-slate-900 tracking-tighter">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              
              <div className="solid-card bg-slate-50 p-6 md:p-8">
                <h3 className="text-xs font-bold text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  {language === "kh" ? "ការដឹកជញ្ជូន" : "Logistics"}
                </h3>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{language === "kh" ? "អតិថិជន" : "Client"}</p>
                    <p className="text-sm font-bold text-slate-900 uppercase">{order.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{language === "kh" ? "ទំនាក់ទំនង" : "Contact"}</p>
                    <p className="text-sm font-bold text-slate-900">{order.customerPhone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{language === "kh" ? "អាសយដ្ឋានដឹកជញ្ជូន" : "Site Address"}</p>
                    <p className="text-sm font-bold text-slate-900 leading-relaxed uppercase">{order.address}</p>
                  </div>
                </div>
              </div>

              <div className="solid-card bg-white p-6 md:p-8 space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                  {language === "kh" ? "ត្រូវការជំនួយ?" : "Need Help?"}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-bold">
                  {language === "kh" ? "ផ្នែកគាំទ្ររបស់យើងគឺសកម្ម ២៤/៧ សម្រាប់ការសាកសួរបច្ចេកទេស។" : "Our support is active 24/7 for technical queries."}
                </p>
                <a href="tel:+85512345678" className="btn-primary w-full py-4 text-xs flex items-center justify-center">
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
