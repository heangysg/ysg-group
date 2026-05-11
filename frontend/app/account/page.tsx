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
          fullName: currentUser.user_metadata?.full_name || "",
          avatarUrl: currentUser.user_metadata?.avatar_url || ""
        })
        fetchUserOrders(currentUser.email)
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
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'shipping': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
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
        
        <section className="bg-slate-50 border-b border-slate-100 pt-16 md:pt-32 pb-12 md:pb-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative group">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[2.5rem] p-2 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-500 group-hover:scale-105">
                  <div className="w-full h-full bg-slate-50 rounded-[2rem] flex items-center justify-center overflow-hidden border border-slate-100">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-10 h-10 text-primary/20" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                  <Settings className="w-4 h-4" />
                </div>
              </div>

              <div className="text-center md:text-left space-y-3">
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase leading-none">
                    {user?.user_metadata?.full_name || t("memberUser")}
                  </h1>
                  <p className="text-[12px] md:text-[14px] font-bold text-slate-400 uppercase tracking-widest">{user?.email}</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                   <div className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     Customer
                   </div>
                   <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest">
                     Verified Account
                   </div>
                </div>
              </div>

              <div className="flex-1 md:text-right">
                <button 
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-500 border border-slate-100 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-3 lg:sticky lg:top-24">
              <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0 -mx-6 lg:mx-0 px-6 lg:px-0">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border ${
                        isActive 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-white text-slate-500 border-slate-100 hover:border-primary/20 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-300"}`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="lg:col-span-9">
              {activeTab === "overview" && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { label: language === "kh" ? "ចំណាយសរុប" : "Portfolio Value", value: `$${orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}`, icon: CreditCard, color: "bg-primary" },
                      { label: t("totalOrders"), value: orders.length, icon: Package, color: "bg-primary" },
                      { label: language === "kh" ? "ពិន្ទុរង្វាន់" : "Loyalty Points", value: "1,250", icon: Shield, color: "bg-primary" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/20 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:bg-primary/5 transition-colors" />
                        <div className="relative z-10 space-y-6">
                          <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/10`}>
                            <stat.icon className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 tracking-tighter">{stat.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                        {language === "kh" ? "សកម្មភាពថ្មីៗ" : "Recent Orders"}
                      </h3>
                      <button onClick={() => setActiveTab("orders")} className="text-[11px] font-bold text-primary uppercase tracking-widest hover:gap-3 flex items-center gap-2 transition-all">
                        {language === "kh" ? "មើលទាំងអស់" : "View All"} <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {orders.slice(0, 4).map((order) => (
                          <Link 
                            key={order.id} 
                            href={`/orders/${order.id}`}
                            className="bg-white border border-slate-100 rounded-2xl p-6 flex items-center justify-between group hover:border-primary/20 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-50 group-hover:bg-primary/5 transition-colors">
                                <Package className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                              </div>
                              <div>
                                <p className="text-[14px] font-bold text-slate-900 uppercase">#{order.id.slice(0, 8)}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-3xl p-16 text-center border border-dashed border-slate-200">
                        <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("noRecentActivity")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-10">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
                        {language === "kh" ? "ព័ត៌មានប្រវត្តិរូប" : "Profile Settings"}
                      </h3>
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Manage your personal identification</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("fullName")}</label>
                          <input 
                            type="text" 
                            required
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-900"
                            placeholder="Your Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("emailAddress")}</label>
                          <input 
                            type="email" 
                            disabled
                            value={user?.email}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-300 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={updating}
                        className="px-10 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
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
                    <div className="bg-white rounded-3xl p-20 flex items-center justify-center border border-slate-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl p-5 md:p-8 border border-slate-100 hover:border-primary/20 transition-all group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-50 group-hover:bg-primary/5 transition-colors">
                                <Package className="w-6 h-6 group-hover:text-primary transition-colors" />
                              </div>
                              <div className="space-y-0.5">
                                <h3 className="text-[14px] md:text-[15px] font-bold text-slate-900 uppercase">#{order.id.slice(0, 8)}</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border shadow-sm ${getStatusColor(order.status)}`}>
                                 {getStatusLabel(order.status)}
                               </span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-8">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-50">
                                <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-bold text-slate-900 truncate uppercase">{language === "kh" && item.nameKhmer ? item.nameKhmer : item.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price: ${item.price.toLocaleString()} • Qty: {item.quantity}</p>
                                </div>
                                <p className="text-[12px] font-bold text-slate-900">${(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <div className="space-y-0.5">
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Investment Value</p>
                              <p className="text-xl font-bold text-slate-900 tracking-tighter">${order.totalAmount?.toLocaleString()}</p>
                            </div>
                            <Link 
                              href={`/orders/${order.id}`}
                              className="px-6 py-3 bg-slate-950 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-primary/5 active:scale-95"
                            >
                              {language === "kh" ? "មើលលម្អិត" : "Details"}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl p-20 border border-slate-100 flex flex-col items-center text-center">
                      <Package className="w-16 h-16 text-slate-100 mb-6" />
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("noRecentActivity")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-10">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
                        {language === "kh" ? "សុវត្ថិភាពគណនី" : "Account Security"}
                      </h3>
                      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Manage your credentials and access</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("newPassword")}</label>
                          <input 
                            type="password" 
                            required
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-900"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("confirmNewPassword")}</label>
                          <input 
                            type="password" 
                            required
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-bold text-slate-900"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={updating}
                        className="px-10 py-4 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
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
