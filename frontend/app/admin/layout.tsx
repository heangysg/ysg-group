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
  Plus
} from "lucide-react"
import { createClient } from "../../lib/supabase/client"
import { useLanguage } from "../../contexts/LanguageContext"
import toast, { Toaster } from "react-hot-toast"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminName, setAdminName] = useState("Admin")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [adminProfileImage, setAdminProfileImage] = useState<string | null>(null)
  const [adminBio, setAdminBio] = useState("")
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
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
      setAdminProfileImage(user.image || null)
      setAdminBio(user.bio || "")
    }
  }, [pathname, router])

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSavingProfile(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "ysg_products")

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      )
      const data = await res.json()
      
      if (data.secure_url) {
        setAdminProfileImage(data.secure_url)
        toast.success(t("photoUploaded") || "Photo uploaded!")
      }
    } catch (err) {
      toast.error("Upload failed")
    } finally {
      setSavingProfile(false)
    }
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const userStr = localStorage.getItem("ysg_admin_user")
      if (!userStr) return
      const user = JSON.parse(userStr)

      const supabase = createClient()
      const { error } = await supabase
        .from("User")
        .update({
          name: adminName,
          image: adminProfileImage,
          bio: adminBio
        })
        .eq("email", user.email)

      if (error) throw error

      // Update local storage
      const updatedUser = { ...user, name: adminName, image: adminProfileImage, bio: adminBio }
      localStorage.setItem("ysg_admin_user", JSON.stringify(updatedUser))
      
      toast.success(t("profileUpdated") || "Profile updated!")
      setShowProfileModal(false)
    } catch (err) {
      toast.error("Failed to update profile")
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
        w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:-translate-x-full lg:w-0 lg:opacity-0"}
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
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
              <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Admin</Link>
              <span className="text-slate-200">/</span>
              <span className="text-slate-900 capitalize">{pathname.split("/").pop()?.replace("-", " ")}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${language === "en" ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("kh")}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${language === "kh" ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
              >
                KH
              </button>
            </div>

            <button className="relative p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 p-1.5 pr-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                {adminProfileImage ? (
                  <img src={adminProfileImage} alt="Profile" className="w-full h-full object-cover" />
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
                      <img src={adminProfileImage} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
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
