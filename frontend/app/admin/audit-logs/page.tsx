"use client"

import { useEffect, useState } from "react"
import { History, User, Package, FolderOpen, Mail, Settings, Trash2, Edit, Plus } from "lucide-react"
import { useLanguage } from "../../../contexts/LanguageContext"

interface AuditLog {
  id: string
  user_email: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  created_at: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { t } = useLanguage()

  useEffect(() => {
    setCurrentPage(1)
    fetchLogs(1)
  }, [filter])

  useEffect(() => {
    fetchLogs(currentPage)
  }, [currentPage])

  async function fetchLogs(page: number) {
    setLoading(true)
    const pageSize = 10
    const start = (page - 1) * pageSize

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem("ysg_admin_token")
      
      const requestBody: any = {
        table: "audit_logs",
        order: { column: "created_at", ascending: false },
        limit: pageSize,
        offset: start,
        countExact: true
      }

      if (filter !== "all") {
        requestBody.eq = { entity_type: filter }
      }

      const res = await fetch(`${API_URL}/api/admin/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(requestBody)
      })

      const result = await res.json()
      
      if (res.ok) {
        setLogs(result.data || [])
        if (result.count !== null && result.count !== undefined) {
          setTotalPages(Math.ceil(result.count / pageSize) || 1)
        }
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes("create") || action.includes("add")) return <Plus className="w-4 h-4 text-green-600" />
    if (action.includes("update") || action.includes("edit")) return <Edit className="w-4 h-4 text-blue-600" />
    if (action.includes("delete")) return <Trash2 className="w-4 h-4 text-red-600" />
    return <History className="w-4 h-4 text-gray-600" />
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "product": return <Package className="w-4 h-4" />
      case "category": return <FolderOpen className="w-4 h-4" />
      case "inquiry": return <Mail className="w-4 h-4" />
      case "setting": return <Settings className="w-4 h-4" />
      default: return <History className="w-4 h-4" />
    }
  }

  const filteredLogs = logs

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{t("auditLogs")}</h1>
        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{t("trackActivities")}</p>
      </div>

      {/* Filters */}
      {/* Filters */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-5 py-3 border-2 border-slate-900 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            filter === "all" ? "bg-primary text-slate-900 translate-y-1 translate-x-1" : "bg-white text-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
          }`}
        >
          {t("allActivities")}
        </button>
        <button
          onClick={() => setFilter("product")}
          className={`px-5 py-3 border-2 border-slate-900 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            filter === "product" ? "bg-primary text-slate-900 translate-y-1 translate-x-1" : "bg-white text-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
          }`}
        >
          <Package className="w-4 h-4" />
          {t("products")}
        </button>
        <button
          onClick={() => setFilter("category")}
          className={`px-5 py-3 border-2 border-slate-900 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            filter === "category" ? "bg-primary text-slate-900 translate-y-1 translate-x-1" : "bg-white text-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          {t("categories")}
        </button>
        <button
          onClick={() => setFilter("inquiry")}
          className={`px-5 py-3 border-2 border-slate-900 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
            filter === "inquiry" ? "bg-primary text-slate-900 translate-y-1 translate-x-1" : "bg-white text-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
          }`}
        >
          <Mail className="w-4 h-4" />
          {t("inquiries")}
        </button>
      </div>

      {/* Logs Table */}
      <div className="solid-card bg-white p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary border-b-2 border-slate-900">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("user")}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("action")}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">Entity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("details")}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest">{t("date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-900">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">{t("loading")}</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">{t("noActivityFound")}</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-primary/5 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-900" />
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{log.user_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getActionIcon(log.action)}
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getEntityIcon(log.entity_type)}
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{log.entity_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {log.details?.name || log.entity_id?.slice(0, 8) || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t-2 border-slate-900 bg-slate-50 flex items-center justify-between">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border-2 border-slate-900 font-bold text-xs uppercase tracking-widest shadow-hard hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {t("previous") || "Previous"}
            </button>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border-2 border-slate-900 font-bold text-xs uppercase tracking-widest shadow-hard hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {t("next") || "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
