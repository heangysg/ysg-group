"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Lock, Mail, ArrowRight } from "lucide-react"
import { logActivity } from "../../../lib/audit"
import { motion } from "framer-motion"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
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
            details: { email: data.user.email, role: data.user.isSuperAdmin ? "Superadmin" : "Admin" }
          })
        } catch (e) {}

        router.push("/admin/dashboard")
      }
    } catch (err) {
      setError("An error occurred during login")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-4 sm:p-6 selection:bg-[#004691]/20 font-sans relative overflow-hidden">
      
      {/* Background Decorator Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-16 sm:h-20 w-auto object-contain" />
          </div>

          {/* Main Card */}
          <div className="bg-[#004691] p-6 sm:p-10 rounded-2xl shadow-2xl border border-[#003366] relative overflow-hidden text-white">
            {/* Subtle glow effect inside the card */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center mb-8 relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-white mb-5 shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                អ្នកគ្រប់គ្រងជាន់ខ្ពស់ វិបផតថល
              </h1>
              <p className="text-blue-200 font-medium text-sm sm:text-base mt-2">
                វិបផតថលគ្រប់គ្រង
              </p>
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-100 p-4 font-bold text-xs sm:text-sm mb-6 rounded-xl border border-red-500/30 backdrop-blur-sm relative z-10">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div className="space-y-4">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-blue-100 block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-white focus:ring-4 focus:ring-white/10 outline-none transition-all font-bold text-white placeholder:text-blue-300 text-sm backdrop-blur-sm"
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-blue-100 block">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-white transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:border-white focus:ring-4 focus:ring-white/10 outline-none transition-all font-bold text-white placeholder:text-blue-300 text-sm backdrop-blur-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white hover:bg-blue-50 text-[#004691] rounded-xl font-extrabold text-sm sm:text-base transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#004691]/30 border-t-[#004691] rounded-full animate-spin" />
                ) : (
                  <>
                    <span>ចូលគណនី (Login)</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      <div className="text-center py-4 text-xs font-semibold text-slate-400">
        &copy; {new Date().getFullYear()} Yeung Shi Group Management System
      </div>
    </div>
  )
}
