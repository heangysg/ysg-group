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
import { Check, Loader2, Upload, Trash2, Edit2, Shield, Key, Edit, ListPlus, MessageSquare } from "lucide-react"
import { useLanguage } from "../../contexts/LanguageContext"
import { uploadImageToSecureProxy } from "../../lib/upload"
import toast, { Toaster } from "react-hot-toast"
import imageCompression from "browser-image-compression"

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
    const tokenStr = localStorage.getItem("ysg_admin_token")
    
    if ((!userStr || !tokenStr) && pathname !== "/admin/login") {
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

    let isFetching = false;
    async function pollNotifications() {
      if (isFetching) return;
      isFetching = true;
      try {
        await fetchNotifications();
      } finally {
        isFetching = false;
      }
    }

    fetchNotifications()
    const interval = setInterval(pollNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [pathname, router])



  async function fetchNotifications() {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem("ysg_admin_token")
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
      
      const [inquiriesRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Inquiry", order: { column: "createdAt", ascending: false }, limit: 5 }) }).then(r => r.json()),
        fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Order", order: { column: "createdAt", ascending: false }, limit: 5 }) }).then(r => r.json())
      ])

      const latestInquiries = inquiriesRes.data
      const latestOrders = ordersRes.data

      const allNotes: any[] = []

      if (latestInquiries) {
        latestInquiries.forEach((item: any) => {
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
        latestOrders.forEach((item: any) => {
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
    const localUrl = URL.createObjectURL(file)
    setAdminProfileImage(localUrl)
    
    if (e.target) e.target.value = ""
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const userStr = localStorage.getItem("ysg_admin_user")
      if (!userStr) return
      const user = JSON.parse(userStr)

      let finalImageUrl = adminProfileImage

      if (selectedFile) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true
        }
        const compressedFile = await imageCompression(selectedFile, options)

        try {
          const secureUrl = await uploadImageToSecureProxy(compressedFile);
          finalImageUrl = secureUrl;
          toast.success(t("photoUploaded") || "Photo uploaded!")
        } catch (error: any) {
          console.error("Secure Upload Error:", error);
          throw new Error(error.message || "Image upload failed");
        }
      }

      const token = localStorage.getItem("ysg_admin_token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const updateRes = await fetch(`${API_URL}/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ id: user.id, name: adminName, avatar: finalImageUrl })
      })

      if (!updateRes.ok) throw new Error("Failed to update profile in database")

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
      bg-white border-r-2 border-slate-900 transition-all duration-300 ease-in-out
      flex flex-col overflow-hidden
      ${sidebarOpen 
        ? "w-72 translate-x-0 opacity-100" 
        : "w-0 -translate-x-full lg:translate-x-0 opacity-0 lg:w-0"}
    `}>
      {/* Logo */}
      <div className="h-20 flex items-center px-8 border-b-2 border-slate-900 shrink-0 bg-primary">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 rounded-none flex items-center justify-center shadow-hard border-2 border-slate-900">
            <span className="text-white font-bold text-xl uppercase">G</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight uppercase">
              {isSuperAdmin ? t("superadmin") : t("admin")} {t("panel")}
            </h1>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mt-0.5">
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
                  flex items-center gap-3 px-4 py-3 font-bold text-xs uppercase tracking-widest transition-all border-2
                  ${isActive 
                    ? "bg-primary text-slate-900 border-slate-900 shadow-hard" 
                    : "text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-900"}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-slate-900" : "text-slate-500"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

      {/* Logout */}
      <div className="p-6 border-t-2 border-slate-900">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 border-2 border-transparent hover:border-red-600 hover:shadow-hard-red bg-red-50 font-bold uppercase tracking-widest text-xs transition-all"
        >
          <LogOut className="w-5 h-5" />
          {t("logout")}
        </button>
      </div>
      </aside>

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-slate-50">
      {/* Header */}
      <header className="h-20 bg-white border-b-2 border-slate-900 px-6 lg:px-8 flex items-center justify-between shrink-0 z-[30]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 bg-slate-50 text-slate-900 border-2 border-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
            <div className={`hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 whitespace-nowrap ${language !== 'kh' ? 'uppercase tracking-[0.2em]' : ''}`}>
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
              className="w-full pl-11 pr-9 py-2 bg-slate-50 border-2 border-slate-900 outline-none focus:bg-white transition-all text-xs font-bold uppercase tracking-widest placeholder:text-slate-400" 
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-900 hover:text-red-600 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          </div>

        <div className="flex items-center gap-4 lg:gap-6">
          {/* Language Switcher with Flags */}
          <div className="flex items-center bg-slate-50 border-2 border-slate-900 p-1 shadow-hard">
            <button
              onClick={() => setLanguage("en")}
              className={`w-10 h-8 flex items-center justify-center transition-all border-2 ${language === "en" ? "bg-white border-slate-900" : "border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
              title="English"
            >
              <img src="https://flagcdn.com/gb.svg" alt="English" className="w-6 h-auto" />
            </button>
            <button
              onClick={() => setLanguage("kh")}
              className={`w-10 h-8 flex items-center justify-center transition-all border-2 ${language === "kh" ? "bg-white border-slate-900" : "border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
              title="Khmer"
            >
              <img src="https://flagcdn.com/kh.svg" alt="Khmer" className="w-6 h-auto" />
            </button>
          </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 transition-all border-2 ${showNotifications ? 'bg-primary text-slate-900 border-slate-900 shadow-hard' : 'text-slate-900 border-transparent hover:border-slate-900 hover:shadow-hard'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border-2 border-slate-900 animate-pulse"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="fixed inset-x-4 top-20 lg:absolute lg:right-0 lg:left-auto lg:mt-4 lg:w-80 bg-white border-2 border-slate-900 shadow-hard overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200 z-[100]">
                  <div className="p-4 border-b-2 border-slate-900 flex items-center justify-between bg-primary">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">{t("notifications")}</h3>
                    <button className="text-xs font-bold text-slate-900 hover:text-white transition-colors uppercase tracking-widest">{t("markAllRead")}</button>
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
                              <p className="text-xs font-medium text-slate-900 truncate">{note.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{note.message}</p>
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
                        <p className="text-xs font-medium text-slate-400">{t("noNewNotifications")}</p>
                      </div>
                    )}
                  </div>
                  <Link 
                    href="/admin/activity" 
                    onClick={() => setShowNotifications(false)}
                    className="block p-4 border-t-2 border-slate-900 bg-slate-50 text-center text-xs font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest"
                  >
                    {t("viewAllActivity")}
                  </Link>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 p-1.5 pr-4 hover:bg-slate-50 transition-all border-2 border-transparent hover:border-slate-900 hover:shadow-hard group"
            >
              <div className="w-10 h-10 bg-slate-100 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                {adminProfileImage ? (
                  <img src={adminProfileImage.includes("cloudinary.com") ? adminProfileImage.replace("/upload/", "/upload/f_auto,q_auto/") : adminProfileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold uppercase text-lg">
                    {adminName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-none uppercase tracking-wider">{adminName}</p>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                  {isSuperAdmin ? t("superadmin") : t("admin")}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-900 hidden md:block group-hover:translate-y-0.5 transition-transform" />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="solid-card bg-white w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b-2 border-slate-900 bg-primary">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">My Profile</h2>
                  <p className="text-sm text-slate-400 mt-1">{t("updatePhotoAndHistory")}</p>
                </div>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-3 bg-white border-2 border-slate-900 text-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-10 space-y-8">
              {/* Profile Image Section */}
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="w-24 h-24 bg-slate-100 border-2 border-slate-900 overflow-hidden shadow-hard flex items-center justify-center">
                    {adminProfileImage ? (
                      <img 
                        src={adminProfileImage.includes("cloudinary.com") ? adminProfileImage.replace("/upload/", "/upload/f_auto,q_auto/") : adminProfileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      />
                    ) : (
                      <User className="w-10 h-10 text-slate-900" />
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-3 -right-3 p-3 bg-primary text-slate-900 border-2 border-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
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
                  <label className="text-base font-medium text-slate-400 uppercase tracking-widest ml-1">{t("fullName")}</label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full mt-2 px-5 py-3.5 bg-slate-50 border-2 border-slate-900 font-bold text-slate-900 outline-none focus:bg-white transition-all uppercase tracking-widest text-[11px]"
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <label className="text-base font-medium text-slate-400 uppercase tracking-widest ml-1">{t("backgroundHistory")}</label>
                <textarea
                  value={adminBio}
                  onChange={(e) => setAdminBio(e.target.value)}
                  placeholder={t("writeBio")}
                  className="w-full mt-2 px-5 py-4 bg-slate-50 border-2 border-slate-900 font-bold text-slate-900 outline-none focus:bg-white transition-all h-32 resize-none uppercase tracking-widest text-[11px]"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-4 px-6 border-2 border-slate-900 text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 hover:shadow-hard transition-all bg-white"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="flex-1 btn-primary py-4 px-6 flex items-center justify-center gap-3 text-xs"
                >
                  {savingProfile ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
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
