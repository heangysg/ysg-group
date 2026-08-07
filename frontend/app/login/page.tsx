"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../contexts/LanguageContext"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t, language } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      toast.success(t("welcomeBack") || "Welcome back!")
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-4 sm:p-6 selection:bg-[#004691]/20 font-sans relative overflow-hidden">
      <Toaster position="top-center" />
      
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
          <Link href="/" className="flex justify-center mb-6 hover:scale-105 transition-transform duration-300">
            <img src="/logo/ysg-logo.png" alt="Yeung Shi Group" className="h-12 sm:h-14 w-auto object-contain" />
          </Link>

          {/* Main Card */}
          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-200">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004691] tracking-tight">
                {t("welcomeBack") || "Welcome Back"}
              </h1>
              <p className="text-slate-500 font-semibold text-xs sm:text-sm mt-1.5">
                {language === "kh" ? "ចូលគណនីដើម្បីគ្រប់គ្រងការបញ្ជាទិញ និងប្រវត្តិរូបរបស់អ្នក" : "Sign in to manage your orders and profile"}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                    {t("emailAuth") || "Email"}
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
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs sm:text-sm font-bold text-slate-700">
                      {t("passwordAuth") || "Password"}
                    </label>
                    <a href="#" className="text-xs font-bold text-[#004691] hover:underline">
                      {t("forgotPasswordAuth") || "Forgot?"}
                    </a>
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
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-xl font-bold text-sm sm:text-base transition-all shadow-md active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t("signIn") || "Sign In"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs font-bold">
                <span className="px-3 bg-white text-slate-400">{t("orContinueWith") || "Or continue with"}</span>
              </div>
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full bg-white text-slate-800 py-3.5 font-bold border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>
          </div>

          <p className="text-center text-slate-600 font-semibold text-xs sm:text-sm mt-6">
            {t("dontHaveAccount") || "Don't have an account?"}{" "}
            <Link href="/register" className="text-[#004691] hover:underline font-bold ml-1">
              {t("registerNow") || "Create account"}
            </Link>
          </p>
        </motion.div>
      </div>

      <div className="text-center py-4 text-xs font-semibold text-slate-400">
        Yeung Shi Group • Industrial Solutions
      </div>
    </div>
  )
}
