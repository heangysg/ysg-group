"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="flex-1 flex items-center justify-center py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Main Card */}
          <div className="bg-white p-8 sm:p-10 rounded-md shadow-sm border border-slate-200">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img src="/logo.png" alt="YSG Icon" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-md" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                អ្នកគ្រប់គ្រងជាន់ខ្ពស់
              </h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base mt-2">
                វិបផតថលគ្រប់គ្រង
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 font-bold text-xs sm:text-sm mb-6 rounded-md border border-red-100 text-center">
                {error}
              </div>
            )}

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
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                    ពាក្យសម្ងាត់
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-md focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm sm:text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
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
          </div>
        </motion.div>
      </div>

      <div className="text-center py-4 text-xs font-semibold text-slate-400">
        &copy; {new Date().getFullYear()} Yeung Shi Group Management System
      </div>
    </div>
  )
}
