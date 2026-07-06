import { useEffect, useRef, useState } from "react"

/**
 * Auto-translate hook using MyMemory free API.
 * Debounces input, then fires a translation request.
 * @param sourceText - The text to translate (Khmer)
 * @param sourceLang - e.g. "km" (Khmer)
 * @param targetLang - e.g. "en" (English)
 * @param delay      - Debounce delay in ms (default 600ms)
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
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`
        const res = await fetch(url, { signal: controller.signal })
        const data = await res.json()

        if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
          const result = data.responseData.translatedText as string
          // MyMemory sometimes returns "PLEASE SELECT TWO DISTINCT LANGUAGES" on error
          if (!result.toUpperCase().includes("PLEASE SELECT")) {
            setTranslated(result)
          }
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
