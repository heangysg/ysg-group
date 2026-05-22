"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Shield, 
  UserPlus, 
  Pencil, 
  Mail, 
  Lock, 
  User, 
  RefreshCw, 
  AlertCircle, 
  History, 
  Image as ImageIcon, 
  X, 
  CheckCircle2,
  Trash2
} from "lucide-react"
import { createClient } from "../../../lib/supabase/client"
import { useLanguage } from "../../../contexts/LanguageContext"
import toast, { Toaster } from "react-hot-toast"

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("details") // details, history
  const [userHistory, setUserHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { t, language } = useLanguage()

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    isSuperAdmin: false
  })

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (!userStr) {
      router.push("/admin/login")
      return
    }
    const user = JSON.parse(userStr)
    if (!user.isSuperAdmin) {
      router.push("/admin/dashboard")
      return
    }
    setIsSuperAdmin(true)
    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (res.ok) setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const url = "/api/admin/users"
      const method = isEditing ? "PATCH" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        if (isEditing) {
          setUsers(users.map(u => u.id === formData.id ? data.user : u))
          toast.success(t("userUpdated") || "User updated!")
        } else {
          setUsers([data.user, ...users])
          toast.success(t("userCreated") || "User created!")
        }
        setShowModal(false)
      } else {
        setError(data.error || "Failed to save user")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const openAddModal = () => {
    setFormData({ id: "", name: "", email: "", password: "", isSuperAdmin: false })
    setIsEditing(false)
    setActiveTab("details")
    setShowModal(true)
  }

  const openEditModal = async (user: any) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "", 
      isSuperAdmin: user.isSuperAdmin
    })
    setIsEditing(true)
    setActiveTab("details")
    setShowModal(true)
    
    // Fetch history
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/admin/audit?userId=${user.id}`)
      const data = await res.json()
      if (res.ok) setUserHistory(data.logs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setHistoryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Loading Personnel...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight">{t("adminManagement")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("createAndManageAdmins")}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          {t("addNewAdmin")}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest">{t("user")}</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest">{t("emailAddress")}</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest">{t("role")}</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase tracking-widest text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.isSuperAdmin ? "bg-primary" : "bg-emerald-500"}`} />
                      <span className="text-xs font-medium text-slate-600 uppercase tracking-widest">
                        {user.isSuperAdmin ? t("superadmin") : t("admin")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-medium text-slate-900">{isEditing ? t("manageAdminProfile") : t("addNewAdmin")}</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {isEditing ? t("updateCredentialsProfile") : t("createCredentialsNewAdmin")}
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              {isEditing && (
                <div className="flex gap-6 mt-8">
                  {[
                    { id: "details", label: t("details"), icon: User },
                    { id: "history", label: t("backgroundHistory"), icon: History }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 pb-4 text-sm font-medium transition-all relative ${
                        activeTab === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar max-h-[60vh]">
              {activeTab === "details" ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">{t("fullName")}</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">{t("emailAddress")}</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest ml-1">
                        {t("password")} {isEditing && <span className="text-[8px] opacity-60 italic">{t("leaveBlankToKeep")}</span>}
                      </label>
                      <input
                        type="password"
                        required={!isEditing}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-900"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isSuperAdmin: !formData.isSuperAdmin })}
                        className={`w-14 h-8 rounded-full transition-all relative ${formData.isSuperAdmin ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-200"}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${formData.isSuperAdmin ? "left-7" : "left-1"}`} />
                      </button>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-900">{t("makeSuperadmin")}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{t("grantsFullAccess")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-all"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-4 px-6 rounded-2xl bg-primary text-white font-medium text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      {isEditing ? t("saveChanges") : t("addNewAdmin")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {historyLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Fetching Personnel Logs...</p>
                    </div>
                  ) : userHistory.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm text-slate-400 italic font-medium">{t("noActivityFound")}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userHistory.map((log, idx) => (
                        <div key={idx} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-medium px-3 py-1 rounded-lg uppercase tracking-widest ${
                              log.action === 'login' ? 'bg-blue-50 text-blue-600' :
                              log.action === 'create' ? 'bg-emerald-50 text-emerald-600' :
                              log.action === 'delete' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {log.action}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(log.created_at || log.time).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{log.details?.name || log.entity_type || log.entityType}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">{log.details?.reason || log.details?.details || ""}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
