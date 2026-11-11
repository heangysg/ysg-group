"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../contexts/LanguageContext"
import { motion } from "framer-motion"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const router = useRouter()
  const { language } = useLanguage()

  useEffect(() => {
    const supabase = createClient()
    let active = true

    const initRecoverySession = async () => {
      try {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search)
          const code = params.get("code")
          if (code) {
            await supabase.auth.exchangeCodeForSession(code)
          }
        }
        const { data } = await supabase.auth.getSession()
        if (active && data?.session) {
          setHasSession(true)
        }
      } finally {
        if (active) setCheckingSession(false)
      }
    }

    initRecoverySession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setHasSession(true)
        setCheckingSession(false)
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error(
        language === "kh"
          ? "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ"
          : "Password must be at least 6 characters"
      )
      return
    }

    if (password !== confirmPassword) {
      toast.error(
        language === "kh"
          ? "ពាក្យសម្ងាត់ថ្មី និងការបញ្ជាក់មិនត្រូវគ្នាទេ"
          : "Passwords do not match"
      )
      return
    }

    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      toast.success(
        language === "kh"
          ? "បានផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!"
          : "Password updated successfully!"
      )
      setTimeout(() => {
        router.push("/account")
        router.refresh()
      }, 1000)
    } catch (error: any) {
      toast.error(
        error?.message ||
          (language === "kh"
            ? "មិនអាចកំណត់ពាក្យសម្ងាត់ថ្មីបានទេ"
            : "Failed to update password")
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-4 sm:p-6 selection:bg-[#004691]/20 font-sans relative overflow-hidden">
      <Toaster position="top-center" />

      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-md blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/50 rounded-md blur-3xl -z-10 pointer-events-none" />

      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex justify-center mb-6 hover:scale-105 transition-transform duration-300">
            <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-12 sm:h-14 w-auto object-contain" />
          </Link>

          <div className="bg-white p-6 sm:p-10 rounded-md shadow-xl border border-slate-200">
            {checkingSession ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-600 text-sm font-semibold">
                <div className="w-8 h-8 border-2 border-[#004691]/20 border-t-[#004691] rounded-full animate-spin" />
                <span>{language === "kh" ? "កំពុងផ្ទៀងផ្ទាត់តំណភ្ជាប់..." : "Verifying reset link..."}</span>
              </div>
            ) : !hasSession ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {language === "kh" ? "តំណភ្ជាប់ផុតកំណត់ ឬមិនត្រឹមត្រូវ" : "Reset Link Expired or Invalid"}
                </h1>
                <p className="text-slate-500 text-sm">
                  {language === "kh"
                    ? "សូមស្នើសុំតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ថ្មីម្ដងទៀត។"
                    : "Please request a new password reset link from the forgot password page."}
                </p>
                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href="/forgot-password"
                    className="w-full py-3 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>{language === "kh" ? "ស្នើសុំតំណភ្ជាប់ថ្មី" : "Request New Link"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#004691] py-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{language === "kh" ? "ត្រឡប់ទៅការចូលគណនី" : "Back to Sign In"}</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-7">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#004691]">
                    {language === "kh" ? "កំណត់ពាក្យសម្ងាត់ថ្មី" : "Set New Password"}
                  </h1>
                  <p className="text-slate-500 font-semibold text-xs sm:text-sm mt-2">
                    {language === "kh"
                      ? "សូមបញ្ចូលពាក្យសម្ងាត់ថ្មីរបស់អ្នកខាងក្រោម"
                      : "Enter your new password below"}
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                      {language === "kh" ? "ពាក្យសម្ងាត់ថ្មី" : "New Password"}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                      {language === "kh" ? "បញ្ជាក់ពាក្យសម្ងាត់ថ្មី" : "Confirm New Password"}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm sm:text-base transition-all shadow-md active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{language === "kh" ? "រក្សាទុកពាក្យសម្ងាត់ថ្មី" : "Update Password"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

