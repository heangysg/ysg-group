"use client"

import { useState, useEffect } from "react"
import { Save } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "YSG Machinery",
    siteEmail: "info@ysgmachinery.com",
    sitePhone: "+855 XX XXX XXXX",
    siteAddress: "Phnom Penh, Cambodia"
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem("ysg_admin_token")
      const res = await fetch(`${API_URL}/api/admin/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ table: "Setting", limit: 100 })
      })
      const { data } = await res.json()
      if (data && data.length > 0) {
        const newSettings = { ...settings }
        data.forEach((row: any) => {
          if (newSettings.hasOwnProperty(row.key)) {
            (newSettings as any)[row.key] = row.value
          }
        })
        setSettings(newSettings)
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem("ysg_admin_token")
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }

      const res = await fetch(`${API_URL}/api/admin/read`, {
        method: "POST", headers, body: JSON.stringify({ table: "Setting", limit: 100 })
      })
      const existingData = await res.json()
      const existingKeys = existingData.data?.map((row: any) => row.key) || []

      for (const [key, value] of Object.entries(settings)) {
        if (existingKeys.includes(key)) {
          await fetch(`${API_URL}/api/admin/crud`, {
            method: "POST", headers, body: JSON.stringify({ table: "Setting", action: "update", match: { key }, data: { value } })
          })
        } else {
          await fetch(`${API_URL}/api/admin/crud`, {
            method: "POST", headers, body: JSON.stringify({ table: "Setting", action: "insert", data: { key, value } })
          })
        }
      }
      
      toast.success("Settings saved successfully!")
    } catch (err) {
      console.error("Failed to save settings:", err)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">{t("settings")}</h1>
        <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{t("websiteConfiguration")}</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="solid-card bg-white p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">{t("siteName")}</label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
              value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">{t("siteEmail")}</label>
            <input
              type="email"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
              value={settings.siteEmail}
              onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">{t("phoneNumber") || "Phone Number"}</label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
              value={settings.sitePhone}
              onChange={(e) => setSettings({...settings, sitePhone: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">{t("address") || "Address"}</label>
            <textarea
              rows={4}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide resize-none"
              value={settings.siteAddress}
              onChange={(e) => setSettings({...settings, siteAddress: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="btn-primary w-full sm:w-auto px-8 py-4 flex items-center justify-center gap-3 text-xs"
          >
            {saving ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? t("saving") || "Saving..." : t("saveSettings")}
          </button>
        </form>
      </div>
    </div>
  )
}
