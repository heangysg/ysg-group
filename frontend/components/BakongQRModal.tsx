"use client"

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Info, Loader2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { createClient } from '../lib/supabase/client'
import { checkBakongTransaction } from '../lib/bakong'
import toast, { Toaster } from 'react-hot-toast'

interface BakongQRModalProps {
  isOpen: boolean
  onClose: () => void
  qrString: string
  amount: number
  orderId: string
  md5: string
  onSuccess?: () => void
  onExpire?: () => void
}

export default function BakongQRModal({ isOpen, onClose, qrString, amount, orderId, md5, onSuccess, onExpire }: BakongQRModalProps) {
  const { t } = useLanguage()
  const [isChecking, setIsChecking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes
  const supabase = createClient()
  const merchantName = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_NAME || "YSG MACHINERY"

  // 1. Countdown Timer Effect
  useEffect(() => {
    if (!isOpen) return
    setTimeLeft(180)
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (onExpire) onExpire()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, onExpire])

  // 2. Automated Polling Effect (Every 5 seconds)
  useEffect(() => {
    if (!isOpen || !md5) return

    const pollInterval = setInterval(async () => {
      const isPaid = await checkBakongTransaction(md5)
      
      if (isPaid) {
        clearInterval(pollInterval)
        handleSuccess()
      }
    }, 5000)

    return () => clearInterval(pollInterval)
  }, [isOpen, md5])

  const handleSuccess = async () => {
    setIsChecking(true)
    try {
      const { error } = await supabase
        .from("Order")
        .update({ status: "paid" })
        .eq("id", orderId)
      
      if (error) throw error
      
      toast.success("Payment Received Successfully!")
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      } else {
        setTimeout(onClose, 2000)
      }
    } catch (err) {
      console.error("Auto-verify failed:", err)
    } finally {
      setIsChecking(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-[340px] animate-in zoom-in-95 duration-300 relative">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute -top-10 right-0 p-2 text-white/60 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* The Card Container - Aiming for compact 20:29 feel */}
        <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-2xl relative border border-white/20 font-nunito">
          
          {/* 1. Header: Compact Bakong Red */}
          <div className="bg-[#E1232E] h-[64px] flex items-center justify-center relative">
            <img 
              src="/logo/KHQR Logo.png" 
              alt="KHQR" 
              className="h-8 object-contain"
            />
          </div>

          {/* 2. Folded Corner Effect */}
          <div className="absolute top-[64px] right-0 w-12 h-12 pointer-events-none z-10">
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-t-[#E1232E] border-l-[24px] border-l-transparent" />
          </div>

          {/* 3. Card Body - Compact Padding */}
          <div className="p-6 pt-8 flex flex-col items-center">
            {/* Merchant Name */}
            <h2 className="text-xl font-black text-black tracking-tight text-center uppercase leading-tight mb-6">
              {merchantName}
            </h2>

            {/* Amount - Large but compact */}
            <div className="text-center mb-6">
              <div className="text-4xl font-black text-black flex items-center justify-center gap-0.5">
                <span className="text-xl font-bold mt-1">$</span>
                {amount.toLocaleString()}
              </div>
            </div>

            {/* QR Code Container - Balanced sizing */}
            <div className="relative bg-white p-3 rounded-2xl border border-slate-100 shadow-inner">
              <QRCodeSVG 
                value={qrString} 
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "https://bakong.nbc.gov.kh/images/logo.svg",
                  x: undefined,
                  y: undefined,
                  height: 36,
                  width: 36,
                  excavate: true,
                }}
              />
            </div>

            {/* Expiry Timer - Integrated */}
            <div className="mt-6 flex flex-col items-center">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                timeLeft < 60 ? "bg-red-50 text-red-500 border-red-100 animate-pulse" : "bg-slate-50 text-slate-500 border-slate-100"
              }`}>
                Expires: {formatTime(timeLeft)}
              </div>
            </div>

            {/* Dynamic Status Indicator */}
            <div className="w-full mt-6 space-y-4">
              <div className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2.5 border-2 ${
                isChecking 
                ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                : "bg-slate-50 border-slate-100 text-slate-400"
              }`}>
                {isChecking ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    Success
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E1232E]" />
                    Waiting for pay...
                  </>
                )}
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <Info className="w-3 h-3" />
                  Instant Network Sync
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
