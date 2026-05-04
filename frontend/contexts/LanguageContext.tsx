"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { translations } from "../lib/translations"

type Language = "en" | "kh"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLang = localStorage.getItem("adminLanguage") as Language
    if (savedLang && (savedLang === "en" || savedLang === "kh")) {
      setLanguage(savedLang)
    }
  }, [])

  const setLanguageWrapper = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("adminLanguage", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageWrapper, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
