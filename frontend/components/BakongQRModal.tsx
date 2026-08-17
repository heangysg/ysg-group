"use client"

import { useState, useEffect, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Loader2, Download, Check, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { checkBakongTransaction } from '../lib/bakong'
import toast, { Toaster } from 'react-hot-toast'
import Portal from './Portal'

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
  const [isVerifying, setIsVerifying] = useState(false)

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

      // Save requests: Do not poll if user minimized or switched tab
      if (typeof document !== 'undefined' && document.hidden) return

      // Save requests: Stop immediately if QR code has expired
      if (expiresAt && Date.now() > expiresAt) {
        clearInterval(pollInterval)
        return
      }

      isFetching = true
      try {
        const isPaid = await checkBakongTransaction(md5, orderId)
        if (isPaid && isSubscribed) {
          clearInterval(pollInterval)
          handleSuccess()
        }
      } catch {
        // Silently ignore transient network drops during background polling
      } finally {
        isFetching = false
      }
    }, 4500)

    return () => {
      isSubscribed = false
      clearInterval(pollInterval)
    }
  }, [isOpen, md5, orderId, expiresAt])

  const handleSuccess = async () => {
    setIsChecking(true)
    try {
      if (onSuccess) {
        setTimeout(onSuccess, 500)
      } else {
        setTimeout(onClose, 500)
      }
    } catch {
      // Quietly continue
    } finally {
      setIsChecking(false)
    }
  }

  const handleManualVerify = async () => {
    if (!md5 || isVerifying) return
    setIsVerifying(true)
    try {
      const isPaid = await checkBakongTransaction(md5, orderId)
      if (isPaid) {
        toast.success(language === "kh" ? "ការទូទាត់ប្រាក់ជោគជ័យ!" : "Payment confirmed!")
        handleSuccess()
      } else {
        toast(
          language === "kh"
            ? "កំពុងរង់ចាំការបញ្ជាក់ពីប្រព័ន្ធ Bakong... ប្រសិនបើអ្នកបានផ្ទេររួច សូមរង់ចាំបន្តិច"
            : "Waiting for bank confirmation... If you just transferred, please wait a moment.",
          { icon: "⏳", duration: 4000 }
        )
      }
    } catch {
      toast(language === "kh" ? "កំពុងរង់ចាំការបញ្ជាក់ពីធនាគារ..." : "Checking payment status...", { icon: "⏳" })
    } finally {
      setIsVerifying(false)
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

      const bakongLogo = new Image()
      bakongLogo.src = "/logo/bakongqr.png"

      await Promise.all([
        new Promise((resolve) => { qrImage.onload = resolve; qrImage.onerror = resolve; }),
        new Promise((resolve) => { khqrLogo.onload = resolve; khqrLogo.onerror = resolve; }),
        new Promise((resolve) => { bakongLogo.onload = resolve; bakongLogo.onerror = resolve; })
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

      // 2. Red Header Bar (#e21a1a)
      ctx.fillStyle = "#e21a1a"
      ctx.fillRect(0, 0, W, 115)

      // Header Cutout Triangle on bottom-right
      ctx.beginPath()
      ctx.moveTo(W, 115)
      ctx.lineTo(W, 150)
      ctx.lineTo(W - 48, 115)
      ctx.closePath()
      ctx.fill()

      // Draw KHQR Logo inside Red Header
      if (khqrLogo.complete && khqrLogo.naturalWidth > 0) {
        const logoHeight = 48
        const logoWidth = (khqrLogo.naturalWidth / khqrLogo.naturalHeight) * logoHeight
        ctx.drawImage(khqrLogo, (W - logoWidth) / 2, (115 - logoHeight) / 2, logoWidth, logoHeight)
      } else {
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 36px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("KHQR", W / 2, 70)
      }

      // 3. Merchant Name
      ctx.fillStyle = "#0f172a"
      ctx.font = "600 28px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(merchantName, 55, 205)

      // 4. Amount Text (Balanced, crisp weight - not overly bold)
      const formattedAmount = typeof amount === 'number' ? amount.toLocaleString() : amount
      ctx.fillStyle = "#0f172a"
      ctx.font = "700 46px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.fillText(formattedAmount, 55, 270)

      const amountWidth = ctx.measureText(formattedAmount).width
      ctx.fillStyle = "#64748b"
      ctx.font = "700 24px Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.fillText("USD", 55 + amountWidth + 14, 270)

      // 5. Subtle Dashed Separator Line
      ctx.strokeStyle = "#94a3b8"
      ctx.lineWidth = 2.5
      ctx.setLineDash([12, 10])
      ctx.beginPath()
      ctx.moveTo(0, 315)
      ctx.lineTo(W, 315)
      ctx.stroke()
      ctx.setLineDash([])

      // 6. Centered QR Code with Clean White Padding Box
      const qrSize = 420
      const qrX = (W - qrSize) / 2
      const qrY = 345

      ctx.fillStyle = "#ffffff"
      ctx.shadowColor = "rgba(0, 0, 0, 0.05)"
      ctx.shadowBlur = 15
      ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40)
      ctx.shadowColor = "transparent"

      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

      // 7. Custom Center Emblem with /logo/bakongqr.png & White Outline (Perfect Circle)
      const emblemSize = 62
      const emblemX = (W - emblemSize) / 2
      const emblemY = qrY + (qrSize - emblemSize) / 2

      ctx.save()
      ctx.beginPath()
      ctx.arc(W / 2, qrY + qrSize / 2, emblemSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()

      if (bakongLogo.complete && bakongLogo.naturalWidth > 0) {
        ctx.drawImage(bakongLogo, emblemX, emblemY, emblemSize, emblemSize)
      } else {
        ctx.fillStyle = "#000000"
        ctx.fill()
      }
      ctx.restore()

      // White circular outline
      ctx.beginPath()
      ctx.arc(W / 2, qrY + qrSize / 2, emblemSize / 2, 0, Math.PI * 2)
      ctx.lineWidth = 3.5
      ctx.strokeStyle = "#ffffff"
      ctx.stroke()

      // 8. Footer Expiry Note
      ctx.fillStyle = "#94a3b8"
      ctx.font = "500 22px Inter, -apple-system, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Scan with Bakong or any Mobile Banking App (KHQR)", W / 2, 850)

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
    <Portal>
      <div
        className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <Toaster position="top-center" />

        {/* Universally Responsive & Centered Modal Card */}
        <div
          className="w-full max-w-[340px] bg-white rounded-2xl overflow-hidden shadow-2xl relative font-sans animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col my-auto shrink-0"
          onClick={(e) => e.stopPropagation()}
        >

          {/* 1. Header: Compact Bakong Red (#e21a1a) */}
          <div
            className="w-full bg-[#e21a1a] h-[44px] sm:h-[46px] px-4 flex items-center justify-center relative shrink-0 select-none"
          >
            {/* Centered Compact KHQR Logo */}
            <div className="flex items-center justify-center">
              <img
                src="/logo/KHQR Logo.png"
                alt="KHQR"
                className="h-4 sm:h-4.5 w-auto object-contain pointer-events-none"
              />
            </div>

            {/* Right Side Downward Cutout Tail */}
            <div className="absolute top-full right-0 w-0 h-0 border-t-[12px] sm:border-t-[14px] border-t-[#e21a1a] border-l-[18px] sm:border-l-[22px] border-l-transparent pointer-events-none" />

            {/* Close Button (Visible on all devices) */}
            <button
              onClick={onClose}
              className="flex absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* 2. Scrollable Card Body */}
          <div className="w-full p-4 sm:p-5 pt-3 pb-5 flex flex-col overflow-y-auto custom-scrollbar">
            {/* Merchant Name */}
            <h2 className="text-[13px] sm:text-[14px] font-bold text-slate-900 leading-tight mb-1 font-[family-name:var(--font-inter)] tracking-tight">
              {merchantName}
            </h2>

            {/* Amount */}
            <div className="flex items-baseline gap-1.5 mb-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {typeof amount === 'number' ? amount.toLocaleString() : amount}
              </span>
              <span className="text-xs font-bold text-slate-500">
                USD
              </span>
            </div>

            {/* Dashed Separator (Edge-to-Edge) */}
            <div className="-mx-4 sm:-mx-5 my-2 flex items-center overflow-hidden">
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
            <div ref={qrRef} className="flex justify-center w-full my-1">
              <div className="relative p-2 bg-white rounded-xl border border-slate-100 shadow-2xs inline-flex items-center justify-center">
                <QRCodeSVG
                  value={qrString}
                  size={155}
                  level="H"
                  includeMargin={false}
                  className="w-[150px] h-[150px] sm:w-[155px] sm:h-[155px] block"
                />
                {/* Center Emblem using bakongqr.png (Exact Mathematical Center of QR) */}
                <div
                  style={{ width: '22px', height: '22px' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] rounded-full bg-white border border-white flex items-center justify-center shadow-xs overflow-hidden pointer-events-none z-10"
                >
                  <img
                    src="/logo/bakongqr.png"
                    alt="Bakong"
                    style={{ width: '100%', height: '100%' }}
                    className="w-full h-full object-cover rounded-full pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Scan to Pay text */}
            <p className="text-center font-bold text-slate-800 text-xs mt-2 mb-0.5 whitespace-nowrap">
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
              className="w-full py-2.5 px-3 bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0284c7] hover:text-[#0369a1] border border-[#bae6fd] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-2xs mb-1.5 cursor-pointer whitespace-nowrap"
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

            {/* Expiry Timer */}
            <div className="flex flex-col items-center pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium text-[11px] whitespace-nowrap">
                {language === "kh" ? "ផុតកំណត់ក្នុងរយៈពេល:" : "Expires in:"} <strong className="text-slate-700">{formatTime(timeLeft)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
