"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "../../../../../lib/supabase/client"
import { ArrowLeft, Save, Package, Tag, DollarSign, MapPin, Calendar, Clock, Image as ImageIcon } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { logActivity } from "../../../../../lib/audit"
import { useLanguage } from "../../../../../contexts/LanguageContext"

export default function EditProduct() {
  const params = useParams()
  const slug = params.slug as string

  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [productId, setProductId] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    nameKhmer: "",
    brand: "",
    model: "",
    price: "",
    year: "",
    hours: "",
    location: "",
    condition: "used",
    description: "",
    descriptionKhmer: "",
    shortDescription: "",
    isPublished: true,
    isFeatured: false,
    categoryId: "",
    subcategoryId: ""
  })
  const router = useRouter()
  const { t, language } = useLanguage()

  useEffect(() => {
    const userStr = localStorage.getItem("ysg_admin_user")
    if (!userStr) {
      router.push("/admin/login")
      return
    }
    fetchCategories()
    fetchProduct()
  }, [slug])

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await supabase
      .from("Category")
      .select("*")
      .order("sortOrder", { ascending: true })
    setCategories(data || [])
  }

  async function fetchSubcategories(categoryId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from("Category")
      .select("*")
      .eq("parentId", categoryId)
      .eq("isActive", true)
      .order("sortOrder", { ascending: true })
    setSubcategories(data || [])
  }

  async function fetchProduct() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("Product")
      .select("*")
      .eq("slug", slug)
      .single()

    if (error || !data) {
      toast.error("Product not found")
      router.push("/admin/products")
      return
    }

    setProductId(data.id)
    setImages(data.images || [])
    setFormData({
      name: data.name || "",
      nameKhmer: data.nameKhmer || "",
      brand: data.brand || "",
      model: data.model || "",
      price: data.price?.toString() || "",
      year: data.year?.toString() || "",
      hours: data.hours?.toString() || "",
      location: data.location || "",
      condition: data.condition || "used",
      description: data.description || "",
      descriptionKhmer: data.descriptionKhmer || "",
      shortDescription: data.shortDescription || "",
      isPublished: data.isPublished ?? true,
      isFeatured: data.isFeatured ?? false,
      categoryId: data.categoryId || "",
      subcategoryId: data.subcategoryId || ""
    })

    if (data.categoryId) {
      fetchSubcategories(data.categoryId)
    }

    setFetching(false)
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingImage(true)
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const data = new FormData()
      data.append("file", file)
      data.append("upload_preset", "ysg_products")
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: data }
      )
      const json = await res.json()
      if (json.secure_url) uploaded.push(json.secure_url)
    }
    setImages(prev => [...prev, ...uploaded])
    setUploadingImage(false)
    toast.success(`${uploaded.length} image(s) uploaded!`)
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData({...formData, categoryId, subcategoryId: ""})
    if (categoryId) {
      fetchSubcategories(categoryId)
    } else {
      setSubcategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const newSlug = generateSlug(formData.name)

    const { error } = await supabase
      .from("Product")
      .update({
        name: formData.name,
        nameKhmer: formData.nameKhmer || null,
        slug: newSlug,
        brand: formData.brand,
        model: formData.model,
        price: parseFloat(formData.price) || 0,
        year: parseInt(formData.year) || null,
        hours: parseInt(formData.hours) || null,
        location: formData.location,
        condition: formData.condition,
        description: formData.description,
        descriptionKhmer: formData.descriptionKhmer || null,
        shortDescription: formData.shortDescription,
        isPublished: formData.isPublished,
        isFeatured: formData.isFeatured,
        categoryId: formData.categoryId || null,
        subcategoryId: formData.subcategoryId || null,
        images: images,
        updatedAt: new Date().toISOString()
      })
      .eq("id", productId)

    if (error) {
      toast.error("Error updating product: " + error.message)
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
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToProducts")}
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("editProduct") || "Edit Product"}</h1>
            <p className="text-sm text-gray-500 mt-1">{formData.name}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Basic Information */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("basicInformation")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("productNameEnglish")}</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("productNameKhmer")}</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.nameKhmer}
                onChange={(e) => setFormData({...formData, nameKhmer: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("classification")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("mainCategory")}</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("subcategory")}</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("brand")}</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("model")}</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Pricing & Specs */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("pricingSpecifications")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("priceUsd")}</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("year")}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("hours")}</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="number" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg" value={formData.hours} onChange={(e) => setFormData({...formData, hours: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("location")}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("condition")}</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("productImages") || "Product Images"}</h2>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors">
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm">{t("clickToUpload") || "Click to upload images"}</span>
                    <span className="text-xs text-gray-400">PNG, JPG up to 10MB each</span>
                  </>
                )}
              </div>
              <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Product ${i+1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-white px-1 rounded">Main</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("description")}</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("shortDescription")}</label>
              <textarea rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" value={formData.shortDescription} onChange={(e) => setFormData({...formData, shortDescription: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("fullDescriptionEnglish")}</label>
              <textarea rows={6} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("fullDescriptionKhmer")}</label>
              <textarea rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" value={formData.descriptionKhmer} onChange={(e) => setFormData({...formData, descriptionKhmer: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="p-6">
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({...formData, isPublished: e.target.checked})} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
              <span className="text-sm text-gray-700">{t("publishImmediately")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
              <span className="text-sm text-gray-700">{t("featureThisProduct")}</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 rounded-b-xl border-t border-gray-100">
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? (t("saving") || "Saving...") : (t("saveChanges") || "Save Changes")}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
