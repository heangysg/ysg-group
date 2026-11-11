"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Save,
  UploadCloud,
  X,
  Star,
  Package,
  Tag,
  DollarSign,
  Calendar,
  ListPlus,
  Image as ImageIcon,
  FileText,
  Lock,
  ExternalLink,
  Info,
  Eye
} from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import imageCompression from "browser-image-compression"
import { getOptimizedImageUrl } from "../../lib/imageUtils"
import { uploadImageToSecureProxy } from "../../lib/upload"
import { logActivity } from "../../lib/audit"
import { useLanguage } from "../../contexts/LanguageContext"
import { useAutoTranslate } from "../../lib/useAutoTranslate"
import { getAdminHeaders } from "../../lib/adminAnalytics"

interface GalleryItem {
  key: string
  url: string
  file?: File
}

interface ProductFormProps {
  mode: "create" | "edit"
  slug?: string
}

function generateAutoSku(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `YSG-${digits}`;
}

function buildProductSlug(name: string, existingSlug?: string): string {
  const cleanBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  if (existingSlug) {
    const match = existingSlug.match(/-p\d+$/)
    if (match && cleanBase) return `${cleanBase}${match[0]}`
    return existingSlug
  }

  const base = cleanBase || "product"
  const shortId = "p" + Math.floor(1000 + Math.random() * 9000)
  return `${base}-${shortId}`
}

export default function ProductForm({ mode, slug }: ProductFormProps) {
  const router = useRouter()
  const { t, language } = useLanguage()
  const isKh = language === "kh"

  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [fetching, setFetching] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)
  const [productId, setProductId] = useState("")
  const [sku, setSku] = useState(() => (mode === "create" ? generateAutoSku() : ""))
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const objectUrlsRef = useRef<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    nameKhmer: "",
    brand: "",
    model: "",
    price: "",
    year: "",
    condition: "used",
    description: "",
    descriptionKhmer: "",
    isPublished: true,
    isFeatured: false,
    categoryId: "",
    subcategoryId: "",
    stock: "1",
  })

  const { translated: autoName, isTranslating: isTranslatingName } = useAutoTranslate(formData.nameKhmer)
  const { translated: autoDesc, isTranslating: isTranslatingDesc } = useAutoTranslate(formData.descriptionKhmer)
  const lastAutoNameRef = useRef("")
  const lastAutoDescRef = useRef("")

  useEffect(() => {
    if (!autoName) return
    setFormData((prev) => {
      if (!prev.name || prev.name === lastAutoNameRef.current) {
        lastAutoNameRef.current = autoName
        return { ...prev, name: autoName }
      }
      return prev
    })
  }, [autoName])

  useEffect(() => {
    if (!autoDesc) return
    setFormData((prev) => {
      if (!prev.description || prev.description === lastAutoDescRef.current) {
        lastAutoDescRef.current = autoDesc
        return { ...prev, description: autoDesc }
      }
      return prev
    })
  }, [autoDesc])

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (!userStr) {
      router.push("/admin/login")
      return
    }

    async function loadInitialData() {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const headers = getAdminHeaders()

      try {
        if (mode === "create") {
          const catRes = await fetch(`${API_URL}/api/admin/read`, {
            method: "POST",
            headers,
            body: JSON.stringify({ table: "Category", eq: { isActive: true }, order: { column: "sortOrder", ascending: true } }),
          }).then((r) => r.json())
          setCategories(catRes.data || [])
          return
        }

        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/read`, {
            method: "POST",
            headers,
            body: JSON.stringify({ table: "Category", order: { column: "sortOrder", ascending: true } }),
          }).then((r) => r.json()),
          fetch(`${API_URL}/api/admin/read`, {
            method: "POST",
            headers,
            body: JSON.stringify({ table: "Product", eq: { slug }, limit: 1 }),
          }).then((r) => r.json()),
        ])

        const allCats = catRes.data || []
        setCategories(allCats)

        if (prodRes.error || !prodRes.data || prodRes.data.length === 0) {
          toast.error(isKh ? "រកមិនឃើញផលិតផលទេ" : "Product not found")
          router.push("/admin/products")
          return
        }

        const data = prodRes.data[0]
        setProductId(data.id)
        setSku(data.sku || generateAutoSku())

        // Load real gallery images from ProductImage (fallback to thumbnail)
        const imgRes = await fetch(`${API_URL}/api/admin/read`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            table: "ProductImage",
            eq: { productId: data.id },
            order: { column: "sortOrder", ascending: true },
          }),
        })
          .then((r) => r.json())
          .catch(() => ({ data: [] }))

        const existingRows = (imgRes.data || [])
          .map((row: any) => row.imageUrl || row.url)
          .filter((u: any) => typeof u === "string" && u.trim().length > 0)

        const initialUrls: string[] =
          existingRows.length > 0 ? existingRows : data.thumbnail ? [data.thumbnail] : []

        setGallery(
          initialUrls.map((url, idx) => ({
            key: `existing-${idx}-${url}`,
            url,
          }))
        )

        let mainCatId = ""
        let subCatId = ""
        const assignedCat = allCats.find((c: any) => c.id === data.categoryId)
        if (assignedCat) {
          if (assignedCat.parentId) {
            mainCatId = assignedCat.parentId
            subCatId = assignedCat.id
          } else {
            mainCatId = assignedCat.id
            subCatId = data.subcategoryId || ""
          }
        }

        setFormData({
          name: data.name || "",
          nameKhmer: data.nameKhmer || "",
          brand: data.brand || "",
          model: data.model || "",
          price: data.price?.toString() || "",
          year: data.year?.toString() || "",
          condition: data.condition || "used",
          description: data.description || "",
          descriptionKhmer: data.descriptionKhmer || "",
          isPublished: data.isPublished ?? true,
          isFeatured: data.isFeatured ?? false,
          categoryId: mainCatId,
          subcategoryId: subCatId,
          stock: data.stock?.toString() || "0",
        })

        if (mainCatId) {
          setSubcategories(allCats.filter((c: any) => c.parentId === mainCatId))
        }
      } catch (err) {
        console.error("Load product form error:", err)
        toast.error("Failed to load form data")
      } finally {
        setFetching(false)
      }
    }

    loadInitialData()
  }, [isKh, mode, router, slug])

  const handleCategoryChange = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, categoryId, subcategoryId: "" }))
    if (categoryId) {
      setSubcategories(categories.filter((c: any) => c.parentId === categoryId))
    } else {
      setSubcategories([])
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newItems: GalleryItem[] = Array.from(files).map((file, idx) => {
      const url = URL.createObjectURL(file)
      objectUrlsRef.current.push(url)
      return {
        key: `pending-${Date.now()}-${idx}-${file.name}`,
        url,
        file,
      }
    })
    setGallery((prev) => [...prev, ...newItems])
    e.target.value = ""
  }

  const removeGalleryItem = (index: number) => {
    setGallery((prev) => {
      const target = prev[index]
      if (target?.file) URL.revokeObjectURL(target.url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const setAsMainImage = (index: number) => {
    if (index === 0) return
    setGallery((prev) => {
      const next = [...prev]
      const [picked] = next.splice(index, 1)
      next.unshift(picked)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (subcategories.length > 0 && !formData.subcategoryId) {
      toast.error(isKh ? "សូមជ្រើសរើសប្រភេទរង (Subcategory)!" : "Please select a subcategory!")
      return
    }

    const resolvedName = (formData.name || autoName || formData.nameKhmer || "").trim()
    if (!resolvedName) {
      toast.error(isKh ? "សូមបញ្ចូលឈ្មោះផលិតផល!" : "Please enter a product name!")
      return
    }

    setSaving(true)

    try {
      const finalImageUrls: string[] = []
      for (const item of gallery) {
        if (item.file) {
          const compressedFile = await imageCompression(item.file, {
            maxSizeMB: 0.35,
            maxWidthOrHeight: 1000,
            useWebWorker: true,
          })
          const secureUrl = await uploadImageToSecureProxy(compressedFile)
          finalImageUrls.push(secureUrl)
        } else if (item.url) {
          finalImageUrls.push(item.url)
        }
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const headers = getAdminHeaders()
      const finalSlug = buildProductSlug(resolvedName, mode === "edit" ? slug : undefined)

      const payloadData: Record<string, any> = {
        name: resolvedName,
        nameKhmer: formData.nameKhmer.trim() || null,
        slug: finalSlug,
        sku: sku || generateAutoSku(),
        brand: formData.brand.trim() || null,
        model: formData.model.trim() || null,
        price: parseFloat(formData.price) || 0,
        year: parseInt(formData.year) || null,
        condition: formData.condition,
        description: (formData.description || autoDesc || "").trim() || null,
        descriptionKhmer: formData.descriptionKhmer.trim() || null,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        categoryId: formData.subcategoryId || formData.categoryId || null,
        subcategoryId: null,
        stock: Math.max(0, parseInt(formData.stock) || 0),
        thumbnail: finalImageUrls[0] || null,
        updatedAt: new Date().toISOString(),
      }

      if (mode === "create") {
        payloadData.createdAt = new Date().toISOString()
      }

      const res = await fetch(`${API_URL}/api/admin/crud`, {
        method: "POST",
        headers,
        body: JSON.stringify(
          mode === "create"
            ? { table: "Product", action: "insert", data: payloadData }
            : { table: "Product", action: "update", match: { id: productId }, data: payloadData }
        ),
      })

      const jsonRes = await res.json()
      if (!res.ok || jsonRes.error) {
        toast.error(`Error: ${jsonRes.error || "Failed to save product"}`)
        setSaving(false)
        return
      }

      const savedId = mode === "create" ? jsonRes.data?.[0]?.id : productId
      if (savedId) {
        const imgSaveRes = await fetch(`${API_URL}/api/admin/products/${savedId}/images`, {
          method: "POST",
          headers,
          body: JSON.stringify({ images: finalImageUrls }),
        })
        if (!imgSaveRes.ok) {
          toast.error(isKh ? "រក្សាទុកផលិតផលបាន តែរូបភាពបន្ថែមមានបញ្ហា" : "Product saved, but gallery sync had an issue")
        }
      }

      await logActivity({
        action: mode === "create" ? "create" : "update",
        entityType: "product",
        entityId: savedId,
        details: { name: resolvedName, sku },
      })

      toast.success(
        mode === "create"
          ? isKh ? "បង្កើតផលិតផលបានជោគជ័យ!" : "Product created successfully!"
          : isKh ? "កែប្រែផលិតផលបានជោគជ័យ!" : "Product updated successfully!"
      )
      setTimeout(() => router.push("/admin/products"), 900)
    } catch (err: any) {
      console.error("Save product error:", err)
      toast.error(err?.message || "Failed to save product")
      setSaving(false)
    }
  }

  const stockNum = parseInt(formData.stock || "0") || 0
  const inputCls =
    "w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-800"

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <Toaster position="top-right" />

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 bg-white rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 hover:text-slate-950 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              {mode === "create" ? t("addProduct") : t("editProduct") || "Edit Product"}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
              {mode === "create"
                ? t("fillInDetails")
                : t("modifyProductInfo") || "Update product details, pricing, stock & gallery"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {mode === "edit" && slug && (
            <Link
              href={`/products/${slug}`}
              target="_blank"
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:border-primary hover:text-primary transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {isKh ? "មើលលើវេបសាយ" : "View Live"}
            </Link>
          )}
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            form="product-editor-form"
            disabled={saving}
            className="btn-primary px-5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving
              ? mode === "create"
                ? t("creatingProduct")
                : isKh ? "កំពុងរក្សាទុក..." : "Saving..."
              : mode === "create"
              ? t("createProduct")
              : isKh ? "រក្សាទុកការកែប្រែ" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* 2-Column E-Commerce Editor */}
      <form id="product-editor-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Main Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Info & Description */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-primary text-white flex items-center gap-2">
              <Package className="w-4 h-4" />
              <h2 className="text-sm font-bold">{t("basicInformation")}</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t("productNameKhmer")} *
                </label>
                <input
                  type="text"
                  required
                  className={inputCls}
                  value={formData.nameKhmer}
                  onChange={(e) => setFormData({ ...formData, nameKhmer: e.target.value })}
                  placeholder="ឧ. ម៉ាស៊ីនត្រងទឹក និងវេចខ្ចប់"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span>{t("productNameEnglish")}</span>
                  {isTranslatingName && (
                    <span className="text-[11px] text-primary font-semibold normal-case animate-pulse">
                      Auto-translating...
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    className={`${inputCls} pl-10`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Hitachi ZX200-3 Excavator"
                  />
                </div>
                {!formData.name && formData.nameKhmer && !isTranslatingName && (
                  <p className="text-[11px] text-slate-700 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {isKh ? "នឹងបំពេញជាភាសាអង់គ្លេសដោយស្វ័យប្រវត្តិ" : "Will auto-fill from Khmer input"}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-700" />
                    {t("fullDescriptionKhmer")}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-800"
                    value={formData.descriptionKhmer}
                    onChange={(e) => setFormData({ ...formData, descriptionKhmer: e.target.value })}
                    placeholder="ពិពណ៌នាអំពីផលិតផល ជាភាសាខ្មែរ..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span>{t("fullDescriptionEnglish")}</span>
                    {isTranslatingDesc && (
                      <span className="text-[11px] text-primary font-semibold normal-case animate-pulse">
                        Auto-translating...
                      </span>
                    )}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-800"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed product description and features..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Gallery Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-primary text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                {t("productImages") || "Product Images"}
              </h2>
              <span className="text-[11px] font-semibold text-blue-100">
                {gallery.length} {isKh ? "រូបភាព" : gallery.length === 1 ? "image" : "images"}
              </span>
            </div>

            <div className="p-5 space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-primary/50 transition-colors">
                <div className="flex flex-col items-center justify-center gap-2 text-slate-800">
                  <UploadCloud className="w-8 h-8 text-slate-700" />
                  <span className="text-xs sm:text-sm font-bold">
                    {t("clickToUpload") || "Click to upload product images"}
                  </span>
                  <span className="text-[11px] text-slate-700">
                    {isKh ? "អាចជ្រើសរើសរូបច្រើនសន្លឹក (PNG, JPG)" : "Upload multiple PNG or JPG images"}
                  </span>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageSelect} />
              </label>

              {gallery.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {gallery.map((item, idx) => (
                    <div
                      key={item.key}
                      className={`relative group rounded-xl overflow-hidden border bg-white shadow-sm ${
                        idx === 0 ? "border-primary ring-2 ring-primary/20" : "border-slate-200"
                      }`}
                    >
                      <img src={getOptimizedImageUrl(item.url, 'card')} alt={`Product ${idx + 1}`} className="w-full h-28 object-cover" />

                      {idx === 0 ? (
                        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] bg-primary text-white px-2 py-0.5 rounded-md font-bold shadow">
                          <Star className="w-2.5 h-2.5 fill-white" />
                          {isKh ? "រូបគោល" : "Main"}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAsMainImage(idx)}
                          title={isKh ? "ដាក់ជារូបគោល" : "Set as main image"}
                          className="absolute bottom-2 left-2 text-[10px] bg-white/95 text-slate-800 hover:bg-primary hover:text-white px-2 py-0.5 rounded-md font-bold shadow transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {isKh ? "ដាក់គោល" : "Set Main"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeGalleryItem(idx)}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/95 rounded-full text-slate-800 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Auto-Generated SKU */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-primary text-white flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <h2 className="text-sm font-bold">{isKh ? "ស្ថានភាព & SKU" : "Visibility & SKU"}</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>SKU</span>
                  <span className="text-[10px] font-semibold text-slate-700 normal-case">
                    {isKh ? "បង្កើតស្វ័យប្រវត្តិ (មិនអាចកែ)" : "Auto-generated (Read-only)"}
                  </span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={sku}
                    className="w-full h-10 pl-10 pr-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 cursor-not-allowed select-all"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <span className="text-xs font-bold text-slate-800">{t("publishImmediately")}</span>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <span className="text-xs font-bold text-slate-800">{t("featureThisProduct")}</span>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-primary text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <h2 className="text-sm font-bold">{isKh ? "តម្លៃ និងស្តុកទំនិញ" : "Pricing & Inventory"}</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("priceUsd")}</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={`${inputCls} pl-10 font-bold`}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isKh ? "ចំនួនស្តុក" : "Stock Quantity"}
                  </label>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      stockNum <= 0
                        ? "bg-red-100 text-red-700"
                        : stockNum <= 5
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {stockNum <= 0
                      ? isKh ? "អស់ស្តុក" : "Out of Stock"
                      : stockNum <= 5
                      ? isKh ? "ស្តុកទាប" : "Low Stock"
                      : isKh ? "មានស្តុក" : "In Stock"}
                  </span>
                </div>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    className={`${inputCls} pl-10 font-bold`}
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organization & Machinery Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-primary text-white flex items-center gap-2">
              <ListPlus className="w-4 h-4" />
              <h2 className="text-sm font-bold">{t("classification")}</h2>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("mainCategory")}</label>
                <select
                  className={inputCls}
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">{t("selectCategory")}</option>
                  {categories
                    .filter((c: any) => !c.parentId)
                    .map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {isKh && cat.nameKhmer ? cat.nameKhmer : cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("subcategory")}</label>
                <select
                  className={`${inputCls} disabled:opacity-50`}
                  value={formData.subcategoryId}
                  onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value })}
                  disabled={!formData.categoryId}
                >
                  <option value="">{t("selectSubcategory")}</option>
                  {subcategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>
                      {isKh && sub.nameKhmer ? sub.nameKhmer : sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("brand")}</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. HITACHI"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("model")}</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. ZX200-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("year")}</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-700 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      className={`${inputCls} pl-9`}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="2020"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t("condition")}</label>
                  <select
                    className={inputCls}
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  >
                    <option value="new">NEW</option>
                    <option value="used">USED</option>
                    <option value="refurbished">REFURBISHED</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

