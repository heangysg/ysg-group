"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../../lib/supabase/client"
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
  const { t } = useLanguage()

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    const supabase = createClient()
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)
    
    setLogs(data || [])
    setLoading(false)
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

  const filteredLogs = filter === "all" ? logs : logs.filter(log => log.entity_type === filter)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("auditLogs")}</h1>
        <p className="text-sm text-gray-600 mt-1">{t("trackActivities")}</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {t("allActivities")}
        </button>
        <button
          onClick={() => setFilter("product")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            filter === "product" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Package className="w-4 h-4" />
          {t("products")}
        </button>
        <button
          onClick={() => setFilter("category")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            filter === "category" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          {t("categories")}
        </button>
        <button
          onClick={() => setFilter("inquiry")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
            filter === "inquiry" ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <Mail className="w-4 h-4" />
          {t("inquiries")}
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("user")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("action")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("details")}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t("date")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t("loading")}</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t("noActivityFound")}</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{log.user_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm text-gray-700 capitalize">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entity_type)}
                        <span className="text-sm text-gray-700 capitalize">{log.entity_type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {log.details?.name || log.entity_id?.slice(0, 8) || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
