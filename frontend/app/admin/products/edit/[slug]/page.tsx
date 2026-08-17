"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Plus, X, UploadCloud, ArrowLeft, Loader2, Info, ListPlus, Save, Package, Tag, DollarSign, MapPin, Calendar, Clock, Image as ImageIcon, FileText } from "lucide-react"
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



 const generateSlug = (name: string, oldSlug: string) => {
 const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
 // Extract -pXXXX from oldSlug if it exists
 const match = oldSlug.match(/-p\d+$/)
 if (match) {
 return `${baseSlug}${match[0]}`
 }
 
 // If it's an old format (like -1785746484266-352), let's just keep the old slug 
 // entirely rather than generating a completely new one that breaks links.
 return oldSlug
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
 
 if (subcategories.length > 0 && !formData.subcategoryId) {
 toast.error(language === "kh" ? "សូមជ្រើសរើសប្រភេទរង (Subcategory) សម្រាប់ផលិតផលនេះ!" : "Please select a subcategory for this product!")
 return
 }
 
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

 const newSlug = generateSlug(formData.name, slug)

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
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("editProduct") || "Edit Product"}</h1>
            <p className="text-sm text-slate-500 mt-1">{t("modifyProductInfo") || "Modify product details and specifications"}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Basic Information Section */}
        <div className="p-4 md:p-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t("basicInformation")}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("productNameKhmer")} *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                value={formData.nameKhmer}
                onChange={(e) => setFormData({...formData, nameKhmer: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                {t("productNameEnglish")}
                {isTranslatingName && <span className="text-xs text-primary font-normal animate-pulse">⟳ Auto-translating...</span>}
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Classification Section */}
        <div className="p-4 md:p-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <ListPlus className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t("classification")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("mainCategory")}</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900"
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
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("subcategory")}</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 disabled:opacity-50"
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
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("brand")}</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("model")}</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Specifications Section */}
        <div className="p-4 md:p-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t("pricingSpecifications")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("priceUsd")}</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("year")}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  className="w-full pl-12 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("condition")}</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900"
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
              >
                <option value="new">NEW</option>
                <option value="used">USED</option>
                <option value="refurbished">REFURBISHED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="p-4 md:p-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t("productImages") || "Product Images"}</h2>
          </div>
          <div className="space-y-6">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center justify-center gap-3 text-slate-600">
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-primary" />
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-slate-400" />
                    <span className="text-sm font-semibold">{t("clickToUpload") || "Click to upload images"}</span>
                    <span className="text-xs text-slate-400">PNG, JPG up to 10MB each</span>
                  </>
                )}
              </div>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>

            {(images.length > 0 || previewUrls.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Existing Images */}
                {images.map((url, i) => (
                  <div key={`existing-${i}`} className="relative group border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                    <img src={url} alt={`Product ${i+1}`} className="w-full h-28 object-cover transition-transform group-hover:scale-105" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full text-slate-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors z-10 shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {i === 0 && <span className="absolute bottom-2 left-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded font-semibold">Main</span>}
                  </div>
                ))}
                
                {/* Pending New Images */}
                {previewUrls.map((url, i) => (
                  <div key={`pending-${i}`} className="relative group border-2 border-primary rounded-lg overflow-hidden shadow-sm bg-white">
                    <img src={url} alt={`Preview ${i+1}`} className="w-full h-28 object-cover opacity-80 grayscale transition-transform group-hover:scale-105" />
                    <button
                      type="button"
                      onClick={() => removePendingImage(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full text-slate-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors z-10 shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span className="absolute bottom-2 right-2 text-[10px] bg-white text-slate-900 px-2 py-0.5 rounded font-semibold border border-slate-200">New</span>
                    {images.length === 0 && i === 0 && <span className="absolute bottom-2 left-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded font-semibold">Main</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="p-4 md:p-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{t("description")}</h2>
          </div>
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("fullDescriptionKhmer")}</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 resize-none placeholder:text-slate-400"
                value={formData.descriptionKhmer}
                onChange={(e) => setFormData({...formData, descriptionKhmer: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                {t("fullDescriptionEnglish")}
                {isTranslatingDesc && <span className="text-xs text-primary font-normal animate-pulse">⟳ Auto-translating...</span>}
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 resize-none placeholder:text-slate-400"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="p-4 md:p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-wrap gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="w-5 h-5 border-slate-300 rounded text-primary focus:ring-primary/20 transition-all cursor-pointer"
                />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{t("publishImmediately")}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="w-5 h-5 border-slate-300 rounded text-primary focus:ring-primary/20 transition-all cursor-pointer"
                />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{t("featureThisProduct")}</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 md:p-5 bg-slate-50 flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-sm hover:bg-slate-100 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? (t("saving") || "Saving...") : (t("saveChanges") || "Save Changes")}
          </button>
        </div>
      </form>
 </div>
 )
}
