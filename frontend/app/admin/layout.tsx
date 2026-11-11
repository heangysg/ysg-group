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
 ShoppingBag,
 Image as ImageIcon,
 BarChart3,
 Boxes,
 ChevronRight
} from "lucide-react"
import { Check, Loader2, Upload, Trash2, Edit2, Shield, Key, Edit, ListPlus, MessageSquare } from "lucide-react"
import { useLanguage } from "../../contexts/LanguageContext"
import { uploadImageToSecureProxy } from "../../lib/upload"
import toast, { Toaster } from "react-hot-toast"
import Portal from "../../components/Portal"
import imageCompression from "browser-image-compression"
import { getOptimizedImageUrl } from "../../lib/imageUtils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
 const [sidebarOpen, setSidebarOpen] = useState(true)
 const [adminName, setAdminName] = useState("Admin")
 const [isAdminRole, setIsAdminRole] = useState(false)
 const [isSuperAdmin, setIsSuperAdmin] = useState(false)
 const [isStaff, setIsStaff] = useState(false)
 const [adminProfileImage, setAdminProfileImage] = useState<string | null>(null)
 const [adminBio, setAdminBio] = useState("")
 const [showProfileModal, setShowProfileModal] = useState(false)
 const [savingProfile, setSavingProfile] = useState(false)
 const [selectedFile, setSelectedFile] = useState<File | null>(null)

 const [showNotifications, setShowNotifications] = useState(false)
 const [notifications, setNotifications] = useState<any[]>([])
 const [notificationsReadAt, setNotificationsReadAt] = useState<number>(0)
 const [search, setSearch] = useState("")
 const [showSearchResults, setShowSearchResults] = useState(false)
 const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
   overview: true,
   sales: true,
   catalog: true,
   system: false,
 })
 const notificationRef = useRef<HTMLDivElement>(null)
 const searchRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
 function handleClickOutside(event: MouseEvent) {
 if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
 setShowNotifications(false)
 }
 if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
 setShowSearchResults(false)
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

 const applySessionState = (u: any, currentPath: string | null) => {
   const superAdmin = u?.isSuperAdmin === true
   const roleNameUpper = String(u?.roleName || "").trim().toUpperCase()
   const roleIdLower = String(u?.roleId || "").trim().toLowerCase()
   const staffUser = !superAdmin && (roleNameUpper === "STAFF" || roleIdLower === "role_staff")

   setAdminName(u?.name || "Admin")
   setIsSuperAdmin(superAdmin)
   setIsStaff(staffUser)
   setAdminProfileImage(u?.avatar || null)
   setAdminBio(u?.bio || "")

   const superAdminPaths = ["/admin/users", "/admin/audit-logs", "/admin/settings"]
   const staffBlockedPaths = ["/admin/dashboard", "/admin/reports", ...superAdminPaths]

   if (staffUser && staffBlockedPaths.some((p) => currentPath?.startsWith(p))) {
     router.replace("/admin/orders")
     return true
   }
   if (!superAdmin && superAdminPaths.some((p) => currentPath?.startsWith(p))) {
     router.replace("/admin/dashboard")
     return true
   }
   return false
 }

 useEffect(() => {
 const userStr = localStorage.getItem("ysg_admin_user")
 const tokenStr = localStorage.getItem("ysg_admin_token")

 if ((!userStr || !tokenStr) && pathname !== "/admin/login") {
 router.push("/admin/login")
 return
 }
 const savedReadAt = Number(localStorage.getItem("ysg_notifications_read_at") || "0")
 if (!Number.isNaN(savedReadAt)) {
 setNotificationsReadAt(savedReadAt)
 }
 if (userStr) {
 const user = JSON.parse(userStr)
 applySessionState(user, pathname)
 }
 }, [pathname, router])

 useEffect(() => {
 const userStr = localStorage.getItem("ysg_admin_user")
 const tokenStr = localStorage.getItem("ysg_admin_token")
 if (!userStr || !tokenStr) return

 const user = JSON.parse(userStr)
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 fetch(`${API_URL}/api/admin/profile`, {
   headers: { Authorization: `Bearer ${tokenStr}` }
 })
   .then((res) => (res.ok ? res.json() : null))
   .then((data) => {
     if (!data?.user) return
     const merged = { ...user, ...data.user }
     localStorage.setItem("ysg_admin_user", JSON.stringify(merged))
     applySessionState(merged, window.location.pathname)
   })
   .catch(() => {})

 let isFetching = false
 async function pollNotifications() {
 if (isFetching || document.hidden) return
 isFetching = true
 try {
 await fetchNotifications()
 } finally {
 isFetching = false
 }
 }

 fetchNotifications()
 const interval = setInterval(pollNotifications, 30000)
 return () => clearInterval(interval)
 }, [])

  async function fetchNotifications() {
    const token = typeof window !== "undefined" ? localStorage.getItem("ysg_admin_token") : null
    if (!token) return

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }

      const safeFetchTable = async (table: string, select: string) => {
        try {
          const res = await fetch(`${API_URL}/api/admin/read`, {
            method: "POST",
            headers,
            body: JSON.stringify({ table, select, order: { column: "createdAt", ascending: false }, limit: 5 })
          })
          if (!res.ok) return { data: [] }
          return await res.json()
        } catch {
          return { data: [] }
        }
      }

      const [inquiriesRes, ordersRes] = await Promise.all([
        safeFetchTable("Inquiry", "id,customerName,message,createdAt"),
        safeFetchTable("Order", "id,customerName,totalAmount,createdAt")
      ])

      const latestInquiries = inquiriesRes?.data || []
      const latestOrders = ordersRes?.data || []

      const allNotes: any[] = []

      if (Array.isArray(latestInquiries)) {
        latestInquiries.forEach((item: any) => {
          if (!item || !item.createdAt) return
          allNotes.push({
            id: item.id,
            type: 'inquiry',
            titleKey: "newInquiryReceived",
            rawMessage: item.message,
            time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: Mail,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            createdAt: new Date(item.createdAt)
          })
        })
      }

      if (Array.isArray(latestOrders)) {
        latestOrders.forEach((item: any) => {
          if (!item || !item.createdAt) return
          allNotes.push({
            id: item.id,
            type: 'order',
            titleKey: "newOrderReceived",
            orderId: item.id ? String(item.id).slice(-6).toUpperCase() : 'N/A',
            amount: item.totalAmount || 0,
            time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: ShoppingBag,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            createdAt: new Date(item.createdAt)
          })
        })
      }

      setNotifications(allNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8))
    } catch {
      // Quietly ignore transient network issues
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

  const isKh = language === "kh"

  const menuGroups = [
    ...(!isStaff
      ? [
          {
            id: "overview",
            label: isKh ? "ទិដ្ឋភាពទូទៅ" : "Overview",
            icon: LayoutDashboard,
            items: [
              { name: t("dashboard"), href: "/admin/dashboard", icon: LayoutDashboard },
              { name: t("reports"), href: "/admin/reports", icon: BarChart3 },
            ],
          },
        ]
      : []),
    {
      id: "sales",
      label: isKh ? "ការលក់ & អតិថិជន" : "Sales & Orders",
      icon: ShoppingBag,
      items: [
        { name: t("orders"), href: "/admin/orders", icon: ShoppingBag },
        { name: t("inquiries"), href: "/admin/inquiries", icon: Mail },
        { name: t("customers") || "Customers", href: "/admin/customers", icon: Users },
      ],
    },
    {
      id: "catalog",
      label: isKh ? "ផលិតផល & ស្តុក" : "Catalog & Stock",
      icon: Package,
      items: [
        { name: t("products"), href: "/admin/products", icon: Package },
        { name: isKh ? "បន្ថែមផលិតផល" : "Add Product", href: "/admin/products/new", icon: Plus },
        { name: isKh ? "ស្តុកទំនិញ (Stock)" : "Stock / Inventory", href: "/admin/inventory", icon: Boxes },
        { name: t("categories"), href: "/admin/categories", icon: FolderOpen },
        { name: isKh ? "ធុងសំរាម" : "Trash", href: "/admin/products/trash", icon: Trash2 },
      ],
    },
    {
      id: "system",
      label: isKh ? "ប្រព័ន្ធ & ការកំណត់" : "System",
      icon: Settings,
      items: [
        { name: t("profile"), href: "/admin/profile", icon: User },
        ...(isSuperAdmin
          ? [
              { name: t("users"), href: "/admin/users", icon: Shield },
              { name: t("auditLogs"), href: "/admin/audit-logs", icon: History },
              { name: t("settings"), href: "/admin/settings", icon: Settings },
            ]
          : []),
      ],
    },
  ]

  const menuItems = menuGroups.flatMap((g) => g.items)

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    const matchedGroup = menuGroups.find((g) => g.items.some((item) => pathname === item.href || (item.href !== "/admin/products" && pathname?.startsWith(item.href))))
    if (matchedGroup && !openGroups[matchedGroup.id]) {
      setOpenGroups((prev) => ({ ...prev, [matchedGroup.id]: true }))
    }
  }, [pathname])

 const handleLogout = () => {
 localStorage.removeItem("ysg_admin_user")
 localStorage.removeItem("ysg_admin_token")
 localStorage.removeItem("ysg_notifications_read_at")
 router.push("/admin/login")
 }

 const markAllNotificationsRead = () => {
 const now = Date.now()
 setNotificationsReadAt(now)
 localStorage.setItem("ysg_notifications_read_at", String(now))
 toast.success(language === "kh" ? "បានសម្គាល់ថាបានអានទាំងអស់" : "All notifications marked as read")
 }

 const unreadCount = notifications.filter((n) => n.createdAt && n.createdAt.getTime() > notificationsReadAt).length

 const filteredMenuItems = search.trim()
 ? menuItems.filter(
 (item) =>
 item.name.toLowerCase().includes(search.toLowerCase()) ||
 item.href.toLowerCase().includes(search.toLowerCase())
 )
 : []

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
 body: JSON.stringify({ id: user.id, name: adminName, avatar: finalImageUrl, bio: adminBio })
 })

 if (!updateRes.ok) throw new Error("Failed to update profile in database")

 const updatedUser = { ...user, name: adminName, avatar: finalImageUrl, bio: adminBio }
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
 className="fixed inset-0 bg-slate-900/50 z-[40] transition-all"
 onClick={() => setSidebarOpen(false)}
 />
 )}

 {/* Sidebar */}
 <aside className={`
 fixed lg:sticky lg:top-0 inset-y-0 left-0 z-[50] lg:h-screen shrink-0
 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
 flex flex-col overflow-hidden
 ${sidebarOpen
 ? "w-72 translate-x-0 opacity-100"
 : "w-0 -translate-x-full lg:translate-x-0 opacity-0 lg:w-0 border-r-0"}
 `}>
 {/* Logo */}
 <div className="h-14 flex items-center px-6 border-b border-slate-200 shrink-0 bg-primary">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm border border-slate-200 overflow-hidden">
 <img src="/logo.png" alt="YSG Logo" className="w-6 h-6 object-contain" />
 </div>
 <div>
 <h1 className="text-sm font-bold text-white leading-tight uppercase">
 {isSuperAdmin ? t("superadmin") : isStaff ? (language === "kh" ? "បុគ្គលិក" : "Staff") : t("admin")}
 </h1>
 <p className="text-[11px] font-medium text-blue-100 leading-tight">
 {t("managementPortal")}
 </p>
 </div>
 </div>
 </div>

        {/* Navigation (Grouped Collapsible Dropdowns) */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar">
          {menuGroups.map((group) => {
            const hasActiveChild = group.items.some((item) => pathname === item.href)
            const isOpen = openGroups[group.id] ?? hasActiveChild

            return (
              <div key={group.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    hasActiveChild
                      ? "text-primary bg-blue-50/80"
                      : "text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <group.icon className="w-4 h-4 shrink-0" />
                    {group.label}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="space-y-0.5 pl-3">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => { if (isMobile) setSidebarOpen(false) }}
                          className={`flex items-center gap-3 px-3.5 py-2.5 text-[13px] font-semibold transition-all rounded-lg ${
                            isActive
                              ? "bg-primary text-white shadow-sm"
                              : "text-slate-800 hover:text-slate-950 hover:bg-slate-100/80"
                          }`}
                        >
                          <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-700"}`} />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

 {/* Logout */}
 <div className="p-4 border-t border-slate-200">
 <button
 onClick={handleLogout}
 className="flex items-center gap-3 w-full px-4 py-2 text-red-600 border-2 border-transparent hover:border-red-600 hover:shadow-sm-red bg-red-50 font-bold font-medium text-xs transition-all"
 >
 <LogOut className="w-5 h-5" />
 {t("logout")}
 </button>
 </div>
 </aside>

 {/* Main Content */}
 <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
 {/* Header */}
 <header className="sticky top-0 h-14 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between shrink-0 z-[30]">
 <div className="flex items-center gap-3">
 <button
 onClick={() => setSidebarOpen(!sidebarOpen)}
 className="p-2 bg-slate-50 text-slate-900 border border-slate-200 shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
 >
 {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
 </button>
 <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />
 <div className={`hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 whitespace-nowrap ${language !== 'kh' ? 'uppercase tracking-[0.2em]' : ''}`}>
 <Link href={isStaff ? "/admin/orders" : "/admin/dashboard"} className="hover:text-primary transition-colors">
 {isSuperAdmin ? t("superadmin") : isStaff ? (language === "kh" ? "បុគ្គលិក" : "Staff") : t("admin")}
 </Link>
 <span className="text-slate-200 text-[14px] font-normal leading-none -mt-0.5">/</span>
 <span className="text-slate-900">
 {pathname === "/admin/dashboard" ? t("dashboard") :
 pathname.includes("/admin/reports") ? t("reports") :
 pathname.includes("/admin/inventory") ? (isKh ? "ស្តុកទំនិញ" : "Stock / Inventory") :
 pathname.includes("/admin/products/trash") ? (language === "kh" ? "ធុងសំរាម" : "Trash") :
 pathname.includes("/admin/products/new") ? (language === "kh" ? "បន្ថែមផលិតផល" : "New Product") :
 pathname.includes("/admin/products/edit") ? (language === "kh" ? "កែប្រែផលិតផល" : "Edit Product") :
 pathname.includes("/admin/products") ? t("products") :
 pathname.includes("/admin/categories") ? t("categories") :
 pathname.includes("/admin/inquiries") ? t("inquiries") :
 pathname.includes("/admin/orders") ? t("orders") :
 pathname.includes("/admin/customers") ? (t("customers") || "Customers") :
 pathname.includes("/admin/profile") ? t("profile") :
 pathname.includes("/admin/users") ? t("users") :
 pathname.includes("/admin/activity") ? t("activity") :
 pathname.includes("/admin/audit-logs") ? t("auditLogs") :
 pathname.includes("/admin/settings") ? t("settings") :
 pathname.split("/").pop()?.replace("-", " ")}
 </span>
 </div>

 {/* Quick Navigation Search Bar */}
 <div className="hidden xl:flex relative group max-w-xs w-full ml-4" ref={searchRef}>
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700 group-focus-within:text-primary transition-colors" />
 <input
 type="text"
 value={search}
 onFocus={() => setShowSearchResults(true)}
 onChange={(e) => {
 setSearch(e.target.value)
 setShowSearchResults(true)
 }}
 onKeyDown={(e) => {
 if (e.key === "Enter" && filteredMenuItems.length > 0) {
 router.push(filteredMenuItems[0].href)
 setSearch("")
 setShowSearchResults(false)
 }
 }}
 placeholder={t("search") + "..."}
 className="w-full pl-10 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-primary transition-all text-xs font-medium placeholder:text-slate-800"
 />
 {search && (
 <button
 onClick={() => {
 setSearch("")
 setShowSearchResults(false)
 }}
 className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-900 hover:text-red-600 transition-colors z-10"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 {showSearchResults && search.trim() && (
 <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-[100]">
 {filteredMenuItems.length > 0 ? (
 <div className="py-1">
 {filteredMenuItems.map((item) => (
 <button
 key={item.href}
 type="button"
 onClick={() => {
 router.push(item.href)
 setSearch("")
 setShowSearchResults(false)
 }}
 className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary flex items-center gap-2.5 transition-colors"
 >
 <item.icon className="w-4 h-4 text-primary shrink-0" />
 <span>{item.name}</span>
 </button>
 ))}
 </div>
 ) : (
 <div className="px-4 py-3 text-xs text-slate-700 font-medium">
 {language === "kh" ? "រកមិនឃើញទំព័រទេ" : "No matching section"}
 </div>
 )}
 </div>
 )}
 </div>
 </div>

 <div className="flex items-center gap-3 lg:gap-4">
 {/* Language Switcher with Flags */}
 <div className="flex items-center bg-slate-50 border border-slate-200 p-0.5 shadow-sm">
 <button
 onClick={() => setLanguage("en")}
 className={`w-8 h-7 flex items-center justify-center transition-all border ${language === "en" ? "bg-white border-slate-200" : "border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
 title="English"
 >
 <img src="/image/gb.png" alt="English" className="w-5 h-auto" />
 </button>
 <button
 onClick={() => setLanguage("kh")}
 className={`w-8 h-7 flex items-center justify-center transition-all border ${language === "kh" ? "bg-white border-slate-200" : "border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100"}`}
 title="Khmer"
 >
 <img src="/image/kh.png" alt="Khmer" className="w-5 h-auto" />
 </button>
 </div>

 {/* Notifications */}
 <div className="relative" ref={notificationRef}>
 <button
 onClick={() => setShowNotifications(!showNotifications)}
 className={`p-1.5 transition-all border ${showNotifications ? 'bg-primary text-white border-primary shadow-sm' : 'text-slate-900 border-transparent hover:border-slate-200 hover:shadow-sm'}`}
 >
 <Bell className="w-4 h-4" />
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 border border-slate-200 rounded-full animate-pulse"></span>
 )}
 </button>

 {/* Notification Dropdown */}
 {showNotifications && (
 <div className="fixed inset-x-4 top-14 lg:absolute lg:right-0 lg:left-auto lg:mt-3 lg:w-80 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-5 duration-200 z-[100]">
 <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-primary text-white">
 <h3 className="font-bold text-white font-medium text-xs">{t("notifications")}</h3>
 <button
 type="button"
 onClick={markAllNotificationsRead}
 className="text-xs font-bold text-blue-100 hover:text-white transition-colors font-medium"
 >
 {t("markAllRead")}
 </button>
 </div>
 <div className="max-h-[350px] overflow-y-auto">
 {notifications.length > 0 ? (
 <div className="divide-y divide-slate-100">
 {notifications.map((note) => {
 const isUnread = note.createdAt && note.createdAt.getTime() > notificationsReadAt
 return (
 <Link
 key={`${note.type}-${note.id}`}
 href={note.type === 'order' ? '/admin/orders' : '/admin/inquiries'}
 onClick={() => setShowNotifications(false)}
 className="p-3.5 hover:bg-slate-50 transition-colors flex gap-3 group"
 >
 <div className={`shrink-0 w-9 h-9 rounded-md ${note.bg} ${note.color} flex items-center justify-center`}>
 <note.icon className="w-4 h-4" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-medium text-slate-900 truncate">{t(note.titleKey || note.title)}</p>
 <p className="text-xs text-slate-800 mt-0.5 line-clamp-2 leading-relaxed">
 {note.type === 'order'
 ? `${t("order")} #${note.orderId} - $${note.amount}`
 : (note.rawMessage?.slice(0, 50) + (note.rawMessage?.length > 50 ? '...' : ''))}
 </p>
 <p className="text-[10px] text-slate-700 mt-1 font-medium">{note.time}</p>
 </div>
 {isUnread && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
 </Link>
 )
 })}
 </div>
 ) : (
 <div className="p-8 text-center">
 <div className="w-12 h-12 bg-slate-50 rounded-md flex items-center justify-center mx-auto mb-3">
 <Bell className="w-6 h-6 text-slate-300" />
 </div>
 <p className="text-xs font-medium text-slate-700">{t("noNewNotifications")}</p>
 </div>
 )}
 </div>
 <Link
 href="/admin/activity"
 onClick={() => setShowNotifications(false)}
 className="block p-4 border-t border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all font-medium"
 >
 {t("viewAllActivity")}
 </Link>
 </div>
 )}
 </div>

 <button
 onClick={() => setShowProfileModal(true)}
 className="flex items-center gap-2.5 p-1 pr-3 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 hover:shadow-sm group"
 >
 <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
 {adminProfileImage ? (
 <img src={getOptimizedImageUrl(adminProfileImage, 'thumb')} alt="Profile" className="w-full h-full object-cover rounded-full" />
 ) : (
 <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase text-sm">
 {adminName.charAt(0)}
 </div>
 )}
 </div>
 <div className="hidden md:block text-left">
 <p className="text-xs font-bold text-slate-900 leading-none uppercase tracking-wider">{adminName}</p>
 <p className="text-[11px] font-medium text-slate-800 mt-0.5 leading-none">
 {isSuperAdmin ? t("superadmin") : isStaff ? (language === "kh" ? "បុគ្គលិក" : "Staff") : t("admin")}
 </p>
 </div>
 <ChevronDown className="w-4 h-4 text-slate-900 hidden md:block group-hover:translate-y-0.5 transition-transform" />
 </button>
 </div>
 </header>

 {/* Content Area */}
 <main className="flex-1 px-5 pt-3 pb-8 sm:px-6 sm:pt-4 lg:px-8 lg:pt-4 lg:pb-10">
 <div className="max-w-7xl mx-auto">
 {children}
 </div>
 </main>
 </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowProfileModal(false)}>
            <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-slate-200 bg-primary text-white">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white leading-snug">{t("myProfile")}</h2>
                    <p className="text-xs font-medium text-blue-100 mt-0.5">{t("updatePhotoAndHistory")}</p>
                  </div>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Profile Image Section */}
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden shadow-xs flex items-center justify-center">
                      {adminProfileImage ? (
                        <img
                          src={getOptimizedImageUrl(adminProfileImage, 'thumb')}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-slate-700" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-primary hover:bg-primary/90 text-white border-2 border-white shadow-sm transition-colors"
                      aria-label="Change photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("fullName")}</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 text-xs sm:text-sm outline-none focus:bg-white focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("backgroundHistory")}</label>
                  <textarea
                    value={adminBio}
                    onChange={(e) => setAdminBio(e.target.value)}
                    placeholder={t("writeBio")}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-500 text-xs sm:text-sm outline-none focus:bg-white focus:border-primary transition-all h-24 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors bg-white"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-60"
                  >
                    {savingProfile ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{t("saveAndClose")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
