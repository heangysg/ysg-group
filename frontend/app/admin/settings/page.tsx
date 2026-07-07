"use client"

import { useState, useEffect } from "react"
import { Save } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    site_name: "YSG Machinery",
    contact_email: "info@ysgmachinery.com",
    contact_phone: "+855 XX XXX XXXX",
    address: "Phnom Penh, Cambodia",
    facebook_url: "",
    whatsapp_url: "",
    telegram_url: "",
    linkedin_url: "",
    twitter_url: "",
    meta_title: "",
    meta_description: "",
    stat_years: "30+",
    stat_branches: "10",
    stat_machinery: "5000+",
    stat_clients: "15k+",
    stat_brands: "50+",
    stat_regions: "25+"
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
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">{t("siteEmail")}</label>
            <input
              type="email"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">{t("phoneNumber") || "Phone Number"}</label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">{t("address") || "Address"}</label>
            <textarea
              rows={4}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide resize-none"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">Facebook URL</label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
              value={settings.facebook_url}
              onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
              placeholder="https://facebook.com/ysgmachinery"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">WhatsApp Number</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.whatsapp_url}
                onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                placeholder="+85512345678"
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">Telegram Username</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.telegram_url}
                onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                placeholder="@ysgmachinery or https://t.me/ysgmachinery"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">LinkedIn URL</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">Twitter URL</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.twitter_url}
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
              />
            </div>
          </div>

          <hr className="border-slate-200" />
          
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Website Statistics</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Years Experience</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.stat_years}
                onChange={(e) => setSettings({ ...settings, stat_years: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Total Branches</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.stat_branches}
                onChange={(e) => setSettings({ ...settings, stat_branches: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Machinery Units</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.stat_machinery}
                onChange={(e) => setSettings({ ...settings, stat_machinery: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Trusted Clients</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.stat_clients}
                onChange={(e) => setSettings({ ...settings, stat_clients: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Trusted Brands</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.stat_brands}
                onChange={(e) => setSettings({ ...settings, stat_brands: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-widest ml-1">Regions Served</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={settings.stat_regions}
                onChange={(e) => setSettings({ ...settings, stat_regions: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">SEO Title</label>
            <input
              type="text"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
              value={settings.meta_title}
              onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold text-slate-900 uppercase tracking-widest ml-1">SEO Description</label>
            <textarea
              rows={3}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide resize-none"
              value={settings.meta_description}
              onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
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
