"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus, X, UploadCloud, ArrowLeft, Loader2, Info, ListPlus, Save, Package, Tag, DollarSign, MapPin, Calendar, Clock, Image as ImageIcon } from "lucide-react"
import { uploadImageToSecureProxy } from "../../../../../lib/upload"
import toast, { Toaster } from "react-hot-toast"
import { logActivity } from "../../../../../lib/audit"
import { useLanguage } from "../../../../../contexts/LanguageContext"
import imageCompression from "browser-image-compression"
import { useAutoTranslate } from "../../../../../lib/useAutoTranslate"

export default function EditProduct() {
  const params = useParams()
  const slug = params.slug as string

  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [productId, setProductId] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
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
    subcategoryId: ""
  })
  const router = useRouter()
  const { t, language } = useLanguage()

  // Auto-translate: Khmer name → English name (only fires if English is empty)
  const { translated: autoName, isTranslating: isTranslatingName } = useAutoTranslate(formData.nameKhmer)
  // Auto-translate: Khmer description → English description
  const { translated: autoDesc, isTranslating: isTranslatingDesc } = useAutoTranslate(formData.descriptionKhmer)

  useEffect(() => {
    if (autoName && !formData.name) {
      setFormData(prev => ({ ...prev, name: autoName }))
    }
  }, [autoName])

  useEffect(() => {
    if (autoDesc && !formData.description) {
      setFormData(prev => ({ ...prev, description: autoDesc }))
    }
  }, [autoDesc])

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (!userStr) {
      router.push("/admin/login")
      return
    }
    
    async function initialFetch() {
      setFetching(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const token = localStorage.getItem("ysg_admin_token")
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }

      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Category", order: { column: "sortOrder", ascending: true } }) }).then(r => r.json()),
          fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Product", eq: { slug }, limit: 1 }) }).then(r => r.json())
        ])

        const allCats = catRes.data || []
        setCategories(allCats)
        
        if (prodRes.error || !prodRes.data || prodRes.data.length === 0) {
          toast.error("Product not found")
          router.push("/admin/products")
          return
        }

        const data = prodRes.data[0]
        setProductId(data.id)
        
        const initialImages = data.images || (data.thumbnail ? [data.thumbnail] : [])
        setImages(initialImages)

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
          subcategoryId: subCatId
        })

        if (mainCatId) {
          const subs = allCats.filter((c: any) => c.parentId === mainCatId)
          setSubcategories(subs)
        }
      } catch (err) {
        console.error("Edit Product Fetch Error:", err)
      } finally {
        setFetching(false)
      }
    }

    initialFetch()
  }, [slug])



  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    const newFiles = Array.from(files)
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    
    setPendingImages(prev => [...prev, ...newFiles])
    setPreviewUrls(prev => [...prev, ...newPreviews])
  }

  const removeExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData({...formData, categoryId, subcategoryId: ""})
    if (categoryId) {
      const subs = categories.filter(c => c.parentId === categoryId)
      setSubcategories(subs)
    } else {
      setSubcategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const uploadedUrls: string[] = []
    if (pendingImages.length > 0) {
      for (const file of pendingImages) {
        try {
          const options = { maxSizeMB: 0.2, maxWidthOrHeight: 600, useWebWorker: true }
          const compressedFile = await imageCompression(file, options)
          
          const secureUrl = await uploadImageToSecureProxy(compressedFile);
          uploadedUrls.push(secureUrl);
        } catch (err: any) {
          console.error("Compression or upload failed", err)
          toast.error(`Image upload failed: ${err.message}`)
          setLoading(false)
          return
        }
      }
    }

    const finalImages = [...images, ...uploadedUrls]

    const newSlug = generateSlug(formData.name)

    const token = localStorage.getItem("ysg_admin_token")
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const res = await fetch(`${API_URL}/api/admin/crud`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        table: "Product",
        action: "update",
        match: { id: productId },
        data: {
          name: formData.name,
          nameKhmer: formData.nameKhmer || null,
          slug: newSlug,
          brand: formData.brand,
          model: formData.model,
          price: parseFloat(formData.price) || 0,
          year: parseInt(formData.year) || null,
          condition: formData.condition,
          description: formData.description,
          descriptionKhmer: formData.descriptionKhmer || null,
          isPublished: formData.isPublished,
          isFeatured: formData.isFeatured,
          categoryId: formData.subcategoryId || formData.categoryId || null,
          subcategoryId: null,
          thumbnail: finalImages[0] || null,
          updatedAt: new Date().toISOString()
        }
      })
    })

    const jsonRes = await res.json()

    if (!res.ok || jsonRes.error) {
      toast.error("Error updating product: " + (jsonRes.error || "Unknown error"))
    } else {
      await logActivity({
        action: "update",
        entityType: "product",
        details: { name: formData.name }
      })
      toast.success("Product updated successfully!")
      setTimeout(() => router.push("/admin/products"), 1500)
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-6">
        <button
          onClick={() => router.back()}
          className="self-start p-3 bg-white border border-slate-200 shadow-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary text-white border border-slate-200 shadow-sm">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight uppercase text-slate-900">{t("editProduct") || "Edit Product"}</h2>
            <p className="text-sm font-medium text-slate-500 mt-2">{t("modifyProductInfo") || "Modify product details and specifications"}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="solid-card bg-white p-0 overflow-hidden">
        {/* Basic Information */}
        <div className="p-8 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 font-medium">{t("basicInformation")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("productNameKhmer")} *</label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide"
                value={formData.nameKhmer}
                onChange={(e) => setFormData({...formData, nameKhmer: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1 flex items-center gap-2">
                {t("productNameEnglish")}
                {isTranslatingName && <span className="text-xs text-primary font-normal normal-case tracking-normal animate-pulse">⟳ Auto-translating...</span>}
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-900" />
                <input
                  type="text"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 uppercase tracking-wide"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="p-8 border-b border-slate-200 bg-primary/5">
          <h2 className="text-xl font-bold text-slate-900 mb-6 font-medium">{t("classification")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("mainCategory")}</label>
              <select
                className="w-full px-5 py-4 bg-white border border-slate-200 outline-none transition-all font-bold text-xs text-slate-900 font-medium"
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">{t("selectCategory")}</option>
                {(categories as any[]).filter((c: any) => !c.parentId).map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("subcategory")}</label>
              <select
                className="w-full px-5 py-4 bg-white border border-slate-200 outline-none transition-all font-bold text-xs text-slate-900 font-medium disabled:opacity-50"
                value={formData.subcategoryId}
                onChange={(e) => setFormData({...formData, subcategoryId: e.target.value})}
                disabled={!formData.categoryId}
              >
                <option value="">{t("selectSubcategory")}</option>
                {(subcategories as any[]).map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("brand")}</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-900" />
                <input
                  type="text"
                  className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 outline-none transition-all font-bold text-xs text-slate-900 font-medium"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("model")}</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-white border border-slate-200 outline-none transition-all font-bold text-xs text-slate-900 font-medium"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Specs */}
        <div className="p-8 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 font-medium">{t("pricingSpecifications")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("priceUsd")}</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-900" />
                <input type="number" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 font-medium" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("year")}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-900" />
                <input type="number" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 font-medium" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("condition")}</label>
              <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 font-medium" value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}>
                <option value="new">NEW</option>
                <option value="used">USED</option>
                <option value="refurbished">REFURBISHED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="p-8 border-b border-slate-200 bg-primary/5">
          <h2 className="text-xl font-bold text-slate-900 mb-6 font-medium">{t("productImages") || "Product Images"}</h2>
          <div className="space-y-6">
            <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
              <div className="flex flex-col items-center justify-center gap-3 text-slate-900">
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-transparent" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10" />
                    <span className="text-sm font-bold font-medium">{t("clickToUpload") || "Click to upload images"}</span>
                    <span className="text-xs font-bold text-slate-500 font-medium">PNG, JPG up to 10MB each</span>
                  </>
                )}
              </div>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>

            {(images.length > 0 || previewUrls.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {/* Existing Images */}
                {images.map((url, i) => (
                  <div key={`existing-${i}`} className="relative group border border-slate-200 shadow-sm bg-white">
                    <img src={url} alt={`Product ${i+1}`} className="w-full h-28 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 text-slate-900 font-bold text-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors z-10"
                    >
                      ✕
                    </button>
                    {i === 0 && <span className="absolute bottom-2 left-2 text-xs bg-primary border border-slate-200 text-white px-2 py-0.5 font-bold font-medium">Main</span>}
                  </div>
                ))}
                
                {/* Pending New Images */}
                {previewUrls.map((url, i) => (
                  <div key={`pending-${i}`} className="relative group border-4 border-primary bg-white shadow-sm">
                    <img src={url} alt={`Preview ${i+1}`} className="w-full h-28 object-cover opacity-80 grayscale" />
                    <button
                      type="button"
                      onClick={() => removePendingImage(i)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 text-slate-900 font-bold text-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors z-10"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-2 right-2 text-xs bg-white border border-slate-200 text-slate-900 px-2 py-0.5 font-bold font-medium">New</span>
                    {images.length === 0 && i === 0 && <span className="absolute bottom-2 left-2 text-xs bg-primary border border-slate-200 text-white px-2 py-0.5 font-bold font-medium">Main</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="p-8 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 font-medium">{t("description")}</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("fullDescriptionKhmer")}</label>
              <textarea rows={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide resize-none" value={formData.descriptionKhmer} onChange={(e) => setFormData({...formData, descriptionKhmer: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold text-slate-900 font-medium ml-1">{t("fullDescriptionEnglish")}</label>
              <textarea rows={6} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-xs text-slate-900 tracking-wide resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="p-8">
          <div className="flex flex-wrap gap-10">
            <label className="flex items-center gap-4 cursor-pointer group">
              <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({...formData, isPublished: e.target.checked})} className="w-6 h-6 border border-slate-200 accent-primary shadow-sm cursor-pointer" />
              <span className="text-xs font-bold text-slate-900 font-medium">{t("publishImmediately")}</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="w-6 h-6 border border-slate-200 accent-primary shadow-sm cursor-pointer" />
              <span className="text-xs font-bold text-slate-900 font-medium">{t("featureThisProduct")}</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-6">
          <button type="button" onClick={() => router.back()} className="px-8 py-4 bg-white border border-slate-200 text-slate-900 font-bold text-xs font-medium hover:bg-slate-50 hover:shadow-sm transition-all">
            {t("cancel")}
          </button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary py-4 px-8 flex items-center justify-center gap-3 text-xs">
            {loading ? <div className="w-5 h-5 border border-slate-200 border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? (t("saving") || "Saving...") : (t("saveChanges") || "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  )
}
