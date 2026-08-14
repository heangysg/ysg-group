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
 // Read from localStorage synchronously before first render to avoid flash
 const getInitialLanguage = (): Language => {
 if (typeof window !== "undefined") {
 const saved = localStorage.getItem("appLanguage") || localStorage.getItem("adminLanguage")
 if (saved === "en" || saved === "kh") return saved
 }
 return "kh" // default to Khmer
 }

 const [language, setLanguage] = useState<Language>("kh")
 const [isReady, setIsReady] = useState(false)

 // Apply correct language after hydration — runs once, immediately
 useEffect(() => {
 const lang = getInitialLanguage()
 setLanguage(lang)
 // Apply khmer-mode class right away
 if (lang === "kh") {
 document.documentElement.classList.add("khmer-mode")
 } else {
 document.documentElement.classList.remove("khmer-mode")
 }
 setIsReady(true)
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
 {!isReady ? (
 // Render invisible children during hydration to prevent layout shift,
 // but don't block the DOM tree — just hide text content briefly
 <div style={{ visibility: "hidden" }}>{children}</div>
 ) : (
 children
 )}
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
