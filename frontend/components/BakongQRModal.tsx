"use client"

import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Loader2, Download, Check } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
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

export default function BakongQRModal({
  isOpen,
  onClose,
  qrString,
  amount,
  orderId,
  md5,
  expiresAt,
  onSuccess,
  onExpire
}: BakongQRModalProps) {
  const { language } = useLanguage()
  const [isChecking, setIsChecking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const merchantName = process.env.NEXT_PUBLIC_BAKONG_MERCHANT_NAME || "Yeung Shi Group"

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
  }, [isOpen, expiresAt, onExpire])

  useEffect(() => {
    if (isOpen && timeLeft === 0) {
      if (onExpire) onExpire()
    }
  }, [timeLeft, isOpen, onExpire])

  useEffect(() => {
    if (!isOpen || !md5) return

    let isSubscribed = true
    let isFetching = false

    const pollInterval = setInterval(async () => {
      if (!isSubscribed || isFetching) return

      isFetching = true
      try {
        const isPaid = await checkBakongTransaction(md5, orderId)
        if (isPaid && isSubscribed) {
          clearInterval(pollInterval)
          handleSuccess()
        }
      } catch (err) {
        console.error("BakongQRModal polling error:", err)
      } finally {
        isFetching = false
      }
    }, 3000)

    return () => {
      isSubscribed = false
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

  const handleDownloadQR = async () => {
    try {
      setIsDownloading(true)
      const svg = qrRef.current?.querySelector('svg')
      if (!svg) throw new Error("SVG not found")

      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context failed")

      const size = 1000
      canvas.width = size
      canvas.height = size

      const img = new Image()
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))

      img.onload = () => {
        // Draw white background
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)

        const pngUrl = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = `YSG-KHQR-${orderId || 'payment'}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)

        setDownloadSuccess(true)
        toast.success(language === "kh" ? "បានទាញយក QR Code រួចរាល់!" : "QR Code downloaded!")
        setTimeout(() => setDownloadSuccess(false), 2000)
        setIsDownloading(false)
      }
    } catch (err) {
      console.error("Failed to download QR:", err)
      toast.error(language === "kh" ? "មិនអាចទាញយកបានទេ" : "Failed to download QR image")
      setIsDownloading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Toaster position="top-center" />

      {/* Modal / Bottom Sheet Card */}
      <div 
        className="w-full sm:max-w-[340px] bg-white rounded-t-[1.75rem] sm:rounded-2xl overflow-hidden shadow-2xl relative font-sans animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Header: Bakong Red with rounded top and top notch */}
        <div className="bg-[#E1232E] pt-2 pb-3.5 sm:py-3.5 px-4 flex flex-col items-center justify-center relative shrink-0">
          {/* Pull Notch (Inside Red Header) */}
          <div className="w-10 h-1 bg-white/40 rounded-full mb-1.5 sm:hidden" />

          {/* Centered KHQR Logo */}
          <img
            src="/logo/KHQR Logo.png"
            alt="KHQR"
            className="h-5 sm:h-5.5 object-contain"
          />

          {/* Right Side Downward Cutout Tail */}
          <div className="absolute top-full right-0 w-0 h-0 border-t-[14px] border-t-[#E1232E] border-l-[22px] border-l-transparent" />

          {/* Close Button (Desktop Only) */}
          <button
            onClick={onClose}
            className="hidden sm:flex absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* 2. Scrollable Card Body */}
        <div className="p-5 pt-4 pb-8 sm:pb-5 flex flex-col overflow-y-auto">
          {/* Merchant Name */}
          <p className="text-xs font-bold text-slate-900 leading-tight mb-1">
            {merchantName}
          </p>

          {/* Amount */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-2xl sm:text-[26px] font-black text-slate-900 leading-none">
              {typeof amount === 'number' ? amount.toLocaleString() : amount}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-500">
              USD
            </span>
          </div>

          {/* Dashed Separator (Edge-to-Edge with crisp, slim, visible dark gray) */}
          <div className="-mx-5 my-3.5 flex items-center overflow-hidden">
            <svg className="w-full h-1" preserveAspectRatio="none">
              <line
                x1="0"
                y1="0.5"
                x2="100%"
                y2="0.5"
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="6, 5"
              />
            </svg>
          </div>

          {/* QR Code Container */}
          <div ref={qrRef} className="relative flex justify-center w-full my-0.5">
            <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs">
              <QRCodeSVG
                value={qrString}
                size={175}
                level="H"
                includeMargin={false}
                className="w-full max-w-[175px] h-auto aspect-square"
              />
            </div>
            {/* Custom Center Emblem */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-black rounded-full border-2 border-white flex items-center justify-center shadow-xs">
              <span className="text-white text-sm font-bold mt-0.5">
                $
              </span>
            </div>
          </div>

          {/* Scan to Pay text */}
          <p className="text-center font-black text-slate-800 text-sm mt-3 mb-0.5">
            {language === "kh" ? "ស្កេនដើម្បីទូទាត់ប្រាក់" : "Scan to Pay"}
          </p>

          <span className="text-center text-xs text-slate-400 font-medium mb-2">
            {language === "kh" ? "ឬ" : "or"}
          </span>

          {/* Download QR Button (ABA Style) */}
          <button
            type="button"
            onClick={handleDownloadQR}
            disabled={isDownloading}
            className="w-full py-2.5 px-4 bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0284c7] hover:text-[#0369a1] border border-[#bae6fd] rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 shadow-2xs mb-2 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span className="text-emerald-700">{language === "kh" ? "បានទាញយករួច!" : "Downloaded!"}</span>
              </>
            ) : isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0284c7]" />
                <span>{language === "kh" ? "កំពុងទាញយក..." : "Downloading..."}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#0284c7]" />
                <span>{language === "kh" ? "ទាញយក QR Code" : "Download QR"}</span>
              </>
            )}
          </button>

          {/* Subtext info */}
          <p className="text-center text-[11px] text-slate-400 font-medium leading-relaxed mb-3">
            {language === "kh"
              ? "ហើយបញ្ចូលរូបភាពទៅក្នុង Mobile Banking ដែលគាំទ្រ KHQR"
              : "and upload to Mobile Banking app supporting KHQR"}
          </p>

          {/* Expiry Timer */}
          <div className="flex flex-col items-center pt-2.5 border-t border-slate-100">
            <span className="text-slate-500 font-medium text-xs">
              {language === "kh" ? "ផុតកំណត់ក្នុងរយៈពេល:" : "Expires in:"} <strong className="text-slate-700">{formatTime(timeLeft)}</strong>
            </span>
          </div>

          {/* Polling verification indicator */}
          {isChecking && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-semibold animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
