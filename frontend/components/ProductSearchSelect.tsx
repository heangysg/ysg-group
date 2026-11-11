"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Package, Search, X, Check } from "lucide-react"

export interface SelectableProduct {
  id: string
  name: string
  nameKhmer?: string | null
  sku?: string | null
  thumbnail?: string | null
}

interface ProductSearchSelectProps {
  value: string
  selectedId?: string
  onChange: (productName: string, productId?: string) => void
  language: string
  required?: boolean
  placeholder?: string
  inputClassName?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

/**
 * Searchable product dropdown backed by published catalog items, with custom-text fallback.
 */
export default function ProductSearchSelect({
  value,
  selectedId,
  onChange,
  language,
  required = false,
  placeholder,
  inputClassName,
}: ProductSearchSelectProps) {
  const [products, setProducts] = useState<SelectableProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  useEffect(() => {
    let active = true
    const loadProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/public/products`)
        if (!res.ok) return
        const payload = await res.json()
        if (active && Array.isArray(payload?.data)) {
          setProducts(payload.data)
        }
      } catch {
        // Keep manual input usable even if catalog fetch fails
      } finally {
        if (active) setLoading(false)
      }
    }
    loadProducts()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getDisplayName = (product: SelectableProduct) => {
    if (language === "kh" && product.nameKhmer) {
      return `${product.nameKhmer} (${product.name})`
    }
    return product.nameKhmer ? `${product.name} (${product.nameKhmer})` : product.name
  }

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => {
      const en = (p.name || "").toLowerCase()
      const kh = (p.nameKhmer || "").toLowerCase()
      const sku = (p.sku || "").toLowerCase()
      return en.includes(q) || kh.includes(q) || sku.includes(q)
    })
  }, [products, searchTerm])

  const handleSelect = (product: SelectableProduct) => {
    const label = getDisplayName(product)
    setSearchTerm(label)
    onChange(label, product.id)
    setOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setSearchTerm(next)
    onChange(next, undefined)
    if (!open) setOpen(true)
  }

  const handleClear = () => {
    setSearchTerm("")
    onChange("", undefined)
    setOpen(true)
  }

  const defaultPlaceholder =
    placeholder ||
    (language === "kh"
      ? "ស្វែងរក ឬជ្រើសរើសផលិតផល..."
      : "Search or select a product...")

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          required={required}
          value={searchTerm}
          onFocus={() => setOpen(true)}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false)
          }}
          placeholder={defaultPlaceholder}
          autoComplete="off"
          className={
            inputClassName ||
            "w-full pl-10 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:border-[#004691] focus:ring-1 focus:ring-[#004691] outline-none transition-all text-slate-900 text-sm"
          }
        />
        <div className="absolute right-2 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear selected product"
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle product list"
            className="p-1 text-slate-500 hover:text-[#004691] rounded transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute z-40 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-xs text-slate-500 text-center">
              {language === "kh" ? "កំពុងផ្ទុកបញ្ជីផលិតផល..." : "Loading products..."}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-500">
              {language === "kh"
                ? `រកមិនឃើញ "${searchTerm}" ក្នុងបញ្ជីទេ — អ្នកអាចផ្ញើឈ្មោះនេះបានធម្មតា។`
                : `No catalog match for "${searchTerm}" — you can still submit this name.`}
            </div>
          ) : (
            <ul className="py-1 divide-y divide-slate-100">
              {filteredProducts.map((product) => {
                const isSelected = selectedId === product.id
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(product)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2.5 hover:bg-blue-50/70 transition-colors ${
                        isSelected ? "bg-blue-50 text-[#004691]" : "text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {product.thumbnail ? (
                          <img
                            src={product.thumbnail}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">
                            {language === "kh" && product.nameKhmer ? product.nameKhmer : product.name}
                          </p>
                          {(language === "kh" ? product.name : product.nameKhmer) && (
                            <p className="text-[11px] text-slate-500 truncate">
                              {language === "kh" ? product.name : product.nameKhmer}
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#004691] shrink-0" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

