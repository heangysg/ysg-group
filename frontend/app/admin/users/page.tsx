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
import { useLanguage } from "../../../contexts/LanguageContext"
import toast, { Toaster } from "react-hot-toast"
import Portal from "../../../components/Portal"

export default function UsersManagementPage() {
 const [users, setUsers] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [isSuperAdmin, setIsSuperAdmin] = useState(false)
 const [showModal, setShowModal] = useState(false)
 const [isEditing, setIsEditing] = useState(false)
 const [activeTab, setActiveTab] = useState("details")
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
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
 const token = localStorage.getItem("ysg_admin_token")
 const res = await fetch(`${API_URL}/api/admin/users`, {
 headers: {
 "Authorization": `Bearer ${token}`
 }
 })
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
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
 const url = `${API_URL}/api/admin/users`
 const method = isEditing ? "PATCH" : "POST"
 
 const token = localStorage.getItem("ysg_admin_token")
 const res = await fetch(url, {
 method,
 headers: { 
 "Content-Type": "application/json",
 "Authorization": `Bearer ${token}`
 },
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
 
 setHistoryLoading(true)
 try {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
 const token = localStorage.getItem("ysg_admin_token");
 const res = await fetch(`${API_URL}/api/admin/audit?userId=${user.id}`, {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 });
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
 <p className="text-slate-400 font-medium text-xs font-medium">Loading Personnel...</p>
 </div>
 )
 }

 return (
 <div className="space-y-6 animate-in fade-in duration-500">
 
 <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <h2 className="text-2xl font-bold uppercase text-slate-900">{t("adminManagement")}</h2>
 <p className="text-sm font-medium text-slate-500 mt-2">{t("createAndManageAdmins")}</p>
 </div>
 <button
 onClick={openAddModal}
 className="btn-primary px-6 py-3 flex items-center gap-2 text-xs"
 >
 <UserPlus className="w-4 h-4" />
 {t("addNewAdmin")}
 </button>
 </div>

 <div className="solid-card bg-white p-0 overflow-hidden flex flex-col">
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-primary text-white border-b border-slate-200">
 <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("user")}</th>
 <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("emailAddress")}</th>
 <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("role")}</th>
 <th className="px-6 py-4 text-xs font-bold text-white font-medium text-right">{t("actions")}</th>
 </tr>
 </thead>
 <tbody className="divide-y-2 divide-slate-900">
 {users.map((user) => (
 <tr key={user.id} className="group hover:bg-primary/5 transition-all">
 <td className="px-6 py-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
 {user.image ? (
 <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
 ) : (
 <User className="w-5 h-5 text-slate-900" />
 )}
 </div>
 <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">{user.name}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="text-xs font-bold text-slate-900 font-medium">{user.email}</span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 border border-slate-200 shadow-sm ${user.isSuperAdmin ? "bg-primary" : "bg-emerald-500"}`} />
 <span className="text-xs font-bold text-slate-900 font-medium">
 {user.isSuperAdmin ? t("superadmin") : t("admin")}
 </span>
 </div>
 </td>
 <td className="px-6 py-4 text-right">
 <button 
 onClick={() => openEditModal(user)}
 className="p-2 bg-white text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
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
 <Portal>
 <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
 <div className="solid-card bg-white w-full max-w-2xl overflow-hidden p-0 flex flex-col animate-in zoom-in-95 duration-200">
 {/* Header */}
 <div className="p-5 border-b border-slate-200 bg-primary text-white">
 <div className="flex justify-between items-start">
 <div>
 <h2 className="text-2xl font-bold text-white font-medium">{isEditing ? t("manageAdminProfile") : t("addNewAdmin")}</h2>
 <p className="text-xs font-bold text-white mt-2 font-medium">
 {isEditing ? t("updateCredentialsProfile") : t("createCredentialsNewAdmin")}
 </p>
 </div>
 <button 
 onClick={() => setShowModal(false)} 
 className="p-3 bg-white text-slate-900 border border-slate-200 shadow-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Tabs */}
 {isEditing && (
 <div className="flex gap-5 mt-8">
 {[
 { id: "details", label: t("details"), icon: User },
 { id: "history", label: t("backgroundHistory"), icon: History }
 ].map(tab => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 pb-4 text-xs font-bold font-medium transition-all relative ${
 activeTab === tab.id ? "text-slate-900" : "text-slate-900/60 hover:text-slate-900"
 }`}
 >
 <tab.icon className="w-4 h-4" />
 {tab.label}
 {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900" />}
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Body */}
 <div className="p-5 overflow-y-auto custom-scrollbar max-h-[60vh]">
 {activeTab === "details" ? (
 <form onSubmit={handleSubmit} className="space-y-6">
 {error && (
 <div className="p-4 bg-red-50 border-2 border-red-900 shadow-sm flex items-center gap-3 text-red-900 text-xs font-bold font-medium">
 <AlertCircle className="w-5 h-5" />
 {error}
 </div>
 )}
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-900 font-medium ml-1">{t("fullName")}</label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 font-medium"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-900 font-medium ml-1">{t("emailAddress")}</label>
 <input
 type="email"
 required
 value={formData.email}
 onChange={e => setFormData({ ...formData, email: e.target.value })}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 font-medium"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-bold text-slate-900 font-medium ml-1">
 {t("password")} {isEditing && <span className="text-[8px] opacity-60 italic">{t("leaveBlankToKeep")}</span>}
 </label>
 <input
 type="password"
 required={!isEditing}
 value={formData.password}
 onChange={e => setFormData({ ...formData, password: e.target.value })}
 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 font-medium"
 />
 </div>
 </div>

 <div className="pt-8 flex gap-6 border-t border-slate-200">
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="flex-1 py-4 px-6 bg-white border border-slate-200 text-slate-900 font-bold text-xs font-medium hover:bg-slate-50 hover:shadow-sm transition-all"
 >
 {t("cancel")}
 </button>
 <button
 type="submit"
 disabled={saving}
 className="flex-1 btn-primary py-4 px-6 flex items-center justify-center gap-3 text-xs"
 >
 {saving ? <div className="w-5 h-5 border border-slate-200 border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
 {isEditing ? t("saveChanges") : t("addNewAdmin")}
 </button>
 </div>
 </form>
 ) : (
 <div className="space-y-6 animate-in fade-in duration-500">
 {historyLoading ? (
 <div className="py-16 flex flex-col items-center justify-center">
 <div className="w-10 h-10 border-4 border-slate-200 border-t-transparent rounded-full animate-spin mb-6" />
 <p className="text-xs font-bold text-slate-500 font-medium">Fetching Personnel Logs...</p>
 </div>
 ) : userHistory.length === 0 ? (
 <div className="solid-card bg-white p-16 text-center border border-slate-200 border-dashed">
 <History className="w-12 h-12 text-slate-400 mx-auto mb-6" />
 <p className="text-xs font-bold text-slate-500 font-medium">{t("noActivityFound")}</p>
 </div>
 ) : (
 <div className="space-y-6">
 {userHistory.map((log, idx) => (
 <div key={idx} className="p-6 bg-white border border-slate-200 shadow-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all group">
 <div className="flex items-center justify-between mb-4">
 <span className={`text-xs font-bold px-3 py-1.5 border-2 shadow-sm font-medium ${
 log.action === 'login' ? 'bg-blue-50 text-blue-900 border-blue-900' :
 log.action === 'create' ? 'bg-emerald-50 text-emerald-900 border-emerald-900' :
 log.action === 'delete' ? 'bg-red-50 text-red-900 border-red-900' : 'bg-amber-50 text-amber-900 border-amber-900'
 }`}>
 {log.action}
 </span>
 <span className="text-xs text-slate-500 font-bold font-medium">
 {new Date(log.created_at || log.time).toLocaleString()}
 </span>
 </div>
 <p className="text-sm font-bold text-slate-900 font-medium">{log.details?.name || log.entity_type || log.entityType}</p>
 <p className="text-xs text-slate-500 mt-2 font-bold font-medium">{log.details?.reason || log.details?.details || ""}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 </Portal>
 )}
 
 <Toaster position="top-right" />
 </div>
 )
}
