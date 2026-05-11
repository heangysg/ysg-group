"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import PublicLayout from '../../../components/PublicLayout'
import { CheckCircle2, Clock, MapPin, Phone, User, Package, ArrowRight, CreditCard, Loader2 } from 'lucide-react'
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
        // If pending, generate QR and auto-open modal
        if (data.status === "pending" && data.paymentMethod === "Bakong") {
          const orderExpiresAt = new Date(data.createdAt).getTime() + (5 * 60 * 1000)
          
          // Use localStorage to securely persist the exact QR code across refreshes
          const cacheKey = `bakong_qr_${data.id}`
          const cachedStr = localStorage.getItem(cacheKey)
          let cachedQR = cachedStr ? JSON.parse(cachedStr) : null

          // If we have a cached QR and it hasn't expired, use it immediately
          if (cachedQR && Date.now() < cachedQR.expiresAt) {
            setQrData(cachedQR)
          } else {
            // Otherwise generate a new one and cache it
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

    // Real-time subscription to order updates
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
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </PublicLayout>
    )
  }

  if (!order) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-black mb-4">Order Not Found</h2>
            <Link href="/products" className="text-primary font-bold">Back to Products</Link>
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
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-40 bg-nichhy min-h-screen">
        
        {/* 💎 Elite Header Flow */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
              <Link href="/" className="hover:text-primary transition-soft">Home</Link>
              <ArrowRight className="w-4 h-4" />
              <span className="text-slate-950">Order Review</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-950 tracking-tighter uppercase leading-[0.9]">
              ORDER <span className="text-primary">#{order.id.toUpperCase()}</span>
            </h1>
          </div>
          
          <div className={`px-10 py-5 rounded-full font-black text-[12px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-sm border transition-soft ${
            order.status === "paid" 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-200/20" 
            : "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-200/20"
          }`}>
            {order.status === "paid" ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {t("paid") || "Payment Received"}
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                {t("pending") || "Awaiting Payment"}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12 animate-in fade-in slide-in-from-left duration-1000">
            
            {/* 🏗️ Luxury Payment Gateway Card */}
            {order.status === "pending" && order.paymentMethod === "Bakong" && (
              <div className="bg-slate-950 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden group shadow-2xl shadow-slate-950/20">
                <div className="relative z-10 space-y-8">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Digital Transaction</span>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">Complete Your <br/>Secure Payment</h2>
                    <p className="text-slate-400 font-bold italic opacity-80 leading-relaxed max-w-md">Your industrial machinery is reserved. Please process the transaction via Bakong KHQR to finalize your order.</p>
                  </div>
                  
                  <button 
                    onClick={() => setShowQR(true)}
                    className="bg-white text-slate-950 px-12 py-7 rounded-[2.5rem] font-black text-[13px] uppercase tracking-[0.4em] flex items-center gap-5 hover:bg-slate-100 transition-soft active:scale-95 shadow-2xl shadow-white/10"
                  >
                    <CreditCard className="w-6 h-6" />
                    Pay with Bakong KHQR
                  </button>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-soft" />
                <div className="absolute top-10 right-10 opacity-10">
                  <Package className="w-40 h-40" />
                </div>
              </div>
            )}

            {/* 🌿 Success Boutique Message */}
            {order.status === "paid" && (
              <div className="bg-white border border-slate-100 rounded-[4rem] p-12 md:p-20 text-center shadow-lux-deep">
                <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-white shadow-2xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter mb-4">Payment Successful</h2>
                <p className="text-slate-500 font-bold italic opacity-80">Thank you for your investment. Your industrial machinery is now being prepared for logistics.</p>
              </div>
            )}

            {/* 📦 Order Content Card */}
            <div className="bg-white border border-slate-100 rounded-[4rem] p-12 md:p-20 shadow-lux-deep">
              <h3 className="text-2xl font-black text-slate-950 mb-12 uppercase tracking-tighter flex items-center gap-5">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                Equipment Manifest
              </h3>
              <div className="space-y-8">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-10 py-8 border-b border-slate-50 last:border-0 group">
                    <div className="w-24 h-24 bg-slate-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 border border-slate-100 group-hover:scale-95 transition-soft">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="text-xl font-black text-slate-950 uppercase tracking-tight group-hover:text-primary transition-soft">
                        {language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}
                      </h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">
                        {item.brand} • Unit Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-950 tracking-tighter">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 pt-10 border-t border-slate-50 flex justify-between items-center">
                <span className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Grand Total Investment</span>
                <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* 🚚 Logistics & Support */}
          <div className="space-y-12 animate-in fade-in slide-in-from-right duration-1000">
            <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-lux-deep">
              <h3 className="text-xl font-black text-slate-950 mb-10 uppercase tracking-tighter">Logistics Profile</h3>
              <div className="space-y-10">
                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-soft">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Customer</p>
                    <p className="font-black text-slate-950 text-lg tracking-tight">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-soft">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Secure Contact</p>
                    <p className="font-black text-slate-950 text-lg tracking-tight">{order.customerPhone}</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-soft">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-1">Site Delivery Address</p>
                    <p className="font-black text-slate-950 leading-relaxed text-lg tracking-tight">{order.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-slate-950/20">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Need Assistance?</h3>
                <p className="text-slate-400 text-sm font-bold italic opacity-80 leading-relaxed mb-8">If you have technical questions regarding your order or logistics, our elite support is active 24/7.</p>
                <a href="tel:+85512345678" className="block w-full py-6 bg-white text-slate-950 rounded-[2rem] text-center font-black text-[12px] uppercase tracking-[0.3em] hover:bg-slate-100 transition-soft active:scale-95 shadow-xl shadow-white/5">
                  Contact Specialist
                </a>
              </div>
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
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
            // Order state will auto-update via real-time subscription
          }}
          onExpire={refreshQR}
        />
      )}
    </PublicLayout>
  )
}
