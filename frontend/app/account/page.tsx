"use client" 

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { createClient } from "../../lib/supabase/client"
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Shield, 
  CheckCircle2,
  LogOut, 
  ChevronRight, 
  Settings, 
  Plus, 
  Check, 
  Lock, 
  Phone, 
  Mail, 
  Edit2, 
  Trash2,
  Clock,
  Sparkles
} from "lucide-react"

export default function AccountPage() {
  const supabase = createClient()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [orders, setOrders] = useState<any[]>([])
  const [fetchingOrders, setFetchingOrders] = useState(false)
  
  // Profile update state
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: ""
  })
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState({ type: "", text: "" })

  // Security update state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  })
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" })

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push("/login")
          return
        }
        setUser(session.user)
        setProfileData({
          fullName: session.user.user_metadata?.full_name || "",
          phone: session.user.user_metadata?.phone || ""
        })

        // Fetch user orders
        setFetchingOrders(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const email = session.user.email || ""
        const phone = session.user.user_metadata?.phone || ""
        const userId = session.user.id || ""

        const res = await fetch(`${API_URL}/api/orders/user/find?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&userId=${encodeURIComponent(userId)}`)
        if (res.ok) {
          const data = await res.json()
          setOrders(data.data || [])
        }
      } catch (err) {
        console.error("Account error:", err)
      } finally {
        setLoading(false)
        setFetchingOrders(false)
      }
    }
    getUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setUpdateMsg({ type: "", text: "" })

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          phone: profileData.phone
        }
      })

      if (error) throw error

      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: profileData.fullName,
          phone: profileData.phone
        }
      })
      setUpdateMsg({ type: "success", text: language === "kh" ? "បានបច្ចុប្បន្នភាពព័ត៌មានដោយជោគជ័យ!" : "Profile updated successfully!" })
    } catch (err: any) {
      setUpdateMsg({ type: "error", text: err.message || "Failed to update profile" })
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: "error", text: language === "kh" ? "ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ!" : "Passwords do not match!" })
      return
    }

    setUpdatingPassword(true)
    setPasswordMsg({ type: "", text: "" })

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setPasswordMsg({ type: "success", text: language === "kh" ? "បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!" : "Password changed successfully!" })
      setPasswordData({ newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "Failed to update password" })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "PENDING": return "bg-amber-50 text-amber-700 border border-amber-200"
      case "CANCELLED": return "bg-rose-50 text-rose-700 border border-rose-200"
      default: return "bg-slate-50 text-slate-700 border border-slate-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "COMPLETED": return language === "kh" ? "បានទូទាត់ប្រាក់" : "Paid"
      case "PENDING": return language === "kh" ? "កំពុងរង់ចាំ" : "Pending"
      case "CANCELLED": return language === "kh" ? "បានបោះបង់" : "Cancelled"
      default: return status || (language === "kh" ? "កំពុងដំណើរការ" : "Processing")
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#004691]" />
        </div>
      </PublicLayout>
    )
  }

  const menuItems = [
    { id: "overview", label: language === "kh" ? "ទិដ្ឋភាពទូទៅ" : "Dashboard Overview", icon: User },
    { id: "orders", label: t("orderHistory"), icon: Package },
    { id: "profile", label: language === "kh" ? "ព័ត៌មានប្រវត្តិរូប" : "Profile Settings", icon: Settings },
    { id: "security", label: language === "kh" ? "សុវត្ថិភាពគណនី" : "Account Security", icon: Lock },
  ]

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white pb-24 font-sans selection:bg-primary/20">
        
        {/* 👤 Account Banner Header */}
        <section className="bg-slate-50 border-b border-slate-200 py-6 md:py-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#004691] text-white rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl md:text-3xl shadow-md shrink-0 overflow-hidden relative border-2 border-white">
                  {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                    <img 
                      src={user.user_metadata.avatar_url || user.user_metadata.picture} 
                      alt={user?.user_metadata?.full_name || "Profile Picture"} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{user?.user_metadata?.full_name ? user.user_metadata.full_name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : "U")}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight truncate">
                    {user?.user_metadata?.full_name || t("memberUser")}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base font-semibold text-slate-600 truncate">{user?.email}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                     <div className="px-3 py-1 bg-slate-200 text-xs font-bold text-slate-700 rounded-full">
                       {language === "kh" ? "អតិថិជន" : "Customer"}
                     </div>
                     <div className="px-3 py-1 bg-[#004691]/10 text-xs font-bold text-[#004691] flex items-center gap-1.5 rounded-full">
                       <CheckCircle2 className="w-3.5 h-3.5 text-[#004691]" />
                       {language === "kh" ? "បញ្ជាក់" : "Verified"}
                     </div>
                  </div>
                </div>
              </div>

              <div className="md:text-right shrink-0">
                <button 
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded-lg font-bold text-sm transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
                <button 
                  onClick={handleLogout}
                  className="md:hidden flex items-center justify-center px-4 py-2 bg-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-700 rounded-lg font-bold text-xs transition-all gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Navigation Tabs */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 mb-2 lg:mb-0">
              {/* Mobile Horizontal Tabs */}
              <nav className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 border-b border-slate-100">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shrink-0 transition-all ${
                        isActive 
                          ? "bg-[#004691] text-white shadow-sm" 
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Desktop Vertical Sidebar */}
              <nav className="hidden lg:flex flex-col gap-1.5">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-200 ${
                        isActive 
                          ? "bg-[#004691] text-white shadow-sm" 
                          : "bg-transparent text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4.5 h-4.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="lg:col-span-9">
              {activeTab === "overview" && (
                <div className="space-y-6 md:space-y-8">
                  
                  {/* 📊 Responsive Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {[
                      { label: language === "kh" ? "ចំណាយសរុប" : "Portfolio Value", value: `$${orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}`, icon: CreditCard },
                      { label: t("totalOrders"), value: orders.length, icon: Package },
                      { label: language === "kh" ? "ពិន្ទុរង្វាន់" : "Loyalty Points", value: "1,250", icon: Shield }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-4 sm:p-5 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-50 text-[#004691] rounded-xl flex items-center justify-center mb-3">
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-500 truncate">{stat.label}</p>
                          <p className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 🛍️ Recent Orders List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                        {language === "kh" ? "សកម្មភាពថ្មីៗ" : "Recent Orders"}
                      </h3>
                      <button onClick={() => setActiveTab("orders")} className="text-xs sm:text-sm md:text-base font-bold text-[#004691] hover:underline flex items-center gap-1">
                        {language === "kh" ? "មើលទាំងអស់" : "View All"} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {orders.slice(0, 4).map((order) => (
                          <Link 
                            key={order.id} 
                            href={`/orders/${order.id}`}
                            className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 flex items-center justify-between gap-4 group hover:border-[#004691] transition-all shadow-2xs"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-blue-50 transition-colors">
                                <Package className="w-5 h-5 text-slate-400 group-hover:text-[#004691] transition-colors" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm md:text-base font-bold text-slate-900 uppercase truncate">#{order.id.slice(0, 8)}</p>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusColor(order.status)} shrink-0`}>
                              {getStatusLabel(order.status)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-12 text-center rounded-2xl border-2 border-dashed border-slate-200">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-600">{t("noRecentActivity")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-2xs border border-slate-200 space-y-8">
                  <div className="space-y-1 border-b border-slate-100 pb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                      {language === "kh" ? "ព័ត៌មានប្រវត្តិរូប" : "Profile Settings"}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-500">{language === "kh" ? "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក" : "Manage your personal information"}</p>
                  </div>

                  {updateMsg.text && (
                    <div className={`p-4 rounded-xl text-xs sm:text-sm font-bold ${updateMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {updateMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-bold text-slate-700">{t("fullName")}</label>
                        <input 
                          type="text" 
                          required
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#004691] outline-none transition-all text-slate-900 text-sm sm:text-base font-medium"
                          placeholder={language === "kh" ? "ឈ្មោះរបស់អ្នក" : "Your Name"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-bold text-slate-700">{t("emailAddress")}</label>
                        <input 
                          type="email" 
                          disabled
                          value={user?.email}
                          className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm sm:text-base cursor-not-allowed font-medium"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={updating}
                      className="px-8 py-3.5 bg-[#004691] hover:bg-[#003366] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {updating ? t("updating") : t("saveChanges")}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6">
                  {fetchingOrders ? (
                    <div className="bg-white p-20 flex items-center justify-center rounded-2xl border border-slate-200">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-[#004691]" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white p-5 md:p-8 rounded-2xl shadow-2xs border border-slate-200 space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#004691] shrink-0">
                                <Package className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase">#{order.id.slice(0, 8)}</h3>
                                <p className="text-xs sm:text-sm font-medium text-slate-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-4 py-1.5 text-xs font-bold rounded-full border w-fit ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-contain" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate uppercase">{language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}</p>
                                  <p className="text-xs font-medium text-slate-500">{language === "kh" ? "តម្លៃ:" : "Price:"} ${item.price.toLocaleString()} • {language === "kh" ? "ចំនួន:" : "Qty:"} {item.quantity}</p>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-900">${(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div>
                              <p className="text-xs font-semibold text-slate-500">{language === "kh" ? "តម្លៃសរុប" : "Total Amount"}</p>
                              <p className="text-lg sm:text-2xl font-black text-[#004691]">${order.totalAmount?.toLocaleString()}</p>
                            </div>
                            <Link 
                              href={`/orders/${order.id}`}
                              className="px-6 py-3 bg-[#004691] hover:bg-[#003366] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all"
                            >
                              {language === "kh" ? "មើលលម្អិត" : "Details"}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-16 flex flex-col items-center text-center rounded-2xl border border-slate-200">
                      <Package className="w-16 h-16 text-slate-300 mb-4" />
                      <p className="text-sm sm:text-base font-bold text-slate-600">{t("noRecentActivity")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-2xs border border-slate-200 space-y-8">
                  <div className="space-y-1 border-b border-slate-100 pb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                      {language === "kh" ? "សុវត្ថិភាពគណនី" : "Account Security"}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-slate-500">{language === "kh" ? "គ្រប់គ្រងពាក្យសម្ងាត់របស់អ្នក" : "Manage your password and credentials"}</p>
                  </div>

                  {passwordMsg.text && (
                    <div className={`p-4 rounded-xl text-xs sm:text-sm font-bold ${passwordMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {passwordMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-bold text-slate-700">{t("newPassword")}</label>
                        <input 
                          type="password" 
                          required
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#004691] outline-none transition-all text-slate-900 text-sm sm:text-base font-medium"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-bold text-slate-700">{t("confirmPassword")}</label>
                        <input 
                          type="password" 
                          required
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#004691] outline-none transition-all text-slate-900 text-sm sm:text-base font-medium"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={updatingPassword}
                      className="px-8 py-3.5 bg-[#004691] hover:bg-[#003366] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {updatingPassword ? t("updating") : t("updatePassword")}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
