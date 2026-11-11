"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react"
import { logActivity } from "../../../lib/audit"
import { motion } from "framer-motion"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
      } else {
        localStorage.setItem("ysg_admin_user", JSON.stringify(data.user))
        localStorage.setItem("ysg_admin_token", data.token)

        try {
          await logActivity({
            action: "login",
            entityType: "auth",
            details: {
              email: data.user.email,
              role: data.user.isSuperAdmin
                ? "Superadmin"
                : data.user.roleName === "STAFF"
                  ? "Staff"
                  : "Admin"
            }
          })
        } catch (e) { }

        if (String(data.user?.roleName || "").trim().toUpperCase() === "STAFF" && !data.user?.isSuperAdmin) {
         router.push("/admin/orders")
       } else {
         router.push("/admin/dashboard")
       }
      }
    } catch (err) {
      setError("An error occurred during login")
    }

    setLoading(false)
  }

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setError("")
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/admin/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to send reset link")
      } else {
        setForgotSent(true)
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Main Card */}
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="YSG Icon" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {forgotMode ? "ស្តារពាក្យសម្ងាត់" : "អ្នកគ្រប់គ្រងជាន់ខ្ពស់"}
              </h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base mt-2">
                {forgotMode ? "បញ្ចូលអ៊ីមែលដើម្បីទទួលតំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ថ្មី" : "ប្រព័ន្ធគ្រប់គ្រង"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 font-medium text-xs sm:text-sm mb-6 rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            {forgotMode ? (
              forgotSent ? (
                <div className="space-y-5 text-center">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-medium flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <p>
                      ប្រសិនបើមានគណនីនៅក្នុងប្រព័ន្ធ តំណភ្ជាប់កំណត់ពាក្យសម្ងាត់ថ្មីត្រូវបានផ្ញើទៅអ៊ីមែល <strong>{forgotEmail}</strong> រួចរាល់ (សុពលភាព ១៥ នាទី)។
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(false)
                      setForgotSent(false)
                      setError("")
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    ត្រឡប់ទៅការចូលគណនី
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                      អ៊ីមែល Admin / Super Admin
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 text-sm"
                        placeholder="admin@company.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 bg-[#004691] hover:bg-[#003366] text-white rounded-xl font-semibold text-sm sm:text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>ផ្ញើតំណភ្ជាប់ស្តារពាក្យសម្ងាត់</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(false)
                      setError("")
                    }}
                    className="w-full py-2.5 text-slate-600 hover:text-[#004691] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    ត្រឡប់ក្រោយ
                  </button>
                </form>
              )
            ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                    អ៊ីមែល
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
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                      ពាក្យសម្ងាត់
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email)
                        setForgotSent(false)
                        setError("")
                        setForgotMode(true)
                      }}
                      className="text-xs font-medium text-[#004691] hover:underline cursor-pointer"
                    >
                      ភ្លេចពាក្យសម្ងាត់?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#004691] hover:bg-[#003366] text-white rounded-xl font-bold text-sm sm:text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed mt-6 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ចូលគណនី</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            )}
          </div>
        </motion.div>
      </div>

      <div className="text-center py-4 text-xs font-semibold text-slate-400">
        &copy; {new Date().getFullYear()} Yeung Shi Group Management System
      </div>
    </div>
  )
}
