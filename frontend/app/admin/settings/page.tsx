"use client"

import { useState, useEffect } from "react"
import { createClient } from "../../../lib/supabase/client"
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
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Save to localStorage for now (would save to database in production)
    localStorage.setItem("siteSettings", JSON.stringify(settings))
    
    toast.success("Settings saved successfully!")
    setLoading(false)
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("settings")}</h1>
        <p className="text-sm text-gray-600 mt-1">{t("websiteConfiguration")}</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("siteName")}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              value={settings.siteName}
              onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("siteEmail")}</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              value={settings.siteEmail}
              onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("phoneNumber") || "Phone Number"}</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              value={settings.sitePhone}
              onChange={(e) => setSettings({...settings, sitePhone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t("address") || "Address"}</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              value={settings.siteAddress}
              onChange={(e) => setSettings({...settings, siteAddress: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            <Save className="w-4 h-4" />
            {loading ? t("saving") || "Saving..." : t("saveSettings")}
          </button>
        </form>
      </div>
    </div>
  )
}
