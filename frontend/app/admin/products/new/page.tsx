"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, UploadCloud, ArrowLeft, Loader2, Info, ListPlus, Package, Tag, DollarSign, MapPin, Calendar, Clock, FileText, Image as ImageIcon, Save } from "lucide-react"
import { uploadImageToSecureProxy } from "../../../../lib/upload"
import toast, { Toaster } from "react-hot-toast"
import { logActivity } from "../../../../lib/audit"
import { useLanguage } from "../../../../contexts/LanguageContext"
import imageCompression from "browser-image-compression"
import { useAutoTranslate } from "../../../../lib/useAutoTranslate"

export default function AddProduct() {
 const [categories, setCategories] = useState<any[]>([])
 const [subcategories, setSubcategories] = useState<any[]>([])
 const [selectedCategory, setSelectedCategory] = useState("")
 const [loading, setLoading] = useState(false)
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

 // Auto-translate: Khmer name → English name
 const { translated: autoName, isTranslating: isTranslatingName } = useAutoTranslate(formData.nameKhmer)
 // Auto-translate: Khmer description → English description
 const { translated: autoDesc, isTranslating: isTranslatingDesc } = useAutoTranslate(formData.descriptionKhmer)

 // Apply auto-translated name only if English box is empty
 useEffect(() => {
 if (autoName && !formData.name) {
 setFormData(prev => ({ ...prev, name: autoName }))
 }
 }, [autoName])

 // Apply auto-translated description only if English box is empty
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
 fetchAllCategories()
 }, [])

 async function fetchAllCategories() {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const token = localStorage.getItem("ysg_admin_token")
 const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }

 const res = await fetch(`${API_URL}/api/admin/read`, {
 method: "POST", headers,
 body: JSON.stringify({ table: "Category", eq: { isActive: true }, order: { column: "sortOrder", ascending: true } })
 })
 
 const result = await res.json()
 setCategories(result.data || [])
 }

 const generateSlug = (name: string) => {
 const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
 const shortId = "p" + Math.floor(1000 + Math.random() * 9000)
 return `${baseSlug}-${shortId}`
 }

 const handleCategoryChange = (categoryId: string) => {
 setSelectedCategory(categoryId)
 setFormData({...formData, categoryId, subcategoryId: ""})
 if (categoryId) {
 const subs = categories.filter((c: any) => c.parentId === categoryId)
 setSubcategories(subs)
 } else {
 setSubcategories([])
 }
 }

 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files
 if (!files || files.length === 0) return
 
 const newFiles = Array.from(files)
 const newPreviews = newFiles.map(file => URL.createObjectURL(file))
 
 setPendingImages(prev => [...prev, ...newFiles])
 setPreviewUrls(prev => [...prev, ...newPreviews])
 }

 const removeImage = (index: number) => {
 setPendingImages(prev => prev.filter((_, i) => i !== index))
 setPreviewUrls(prev => prev.filter((_, i) => i !== index))
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

 const slug = generateSlug(formData.name)
 
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
 action: "insert",
 data: {
 name: formData.name,
 nameKhmer: formData.nameKhmer || null,
 slug: slug,
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
 thumbnail: uploadedUrls[0] || null,
 createdAt: new Date().toISOString(),
 updatedAt: new Date().toISOString()
 }
 })
 })

 const jsonRes = await res.json()

 if (!res.ok || jsonRes.error) {
 toast.error("Error creating product: " + (jsonRes.error || "Unknown error"))
 } else {
 await logActivity({
 action: "create",
 entityType: "product",
 details: { name: formData.name }
 })
 toast.success("Product created successfully!")
 setTimeout(() => router.push("/admin/products"), 1500)
 }
 setLoading(false)
 }

 return (
    <div className="max-w-3xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("addProduct")}</h1>
            <p className="text-sm text-slate-500 mt-1">{t("fillInDetails")}</p>
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
                placeholder="ឧ. ម៉ាស៊ីនត្រងទឹក និងវេចខ្ចប់"
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
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="E.G., HITACHI ZX200-3"
                />
              </div>
 {!formData.name && formData.nameKhmer && !isTranslatingName && (
 <p className="text-xs text-slate-400 ml-1">⚡ Will auto-fill from Khmer input</p>
 )}
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
                {categories.filter((c: any) => !c.parentId).map((cat: any) => (
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
                disabled={!selectedCategory}
              >
                <option value="">{t("selectSubcategory")}</option>
                {subcategories.map((sub: any) => (
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
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="E.G., CATERPILLAR, HITACHI"
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
                placeholder="E.G., ZX200-3, 950H"
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
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">{t("year")}</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  placeholder="2020"
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
                    <span className="text-xs text-slate-400">{t("imageUploadHint") || "PNG, JPG up to 10MB each"}</span>
                  </>
                )}
              </div>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative group border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                    <img src={url} alt={`Preview ${i+1}`} className="w-full h-28 object-cover transition-transform group-hover:scale-105" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full text-slate-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors z-10 shadow-sm opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {i === 0 && <span className="absolute bottom-2 left-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded font-semibold">Main</span>}
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
                placeholder="ពិពណ៌នាអំពីផលិតផល ជាភាសាខ្មែរ..."
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
                placeholder="Detailed product description with specifications and features"
              />
              {!formData.description && formData.descriptionKhmer && !isTranslatingDesc && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Will auto-fill from Khmer description
                </p>
              )}
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
        <div className="p-6 bg-slate-50 flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-sm hover:bg-slate-100 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? t("creatingProduct") : t("createProduct")}
          </button>
        </div>
      </form>
    </div>
  )
}
