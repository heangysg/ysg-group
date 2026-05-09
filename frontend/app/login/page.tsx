"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import PublicLayout from "../../components/PublicLayout"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../contexts/LanguageContext"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t, language } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success("Login successful!")
      router.push("/account")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Login failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      })
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message || "Google login failed")
    }
  }

  return (
    <PublicLayout hideNav={true}>
      <Toaster position="top-center" />
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 lg:bg-white overflow-hidden">
        {/* Left Side: Professional Visual (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
          <img 
            src="/machinery_auth_bg_1777946926912.png" 
            alt="Machinery" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity hover:scale-105 transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/40" />
          
          <div className="relative z-10 w-full p-16 flex flex-col justify-between">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-primary transition-all">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">YSG MACHINERY</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Solutions</span>
              </div>
            </Link>

            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-white leading-tight tracking-tight">
                Quality Gear for <br />
                <span className="text-primary">Global Success.</span>
              </h2>
              <p className="text-slate-300 text-lg max-w-md font-medium leading-relaxed">
                Connect with the world's most trusted machinery network and manage your equipment with ease.
              </p>
            </div>

            <div className="flex gap-12 text-white/40 font-bold text-[10px] uppercase tracking-[0.2em]">
              <span>Industrial Excellence</span>
              <span>Global Support</span>
              <span>Trusted Since 2010</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Professional Form (App-like on mobile) */}
        <div className="w-full lg:w-1/2 flex flex-col relative bg-slate-900 lg:bg-white">
          {/* Mobile Branding Area */}
          <div className="lg:hidden h-[25vh] flex flex-col items-center justify-center space-y-4 px-6 text-center animate-in fade-in slide-in-from-top-10 duration-700">
             <Link href="/" className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight">YSG MACHINERY</h1>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{t("management")}</p>
                </div>
             </Link>
          </div>

          {/* Form Container (App Bottom Sheet on mobile) */}
          <div className="flex-1 bg-white lg:bg-transparent rounded-t-[2.5rem] lg:rounded-none px-6 sm:px-12 md:px-24 py-10 flex items-center justify-center shadow-[0_-20px_40px_rgba(0,0,0,0.2)] lg:shadow-none animate-in slide-in-from-bottom-20 duration-700 delay-100 fill-mode-both">
            <div className="max-w-md w-full space-y-8">
              <div className="text-left space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight lg:text-5xl">
                  {t("signIn")}
                </h2>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                  {t("logInToAccount")}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-primary/20 hover:bg-white transition-all active:scale-[0.98]"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                  <span className="tracking-tight">{t("continueWithGoogle")}</span>
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em]">
                    <span className="bg-white px-4 text-slate-300">{t("orContinueWithEmail")}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-4">
                  <div className="group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 block ml-1 transition-colors group-focus-within:text-primary">
                      {t("emailAddress")}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-center mb-1.5 px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-colors group-focus-within:text-primary">
                        {t("password")}
                      </label>
                      <button type="button" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
                        {t("forgot")}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-300"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.25em] text-xs hover:bg-primary hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {t("signIn")}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-6">
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  {t("newToYsg")}{" "}
                  <Link href="/register" className="text-primary hover:underline ml-2">
                    {t("createAccount")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
