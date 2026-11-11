"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit, ChevronRight, ChevronDown, Folder, Image as ImageIcon, X, Check, Edit2, Loader2, Search } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { logActivity } from "../../../lib/audit"
import { useLanguage } from "../../../contexts/LanguageContext"
import { uploadImageToSecureProxy } from "../../../lib/upload"
import { useAutoTranslate } from "../../../lib/useAutoTranslate"
import Portal from "../../../components/Portal"
import { getOptimizedImageUrl } from "../../../lib/imageUtils"

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState("main")
  const [selectedParent, setSelectedParent] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    nameKhmer: "",
    slug: "",
    description: "",
    descriptionKhmer: "",
    parentId: "",
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
    image: ""
  })
  const router = useRouter()
  const { t, language } = useLanguage()
  const isKh = language === "kh"

  const { translated: autoName, isTranslating: isTranslatingName } = useAutoTranslate(
    showAddModal ? formData.nameKhmer : ""
  )
  const { translated: autoDesc, isTranslating: isTranslatingDesc } = useAutoTranslate(
    showAddModal ? formData.descriptionKhmer : ""
  )
  const lastAutoNameRef = useRef("")
  const lastAutoDescRef = useRef("")

  useEffect(() => {
    if (!showAddModal || !autoName) return
    setFormData((prev) => {
      if (!prev.name || prev.name === lastAutoNameRef.current) {
        lastAutoNameRef.current = autoName
        return { ...prev, name: autoName }
      }
      return prev
    })
  }, [autoName, showAddModal])

  useEffect(() => {
    if (!showAddModal || !autoDesc) return
    setFormData((prev) => {
      if (!prev.description || prev.description === lastAutoDescRef.current) {
        lastAutoDescRef.current = autoDesc
        return { ...prev, description: autoDesc }
      }
      return prev
    })
  }, [autoDesc, showAddModal])

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem("ysg_admin_token")
    const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    
    const res = await fetch(`${API_URL}/api/admin/read`, {
      method: "POST",
      headers,
      body: JSON.stringify({ table: "Category", order: { column: "sortOrder", ascending: true } })
    }).then(r => r.json())

    const allCats = res.data || []
    setCategories(allCats.filter((c: any) => !c.parentId))
    setSubcategories(allCats.filter((c: any) => Boolean(c.parentId)))
  }

  const getSubcategories = (parentId: string) => {
    return subcategories.filter(sub => sub.parentId === parentId)
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setPendingImageFile(file)
    setPreviewImage(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setFormData({ ...formData, image: "" })
    setPendingImageFile(null)
    setPreviewImage("")
  }

  const openAddMainModal = () => {
    lastAutoNameRef.current = ""
    lastAutoDescRef.current = ""
    setModalType("main")
    setEditingItem(null)
    setFormData({
      name: "",
      nameKhmer: "",
      slug: "",
      description: "",
      descriptionKhmer: "",
      parentId: "",
      isActive: true,
      isFeatured: false,
      sortOrder: categories.length,
      image: ""
    })
    setPendingImageFile(null)
    setPreviewImage("")
    setShowAddModal(true)
  }

  const openAddSubModal = (parent: any) => {
    lastAutoNameRef.current = ""
    lastAutoDescRef.current = ""
    setModalType("sub")
    setSelectedParent(parent)
    setEditingItem(null)
    setFormData({
      name: "",
      nameKhmer: "",
      slug: "",
      description: "",
      descriptionKhmer: "",
      parentId: parent.id,
      isActive: true,
      isFeatured: false,
      sortOrder: getSubcategories(parent.id).length,
      image: ""
    })
    setPendingImageFile(null)
    setPreviewImage("")
    setShowAddModal(true)
  }

  const openEditModal = (item: any) => {
    lastAutoNameRef.current = ""
    lastAutoDescRef.current = ""
    setModalType(item.parentId ? "sub" : "main")
    setEditingItem(item)
    setSelectedParent(item.parentId ? categories.find(c => c.id === item.parentId) : null)
    setFormData({
      name: item.name,
      nameKhmer: item.nameKhmer || "",
      slug: item.slug,
      description: item.description || "",
      descriptionKhmer: item.descriptionKhmer || "",
      parentId: item.parentId || "",
      isActive: item.isActive,
      isFeatured: item.isFeatured || false,
      sortOrder: item.sortOrder || 0,
      image: item.image || ""
    })
    setPendingImageFile(null)
    setPreviewImage("")
    setShowAddModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingImage(true)
    let finalImageUrl = formData.image

    if (pendingImageFile) {
      try {
        finalImageUrl = await uploadImageToSecureProxy(pendingImageFile);
      } catch (err: any) {
        setUploadingImage(false)
        toast.error("Failed to upload image: " + err.message)
        return
      }
    }

    const slug = formData.slug || generateSlug(formData.name)
    
    const dataToSave = {
      name: formData.name,
      nameKhmer: formData.nameKhmer || null,
      slug: slug,
      description: formData.description || null,
      descriptionKhmer: formData.descriptionKhmer || null,
      parentId: formData.parentId || null,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      sortOrder: formData.sortOrder,
      image: finalImageUrl || null,
      updatedAt: new Date().toISOString()
    }

    const token = localStorage.getItem("ysg_admin_token")
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const res = await fetch(`${API_URL}/api/admin/crud`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(
        editingItem
          ? { table: "Category", action: "update", match: { id: editingItem.id }, data: dataToSave }
          : { table: "Category", action: "insert", data: { ...dataToSave, createdAt: new Date().toISOString() } }
      )
    })

    if (!res.ok) {
      toast.error("Error saving category")
    } else {
      const jsonRes = await res.json().catch(() => ({}))
      const savedRecord = Array.isArray(jsonRes.data) ? jsonRes.data[0] : jsonRes.data

      if (savedRecord) {
        const sortByOrder = (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        if (savedRecord.parentId) {
          setCategories((prev) => prev.filter((c) => c.id !== savedRecord.id))
          setSubcategories((prev) => {
            const exists = prev.some((c) => c.id === savedRecord.id)
            const next = exists ? prev.map((c) => (c.id === savedRecord.id ? savedRecord : c)) : [...prev, savedRecord]
            return next.sort(sortByOrder)
          })
        } else {
          setSubcategories((prev) => prev.filter((c) => c.id !== savedRecord.id))
          setCategories((prev) => {
            const exists = prev.some((c) => c.id === savedRecord.id)
            const next = exists ? prev.map((c) => (c.id === savedRecord.id ? savedRecord : c)) : [...prev, savedRecord]
            return next.sort(sortByOrder)
          })
        }
      } else {
        fetchCategories()
      }

      void logActivity({
        action: editingItem ? "update" : "create",
        entityType: "category",
        entityId: editingItem?.id || savedRecord?.id,
        details: { name: formData.name }
      })
      toast.success(editingItem ? "Category updated" : "Category created")
      setShowAddModal(false)
      setEditingItem(null)
      setSelectedParent(null)
      setPendingImageFile(null)
      setPreviewImage("")
      setFormData({ name: "", nameKhmer: "", slug: "", description: "", descriptionKhmer: "", parentId: "", isActive: true, isFeatured: false, sortOrder: 0, image: "" })
    }
    setUploadingImage(false)
  }

  const handleDelete = async (item: any, hasChildren: boolean, subItemsCount: number) => {
    const itemName = language === "kh" && item.nameKhmer ? item.nameKhmer : item.name;

    if (hasChildren) {
      toast.error(language === "kh" 
        ? `មិនអាចលុប "${itemName}" បានទេ ព្រោះវាមានប្រភេទរងចំនួន ${subItemsCount}` 
        : `Cannot delete "${itemName}" because it has ${subItemsCount} subcategory(ies)`
      )
      return
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem("ysg_admin_token")
    const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }

    const [catCheckRes, subCheckRes] = await Promise.all([
      fetch(`${API_URL}/api/admin/read`, {
        method: "POST",
        headers,
        body: JSON.stringify({ table: "Product", select: "id", eq: { categoryId: item.id } })
      }),
      fetch(`${API_URL}/api/admin/read`, {
        method: "POST",
        headers,
        body: JSON.stringify({ table: "Product", select: "id", eq: { subcategoryId: item.id } })
      }),
    ])

    if (!catCheckRes.ok || !subCheckRes.ok) {
      toast.error(language === "kh" ? "មិនអាចផ្ទៀងផ្ទាត់ផលិតផលក្នុងប្រភេទនេះបានទេ" : "Failed to verify products in this category")
      return
    }

    const [catData, subData] = await Promise.all([catCheckRes.json(), subCheckRes.json()])
    const matchingProductIds = new Set<string>([
      ...(catData.data || []).map((p: any) => p.id),
      ...(subData.data || []).map((p: any) => p.id),
    ])
    const productCount = matchingProductIds.size

    if (productCount > 0) {
      toast.error(language === "kh"
        ? `មិនអាចលុប "${itemName}" បានទេ ព្រោះវាមាន ${productCount} ផលិតផល។ សូមលុប ឬផ្លាស់ប្តូរប្រភេទផលិតផលទាំងនោះជាមុនសិន។`
        : `Cannot delete "${itemName}" because it contains ${productCount} product(s). Please move or delete the products first.`
      )
      return
    }
    
    if (confirm(language === "kh" ? `តើអ្នកពិតជាចង់លុប "${itemName}" មែនទេ?` : `Are you sure you want to delete "${itemName}"?`)) {
      const res = await fetch(`${API_URL}/api/admin/crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ table: "Category", action: "delete", match: { id: item.id } })
      })
      
      if (!res.ok) {
        toast.error("Error deleting category")
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== item.id))
        setSubcategories((prev) => prev.filter((c) => c.id !== item.id))
        void logActivity({
          action: "delete",
          entityType: "category",
          entityId: item.id,
          details: { name: item.name }
        })
        toast.success(`"${item.name}" deleted`)
      }
    }
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{t("categories")}</h2>
          <p className="text-xs sm:text-sm font-medium text-slate-700 mt-1">{t("manageMainCategories")}</p>
        </div>
        <button
          onClick={openAddMainModal}
          className="btn-primary rounded-xl px-6 py-3 flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          {t("addMainCategory")}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-slate-200 bg-primary text-white flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white">{t("categoryStructure")}</h2>
          <p className="text-xs font-medium text-blue-100">{t("cannotDeleteCategories")}</p>
        </div>
        <div className="divide-y divide-slate-200">
          {categories.map((cat: any) => {
            const subItems = getSubcategories(cat.id)
            const isExpanded = expanded[cat.id]
            const hasChildren = subItems.length > 0

            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between p-4 hover:bg-primary/5 transition-all group">
                  <div className="flex items-center gap-4 flex-1">
                    {hasChildren && (
                      <button onClick={() => toggleExpand(cat.id)} className="p-1.5 rounded-lg border border-slate-200 shadow-sm bg-white hover:bg-slate-50 transition-all cursor-pointer">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                    {!hasChildren && <div className="w-8" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-slate-900 text-base md:text-lg">{language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}</span>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${cat.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {cat.isActive ? t('active') : t('inactive')}
                        </span>
                        {cat.isFeatured && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{t('featured')}</span>}
                      </div>
                      {(cat.description || cat.descriptionKhmer) && (
                        <div className="text-xs font-medium text-slate-700 mt-1">
                          {isKh && cat.descriptionKhmer ? cat.descriptionKhmer : cat.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openAddSubModal(cat)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer">
                      <Plus className="w-3 h-3" />
                      {t("addSub")}
                    </button>
                    <button onClick={() => openEditModal(cat)} className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-primary hover:text-primary transition-all cursor-pointer">
                      <Edit className="w-4 h-4 text-slate-900" />
                    </button>
                    <button onClick={() => handleDelete(cat, hasChildren, subItems.length)} className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                {isExpanded && hasChildren && (
                  <div className="bg-slate-50 pl-14 border-t border-slate-200 divide-y divide-slate-200">
                    {subItems.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-white transition-all group">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-slate-900">{language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}</span>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${sub.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {sub.isActive ? t('active') : t('inactive')}
                            </span>
                          </div>
                          {(sub.description || sub.descriptionKhmer) && (
                            <div className="text-xs font-medium text-slate-700 mt-1">
                              {isKh && sub.descriptionKhmer ? sub.descriptionKhmer : sub.description}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(sub)} className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-primary hover:text-primary transition-all cursor-pointer">
                            <Edit className="w-4 h-4 text-slate-900" />
                          </button>
                          <button onClick={() => handleDelete(sub, false, 0)} className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-all cursor-pointer">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {categories.length === 0 && (
            <div className="p-12 text-center">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t("noCategoriesYet")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <Portal>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-primary text-white border-b border-slate-200 px-5 py-4 z-10 flex justify-between items-start gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">{editingItem ? t("editCategory") : t("addMainCategory")}</h2>
                  <p className="text-xs font-medium text-blue-100 mt-0.5">
                    {editingItem ? t("modifyCategoryInfo") : t("createNewTopLevel")}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {t("categoryName")} ({isKh ? "ភាសាខ្មែរ" : "Khmer"}) *
                    </label>
                    <input type="text" required className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium text-xs sm:text-sm text-slate-900 transition-all" value={formData.nameKhmer} onChange={(e) => setFormData({...formData, nameKhmer: e.target.value})} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                      <span>{t("categoryName")} ({isKh ? "ភាសាអង់គ្លេស" : "English"}) *</span>
                      {isTranslatingName && (
                        <span className="text-[11px] font-semibold text-primary animate-pulse">
                          {isKh ? "កំពុងបកប្រែ..." : "Auto-translating..."}
                        </span>
                      )}
                    </label>
                    <input type="text" required className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium text-xs sm:text-sm text-slate-900 transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {t("description")} ({isKh ? "ភាសាខ្មែរ" : "Khmer"})
                    </label>
                    <textarea rows={3} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium text-xs sm:text-sm text-slate-900 transition-all resize-none" value={formData.descriptionKhmer} onChange={(e) => setFormData({...formData, descriptionKhmer: e.target.value})} />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
                      <span>{t("description")} ({isKh ? "ភាសាអង់គ្លេស" : "English"})</span>
                      {isTranslatingDesc && (
                        <span className="text-[11px] font-semibold text-primary animate-pulse">
                          {isKh ? "កំពុងបកប្រែ..." : "Auto-translating..."}
                        </span>
                      )}
                    </label>
                    <textarea rows={3} className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium text-xs sm:text-sm text-slate-900 transition-all resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("sortOrder")}</label>
                    <input type="number" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium text-xs sm:text-sm text-slate-900 transition-all" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">{t("categoryImage") || "Category Image"}</label>
                    {!previewImage && !formData.image ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-white transition-all">
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-700">
                          <ImageIcon className="w-7 h-7" />
                          <span className="text-xs font-semibold">{t("clickToSelectImage")}</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    ) : (
                      <div className="relative group p-2 border border-slate-200 rounded-xl bg-slate-50">
                        <img 
                          src={previewImage || getOptimizedImageUrl(formData.image, 'card')} 
                          alt="Category" 
                          className="w-full h-40 object-cover rounded-lg border border-slate-200" 
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-white text-red-600 border border-slate-200 shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-5 pt-1">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 border border-slate-300 rounded accent-primary" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">{t("active")}</span>
                    </label>
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 border border-slate-300 rounded accent-primary" />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">{t("featured")}</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-xs sm:text-sm text-slate-800 hover:bg-slate-100 transition-colors">{t("cancel")}</button>
                  <button type="submit" disabled={uploadingImage} className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-60">
                    {uploadingImage ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (editingItem ? t("update") : t("create"))}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
