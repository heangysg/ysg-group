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
  
  // 📱 Touch drag state for pull-to-dismiss gesture
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartY = useRef<number>(0)
  
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

  // 🖐️ Touch Drag Gestures for Pull Notch & Red Header (អូសចុះក្រោមដើម្បីបិទ)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStartY.current
    if (deltaY > 0) {
      // Dragging downward
      setDragY(deltaY)
    } else {
      setDragY(0)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (dragY > 80) {
      // Swiped down far enough -> close modal
      onClose()
    }
    setDragY(0)
  }

  // 📸 Ultra-crisp, Complete KHQR Card Image Generator
  const handleDownloadQR = async () => {
    try {
      setIsDownloading(true)
      const svg = qrRef.current?.querySelector('svg')
      if (!svg) throw new Error("SVG not found")

      const svgData = new XMLSerializer().serializeToString(svg)
      const qrImage = new Image()
      qrImage.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))

      const khqrLogo = new Image()
      khqrLogo.src = "/logo/KHQR Logo.png"

      await Promise.all([
        new Promise((resolve) => { qrImage.onload = resolve; qrImage.onerror = resolve; }),
        new Promise((resolve) => { khqrLogo.onload = resolve; khqrLogo.onerror = resolve; })
      ])

      // High-resolution Canvas (800 x 1150 px)
      const canvas = document.createElement("canvas")
      const W = 800
      const H = 1150
      canvas.width = W
      canvas.height = H
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context error")

      // 1. Clean White Background
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, W, H)

      // 2. Red Header Bar (#E1232E)
      ctx.fillStyle = "#E1232E"
      ctx.fillRect(0, 0, W, 140)

      // Header Cutout Triangle on bottom-right
      ctx.beginPath()
      ctx.moveTo(W, 140)
      ctx.lineTo(W, 185)
      ctx.lineTo(W - 60, 140)
      ctx.closePath()
      ctx.fill()

      // Draw KHQR Logo inside Red Header
      if (khqrLogo.complete && khqrLogo.naturalWidth > 0) {
        const logoHeight = 65
        const logoWidth = (khqrLogo.naturalWidth / khqrLogo.naturalHeight) * logoHeight
        ctx.drawImage(khqrLogo, (W - logoWidth) / 2, (140 - logoHeight) / 2, logoWidth, logoHeight)
      } else {
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 42px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("KHQR", W / 2, 85)
      }

      // 3. Merchant Name
      ctx.fillStyle = "#0f172a"
      ctx.font = "600 28px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(merchantName, 55, 230)

      // 4. Amount Text (Balanced, crisp weight - not overly bold)
      const formattedAmount = typeof amount === 'number' ? amount.toLocaleString() : amount
      ctx.fillStyle = "#0f172a"
      ctx.font = "700 46px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.fillText(formattedAmount, 55, 295)

      const amountWidth = ctx.measureText(formattedAmount).width
      ctx.fillStyle = "#64748b"
      ctx.font = "600 22px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.fillText("USD", 55 + amountWidth + 12, 295)

      // 5. Dashed Divider Line
      ctx.strokeStyle = "#64748b"
      ctx.lineWidth = 2.5
      ctx.setLineDash([14, 10])
      ctx.beginPath()
      ctx.moveTo(55, 335)
      ctx.lineTo(W - 55, 335)
      ctx.stroke()
      ctx.setLineDash([])

      // 6. Centered QR Code
      const qrSize = 540
      const qrX = (W - qrSize) / 2
      const qrY = 385
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

      // 7. Centered Emblem ($ on black circle)
      const emblemSize = 90
      const emblemX = (W - emblemSize) / 2
      const emblemY = qrY + (qrSize - emblemSize) / 2

      ctx.beginPath()
      ctx.arc(emblemX + emblemSize / 2, emblemY + emblemSize / 2, emblemSize / 2, 0, Math.PI * 2)
      ctx.fillStyle = "#000000"
      ctx.fill()
      ctx.lineWidth = 6
      ctx.strokeStyle = "#ffffff"
      ctx.stroke()

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 44px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("$", emblemX + emblemSize / 2, emblemY + emblemSize / 2 + 2)

      // 8. Footer Brand Text
      ctx.textBaseline = "alphabetic"
      ctx.fillStyle = "#004691"
      ctx.font = "bold 28px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Scan with any Mobile Banking app supporting KHQR", W / 2, 990)

      ctx.fillStyle = "#94a3b8"
      ctx.font = "500 22px Inter, sans-serif"
      ctx.fillText(`Order ID: #${orderId || 'PAYMENT'} • Yeung Shi Group`, W / 2, 1035)

      // 9. Clean Download via Native Mobile Share / Blob
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Blob creation failed")
        const fileName = `YSG-KHQR-${orderId || 'payment'}.png`
        const file = new File([blob], fileName, { type: "image/png" })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "KHQR Payment - Yeung Shi Group",
            })
            setDownloadSuccess(true)
            setTimeout(() => setDownloadSuccess(false), 2000)
            setIsDownloading(false)
            return
          } catch (shareErr) {
            // User cancelled share sheet or fallback to direct download
          }
        }

        // Standard File Download Fallback
        const url = URL.createObjectURL(blob)
        const downloadLink = document.createElement("a")
        downloadLink.href = url
        downloadLink.download = fileName
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        setTimeout(() => URL.revokeObjectURL(url), 1000)

        setDownloadSuccess(true)
        toast.success(language === "kh" ? "បានទាញយក QR Code រួចរាល់!" : "KHQR image saved!")
        setTimeout(() => setDownloadSuccess(false), 2000)
        setIsDownloading(false)
      }, "image/png", 1.0)

    } catch (err) {
      console.error("Failed to download QR:", err)
      toast.error(language === "kh" ? "មិនអាចទាញយកបានទេ" : "Failed to download QR image")
      setIsDownloading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/75 backdrop-blur-xs z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Toaster position="top-center" />

      {/* 100% Full-Width Bottom Sheet on Phone / Centered Modal on Desktop */}
      <div 
        className="w-full sm:max-w-[340px] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl relative font-sans animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col will-change-transform"
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Header: Bakong Red with Interactive Pull-to-Dismiss Gesture */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full bg-[#E1232E] pt-2 pb-3.5 sm:py-3.5 px-4 flex flex-col items-center justify-center relative shrink-0 cursor-grab active:cursor-grabbing select-none touch-none"
        >
          {/* Pull Notch Indicator (Drag down to dismiss) */}
          <div className="w-12 h-1.5 bg-white/50 hover:bg-white/70 active:bg-white/90 rounded-full mb-1.5 sm:hidden transition-colors" />

          {/* Centered KHQR Logo */}
          <img
            src="/logo/KHQR Logo.png"
            alt="KHQR"
            className="h-5 sm:h-5.5 w-auto object-contain pointer-events-none"
          />

          {/* Right Side Downward Cutout Tail */}
          <div className="absolute top-full right-0 w-0 h-0 border-t-[14px] border-t-[#E1232E] border-l-[22px] border-l-transparent pointer-events-none" />

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
        <div className="w-full p-5 pt-3 pb-8 sm:pb-4 flex flex-col overflow-y-auto">
          {/* Merchant Name */}
          <h2 className="text-[14px] sm:text-[15px] font-bold text-slate-900 leading-tight mb-0.5 font-[family-name:var(--font-inter)] tracking-tight">
            {merchantName}
          </h2>

          {/* Amount */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
              {typeof amount === 'number' ? amount.toLocaleString() : amount}
            </span>
            <span className="text-xs font-bold text-slate-500">
              USD
            </span>
          </div>

          {/* Dashed Separator (Edge-to-Edge) */}
          <div className="-mx-5 my-2.5 flex items-center overflow-hidden">
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
            <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
              <QRCodeSVG
                value={qrString}
                size={155}
                level="H"
                includeMargin={false}
                className="w-[155px] h-[155px]"
              />
            </div>
            {/* Custom Center Emblem */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-black rounded-full border-2 border-white flex items-center justify-center shadow-2xs">
              <span className="text-white text-xs font-bold mt-0.5">
                $
              </span>
            </div>
          </div>

          {/* Scan to Pay text */}
          <p className="text-center font-bold text-slate-800 text-xs mt-2 mb-0.5">
            {language === "kh" ? "ស្កេនដើម្បីទូទាត់ប្រាក់" : "Scan to Pay"}
          </p>

          <span className="text-center text-[11px] text-slate-400 font-medium mb-1">
            {language === "kh" ? "ឬ" : "or"}
          </span>

          {/* Download QR Button (ABA Style) */}
          <button
            type="button"
            onClick={handleDownloadQR}
            disabled={isDownloading}
            className="w-full py-2.5 px-3 bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0284c7] hover:text-[#0369a1] border border-[#bae6fd] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-2xs mb-1.5 cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span className="text-emerald-700 text-xs">{language === "kh" ? "បានទាញយករួច!" : "Downloaded!"}</span>
              </>
            ) : isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0284c7]" />
                <span className="text-xs">{language === "kh" ? "កំពុងទាញយក..." : "Downloading..."}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[#0284c7]" />
                <span className="text-xs">{language === "kh" ? "ទាញយក QR Code" : "Download QR"}</span>
              </>
            )}
          </button>

          {/* Subtext info */}
          <p className="text-center text-[10px] text-slate-400 font-medium leading-snug mb-2">
            {language === "kh"
              ? "ហើយបញ្ចូលរូបភាពទៅក្នុង Mobile Banking ដែលគាំទ្រ KHQR"
              : "and upload to Mobile Banking app supporting KHQR"}
          </p>

          {/* Expiry Timer */}
          <div className="flex flex-col items-center pt-2 border-t border-slate-100">
            <span className="text-slate-500 font-medium text-[11px]">
              {language === "kh" ? "ផុតកំណត់ក្នុងរយៈពេល:" : "Expires in:"} <strong className="text-slate-700">{formatTime(timeLeft)}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
