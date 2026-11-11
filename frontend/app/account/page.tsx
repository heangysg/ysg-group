"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PublicLayout from "../../components/PublicLayout"
import { useLanguage } from "../../contexts/LanguageContext"
import { createClient } from "../../lib/supabase/client"
import { getOptimizedImageUrl } from "../../lib/imageUtils"
import {
  User,
  Package,
  CreditCard,
  Shield,
  CheckCircle2,
  LogOut,
  ChevronRight,
  Settings,
  Lock,
  Phone,
  Mail,
  Printer,
  ShoppingBag,
  Calendar,
  AlertCircle,
} from "lucide-react"

const formatUsd = (val: unknown) =>
  `$${(Number(val) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const parseOrderItems = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function AccountPage() {
  const supabase = createClient()
  const { t, language } = useLanguage()
  const isKh = language === "kh"
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const navRef = useRef<HTMLDivElement>(null)

  const [orders, setOrders] = useState<any[]>([])
  const [fetchingOrders, setFetchingOrders] = useState(false)

  // Profile update state
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
  })
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState({ type: "", text: "" })

  // Security update state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" })

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setTimeout(() => {
      const nav = navRef.current
      const activeBtn = nav?.querySelector(`[data-tab="${tabId}"]`) as HTMLElement
      if (nav && activeBtn) {
        const navCenter = nav.offsetWidth / 2
        const btnCenter = activeBtn.offsetLeft + activeBtn.offsetWidth / 2
        nav.scrollTo({ left: btnCenter - navCenter, behavior: "smooth" })
      }
    }, 30)
  }

  useEffect(() => {
    async function getUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/login")
          return
        }
        setUser(session.user)
        setProfileData({
          fullName: session.user.user_metadata?.full_name || "",
          phone: session.user.user_metadata?.phone || "",
        })

        setFetchingOrders(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const email = session.user.email || ""
        const phone = session.user.user_metadata?.phone || ""
        const userId = session.user.id || ""

        const res = await fetch(
          `${API_URL}/api/orders/user/find?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&userId=${encodeURIComponent(userId)}`
        )
        if (res.ok) {
          const data = await res.json()
          const normalized = (data.data || []).map((o: any) => ({
            ...o,
            items: parseOrderItems(o.items),
          }))
          setOrders(normalized)
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
          full_name: profileData.fullName.trim(),
          phone: profileData.phone.trim(),
        },
      })

      if (error) throw error

      setUser({
        ...user,
        user_metadata: {
          ...user.user_metadata,
          full_name: profileData.fullName.trim(),
          phone: profileData.phone.trim(),
        },
      })
      setUpdateMsg({
        type: "success",
        text: isKh
          ? "បានរក្សាទុកព័ត៌មានប្រវត្តិរូបដោយជោគជ័យ!"
          : "Profile updated successfully!",
      })
    } catch (err: any) {
      setUpdateMsg({
        type: "error",
        text: err.message || "Failed to update profile",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: isKh
          ? "ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៦ តួអក្សរ!"
          : "Password must be at least 6 characters.",
      })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: isKh ? "ពាក្យសម្ងាត់មិនត្រូវគ្នាទេ!" : "Passwords do not match!",
      })
      return
    }

    setUpdatingPassword(true)
    setPasswordMsg({ type: "", text: "" })

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setPasswordMsg({
        type: "success",
        text: isKh
          ? "បានផ្លាស់ប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!"
          : "Password changed successfully!",
      })
      setPasswordData({ newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      setPasswordMsg({
        type: "error",
        text: err.message || "Failed to update password",
      })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "COMPLETED":
        return {
          pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: isKh ? "បានទូទាត់" : "Paid",
        }
      case "CONFIRMED":
        return {
          pill: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          label: isKh ? "បានបញ្ជាក់" : "Confirmed",
        }
      case "PENDING":
        return {
          pill: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: isKh ? "រង់ចាំទូទាត់" : "Pending",
        }
      case "CANCELLED":
        return {
          pill: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          label: isKh ? "បានបោះបង់" : "Cancelled",
        }
      default:
        return {
          pill: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          label: status || (isKh ? "កំពុងដំណើរការ" : "Processing"),
        }
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50/60 gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-[3px] border-slate-200 border-t-[#004691]" />
          <p className="text-xs font-medium text-slate-500">
            {isKh ? "កំពុងផ្ទុកគណនីរបស់អ្នក..." : "Loading your account..."}
          </p>
        </div>
      </PublicLayout>
    )
  }

  const menuItems = [
    {
      id: "overview",
      label: isKh ? "ទិដ្ឋភាពទូទៅ" : "Overview",
      icon: User,
    },
    {
      id: "orders",
      label: t("orderHistory"),
      icon: Package,
      count: orders.length,
    },
    {
      id: "profile",
      label: isKh ? "ព័ត៌មានប្រវត្តិរូប" : "Profile",
      icon: Settings,
    },
    {
      id: "security",
      label: isKh ? "សុវត្ថិភាព" : "Security",
      icon: Lock,
    },
  ]

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const displayName = user?.user_metadata?.full_name || t("memberUser")
  const initial = displayName
    ? String(displayName).charAt(0).toUpperCase()
    : user?.email
    ? String(user.email).charAt(0).toUpperCase()
    : "U"

  const paidTotal = orders
    .filter((o) =>
      ["paid", "completed", "confirmed", "shipped", "delivered"].includes(
        String(o.status || "").toLowerCase()
      )
    )
    .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0)

  const totalSpentAll =
    paidTotal > 0
      ? paidTotal
      : orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0)

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(isKh ? "en-GB" : "en-US", {
        month: "short",
        year: "numeric",
      })
    : "—"

  return (
    <PublicLayout>
      <main className="min-h-screen bg-slate-50/70 pb-24 pt-5 md:pt-8 font-sans">
        <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-[#004691] transition-colors">
              {t("home")}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">
              {isKh ? "គណនីរបស់ខ្ញុំ" : "My Account"}
            </span>
          </div>

          {/* Clean Profile Header Card */}
          <section className="relative bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            {/* Banner */}
            <div className="h-24 sm:h-28 bg-gradient-to-r from-[#004691] via-[#0a5bb5] to-[#1a73d9] rounded-t-2xl" />

            {/* Profile info row */}
            <div className="px-5 sm:px-7 pb-5 sm:pb-6">
              {/* Avatar — pulled up to overlap the banner */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
                {/* Left: avatar + name stacked nicely */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-0 sm:gap-4 min-w-0">
                  {/* Avatar circle */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#004691] text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg ring-4 ring-white overflow-hidden shrink-0 relative z-10 -mt-12 sm:-mt-14">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>

                  {/* Name + email — flows naturally below avatar on mobile */}
                  <div className="min-w-0 mt-3 sm:mt-0 sm:pb-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                        {displayName}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#004691] border border-blue-200/80 text-[11px] font-semibold whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3" />
                        {isKh ? "បានផ្ទៀងផ្ទាត់" : "Verified"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 break-all sm:break-normal sm:truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Logout button — bottom-right on desktop, below on mobile */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-sm shrink-0 self-start sm:self-end cursor-pointer w-fit"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("logout")}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Main Grid: Sidebar + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Navigation */}
            <aside className="lg:col-span-3 lg:sticky lg:top-24">
              {/* Mobile Pill Tabs */}
              <nav
                ref={navRef}
                className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 pb-1"
              >
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      data-tab={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#004691] text-white shadow-xs"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                      {typeof item.count === "number" && item.count > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </nav>

              {/* Desktop Sidebar Card */}
              <nav className="hidden lg:flex flex-col gap-1 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#004691] text-white shadow-xs"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-white" : "text-slate-400"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {typeof item.count === "number" && item.count > 0 ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.count}
                        </span>
                      ) : (
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? "text-white/80" : "text-slate-300"
                          }`}
                        />
                      )}
                    </button>
                  )
                })}
              </nav>
            </aside>

            {/* Tab Content Area */}
            <div className="lg:col-span-9 min-w-0">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* 3 Clean Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 text-[#004691] flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500">
                          {isKh ? "ចំណាយសរុប" : "Total Spent"}
                        </p>
                        <p className="text-base sm:text-xl font-bold text-slate-900 tabular-nums truncate mt-0.5">
                          {formatUsd(totalSpentAll)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500">
                          {isKh ? "ការបញ្ជាទិញ" : "Total Orders"}
                        </p>
                        <p className="text-base sm:text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                          {orders.length}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-medium text-slate-500">
                          {isKh ? "សមាជិកតាំងពី" : "Member Since"}
                        </p>
                        <p className="text-base sm:text-xl font-bold text-slate-900 tabular-nums truncate mt-0.5">
                          {memberSince}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders Card */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900">
                        {isKh ? "ការបញ្ជាទិញថ្មីៗ" : "Recent Orders"}
                      </h2>
                      {orders.length > 0 && (
                        <button
                          onClick={() => setActiveTab("orders")}
                          className="text-xs font-semibold text-[#004691] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          {isKh ? "មើលទាំងអស់" : "View All"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {orders.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {orders.slice(0, 4).map((order) => {
                          const st = getStatusStyle(order.status)
                          const itemCount = Array.isArray(order.items)
                            ? order.items.reduce(
                                (sum: number, i: any) =>
                                  sum + (Number(i?.quantity) || 1),
                                0
                              )
                            : 0

                          return (
                            <Link
                              key={order.id}
                              href={`/orders/${order.id}`}
                              className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors group"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#004691] flex items-center justify-center shrink-0 transition-colors">
                                  <Package className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-900 font-mono">
                                      #{String(order.id).slice(0, 8)}
                                    </p>
                                    {itemCount > 0 && (
                                      <span className="text-[11px] text-slate-400 font-medium">
                                        • {itemCount}{" "}
                                        {isKh ? "មុខ" : itemCount === 1 ? "item" : "items"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <div className="text-right hidden sm:block">
                                  <p className="text-sm font-bold text-slate-900 tabular-nums">
                                    {formatUsd(order.totalAmount)}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${st.pill}`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                                  />
                                  {st.label}
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#004691] transition-colors" />
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-10 text-center flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          {t("noRecentActivity")}
                        </p>
                        <Link
                          href="/products"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004691] hover:bg-[#003570] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                        >
                          {isKh ? "រកមើលផលិតផល" : "Browse Products"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order History Tab */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  {fetchingOrders ? (
                    <div className="bg-white p-16 flex items-center justify-center rounded-2xl border border-slate-200/80">
                      <div className="animate-spin rounded-full h-9 w-9 border-[3px] border-slate-200 border-t-[#004691]" />
                    </div>
                  ) : orders.length > 0 ? (
                    orders.map((order) => {
                      const st = getStatusStyle(order.status)
                      return (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
                        >
                          {/* Order Card Header */}
                          <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#004691] flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 font-mono">
                                  #{String(order.id).slice(0, 8)}
                                </h3>
                                <p className="text-xs text-slate-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${st.pill}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                              />
                              {st.label}
                            </span>
                          </div>

                          {/* Order Items */}
                          <div className="divide-y divide-slate-100 px-5">
                            {order.items?.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="py-3.5 flex items-center gap-3.5"
                              >
                                <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200/70 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                                  {item.image ? (
                                    <img
                                      src={getOptimizedImageUrl(item.image, "thumb")}
                                      alt={item.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <Package className="w-5 h-5 text-slate-300" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                    {isKh && item.nameKhmer
                                      ? item.nameKhmer
                                      : item.name}
                                  </p>
                                  <p className="text-xs text-slate-500 tabular-nums mt-0.5">
                                    {formatUsd(item.price)} × {item.quantity}
                                  </p>
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums shrink-0 ml-auto pl-2">
                                  {formatUsd(
                                    (Number(item.price) || 0) *
                                      (Number(item.quantity) || 1)
                                  )}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Order Card Footer */}
                          <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] font-medium text-slate-500">
                                {isKh ? "តម្លៃសរុប" : "Total Amount"}
                              </p>
                              <p className="text-base sm:text-lg font-bold text-[#004691] tabular-nums">
                                {formatUsd(order.totalAmount)}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/orders/${order.id}/invoice`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>{isKh ? "វិក្កយបត្រ" : "Receipt"}</span>
                              </Link>
                              <Link
                                href={`/orders/${order.id}`}
                                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#004691] hover:bg-[#003570] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
                              >
                                <span>{isKh ? "មើលលម្អិត" : "Details"}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="bg-white p-14 flex flex-col items-center text-center rounded-2xl border border-slate-200/80 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Package className="w-7 h-7" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        {t("noRecentActivity")}
                      </p>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004691] hover:bg-[#003570] text-white text-xs font-semibold rounded-xl transition-all"
                      >
                        {isKh ? "រកមើលផលិតផល" : "Browse Products"}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Settings Tab */}
              {activeTab === "profile" && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {isKh ? "ព័ត៌មានប្រវត្តិរូប" : "Profile Settings"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      {isKh
                        ? "គ្រប់គ្រងឈ្មោះ និងលេខទូរស័ព្ទទំនាក់ទំនងរបស់អ្នក"
                        : "Manage your name and contact phone number"}
                    </p>
                  </div>

                  {updateMsg.text && (
                    <div
                      className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border ${
                        updateMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {updateMsg.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{updateMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          {t("fullName")}
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={profileData.fullName}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                fullName: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/10 outline-none transition-all text-slate-900 text-sm font-medium"
                            placeholder={isKh ? "ឈ្មោះរបស់អ្នក" : "Your Name"}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          {isKh ? "លេខទូរស័ព្ទ" : "Phone Number"}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/10 outline-none transition-all text-slate-900 text-sm font-medium"
                            placeholder="012 345 678"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-700 block">
                          {t("emailAddress")}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            disabled
                            value={user?.email || ""}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-sm cursor-not-allowed font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={updating}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#004691] hover:bg-[#003570] text-white font-semibold text-sm rounded-xl transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
                      >
                        {updating ? t("updating") : t("saveChanges")}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Account Security Tab */}
              {activeTab === "security" && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {isKh ? "សុវត្ថិភាពគណនី" : "Account Security"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      {isKh
                        ? "ប្តូរពាក្យសម្ងាត់ថ្មីសម្រាប់គណនីរបស់អ្នក"
                        : "Update your password to keep your account secure"}
                    </p>
                  </div>

                  {passwordMsg.text && (
                    <div
                      className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border ${
                        passwordMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {passwordMsg.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      )}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          {t("newPassword")}
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/10 outline-none transition-all text-slate-900 text-sm font-medium"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
                          {t("confirmPassword")}
                        </label>
                        <div className="relative">
                          <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004691] focus:ring-2 focus:ring-[#004691]/10 outline-none transition-all text-slate-900 text-sm font-medium"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#004691] hover:bg-[#003570] text-white font-semibold text-sm rounded-xl transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer"
                      >
                        {updatingPassword ? t("updating") : t("updatePassword")}
                      </button>
                    </div>
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
