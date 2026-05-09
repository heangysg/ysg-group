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
          const generated = generateBakongQR(data.totalAmount, data.id)
          setQrData(generated)
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
      const generated = generateBakongQR(order.totalAmount, order.id)
      setQrData(generated)
      toast.success("QR Code Refreshed")
    }
  }

  return (
    <PublicLayout>
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 font-sans">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/" className="text-slate-400 hover:text-primary transition-colors">Home</Link>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-900 font-bold">Order Details</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
          </div>
          
          <div className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 ${
            order.status === "paid" 
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
            : "bg-amber-50 text-amber-600 border border-amber-100"
          }`}>
            {order.status === "paid" ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                {t("paid") || "Paid"}
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 animate-pulse" />
                {t("pending") || "Payment Pending"}
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Payment Section for Pending Orders */}
            {order.status === "pending" && order.paymentMethod === "Bakong" && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-4">Complete Your Payment</h2>
                  <p className="text-slate-400 mb-8 max-w-md">Your machinery is reserved. Please complete the payment via Bakong KHQR to start processing your order.</p>
                  <button 
                    onClick={() => setShowQR(true)}
                    className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-white/10"
                  >
                    <CreditCard className="w-5 h-5" />
                    Pay with Bakong KHQR
                  </button>
                </div>
                {/* Background Decoration */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:bg-primary/30 transition-all" />
              </div>
            )}

            {/* Success Message for Paid Orders */}
            {order.status === "paid" && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 md:p-10 text-center">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-emerald-900 mb-2">Payment Successful!</h2>
                <p className="text-emerald-700">Thank you for your purchase. Your machinery order is now being processed by our team.</p>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" />
                Order Items
              </h3>
              <div className="space-y-6">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-slate-900">{language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.brand} • Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 pt-8 border-t border-slate-50 flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-sm">Total Amount</span>
                <span className="text-3xl font-black text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Shipping Details */}
            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-6">Shipping Details</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <User className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                    <p className="font-bold text-slate-900">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contact</p>
                    <p className="font-bold text-slate-900">{order.customerPhone}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Delivery Address</p>
                    <p className="font-bold text-slate-900 leading-relaxed">{order.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8">
              <h3 className="text-lg font-black text-slate-900 mb-4">Need Help?</h3>
              <p className="text-sm text-slate-500 mb-6">If you have any questions about your order or payment, please contact our 24/7 support.</p>
              <a href="tel:+85512345678" className="block w-full py-4 bg-slate-100 rounded-2xl text-center font-black text-sm hover:bg-slate-200 transition-colors">
                Contact Support
              </a>
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
