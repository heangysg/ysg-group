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
  // Start with 'kh' consistently on both Server and Client initial render to prevent SSR Hydration Mismatch
  const [language, setLanguage] = useState<Language>("kh")

  // Sync saved user preference from localStorage after initial hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = (localStorage.getItem("adminLanguage") || localStorage.getItem("appLanguage")) as Language
      if (savedLang === "en" || savedLang === "kh") {
        setLanguage(savedLang)
      }
    }
  }, [])

  useEffect(() => {
    if (language === "kh") {
      document.documentElement.classList.add("khmer-mode")
    } else {
      document.documentElement.classList.remove("khmer-mode")
    }
  }, [language])

  const setLanguageWrapper = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("adminLanguage", lang)
      localStorage.setItem("appLanguage", lang)
    }
    if (lang === "kh") {
      document.documentElement.classList.add("khmer-mode")
    } else {
      document.documentElement.classList.remove("khmer-mode")
    }
  }

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key
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
