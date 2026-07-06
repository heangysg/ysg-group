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
  expiresAt?: number
  onSuccess?: () => void
  onExpire?: () => void
}
  
export default function BakongQRModal({ isOpen, onClose, qrString, amount, orderId, md5, expiresAt, onSuccess, onExpire }: BakongQRModalProps) {
  const { t } = useLanguage()
  const [isChecking, setIsChecking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const supabase = createClient()
  const merchantName = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_NAME || "YSG"

  useEffect(() => {
    if (!isOpen) return

    let initialTime = 300
    if (expiresAt) {
      const remaining = Math.floor((expiresAt - Date.now()) / 1000)
      initialTime = remaining > 0 ? remaining : 0
    }
    setTimeLeft(initialTime)

    if (initialTime <= 0) {
      if (onExpire) onExpire()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, expiresAt])

  useEffect(() => {
    if (isOpen && timeLeft === 0) {
      if (onExpire) onExpire()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isOpen])

  useEffect(() => {
    if (!isOpen || !md5) return

    let isSubscribed = true;
    let isFetching = false;

    const pollInterval = setInterval(async () => {
      if (!isSubscribed || isFetching) return;
      
      isFetching = true;
      try {
        const isPaid = await checkBakongTransaction(md5, orderId)
        if (isPaid && isSubscribed) {
          clearInterval(pollInterval)
          handleSuccess()
        }
      } catch (err) {
        console.error("BakongQRModal polling error:", err);
      } finally {
        isFetching = false;
      }
    }, 3000)

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval)
    }
  }, [isOpen, md5, orderId])

  const handleSuccess = async () => {
    setIsChecking(true)
    try {
      if (onSuccess) {
        setTimeout(onSuccess, 500)
      } else {
        setTimeout(onClose, 500)
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
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Toaster position="top-center" />

      <div className="w-full max-w-[290px] animate-in zoom-in-95 duration-300 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* The Card Container */}
        <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-2xl relative font-sans">

          {/* 1. Header: Bakong Red */}
          <div className="bg-[#E1232E] h-[70px] flex items-center justify-center relative">
            {/* Right Side Downward Tail */}
            <div className="absolute top-full right-0 w-0 h-0 border-t-[20px] border-t-[#E1232E] border-l-[28px] border-l-transparent" />

            <img
              src="/logo/KHQR Logo.png"
              alt="KHQR"
              className="h-6 object-contain"
            />
          </div>

          {/* 3. Card Body */}
          <div className="p-6 pt-5 flex flex-col">
            {/* Merchant Name */}
            <h2 className="text-[14px] font-medium text-slate-500 uppercase tracking-tight leading-tight mb-2 mt-2">
              {merchantName}
            </h2>

            {/* Amount - Large and left aligned */}
            <div className="mb-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[36px] font-medium text-slate-900 leading-none tracking-tight">
                  {amount}
                </span>
                <span className="text-[14px] font-medium text-slate-500">
                  USD
                </span>
              </div>
            </div>

            {/* Dashed Separator */}
            <div className="w-full border-t border-dashed border-slate-300 mb-6"></div>

            {/* QR Code Container */}
            <div className="relative flex justify-center w-full mb-6">
              <QRCodeSVG
                value={qrString}
                size={190}
                level="H"
                includeMargin={false}
              />
              {/* Custom Black Disc with White $ */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36px] h-[36px] bg-black rounded-full border-[3px] border-white flex items-center justify-center shadow-sm">
                <span className="text-white text-[18px] font-medium mt-0.5">
                  $
                </span>
              </div>
            </div>

            {/* Expiry Timer */}
            <div className="flex flex-col items-center">
              <span className="text-slate-500 font-medium text-[13px]">
                Expires in: {formatTime(timeLeft)}
              </span>
            </div>

            {/* Hidden Polling Status for debugging/UX if needed, but removed visual clutter */}
            {isChecking && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
