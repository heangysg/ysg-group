"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, CheckCircle2, ArrowLeft } from "lucide-react"

function AdminResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const email = searchParams.get("email") || ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token || !email) {
      setError("តំណភ្ជាប់កំណត់ពាក្យសម្ងាត់មិនត្រឹមត្រូវ ឬផុតកំណត់។")
      return
    }
    if (newPassword.length < 8) {
      setError("ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួអក្សរ។")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("ការបញ្ជាក់ពាក្យសម្ងាត់មិនដូចគ្នាទេ។")
      return
    }

    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const res = await fetch(`${API_URL}/api/admin/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "មិនអាចកំណត់ពាក្យសម្ងាត់ថ្មីបានទេ។")
      } else {
        setSuccess(true)
        setTimeout(() => router.push("/admin/login"), 2000)
      }
    } catch {
      setError("មានបញ្ហាការតភ្ជាប់ សូមព្យាយាមម្តងទៀត។")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="YSG Icon" className="w-16 h-16 object-contain rounded-xl" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              កំណត់ពាក្យសម្ងាត់ថ្មី
            </h1>
            {email && (
              <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1.5">{email}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 text-xs sm:text-sm font-medium mb-5 rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-5 text-center">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                <p>ផ្លាស់ប្តូរពាក្យសម្ងាត់បានជោគជ័យ! កំពុងត្រឡប់ទៅទំព័រចូលគណនី...</p>
              </div>
              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#004691] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                ទៅទំព័រចូលគណនី
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  ពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៨ តួអក្សរ)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#004691] outline-none text-sm text-slate-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-slate-700 block">
                  បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-[#004691] outline-none text-sm text-slate-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#004691] hover:bg-[#003366] text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? "កំពុងរក្សាទុក..." : "រក្សាទុកពាក្យសម្ងាត់ថ្មី"}
              </button>

              <Link
                href="/admin/login"
                className="w-full py-2 text-slate-600 hover:text-[#004691] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                ត្រឡប់ទៅការចូលគណនី
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AdminResetPasswordInner />
    </Suspense>
  )
}

