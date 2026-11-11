"use client"

import { useState, useEffect } from "react"
import { Save, Settings, Link2, BarChart3, Search, MapPin, Mail, Phone, Globe } from "lucide-react"
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
  const { t, language } = useLanguage()
  const isKh = language === "kh"

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
      if (res.ok) {
        const { data } = await res.json()
        if (data && data.length > 0) {
          const newSettings = { ...settings }
          data.forEach((row: any) => {
            if (Object.prototype.hasOwnProperty.call(newSettings, row.key)) {
              (newSettings as any)[row.key] = row.value
            }
          })
          setSettings(newSettings)
        }
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

      toast.success(isKh ? "រក្សាទុកការកំណត់បានជោគជ័យ!" : "Settings saved successfully!")
    } catch (err) {
      console.error("Failed to save settings:", err)
      toast.error(isKh ? "មិនអាចរក្សាទុកការកំណត់បានទេ" : "Failed to save settings")
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

  const inputClasses = "w-full py-3 px-4 bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white transition-all text-xs"

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t("settings")}</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
            {t("websiteConfiguration")}
          </p>
        </div>
      </div>

      <div className="solid-card bg-white overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-10">
          {/* General Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold uppercase text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                {isKh ? "ព័ត៌មានទូទៅ" : "General Information"}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {isKh
                  ? "ធ្វើបច្ចុប្បន្នភាពព័ត៌មានលម្អិតសំខាន់ៗ និងព័ត៌មានទំនាក់ទំនងនៃគេហទំព័ររបស់អ្នក។"
                  : "Update your primary website details and contact information."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">{t("siteName")}</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <input
                    type="text"
                    className={`${inputClasses} pl-9`}
                    value={settings.site_name}
                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">{t("siteEmail")}</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <input
                    type="email"
                    className={`${inputClasses} pl-9`}
                    value={settings.contact_email}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "លេខទូរស័ព្ទទំនាក់ទំនង" : "Phone Number"}
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <input
                    type="text"
                    className={`${inputClasses} pl-9`}
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">{t("address")}</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <textarea
                    rows={3}
                    className={`${inputClasses} pl-9 resize-none`}
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Social Media Links Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold uppercase text-slate-900 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                {isKh ? "បណ្តាញសង្គម និងតំណភ្ជាប់" : "Social Media & Links"}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {isKh
                  ? "គ្រប់គ្រងគណនីបណ្តាញសង្គម និងតំណភ្ជាប់ទំនាក់ទំនងខាងក្រៅរបស់អ្នក។"
                  : "Manage your external profiles and contact links."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "តំណភ្ជាប់ Facebook (URL)" : "Facebook URL"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.facebook_url}
                  onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/ysgmachinery"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "លេខទូរស័ព្ទ WhatsApp" : "WhatsApp Number"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.whatsapp_url}
                  onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                  placeholder="+85512345678"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "ឈ្មោះ ឬតំណភ្ជាប់ Telegram" : "Telegram Username/Link"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.telegram_url}
                  onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                  placeholder="@ysgmachinery or https://t.me/ysgmachinery"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "តំណភ្ជាប់ LinkedIn (URL)" : "LinkedIn URL"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.linkedin_url}
                  onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "តំណភ្ជាប់ Twitter / X (URL)" : "Twitter URL"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.twitter_url}
                  onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Website Statistics Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold uppercase text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {isKh ? "ស្ថិតិគេហទំព័រ" : "Website Statistics"}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {isKh
                  ? "ធ្វើបច្ចុប្បន្នភាពតួលេខដែលបង្ហាញនៅលើផ្នែកស្ថិតិនៃគេហទំព័ររបស់អ្នក។"
                  : "Update the numbers shown on your website's statistics sections."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "បទពិសោធន៍ (ឆ្នាំ)" : "Years Experience"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.stat_years}
                  onChange={(e) => setSettings({ ...settings, stat_years: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "សាខាសរុប" : "Total Branches"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.stat_branches}
                  onChange={(e) => setSettings({ ...settings, stat_branches: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "ចំនួនគ្រឿងចក្រ" : "Machinery Units"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.stat_machinery}
                  onChange={(e) => setSettings({ ...settings, stat_machinery: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "អតិថិជនដែលទុកចិត្ត" : "Trusted Clients"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.stat_clients}
                  onChange={(e) => setSettings({ ...settings, stat_clients: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "ម៉ាកល្បីៗដែលទុកចិត្ត" : "Trusted Brands"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.stat_brands}
                  onChange={(e) => setSettings({ ...settings, stat_brands: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "តំបន់សេវាកម្ម" : "Regions Served"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.stat_regions}
                  onChange={(e) => setSettings({ ...settings, stat_regions: e.target.value })}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* SEO Settings Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold uppercase text-slate-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                {isKh ? "ការកំណត់ SEO" : "SEO Settings"}
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {isKh
                  ? "គ្រប់គ្រងរបៀបដែលគេហទំព័ររបស់អ្នកបង្ហាញនៅលើម៉ាស៊ីនស្វែងរក Google។"
                  : "Manage how your website appears on search engines."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "ចំណងជើង SEO" : "SEO Title"}
                </label>
                <input
                  type="text"
                  className={inputClasses}
                  value={settings.meta_title}
                  onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1.5 block">
                  {isKh ? "ការពិពណ៌នា SEO" : "SEO Description"}
                </label>
                <textarea
                  rows={3}
                  className={`${inputClasses} resize-none`}
                  value={settings.meta_description}
                  onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                />
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
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  {t("saveSettings")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <Toaster position="top-right" />
    </div>
  )
}
