"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../contexts/LanguageContext"
import { motion } from "framer-motion"

export default function RegisterPage() {
 const [fullName, setFullName] = useState("")
 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [loading, setLoading] = useState(false)
 const [isSubmitted, setIsSubmitted] = useState(false)
 const router = useRouter()
 const { t, language } = useLanguage()

 const handleRegister = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)
 const supabase = createClient()
 
 try {
 const { error } = await supabase.auth.signUp({
 email,
 password,
 options: {
 data: {
 full_name: fullName,
 }
 }
 })
 if (error) throw error
 setIsSubmitted(true)
 toast.success(t("registerSuccess") || "Registration successful! Please check your email.")
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
 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-md blur-3xl -z-10 pointer-events-none" />
 <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/50 rounded-md blur-3xl -z-10 pointer-events-none" />
 
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
 <div className="bg-white p-6 sm:p-10 rounded-md shadow-xl border border-slate-200">
 {isSubmitted ? (
 <motion.div 
 initial={{ scale: 0.95, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 className="flex flex-col items-center justify-center text-center space-y-6"
 >
 <div className="w-16 h-16 bg-blue-50 text-[#004691] rounded-md flex items-center justify-center border border-blue-100 shadow-2xs">
 <CheckCircle2 className="w-8 h-8 text-[#004691]" />
 </div>
 <div className="space-y-2">
 <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
 {t("checkYourInbox") || "Check Your Inbox"}
 </h2>
 <p className="text-slate-600 font-semibold text-xs sm:text-sm leading-relaxed">
 {t("weSentLink") || "We've sent a verification link to"}{" "}
 <span className="text-[#004691] font-bold block mt-1">{email}</span>
 </p>
 </div>
 <Link 
 href="/login" 
 className="w-full py-4 bg-[#004691] hover:bg-[#003366] text-white text-sm sm:text-base rounded-md font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
 >
 <span>{t("proceedToLogin") || "Proceed to Login"}</span>
 <ArrowRight className="w-4 h-4" />
 </Link>
 </motion.div>
 ) : (
 <>
 <div className="text-center mb-8">
 <h1 className="text-2xl sm:text-3xl font-bold text-[#004691] ">
 {t("register") || "Create Account"}
 </h1>
 <p className="text-slate-500 font-semibold text-xs sm:text-sm mt-1.5">
 {t("joinYsgNetwork") || "Join the YSG professional network"}
 </p>
 </div>

 <form onSubmit={handleRegister} className="space-y-4">
 
 {/* Full Name */}
 <div className="space-y-1.5">
 <label className="text-xs sm:text-sm font-bold text-slate-700 block">
 {t("fullNameAuth") || "Full Name"}
 </label>
 <div className="relative group">
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004691] transition-colors">
 <User className="w-5 h-5" />
 </div>
 <input
 type="text"
 required
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
 placeholder="John Doe"
 />
 </div>
 </div>

 {/* Email */}
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
 className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
 placeholder="name@company.com"
 />
 </div>
 </div>

 {/* Password */}
 <div className="space-y-1.5">
 <label className="text-xs sm:text-sm font-bold text-slate-700 block">
 {t("passwordAuth") || "Password"}
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
 className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#004691] focus:ring-4 focus:ring-[#004691]/10 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 text-sm"
 placeholder="••••••••"
 />
 </div>
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={loading}
 className="w-full py-4 bg-[#004691] hover:bg-[#003366] text-white rounded-md font-bold text-sm sm:text-base transition-all shadow-md active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50 mt-2"
 >
 {loading ? (
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>
 <span>{t("register") || "Create Account"}</span>
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </form>

 <div className="relative my-6">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-slate-400"></div>
 </div>
 <div className="relative flex justify-center text-xs font-bold">
 <span className="px-3 bg-white text-slate-600">{t("orContinueWith") || "Or continue with"}</span>
 </div>
 </div>

 {/* Google OAuth */}
 <button
 onClick={handleGoogleLogin}
 type="button"
 className="w-full bg-white text-slate-800 py-3.5 font-bold border border-slate-200 rounded-md shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 text-sm"
 >
 <svg className="w-5 h-5" viewBox="0 0 24 24">
 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
 </svg>
 <span>Google</span>
 </button>
 </>
 )}
 </div>

 <p className="text-center text-slate-600 font-semibold text-xs sm:text-sm mt-6">
 {t("alreadyHaveAccount") || "Already have an account?"}{" "}
 <Link href="/login" className="text-[#004691] hover:underline font-bold ml-1">
 {t("signIn") || "Sign in"}
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
