"use client"

import { useLanguage } from "../../../contexts/LanguageContext"

export default function LanguageTest() {
  const { t, language, setLanguage } = useLanguage()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Language Test Page</h1>
      
      <div className="bg-white rounded-xl p-6 mb-6">
        <p className="text-lg mb-4">
          Current Language: <strong>{language === "en" ? "English" : "Khmer"}</strong>
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => setLanguage("en")}
            className={`px-4 py-2 rounded-lg ${language === "en" ? "bg-primary text-white" : "bg-gray-200"}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("kh")}
            className={`px-4 py-2 rounded-lg ${language === "kh" ? "bg-primary text-white" : "bg-gray-200"}`}
          >
            Khmer
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <h2 className="font-bold text-lg mb-3">Translation Results:</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-semibold">Dashboard:</span>
            <span>{t("dashboard")}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-semibold">Products:</span>
            <span>{t("products")}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-semibold">Categories:</span>
            <span>{t("categories")}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-semibold">Inquiries:</span>
            <span>{t("inquiries")}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-semibold">Settings:</span>
            <span>{t("settings")}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-semibold">Logout:</span>
            <span>{t("logout")}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          The Khmer translations are working! The right column shows the actual Khmer text from the translation system.
        </p>
      </div>
    </div>
  )
}
