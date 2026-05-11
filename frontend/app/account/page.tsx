"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import PublicLayout from "../../components/PublicLayout"
import { User as UserIcon, Mail, Calendar, LogOut, Package, Settings, ChevronRight, Shield, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "../../contexts/LanguageContext"

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { t } = useLanguage()
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
        // Fetch orders for this user
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
      alert("Profile updated successfully!")
      setActiveTab("overview")
    }
    setUpdating(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Passwords do not match")
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
      alert("Password updated successfully!")
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </PublicLayout>
    )
  }

  const menuItems = [
    { id: "profile", icon: UserIcon, label: t("editProfile"), desc: t("changeDetails"), color: "text-slate-900" },
    { id: "orders", icon: Package, label: t("orderHistory"), desc: t("trackOrders"), color: "text-slate-900" },
    { id: "security", icon: Shield, label: t("security"), desc: t("passwordPrivacy"), color: "text-slate-900" },
    { id: "settings", icon: Settings, label: t("settings"), desc: t("managePlatform"), color: "text-slate-900" },
  ]

  return (
    <PublicLayout>
      <main className="min-h-screen bg-white py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 border-b border-slate-100 pb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {activeTab === "overview" ? t("myAccount") : menuItems.find(m => m.id === activeTab)?.label}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] mt-2">
              {activeTab === "overview" ? t("manageYourProfile") : menuItems.find(m => m.id === activeTab)?.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar: Navigation & Profile */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-5 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-slate-50 overflow-hidden">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-6 h-6 md:w-7 md:h-7 text-primary/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base md:text-lg font-bold text-slate-900 truncate">
                      {user?.user_metadata?.full_name || t("memberUser")}
                    </h2>
                    <p className="text-slate-400 text-[10px] md:text-[11px] font-bold uppercase tracking-widest truncate break-all">{user?.email}</p>
                  </div>
                </div>

                <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0 -mx-1 lg:mx-0">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`flex-shrink-0 flex items-center justify-between px-4 py-2 lg:p-3 rounded-lg text-[11px] lg:text-[13px] font-bold uppercase tracking-widest transition-soft border ${
                      activeTab === "overview" ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "text-slate-600 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <span>Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 hidden lg:block" />
                  </button>
                  {menuItems.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex-shrink-0 flex items-center justify-between px-4 py-2 lg:p-3 rounded-lg text-[11px] lg:text-[13px] font-bold uppercase tracking-widest transition-soft border ${
                        activeTab === item.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "text-slate-600 border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50 hidden lg:block" />
                    </button>
                  ))}
                </nav>

                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-50">
                  <button 
                    onClick={handleLogout}
                    className="w-full py-4 bg-white border border-slate-100 text-red-500 rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-red-50 transition-soft flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </button>
                </div>
              </div>

            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8">
              {activeTab === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[
                      { label: "Total Spent", value: `$${orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}`, icon: CreditCard },
                      { label: "Total Orders", value: orders.length, icon: Package },
                      { label: "Reward Points", value: "1,250", icon: Shield },
                      { label: "Account Level", value: "Professional", icon: UserIcon }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-5 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lux transition-soft group">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-primary group-hover:text-white transition-soft border border-slate-50">
                          <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 md:mb-2">{stat.label}</p>
                        <p className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Transaction Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lux transition-soft">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Account Authority</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900">Verified Professional</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Global Machinery Access</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lux transition-soft">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Portfolio Activity</p>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-900">{orders.length} Active Shipments</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Industrial Tracking</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">Recent Activity</h3>
                      <button onClick={() => setActiveTab("orders")} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:translate-x-1 transition-soft">View All &rarr;</button>
                    </div>
                    {orders.length > 0 ? (
                      <div className="p-6 md:p-8 space-y-4">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-5 border border-slate-50 rounded-2xl hover:bg-slate-50/50 transition-soft group">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-12 h-12 bg-primary/5 rounded-xl flex-shrink-0 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-soft">
                                <Package className="w-6 h-6 text-primary group-hover:text-white transition-soft" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[14px] font-bold text-slate-900 truncate">Shipment #{order.id.slice(0, 8)}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                  {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} Items
                                </p>
                              </div>
                            </div>
                            <Link href={`/orders/${order.id}`} className="text-primary hover:scale-110 transition-soft">
                              <ChevronRight className="w-5 h-5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <Package className="w-8 h-8 text-slate-100 mx-auto mb-3" />
                        <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("noRecentActivity")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-4">
                  {fetchingOrders ? (
                    <div className="bg-white rounded-2xl p-16 flex items-center justify-center border border-slate-100">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl p-5 md:p-6 border border-slate-100 transition-soft">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-50">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 border border-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center text-slate-300">
                                <Package className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="text-[14px] md:text-[15px] font-bold text-slate-900 leading-tight">Shipment #{order.id.slice(0, 8)}</h3>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-lg text-[8px] md:text-[9px] font-bold uppercase tracking-widest border text-center w-fit ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>

                          <div className="space-y-3 mb-6">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-8 h-8 border border-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[12px] md:text-[13px] font-bold text-slate-900 leading-tight truncate">{item.name}</p>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">QTY: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="text-[12px] md:text-[13px] font-bold text-slate-900 flex-shrink-0">${(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div>
                              <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Portfolio Value</p>
                              <p className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">${order.totalAmount?.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {order.status === "pending" && (
                                <Link 
                                  href={`/orders/${order.id}`}
                                  className="px-4 md:px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:opacity-90 transition-soft flex items-center gap-2"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Pay Now
                                </Link>
                              )}
                              <Link 
                                href={`/orders/${order.id}`}
                                className="px-4 md:px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:opacity-90 transition-soft"
                              >
                                Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-16 border border-slate-100 flex flex-col items-center text-center">
                      <Package className="w-10 h-10 text-slate-100 mb-4" />
                      <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("noRecentActivity")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "profile" && (
                <div className="bg-white rounded-[2rem] p-6 md:p-12 border border-slate-100 shadow-sm">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-6 md:mb-8 tracking-tight">Profile Information</h3>
                  <form onSubmit={handleUpdateProfile} className="space-y-6 md:space-y-8">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("fullName")}</label>
                      <input 
                        type="text" 
                        required
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-soft font-bold text-slate-900 text-[14px] md:text-[15px]"
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("emailAddress")}</label>
                      <input 
                        type="email" 
                        disabled
                        value={user?.email}
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-400 cursor-not-allowed text-[14px] md:text-[15px]"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={updating}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-primary transition-soft shadow-lg shadow-slate-900/10 disabled:opacity-50"
                    >
                      {updating ? t("updating") : t("saveChanges")}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "security" && (
                <div className="bg-white rounded-3xl p-6 md:p-12 border border-slate-100 shadow-sm">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-6 md:mb-8 tracking-tight">Security Settings</h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-6 md:space-y-8">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("newPassword")}</label>
                      <input 
                        type="password" 
                        required
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-soft font-bold text-slate-900 text-[14px] md:text-[15px]"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("confirmNewPassword")}</label>
                      <input 
                        type="password" 
                        required
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-white border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-soft font-bold text-slate-900 text-[14px] md:text-[15px]"
                        placeholder="••••••••"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={updating}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-primary transition-soft shadow-lg shadow-slate-900/10 disabled:opacity-50"
                    >
                      {updating ? t("updating") : t("updatePassword")}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </PublicLayout>
  )
}
