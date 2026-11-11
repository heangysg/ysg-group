"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../contexts/LanguageContext"
import { motion } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { language } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail) return

    setLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
      if (error) throw error

      setSent(true)
      toast.success(
        language === "kh"
          ? "បានផ្ញើតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ថ្មីទៅអ៊ីមែលរបស់អ្នក!"
          : "Password reset link sent to your email!"
      )
    } catch (error: any) {
      toast.error(
        error?.message ||
          (language === "kh"
            ? "មិនអាចផ្ញើអ៊ីមែលកំណត់ពាក្យសម្ងាត់ថ្មីបានទេ"
            : "Failed to send password reset email")
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
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-[#004691]">
                  {language === "kh" ? "សូមពិនិត្យអ៊ីមែលរបស់អ្នក" : "Check Your Email"}
                </h1>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {language === "kh"
                    ? `យើងបានផ្ញើតំណភ្ជាប់សម្រាប់កំណត់ពាក្យសម្ងាត់ថ្មីទៅកាន់ ${email}។ សូមពិនិត្យប្រអប់ទទួល ឬ Spam។`
                    : `We sent a password reset link to ${email}. Please check your inbox or spam folder.`}
                </p>
                <div className="pt-3 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-bold text-sm transition-all"
                  >
                    {language === "kh" ? "ផ្ញើម្ដងទៀត ឬប្រើអ៊ីមែលផ្សេង" : "Resend or Try Another Email"}
                  </button>
                  <Link
                    href="/login"
                    className="w-full py-3 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2"
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
                    {language === "kh" ? "ភ្លេចពាក្យសម្ងាត់?" : "Forgot Password?"}
                  </h1>
                  <p className="text-slate-500 font-semibold text-xs sm:text-sm mt-2">
                    {language === "kh"
                      ? "បញ្ចូលអ៊ីមែលគណនីរបស់អ្នក ដើម្បីទទួលតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ថ្មី"
                      : "Enter your account email and we'll send you a reset link"}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                      {language === "kh" ? "អ៊ីមែល" : "Email"}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm sm:text-base transition-all shadow-md active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{language === "kh" ? "ផ្ញើតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ថ្មី" : "Send Reset Link"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#004691] hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{language === "kh" ? "ត្រឡប់ទៅការចូលគណនី" : "Back to Sign In"}</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

