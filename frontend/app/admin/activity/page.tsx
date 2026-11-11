"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  Mail,
  Clock,
  ArrowLeft,
  ShoppingBag,
  Search,
  RefreshCw,
  X,
  ArrowUpRight,
  FileText,
  Activity
} from "lucide-react"
import { useLanguage } from "../../../contexts/LanguageContext"
import {
  getAdminHeaders,
  formatUsd,
  getOrderStatusBadgeClass,
  getOrderStatusLabel
} from "../../../lib/adminAnalytics"

type ActivityTab = "all" | "order" | "inquiry"

interface ActivityItem {
  id: string
  type: "order" | "inquiry"
  customer: string
  contact?: string
  summary: string
  amount?: number
  status?: string
  paymentMethod?: string
  createdAt: string
}

const PAGE_SIZE = 12
let _cachedActivities: ActivityItem[] = []

export default function ActivityPage() {
  const { t, language } = useLanguage()
  const isKh = language === "kh"

  const [activities, setActivities] = useState<ActivityItem[]>(_cachedActivities)
  const [loading, setLoading] = useState(_cachedActivities.length === 0)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<ActivityTab>("all")
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const fetchActivities = useCallback(async (background = false) => {
    if (background) setRefreshing(true)
    else setLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const headers = getAdminHeaders()

      const [inquiriesRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/read`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            table: "Inquiry",
            select: "id,customerName,customerPhone,email,companyName,message,status,createdAt",
            order: { column: "createdAt", ascending: false },
            limit: 40,
          }),
        }).then((r) => (r.ok ? r.json() : { data: [] })),
        fetch(`${API_URL}/api/admin/read`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            table: "Order",
            select: "id,customerName,customerPhone,customerEmail,totalAmount,status,paymentMethod,createdAt",
            order: { column: "createdAt", ascending: false },
            limit: 40,
          }),
        }).then((r) => (r.ok ? r.json() : { data: [] })),
      ])

      const combined: ActivityItem[] = []

      for (const item of inquiriesRes?.data || []) {
        if (!item?.createdAt) continue
        combined.push({
          id: `inq-${item.id}`,
          type: "inquiry",
          customer: item.customerName || item.companyName || item.email || (isKh ? "អតិថិជនទូទៅ" : "Customer"),
          contact: item.customerPhone || item.email || "",
          summary: String(item.message || "").trim(),
          status: item.status || "new",
          createdAt: item.createdAt,
        })
      }

      for (const item of ordersRes?.data || []) {
        if (!item?.createdAt) continue
        combined.push({
          id: String(item.id),
          type: "order",
          customer: item.customerName || item.customerEmail || (isKh ? "អតិថិជនទូទៅ" : "Customer"),
          contact: item.customerPhone || item.customerEmail || "",
          summary: `#${String(item.id).toUpperCase()}`,
          amount: Number(item.totalAmount) || 0,
          status: item.status || "pending",
          paymentMethod: item.paymentMethod || "",
          createdAt: item.createdAt,
        })
      }

      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      _cachedActivities = combined
      setActivities(combined)
    } catch (err) {
      console.error("Activity Fetch Error:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [isKh])

  useEffect(() => {
    fetchActivities(_cachedActivities.length > 0)
  }, [fetchActivities])

  const counts = useMemo(() => {
    let orders = 0
    let inquiries = 0
    for (const a of activities) {
      if (a.type === "order") orders++
      else inquiries++
    }
    return { total: activities.length, orders, inquiries }
  }, [activities])

  const filteredActivities = useMemo(() => {
    const q = search.trim().toLowerCase()
    return activities.filter((a) => {
      if (tab !== "all" && a.type !== tab) return false
      if (!q) return true
      return (
        a.customer.toLowerCase().includes(q) ||
        (a.contact || "").toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      )
    })
  }, [activities, tab, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [tab, search])

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedActivities = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredActivities.slice(start, start + PAGE_SIZE)
  }, [filteredActivities, safePage])

  const formatTimestamp = (iso: string) =>
    new Date(iso).toLocaleString(isKh ? "km-KH" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const renderStatusPill = (item: ActivityItem) => {
    if (item.type === "order") {
      return (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getOrderStatusBadgeClass(item.status || "pending")}`}>
          {getOrderStatusLabel(item.status || "pending", isKh, t)}
        </span>
      )
    }

    const replied = String(item.status || "").toLowerCase() === "replied"
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
          replied
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-purple-50 text-purple-700 border-purple-200"
        }`}
      >
        {replied ? (isKh ? "បានឆ្លើយតប" : "Replied") : (isKh ? "សារថ្មី" : "New")}
      </span>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/dashboard"
            className="p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:text-primary hover:border-primary transition-all shadow-sm shrink-0"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-primary hidden sm:inline" />
              <span>{t("viewAllActivity") || (isKh ? "សកម្មភាពទាំងអស់" : "All Activity")}</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5">
              {isKh
                ? "តាមដានការបញ្ជាទិញ និងសារទំនាក់ទំនងថ្មីៗពីអតិថិជន"
                : "Recent customer orders and product inquiries in one place"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchActivities(true)}
          disabled={refreshing}
          className="self-start sm:self-auto px-4 py-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
          <span>{isKh ? "ផ្ទុកឡើងវិញ" : "Refresh"}</span>
        </button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {isKh ? "សរុប" : "Total Events"}
          </p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tabular-nums">{counts.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            {isKh ? "ការបញ្ជាទិញ" : "Orders"}
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 tabular-nums">{counts.orders}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
            {isKh ? "សារសាកសួរ" : "Inquiries"}
          </p>
          <p className="text-xl sm:text-2xl font-black text-purple-600 mt-1 tabular-nums">{counts.inquiries}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col lg:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {[
            { id: "all" as ActivityTab, label: isKh ? `ទាំងអស់ (${counts.total})` : `All (${counts.total})` },
            { id: "order" as ActivityTab, label: isKh ? `ការបញ្ជាទិញ (${counts.orders})` : `Orders (${counts.orders})` },
            { id: "inquiry" as ActivityTab, label: isKh ? `សារសាកសួរ (${counts.inquiries})` : `Inquiries (${counts.inquiries})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                tab === item.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isKh ? "ស្វែងរកតាម ឈ្មោះ លេខកូដ ឬសារ..." : "Search name, order ID, or message..."}
            className="w-full h-10 pl-10 pr-9 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none text-xs sm:text-sm font-medium text-slate-900"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-red-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Activity Feed Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="w-9 h-9 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-3" />
            <p className="text-slate-600 font-bold text-xs">{t("loading")}</p>
          </div>
        ) : paginatedActivities.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {paginatedActivities.map((activity) => {
              const isOrder = activity.type === "order"
              return (
                <div
                  key={activity.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                        isOrder
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-purple-50 text-purple-600 border-purple-200"
                      }`}
                    >
                      {isOrder ? <ShoppingBag className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {activity.customer}
                        </span>
                        {renderStatusPill(activity)}
                        {isOrder && activity.amount !== undefined && (
                          <span className="text-xs font-black text-primary tabular-nums">
                            {formatUsd(activity.amount, 2)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {isOrder
                          ? `${isKh ? "ការបញ្ជាទិញ" : "Order"} ${activity.summary}${
                              activity.paymentMethod ? ` • ${activity.paymentMethod}` : ""
                            }`
                          : activity.summary || (isKh ? "បានផ្ញើសារទំនាក់ទំនង" : "Sent an inquiry")}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 pt-0.5">
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTimestamp(activity.createdAt)}
                        </span>
                        {activity.contact && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="truncate max-w-[240px]">{activity.contact}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 sm:pl-2">
                    {isOrder && (
                      <Link
                        href={`/orders/${activity.id}/invoice`}
                        target="_blank"
                        className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:border-primary hover:text-primary transition-all inline-flex items-center gap-1.5"
                        title={isKh ? "វិក្កយបត្រ" : "Invoice"}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{isKh ? "វិក្កយបត្រ" : "Invoice"}</span>
                      </Link>
                    )}
                    <Link
                      href={isOrder ? "/admin/orders" : "/admin/inquiries"}
                      className="px-3.5 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-bold text-xs hover:bg-primary hover:text-white hover:border-primary transition-all inline-flex items-center gap-1.5"
                    >
                      <span>{isOrder ? (isKh ? "មើលការបញ្ជាទិញ" : "Orders") : (isKh ? "មើលសារ" : "Inquiries")}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              {t("noActivityFound") || (isKh ? "រកមិនឃើញសកម្មភាពទេ" : "No activity found")}
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              {isKh ? "មិនមានទិន្នន័យត្រូវនឹងការស្វែងរករបស់អ្នកទេ។" : "Try adjusting your filter or search query."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-600 tabular-nums">
              {isKh
                ? `បង្ហាញ ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredActivities.length)} នៃ ${filteredActivities.length}`
                : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filteredActivities.length)} of ${filteredActivities.length}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-100 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isKh ? "មុន" : "Previous"}
              </button>
              <span className="text-xs font-bold text-slate-700 px-2 tabular-nums">
                {isKh ? `ទំព័រ ${safePage} នៃ ${totalPages}` : `Page ${safePage} of ${totalPages}`}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-100 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isKh ? "បន្ទាប់" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
