"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Lock, Mail } from "lucide-react"
import { logActivity } from "../../../lib/audit"

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
      
      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="solid-card bg-white p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex justify-center">
              <img src="/logo/ysg-logo.png" alt="YSG Machinery Logo" className="h-20 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Admin Login</h1>
            <p className="text-slate-500 mt-2 font-medium text-sm">Access YSG Machinery Management Portal</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 font-bold tracking-widest uppercase text-xs mb-6 border-2 border-red-600 shadow-hard">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-base font-bold text-slate-700 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 uppercase tracking-widest text-[11px]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-base font-bold text-slate-700 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 uppercase tracking-widest text-[11px]"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-[11px] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                "LOGIN"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
