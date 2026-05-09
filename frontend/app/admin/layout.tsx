"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  Mail, 
  History, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Bell, 
  Search, 
  ChevronDown,
  User,
  Camera,
  Globe,
  Plus,
  ShoppingBag
} from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import { useLanguage } from "../../contexts/LanguageContext"
import toast, { Toaster } from "react-hot-toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState("Admin")
  const [isAdminRole, setIsAdminRole] = useState(false)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [adminProfileImage, setAdminProfileImage] = useState<string | null>(null)
  const [adminBio, setAdminBio] = useState("")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { t, language, setLanguage } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (!userStr && pathname !== "/admin/login") {
      router.push("/admin/login")
      return
    }
    if (userStr) {
      const user = JSON.parse(userStr)
      setAdminName(user.name || "Admin")
      setIsSuperAdmin(user.isSuperAdmin === true)
      setAdminProfileImage(user.avatar || null)
      setAdminBio(user.bio || "")
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [pathname, router])

  useEffect(() => {
    // Real-time subscriptions
    const supabase = createClient()
    
    const inquirySub = supabase
      .channel('inquiry-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Inquiry' }, () => {
        fetchNotifications()
      })
      .subscribe()

    const orderSub = supabase
      .channel('order-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Order' }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(inquirySub)
      supabase.removeChannel(orderSub)
    }
  }, [])

  async function fetchNotifications() {
    const supabase = createClient()
    
    try {
      // Fetch inquiries and orders in parallel
      const [{ data: latestInquiries }, { data: latestOrders }] = await Promise.all([
        supabase.from("Inquiry").select("*").order("createdAt", { ascending: false }).limit(5),
        supabase.from("Order").select("*").order("createdAt", { ascending: false }).limit(5)
      ])

      const allNotes: any[] = []

      if (latestInquiries) {
        latestInquiries.forEach(item => {
          allNotes.push({
            id: item.id,
            type: 'inquiry',
            title: t("newInquiryReceived"),
            message: item.message?.slice(0, 50) + (item.message?.length > 50 ? '...' : ''),
            time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: Mail,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            createdAt: new Date(item.createdAt)
          })
        })
      }

      if (latestOrders) {
        latestOrders.forEach(item => {
          allNotes.push({
            id: item.id,
            type: 'order',
            title: t("newOrderReceived"),
            message: `${t("order")} #${item.id.slice(-6).toUpperCase()} - $${item.totalAmount}`,
            time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: ShoppingBag,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            createdAt: new Date(item.createdAt)
          })
        })
      }

      setNotifications(allNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8))
    } catch (err) {
      console.error("Notifications Fetch Error:", err)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const menuItems = [
    { name: t("dashboard"), href: "/admin/dashboard", icon: LayoutDashboard },
    { name: t("products"), href: "/admin/products", icon: Package },
    { name: t("categories"), href: "/admin/categories", icon: FolderOpen },
    { name: t("inquiries"), href: "/admin/inquiries", icon: Mail },
    { name: t("orders"), href: "/admin/orders", icon: History },
    ...(isSuperAdmin ? [
      { name: t("users"), href: "/admin/users", icon: Users },
      { name: t("auditLogs"), href: "/admin/audit-logs", icon: History },
      { name: t("settings"), href: "/admin/settings", icon: Settings }
    ] : [])
  ]

  const handleLogout = () => {
    localStorage.removeItem("ysg_admin_user")
    router.push("/admin/login")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    // Create a local preview
    const localUrl = URL.createObjectURL(file)
    setAdminProfileImage(localUrl)
    
    // Reset input so same file can be selected again
    if (e.target) e.target.value = ""
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const userStr = localStorage.getItem("ysg_admin_user")
      if (!userStr) return
      const user = JSON.parse(userStr)

      let finalImageUrl = adminProfileImage

      // 1. If there's a new file, upload it now
      if (selectedFile) {
        const cloudName = (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dpaq3ova2").trim()
        const uploadPreset = (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ysg-website").trim()

        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("upload_preset", uploadPreset)

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        )
        const data = await res.json()
        
        if (res.ok && data.secure_url) {
          // Optimize the URL before saving to database
          finalImageUrl = data.secure_url.replace("/upload/", "/upload/w_400,h_400,c_fill,g_face,f_auto,q_auto/")
          toast.success(t("photoUploaded") || "Photo uploaded!")
        } else {
          console.error("Cloudinary Error Detail:", data)
          const errorMsg = data.error?.message || "Image upload failed"
          throw new Error(errorMsg)
        }
      }

      // 2. Update Database
      const supabase = createClient()
      const { error } = await supabase
        .from("User")
        .update({
          name: adminName,
          avatar: finalImageUrl
        })
        .eq("email", user.email)

      if (error) throw error

      // Update local storage
      const updatedUser = { ...user, name: adminName, avatar: finalImageUrl }
      localStorage.setItem("ysg_admin_user", JSON.stringify(updatedUser))
      
      setAdminProfileImage(finalImageUrl)
      setSelectedFile(null)
      toast.success(t("profileUpdated") || "Profile updated!")
      setShowProfileModal(false)
    } catch (err: any) {
      console.error("Save profile error:", err)
      toast.error(err.message || "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  if (pathname === "/admin/login") return <>{children}</>

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[40] transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[50]
        bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
        flex flex-col overflow-hidden
        ${sidebarOpen 
          ? "w-72 translate-x-0 opacity-100" 
          : "w-0 -translate-x-full lg:translate-x-0 opacity-0 lg:w-0"}
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-black text-xl">G</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                {isSuperAdmin ? t("superadmin") : t("admin")} {t("panel")}
              </h1>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                {t("managementPortal")}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                  ${isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-all"
          >
            <LogOut className="w-5 h-5" />
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between shrink-0 z-[30]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
            <div className={`hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 whitespace-nowrap ${language !== 'kh' ? 'uppercase tracking-[0.2em]' : ''}`}>
              <Link href="/admin/dashboard" className="hover:text-primary transition-colors">{t("admin")}</Link>
              <span className="text-slate-200 text-[14px] font-normal leading-none -mt-0.5">/</span>
              <span className="text-slate-900">
                {pathname === "/admin/dashboard" ? t("dashboard") : 
                 pathname.includes("/admin/products") ? t("products") :
                 pathname.includes("/admin/categories") ? t("categories") :
                 pathname.includes("/admin/inquiries") ? t("inquiries") :
                 pathname.includes("/admin/orders") ? t("orders") :
                 pathname.includes("/admin/users") ? t("users") :
                 pathname.includes("/admin/activity") ? t("activity") :
                 pathname.includes("/admin/audit-logs") ? t("auditLogs") :
                 pathname.includes("/admin/settings") ? t("settings") :
                 pathname.split("/").pop()?.replace("-", " ")}
              </span>
            </div>
            
            {/* Global Search Bar */}
            <div className="hidden xl:flex relative group max-w-xs w-full ml-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search") + "..."}
                className="w-full pl-11 pr-9 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all text-sm font-medium" 
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Language Switcher with Flags */}
            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
              <button
                onClick={() => setLanguage("en")}
                className={`w-10 h-8 rounded-lg flex items-center justify-center transition-all ${language === "en" ? "bg-white shadow-sm ring-1 ring-slate-200" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
                title="English"
              >
                <img src="https://flagcdn.com/gb.svg" alt="English" className="w-6 h-auto rounded-sm" />
              </button>
              <button
                onClick={() => setLanguage("kh")}
                className={`w-10 h-8 rounded-lg flex items-center justify-center transition-all ${language === "kh" ? "bg-white shadow-sm ring-1 ring-slate-200" : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
                title="Khmer"
              >
                <img src="https://flagcdn.com/kh.svg" alt="Khmer" className="w-6 h-auto rounded-sm" />
              </button>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary hover:bg-primary/5'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="fixed inset-x-4 top-20 lg:absolute lg:right-0 lg:left-auto lg:mt-3 lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200 z-[100]">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{t("notifications")}</h3>
                    <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">{t("markAllRead")}</button>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((note) => (
                          <div key={note.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3 group">
                            <div className={`shrink-0 w-10 h-10 rounded-xl ${note.bg} ${note.color} flex items-center justify-center`}>
                              <note.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{note.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{note.message}</p>
                              <p className="text-[9px] text-slate-400 mt-1 font-medium">{note.time}</p>
                            </div>
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-slate-400">{t("noNewNotifications")}</p>
                      </div>
                    )}
                  </div>
                  <Link 
                    href="/admin/activity" 
                    onClick={() => setShowNotifications(false)}
                    className="block p-4 bg-slate-50 text-center text-[10px] font-bold text-slate-500 hover:text-primary hover:bg-slate-100 transition-all uppercase tracking-widest"
                  >
                    {t("viewAllActivity")}
                  </Link>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 p-1.5 pr-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                {adminProfileImage ? (
                  <img src={adminProfileImage.includes("cloudinary.com") ? adminProfileImage.replace("/upload/", "/upload/f_auto,q_auto/") : adminProfileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {adminName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">{adminName}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">
                  {isSuperAdmin ? t("superadmin") : t("admin")}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-300 hidden md:block" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="p-10 pb-6 border-b border-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t("myProfile")}</h2>
                  <p className="text-sm text-slate-400 mt-1">{t("updatePhotoAndHistory")}</p>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-8">
              {/* Profile Image Section */}
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
                    {adminProfileImage ? (
                      <img 
                        src={adminProfileImage.includes("cloudinary.com") ? adminProfileImage.replace("/upload/", "/upload/f_auto,q_auto/") : adminProfileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("fullName")}</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full mt-2 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t("backgroundHistory")}</label>
                <textarea
                  value={adminBio}
                  onChange={(e) => setAdminBio(e.target.value)}
                  placeholder={t("writeBio")}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all h-32 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="flex-1 py-4 px-6 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {savingProfile ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {t("saveAndClose")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
