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
 Trash2,
 Power
} from "lucide-react"
import { useLanguage } from "../../../contexts/LanguageContext"
import toast, { Toaster } from "react-hot-toast"
import Portal from "../../../components/Portal"
import { getOptimizedImageUrl } from "../../../lib/imageUtils"
import { logActivity } from "../../../lib/audit"

export default function UsersManagementPage() {
 const [users, setUsers] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [isSuperAdmin, setIsSuperAdmin] = useState(false)
 const [currentUserId, setCurrentUserId] = useState("")
 const [togglingId, setTogglingId] = useState<string | null>(null)
 const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
 const [deleting, setDeleting] = useState(false)
 const [showModal, setShowModal] = useState(false)
 const [isEditing, setIsEditing] = useState(false)
 const [activeTab, setActiveTab] = useState("details")
 const [userHistory, setUserHistory] = useState<any[]>([])
 const [historyLoading, setHistoryLoading] = useState(false)
 const [error, setError] = useState("")
 const [saving, setSaving] = useState(false)
 const router = useRouter()
 const { t, language } = useLanguage()
 const isKh = language === "kh"

 const [formData, setFormData] = useState({
 id: "",
 name: "",
 email: "",
 password: "",
 roleType: "admin"
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
 setCurrentUserId(user.id || "")
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
 setFormData({ id: "", name: "", email: "", password: "", roleType: "admin" })
 setIsEditing(false)
 setActiveTab("details")
 setShowModal(true)
 }

 const openEditModal = async (user: any) => {
 let roleType = "admin";
 if (user.roleName === "STAFF") roleType = "staff";
 else if (user.isSuperAdmin) roleType = "superadmin";

 setFormData({
 id: user.id,
 name: user.name,
 email: user.email,
 password: "", 
 roleType: roleType
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

 const handleToggleActive = async (user: any) => {
 setTogglingId(user.id)
 try {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
 const token = localStorage.getItem("ysg_admin_token")
 const nextActive = user.isActive === false
 const res = await fetch(`${API_URL}/api/admin/users`, {
 method: "PATCH",
 headers: {
 "Content-Type": "application/json",
 "Authorization": `Bearer ${token}`
 },
 body: JSON.stringify({ id: user.id, isActive: nextActive })
 })
 const data = await res.json().catch(() => ({}))
 if (!res.ok) {
 toast.error(data.error || (isKh ? "មិនអាចកែប្រែស្ថានភាពគណនីបានទេ" : "Failed to update account status"))
 } else {
 setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)))
 void logActivity({
 action: "update",
 entityType: "user",
 entityId: user.id,
 details: { name: user.name, email: user.email, status: nextActive ? "activated" : "deactivated" }
 })
 toast.success(
 nextActive
 ? (isKh ? `បានបើកដំណើរការ "${user.name}" ឡើងវិញ` : `Activated "${user.name}"`)
 : (isKh ? `បានបិទគណនី "${user.name}"` : `Deactivated "${user.name}"`)
 )
 }
 } catch {
 toast.error(isKh ? "មានបញ្ហាបណ្ដាញ" : "Network error")
 } finally {
 setTogglingId(null)
 }
 }

 const handleDeleteUser = async () => {
 if (!deleteTarget) return
 setDeleting(true)
 try {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
 const token = localStorage.getItem("ysg_admin_token")
 const res = await fetch(`${API_URL}/api/admin/users/${deleteTarget.id}`, {
 method: "DELETE",
 headers: { "Authorization": `Bearer ${token}` }
 })
 const data = await res.json().catch(() => ({}))
 if (!res.ok) {
 toast.error(data.error || (isKh ? "មិនអាចលុបគណនីបានទេ" : "Failed to remove user"))
 } else {
 setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
 void logActivity({
 action: "delete",
 entityType: "user",
 entityId: deleteTarget.id,
 details: { name: deleteTarget.name, email: deleteTarget.email }
 })
 toast.success(isKh ? `បានលុបគណនី "${deleteTarget.name}"` : `Removed "${deleteTarget.name}"`)
 setDeleteTarget(null)
 }
 } catch {
 toast.error(isKh ? "មានបញ្ហាបណ្ដាញ" : "Network error")
 } finally {
 setDeleting(false)
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
 
 <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div>
 <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t("adminManagement")}</h2>
 <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1">{t("createAndManageAdmins")}</p>
 </div>
 <button
 onClick={openAddModal}
 className="btn-primary rounded-xl px-6 py-3 flex items-center gap-2 text-xs"
 >
 <UserPlus className="w-4 h-4" />
 {t("addNewAdmin")}
 </button>
 </div>

 <div className="solid-card bg-white overflow-hidden p-0 border border-slate-200 shadow-sm rounded-2xl">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-primary border-b border-slate-200">
 <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">{t("user")}</th>
 <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">{t("emailAddress")}</th>
 <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">{t("role")}</th>
 <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">{t("status") || "Status"}</th>
 <th className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap text-right">{t("actions")}</th>
 </tr>
 </thead>
 <tbody className="divide-y-2 divide-slate-100">
 {users.map((user) => (
 <tr key={user.id} className="group hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm uppercase overflow-hidden">
 {user.image ? (
 <img src={getOptimizedImageUrl(user.image, 'thumb')} alt={user.name} className="w-full h-full object-cover" />
 ) : (
 <User className="w-5 h-5 text-primary" />
 )}
 </div>
 <span className="font-bold text-slate-900 text-sm">{user.name}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="text-xs font-bold text-slate-900 font-medium">{user.email}</span>
 </td>
 <td className="px-6 py-4">
  <div className="flex items-center gap-2">
  <div className={`w-2 h-2 rounded-full ${
  user.roleName === 'STAFF' ? "bg-amber-500" 
  : user.isSuperAdmin ? "bg-primary" 
  : "bg-emerald-500"
  }`} />
  <span className="text-xs font-bold text-slate-900 font-medium">
  {user.roleName === 'STAFF' ? (language === 'kh' ? 'បុគ្គលិក' : 'Staff') : (user.isSuperAdmin ? t("superadmin") : t("admin"))}
  </span>
  </div>
 </td>
 <td className="px-6 py-4">
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
  user.isActive !== false
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-red-50 text-red-700 border-red-200"
  }`}>
  {user.isActive !== false ? (isKh ? "សកម្ម" : "Active") : (isKh ? "បានបិទ" : "Inactive")}
  </span>
 </td>
 <td className="px-6 py-4 text-right">
 <div className="inline-flex items-center justify-end gap-2">
 <button 
 onClick={() => openEditModal(user)}
 title={isKh ? "កែប្រែ" : "Edit"}
 className="p-2 bg-white text-slate-900 rounded-lg border border-slate-200 hover:border-primary hover:text-primary hover:shadow-sm transition-all cursor-pointer"
 >
 <Pencil className="w-4 h-4" />
 </button>
 {user.id !== currentUserId && (
 <>
 <button
 onClick={() => handleToggleActive(user)}
 disabled={togglingId === user.id}
 title={user.isActive !== false ? (isKh ? "បិទគណនី" : "Deactivate") : (isKh ? "បើកគណនី" : "Activate")}
 className={`p-2 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
 user.isActive !== false ? "text-amber-600 hover:border-amber-300 hover:bg-amber-50" : "text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
 }`}
 >
 <Power className="w-4 h-4" />
 </button>
 <button
 onClick={() => setDeleteTarget(user)}
 title={isKh ? "លុបគណនី" : "Remove Admin"}
 className="p-2 bg-white text-red-600 rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 hover:shadow-sm transition-all cursor-pointer"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </>
 )}
 </div>
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
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowModal(false)}>
 <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden p-0 flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
 {/* Header */}
 <div className="px-5 py-4 border-b border-slate-200 bg-primary text-white">
 <div className="flex justify-between items-start gap-3">
 <div>
 <h2 className="text-base font-bold text-white">{isEditing ? t("manageAdminProfile") : t("addNewAdmin")}</h2>
 <p className="text-xs font-medium text-blue-100 mt-0.5">
 {isEditing ? t("updateCredentialsProfile") : t("createCredentialsNewAdmin")}
 </p>
 </div>
 <button 
 type="button"
 onClick={() => setShowModal(false)} 
 className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0"
 aria-label="Close"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Tabs */}
 {isEditing && (
 <div className="flex gap-5 mt-3 -mb-4">
 {[
 { id: "details", label: t("details"), icon: User },
 { id: "history", label: t("backgroundHistory"), icon: History }
 ].map(tab => (
 <button
 key={tab.id}
 type="button"
 onClick={() => setActiveTab(tab.id)}
 className={`flex items-center gap-2 pb-3 text-xs font-semibold transition-all relative ${
 activeTab === tab.id ? "text-white" : "text-blue-200 hover:text-white"
 }`}
 >
 <tab.icon className="w-4 h-4" />
 {tab.label}
 {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />}
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Body */}
 <div className="p-5 overflow-y-auto custom-scrollbar max-h-[65vh]">
 {activeTab === "details" ? (
 <form onSubmit={handleSubmit} className="space-y-5">
 {error && (
 <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl flex items-center gap-2.5 text-red-800 text-xs font-semibold">
 <AlertCircle className="w-4 h-4 shrink-0" />
 {error}
 </div>
 )}
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-800">{t("fullName")}</label>
 <input
 type="text"
 required
 value={formData.name}
 onChange={e => setFormData({ ...formData, name: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-medium text-xs sm:text-sm text-slate-900"
 />
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-800">{t("emailAddress")}</label>
 <input
 type="email"
 required
 value={formData.email}
 onChange={e => setFormData({ ...formData, email: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-medium text-xs sm:text-sm text-slate-900"
 />
 </div>
 <div className="space-y-1.5">
 <label className="block text-xs font-bold text-slate-800">
 {t("password")} {isEditing && <span className="text-[11px] font-normal text-slate-600">{t("leaveBlankToKeep")}</span>}
 </label>
 <input
 type="password"
 required={!isEditing}
 value={formData.password}
 onChange={e => setFormData({ ...formData, password: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-medium text-xs sm:text-sm text-slate-900"
 />
 </div>
  <div className="space-y-1.5">
  <label className="block text-xs font-bold text-slate-800">
  {language === 'kh' ? 'តួនាទី (Role)' : 'Role'}
  </label>
  <select
  value={formData.roleType}
  onChange={e => setFormData({ ...formData, roleType: e.target.value })}
  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none transition-all font-medium text-xs sm:text-sm text-slate-900"
  >
  <option value="superadmin">{language === 'kh' ? 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់ (Super Admin)' : 'Super Admin'}</option>
  <option value="admin">{language === 'kh' ? 'អ្នកគ្រប់គ្រង (Admin)' : 'Admin'}</option>
  <option value="staff">{language === 'kh' ? 'បុគ្គលិក (Staff)' : 'Staff'}</option>
  </select>
  </div>
 </div>

 <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-200">
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors"
 >
 {t("cancel")}
 </button>
 <button
 type="submit"
 disabled={saving}
 className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-60"
 >
 {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
 <span>{isEditing ? t("saveChanges") : t("addNewAdmin")}</span>
 </button>
 </div>
 </form>
 ) : (
 <div className="space-y-6 animate-in fade-in duration-500">
 {historyLoading ? (
 <div className="py-16 flex flex-col items-center justify-center">
 <div className="w-10 h-10 border-4 border-slate-200 border-t-transparent rounded-full animate-spin mb-6" />
 <p className="text-xs font-bold text-slate-500 font-medium">{t("loading")}</p>
 </div>
 ) : userHistory.length === 0 ? (
 <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 border-dashed">
 <History className="w-12 h-12 text-slate-400 mx-auto mb-4" />
 <p className="text-xs font-medium text-slate-500">{t("noActivityFound")}</p>
 </div>
 ) : (
 <div className="space-y-4">
 {userHistory.map((log, idx) => (
 <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all group">
 <div className="flex items-center justify-between mb-3">
 <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
 log.action === 'login' ? 'bg-blue-50 text-blue-700 border-blue-200' :
 log.action === 'create' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
 log.action === 'delete' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
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

 {deleteTarget && (
 <Portal>
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => !deleting && setDeleteTarget(null)}>
 <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-start gap-4">
 <div className="p-3 bg-red-50 border border-red-200 rounded-xl shrink-0">
 <Trash2 className="w-5 h-5 text-red-600" />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900">
 {isKh ? "លុបគណនីអ្នកគ្រប់គ្រង" : "Remove Admin Account"}
 </h3>
 <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
 {isKh
 ? <>តើអ្នកប្រាកដថាចង់លុប <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) មែនទេ? គណនីនេះនឹងត្រូវដកហូតសិទ្ធិចូលប្រព័ន្ធភ្លាមៗ។</>
 : <>Are you sure you want to remove <strong>{deleteTarget.name}</strong> ({deleteTarget.email})? They will immediately lose admin access.</>}
 </p>
 </div>
 </div>
 <div className="flex items-center justify-end gap-2.5 pt-2">
 <button
 type="button"
 disabled={deleting}
 onClick={() => setDeleteTarget(null)}
 className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
 >
 {t("cancel")}
 </button>
 <button
 type="button"
 disabled={deleting}
 onClick={handleDeleteUser}
 className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition-colors disabled:opacity-60 cursor-pointer"
 >
 {deleting ? (isKh ? "កំពុងលុប..." : "Removing...") : (isKh ? "លុបគណនី" : "Remove")}
 </button>
 </div>
 </div>
 </div>
 </Portal>
 )}
 </div>
 )
}
