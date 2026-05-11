"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../contexts/LanguageContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()

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
      toast.success(t("loginSuccess") || "Welcome back!")
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
    <div className="min-h-screen bg-white flex selection:bg-primary selection:text-white">
      <Toaster position="top-center" />
      
      {/* Left Panel: Industrial Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-950/95 z-10" />
        
        {/* Placeholder for Industrial Image */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-overlay bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop")' }}
        />
        
        <div className="relative z-20 flex flex-col justify-between p-16 h-full text-white w-full">
          <Link href="/" className="inline-flex items-center gap-4 group w-fit">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-slate-950 transition-all duration-300">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-widest uppercase text-sm group-hover:text-primary transition-colors duration-300">Return to Home</span>
          </Link>
          
          <div className="space-y-6 max-w-lg">
            <div className="w-20 h-2 bg-primary rounded-full mb-8" />
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight uppercase">
              Heavy Machinery. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Unmatched Power.</span>
            </h1>
            <p className="text-lg text-slate-300 font-medium leading-relaxed">
              Access the YSG Industrial Portal to manage your elite equipment fleet, track orders, and request specialized support.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-10">
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm mb-8 lg:hidden">
              <img src="/logo.png" alt="YSG" className="w-10 h-10 object-contain" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              {t("login") || "Sign In"}
            </h2>
            <p className="text-slate-500 font-medium">
              Enter your credentials to access your professional account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <a href="#" className="text-xs font-bold text-primary hover:text-primary-dark transition-colors">Forgot?</a>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold tracking-widest uppercase shadow-lg shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t("login") || "Sign In"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full bg-white text-slate-700 py-4 rounded-2xl font-bold tracking-widest uppercase shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <div className="pt-8 mt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-medium">
              {t("noAccount") || "Don't have an account?"}{" "}
              <Link href="/register" className="text-primary hover:text-primary-dark font-bold ml-1 transition-colors">
                {t("registerNow") || "Create one now"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
