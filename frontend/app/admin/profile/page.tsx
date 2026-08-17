"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "../../../contexts/LanguageContext"
import toast, { Toaster } from "react-hot-toast"
import { Save, User, Mail, Phone, Lock, Eye, EyeOff, FileText } from "lucide-react"

export default function ProfilePage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("ysg_admin_token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const res = await fetch(`${API_URL}/api/admin/profile`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      
      if (!res.ok) throw new Error("Failed to load profile")
      
      const data = await res.json()
      if (data.user) {
        setFormData(prev => ({
          ...prev,
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          bio: data.user.bio || ""
        }))
      }
    } catch (err: any) {
      toast.error(err.message || t("errorLoadingData") || "Error loading profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error(t("currentPasswordRequired") || "Current password is required")
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error(t("passwordsDoNotMatch") || "Passwords do not match")
        return
      }
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("ysg_admin_token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio
      }

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword
        payload.newPassword = formData.newPassword
      }

      const res = await fetch(`${API_URL}/api/admin/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update profile")
      
      toast.success(t("profileUpdated") || "Profile updated successfully")
      
      // Clear password fields on success
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }))
      
      // Update local storage name if it changed
      const userStr = localStorage.getItem("ysg_admin_user")
      if (userStr) {
        const user = JSON.parse(userStr)
        user.name = formData.name
        user.bio = formData.bio
        localStorage.setItem("ysg_admin_user", JSON.stringify(user))
      }
      
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold uppercase text-slate-900">{t("profile")}</h2>
          <p className="text-sm font-medium text-slate-500 mt-2">
            {t("personalInfo")} & {t("passwordPrivacy") || "Security"}
          </p>
        </div>
      </div>

      <div className="solid-card bg-white overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold uppercase text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t("personalInfo")}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Update your personal details.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                    {t("adminName")}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white transition-all text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                    {t("emailAuth")}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white transition-all text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                    {t("phone")}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white transition-all text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                    {t("backgroundHistory") || "Background History"}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder={t("writeBio") || "Write a short bio or history about yourself..."}
                      className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white transition-all text-[11px] h-32 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold uppercase text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  {t("changePassword")}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Leave blank if you don't want to change your password.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                    {t("currentPassword")}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white transition-all text-[11px]"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="text-primary hover:text-gray-500 focus:outline-none"
                      >
                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                    {t("newPasswordProfile")}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white transition-all text-[11px]"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-primary hover:text-gray-500 focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                    {t("confirmPasswordProfile")}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white transition-all text-[11px]"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-primary hover:text-gray-500 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-3 flex items-center justify-center gap-2 text-xs w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white border-2 border-t-transparent rounded-full" />
                  {t("updating") || "Updating..."}
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  {t("updateProfile")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
