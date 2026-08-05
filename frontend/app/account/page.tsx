"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import PublicLayout from "../../components/PublicLayout"
import { User as UserIcon, Mail, Calendar, LogOut, Package, Settings, ChevronRight, Shield, CreditCard, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "../../contexts/LanguageContext"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t, language } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")
  const [updating, setUpdating] = useState(false)
  const [profileData, setProfileData] = useState({ fullName: "", avatarUrl: "" })
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" })
  const [orders, setOrders] = useState<any[]>([])
  const [fetchingOrders, setFetchingOrders] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push("/login")
      } else {
        setUser(currentUser)
        setProfileData({
          fullName: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || "",
          avatarUrl: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || ""
        })
        if (currentUser.email) {
          fetchUserOrders(currentUser.email)
        }
      }
      setLoading(false)
    }
    fetchUser()
  }, [router])

  const fetchUserOrders = async (email: string) => {
    if (!email) return
    setFetchingOrders(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("Order")
      .select("*")
      .eq("customerEmail", email)
      .order("createdAt", { ascending: false })
    
    if (!error && data) {
      setOrders(data)
    }
    setFetchingOrders(false)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'paid': 
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'shipping': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return t("pending")
      case 'confirmed': return t("confirmed")
      case 'shipping': return t("shipping")
      case 'completed': return t("completed")
      case 'cancelled': return t("cancelled")
      default: return status
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: profileData.fullName }
    })
    
    if (error) {
      alert(error.message)
    } else {
      alert(language === "kh" ? "បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបដោយជោគជ័យ!" : "Profile updated successfully!")
      setActiveTab("overview")
    }
    setUpdating(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert(language === "kh" ? "ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ" : "Passwords do not match")
      return
    }
    setUpdating(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: passwords.newPassword
    })
    
    if (error) {
      alert(error.message)
    } else {
      alert(language === "kh" ? "បានធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់ដោយជោគជ័យ!" : "Password updated successfully!")
      setActiveTab("overview")
    }
    setUpdating(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    )
  }

  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: language === "kh" ? "ទំព័រដើម" : "Overview" },
    { id: "profile", icon: UserIcon, label: t("editProfile") },
    { id: "orders", icon: Package, label: t("orderHistory") },
    { id: "security", icon: Shield, label: t("security") },
  ]

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white">
        
        <section className="relative bg-slate-50 pt-6 md:pt-16 pb-6 md:pb-20 border-b border-slate-100 overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
          
          <div className="relative max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 md:w-32 md:h-32 bg-slate-100 border-2 md:border-4 border-white shadow-md rounded-full overflow-hidden transition-all duration-500 group-hover:scale-105">
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                      <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon className="w-8 h-8 md:w-10 md:h-10 text-slate-300" />
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 md:w-10 md:h-10 bg-primary text-white rounded-full border-2 md:border-[3px] border-white flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors shadow-sm">
                  <Settings className="w-3 h-3 md:w-5 md:h-5" />
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1 md:space-y-3 pt-0 md:pt-2">
                <div className="space-y-0.5 md:space-y-1">
                  <h1 className="text-lg md:text-3xl font-medium text-slate-900 tracking-tight truncate">
                    {user?.user_metadata?.full_name || t("memberUser")}
                  </h1>
                  <p className="text-[11px] md:text-[13px] font-medium text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 md:mt-2">
                   <div className="px-2.5 md:px-4 py-1 md:py-1.5 bg-slate-200 text-[9px] md:text-[10px] font-bold font-medium text-slate-700 rounded-full">
                     {language === "kh" ? "អតិថិជន" : "Customer"}
                   </div>
                   <div className="px-2.5 md:px-4 py-1 md:py-1.5 bg-primary/10 text-[9px] md:text-[10px] font-bold font-medium text-primary flex items-center gap-1 rounded-full">
                     <Shield className="w-2.5 h-2.5 md:w-3 md:h-3" />
                     {language === "kh" ? "បញ្ជាក់" : "Verified"}
                   </div>
                </div>
              </div>

              <div className="md:text-right shrink-0">
                <button 
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold font-medium text-[11px] hover:-translate-y-1 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
                <button 
                  onClick={handleLogout}
                  className="md:hidden flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-3 lg:sticky lg:top-24 mb-4 md:mb-0">
              <nav className="flex flex-col gap-0 md:gap-2 -mx-4 md:mx-0 bg-white md:bg-transparent border-y border-slate-100 md:border-none">
                {menuItems.map((item, index) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center justify-between px-6 py-4 md:px-5 md:py-3.5 md:rounded-xl text-[14px] md:text-[12px] font-medium transition-all duration-300 ${index !== menuItems.length - 1 ? 'border-b border-slate-100 md:border-none' : ''} ${
                        isActive 
                          ? "bg-slate-50 md:bg-primary text-primary md:text-white md:shadow-md md:shadow-primary/20" 
                          : "bg-white md:bg-transparent text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 md:w-4 md:h-4 ${isActive ? "text-primary md:text-white" : "text-slate-400"}`} />
                        <span className={isActive ? "font-bold" : ""}>{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 md:hidden" />
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="lg:col-span-9">
              {activeTab === "overview" && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  
                  <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-6 md:pb-0 md:mx-0 md:px-0 snap-x">
                    {[
                      { label: language === "kh" ? "ចំណាយសរុប" : "Portfolio Value", value: `$${orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}`, icon: CreditCard, color: "bg-blue-600" },
                      { label: t("totalOrders"), value: orders.length, icon: Package, color: "bg-blue-600" },
                      { label: language === "kh" ? "ពិន្ទុរង្វាន់" : "Loyalty Points", value: "1,250", icon: Shield, color: "bg-blue-600" }
                    ].map((stat, i) => (
                      <div key={i} className="min-w-[160px] md:min-w-0 flex-shrink-0 snap-center solid-card bg-white p-4 md:p-8 hover:-translate-y-1 transition-all duration-300 group rounded-xl md:rounded-2xl border border-slate-100 shadow-sm">
                        <div className="relative z-10 flex flex-col gap-4">
                          <div className={`w-10 h-10 md:w-12 md:h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center`}>
                            <stat.icon className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-medium text-slate-900 tracking-tight">
                        {language === "kh" ? "សកម្មភាពថ្មីៗ" : "Recent Orders"}
                      </h3>
                      <button onClick={() => setActiveTab("orders")} className="text-[13px] font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-all">
                        {language === "kh" ? "មើលទាំងអស់" : "View All"} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {orders.slice(0, 4).map((order) => (
                          <Link 
                            key={order.id} 
                            href={`/orders/${order.id}`}
                            className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all"
                          >
                            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-primary/5 transition-colors flex-shrink-0">
                                <Package className="w-5 h-5 md:w-6 md:h-6 text-slate-300 group-hover:text-primary transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] md:text-[14px] font-bold text-slate-900 uppercase truncate">#{order.id.slice(0, 8)}</p>
                                <p className="text-[10px] font-bold text-slate-500 font-medium truncate">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className={`px-4 py-1.5 text-[10px] font-bold font-medium rounded-full ${getStatusColor(order.status)} shrink-0 self-start sm:self-auto`}>
                              {getStatusLabel(order.status)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-16 text-center rounded-2xl border-2 border-dashed border-slate-200">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-[11px] font-bold text-slate-500 font-medium">{t("noRecentActivity")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="solid-card bg-white p-5 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
                  <div className="space-y-10">
                    <div className="space-y-1">
                      <h3 className="text-xl md:text-2xl font-medium text-slate-900 tracking-tight">
                        {language === "kh" ? "ព័ត៌មានប្រវត្តិរូប" : "Profile Settings"}
                      </h3>
                      <p className="text-[13px] text-slate-500">{language === "kh" ? "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក" : "Manage your personal identification"}</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold font-medium text-slate-700">{t("fullName")}</label>
                            <input 
                              type="text" 
                              required
                              value={profileData.fullName}
                              onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary outline-none transition-all text-slate-900 text-sm focus:ring-4 focus:ring-primary/10"
                              placeholder={language === "kh" ? "ឈ្មោះរបស់អ្នក" : "Your Name"}
                            />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold font-medium text-slate-700">{t("emailAddress")}</label>
                            <input 
                              type="email" 
                              disabled
                              value={user?.email}
                              className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                            />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={updating}
                        className="btn-primary px-8 py-4 text-xs flex items-center justify-center disabled:opacity-50 rounded-xl"
                      >
                        {updating ? t("updating") : t("saveChanges")}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   {fetchingOrders ? (
                    <div className="solid-card bg-white p-20 flex items-center justify-center rounded-2xl">
                      <div className="animate-spin rounded-xl h-8 w-8 border-4 border-slate-200 border-t-primary" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="solid-card bg-white p-5 md:p-8 hover:-translate-y-1 hover:shadow-md transition-all group rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 transition-colors">
                                <Package className="w-6 h-6 group-hover:text-primary transition-colors" />
                              </div>
                              <div className="space-y-0.5">
                                <h3 className="text-[14px] md:text-[15px] font-medium text-slate-900 uppercase">#{order.id.slice(0, 8)}</h3>
                                <p className="text-[9px] font-medium text-slate-500 font-medium">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className={`px-4 py-1.5 text-[10px] font-bold font-medium rounded-xl bg-white shadow-sm ${getStatusColor(order.status)}`}>
                                 {getStatusLabel(order.status)}
                               </span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-8">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                                  {item.image && <img src={item.image.includes('cloudinary.com') ? item.image.replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : item.image} alt={item.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-medium text-slate-900 truncate uppercase">{language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}</p>
                                  <p className="text-[9px] font-medium text-slate-500 font-medium">{language === "kh" ? "តម្លៃ:" : "Price:"} ${item.price.toLocaleString()} • {language === "kh" ? "ចំនួន:" : "Qty:"} {item.quantity}</p>
                                </div>
                                <p className="text-[12px] font-medium text-slate-900">${(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-medium text-slate-400 font-medium">{language === "kh" ? "តម្លៃវិនិយោគ" : "Investment Value"}</p>
                              <p className="text-lg md:text-xl font-medium text-slate-900 tracking-tighter">${order.totalAmount?.toLocaleString()}</p>
                            </div>
                            <Link 
                              href={`/orders/${order.id}`}
                              className="btn-primary px-6 py-3 text-[10px] rounded-xl"
                            >
                              {language === "kh" ? "មើលលម្អិត" : "Details"}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="solid-card bg-white p-20 flex flex-col items-center text-center rounded-2xl">
                      <Package className="w-16 h-16 text-slate-100 mb-6" />
                      <p className="text-[11px] font-bold text-slate-400 font-medium">{t("noRecentActivity")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="solid-card bg-white p-5 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
                  <div className="space-y-10">
                    <div className="space-y-1">
                      <h3 className="text-xl md:text-2xl font-medium text-slate-900 tracking-tight">
                        {language === "kh" ? "សុវត្ថិភាពគណនី" : "Account Security"}
                      </h3>
                      <p className="text-[13px] text-slate-500">{language === "kh" ? "គ្រប់គ្រងព័ត៌មានសម្ងាត់របស់អ្នក" : "Manage your credentials and access"}</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold font-medium text-slate-700">{t("newPassword")}</label>
                            <input 
                              type="password" 
                              required
                              value={passwords.newPassword}
                              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 text-sm"
                              placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold font-medium text-slate-700">{t("confirmNewPassword")}</label>
                            <input 
                              type="password" 
                              required
                              value={passwords.confirmPassword}
                              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all text-slate-900 text-sm"
                              placeholder="••••••••"
                            />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={updating}
                        className="btn-primary px-8 py-4 text-xs flex items-center justify-center disabled:opacity-50 rounded-xl"
                      >
                        {updating ? t("updating") : t("updatePassword")}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}
