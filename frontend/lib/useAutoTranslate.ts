import { useEffect, useRef, useState } from "react"

/**
 * Auto-translate hook using MyMemory free API.
 * Debounces input, then fires a translation request.
 * @param sourceText - The text to translate (Khmer)
 * @param sourceLang - e.g. "km" (Khmer)
 * @param targetLang - e.g. "en" (English)
 * @param delay - Debounce delay in ms (default 600ms)
 */
export function useAutoTranslate(
 sourceText: string,
 sourceLang: string = "km",
 targetLang: string = "en",
 delay: number = 600
) {
 const [translated, setTranslated] = useState<string>("")
 const [isTranslating, setIsTranslating] = useState(false)
 const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
 const abortControllerRef = useRef<AbortController | null>(null)

 useEffect(() => {
 // Clear previous timer
 if (debounceTimer.current) clearTimeout(debounceTimer.current)

 // If empty, clear result immediately
 if (!sourceText || sourceText.trim().length < 2) {
 setTranslated("")
 setIsTranslating(false)
 return
 }

 setIsTranslating(true)

 debounceTimer.current = setTimeout(async () => {
 // Cancel previous in-flight request
 if (abortControllerRef.current) abortControllerRef.current.abort()
 const controller = new AbortController()
 abortControllerRef.current = controller

 try {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(sourceText)}`
  const res = await fetch(url, { signal: controller.signal })
  const data = await res.json()

  if (data && data[0] && data[0][0] && data[0][0][0]) {
  const result = data[0][0][0] as string
  setTranslated(result)
  }
 } catch (err: any) {
 if (err?.name !== "AbortError") {
 console.warn("Auto-translate failed:", err)
 }
 } finally {
 setIsTranslating(false)
 }
 }, delay)

 return () => {
 if (debounceTimer.current) clearTimeout(debounceTimer.current)
 }
 }, [sourceText, sourceLang, targetLang, delay])

 return { translated, isTranslating }
}
