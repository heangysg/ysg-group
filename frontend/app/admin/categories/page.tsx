"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit, ChevronRight, ChevronDown, Folder, Image as ImageIcon, X, Check, Edit2, Loader2, Search } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { logActivity } from "../../../lib/audit"
import { useLanguage } from "../../../contexts/LanguageContext"
import imageCompression from "browser-image-compression"
import { uploadImageToSecureProxy } from "../../../lib/upload"

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

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem("ysg_admin_token")
    const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
    
    const [mainRes, subRes] = await Promise.all([
      fetch(`${API_URL}/api/admin/read`, {
        method: "POST", headers,
        body: JSON.stringify({ table: "Category", isNull: ["parentId"], order: { column: "sortOrder", ascending: true } })
      }).then(r => r.json()),
      fetch(`${API_URL}/api/admin/read`, {
        method: "POST", headers,
        body: JSON.stringify({ table: "Category", isNotNull: ["parentId"], order: { column: "sortOrder", ascending: true } })
      }).then(r => r.json())
    ])
    
    setCategories(mainRes.data || [])
    setSubcategories(subRes.data || [])
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
        const options = { maxSizeMB: 0.1, maxWidthOrHeight: 300, useWebWorker: true }
        const compressedFile = await imageCompression(pendingImageFile, options)
        
        finalImageUrl = await uploadImageToSecureProxy(compressedFile);
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
    let error
    if (editingItem) {
      const res = await fetch(`${API_URL}/api/admin/crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ table: "Category", action: "update", match: { id: editingItem.id }, data: dataToSave })
      })
      if (!res.ok) error = new Error("Failed to update")
    } else {
      const res = await fetch(`${API_URL}/api/admin/crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ table: "Category", action: "insert", data: { ...dataToSave, createdAt: new Date().toISOString() } })
      })
      if (!res.ok) error = new Error("Failed to insert")
    }
    
    if (error) {
      toast.error("Error saving category")
    } else {
      await logActivity({
        action: editingItem ? "update" : "create",
        entityType: "category",
        entityId: editingItem?.id,
        details: { name: formData.name }
      })
      toast.success(editingItem ? "Category updated" : "Category created")
      setShowAddModal(false)
      setEditingItem(null)
      setSelectedParent(null)
      setPendingImageFile(null)
      setPreviewImage("")
      setFormData({ name: "", nameKhmer: "", slug: "", description: "", descriptionKhmer: "", parentId: "", isActive: true, isFeatured: false, sortOrder: 0, image: "" })
      fetchCategories()
    }
    setUploadingImage(false)
  }

  const handleDelete = async (item: any, hasChildren: boolean, subItemsCount: number) => {
    if (hasChildren) {
      toast.error(`Cannot delete "${item.name}" because it has ${subItemsCount} subcategory(ies)`)
      return
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem("ysg_admin_token")

    const productCheck = await fetch(`${API_URL}/api/admin/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ 
        table: "Product", 
        or: [`categoryId.eq.${item.id}`, `subcategoryId.eq.${item.id}`] 
      })
    })
    const productData = await productCheck.json()
    const productCount = productData.data?.length || 0

    if (productCount > 0) {
      toast.error(`Cannot delete "${item.name}" because it contains ${productCount} product(s). Please move or delete the products first.`)
      return
    }
    
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const res = await fetch(`${API_URL}/api/admin/crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ table: "Category", action: "delete", match: { id: item.id } })
      })
      
      if (!res.ok) {
        toast.error("Error deleting category")
      } else {
        await logActivity({
          action: "delete",
          entityType: "category",
          entityId: item.id,
          details: { name: item.name }
        })
        toast.success(`"${item.name}" deleted`)
        fetchCategories()
      }
    }
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">{t("categories")}</h1>
          <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-widest">{t("manageMainCategories")}</p>
        </div>
        <button
          onClick={openAddMainModal}
          className="btn-primary px-6 py-3 flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          {t("addMainCategory")}
        </button>
      </div>

      <div className="solid-card bg-white overflow-hidden p-0">
        <div className="p-6 border-b-2 border-slate-900 bg-primary">
          <h2 className="font-bold text-slate-900 uppercase tracking-widest text-lg">{t("categoryStructure")}</h2>
          <p className="text-xs font-bold text-slate-900 mt-1 uppercase tracking-widest">{t("cannotDeleteCategories")}</p>
        </div>
        <div className="divide-y-2 divide-slate-900">
          {categories.map((cat: any) => {
            const subItems = getSubcategories(cat.id)
            const isExpanded = expanded[cat.id]
            const hasChildren = subItems.length > 0
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between p-4 hover:bg-primary/5 transition-all group">
                  <div className="flex items-center gap-4 flex-1">
                    {hasChildren && (
                      <button onClick={() => toggleExpand(cat.id)} className="p-1 border-2 border-slate-900 shadow-hard bg-white hover:translate-y-0.5 transition-all">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                    {!hasChildren && <div className="w-8" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-slate-900 uppercase text-lg">{language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 uppercase tracking-widest border-2 shadow-hard ${cat.isActive ? 'bg-emerald-50 text-emerald-900 border-emerald-900' : 'bg-slate-100 text-slate-900 border-slate-900'}`}>
                          {cat.isActive ? t('active') : t('inactive')}
                        </span>
                        {cat.isFeatured && <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-900 border-2 border-amber-900 shadow-hard uppercase tracking-widest">{t('featured')}</span>}
                      </div>
                      {cat.description && <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{cat.description}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openAddSubModal(cat)} className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-emerald-50 border-2 border-emerald-900 text-emerald-900 shadow-hard hover:translate-y-0.5 transition-all flex items-center gap-2">
                      <Plus className="w-3 h-3" />
                      {t("addSub")}
                    </button>
                    <button onClick={() => openEditModal(cat)} className="p-1.5 bg-white border-2 border-slate-900 shadow-hard hover:translate-y-0.5 transition-all">
                      <Edit className="w-4 h-4 text-slate-900" />
                    </button>
                    <button onClick={() => handleDelete(cat, hasChildren, subItems.length)} className="p-1.5 bg-white border-2 border-slate-900 shadow-hard hover:shadow-hard-red hover:border-red-600 transition-all">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                {isExpanded && hasChildren && (
                  <div className="bg-slate-50 pl-14 border-t-2 border-slate-900 divide-y-2 divide-slate-900">
                    {subItems.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-white transition-all group">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-slate-900 uppercase">{language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}</span>
                            <span className={`text-xs font-bold px-2.5 py-1 uppercase tracking-widest border-2 shadow-hard ${sub.isActive ? 'bg-emerald-50 text-emerald-900 border-emerald-900' : 'bg-slate-100 text-slate-900 border-slate-900'}`}>
                              {sub.isActive ? t('active') : t('inactive')}
                            </span>
                          </div>
                          {sub.description && <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{sub.description}</div>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(sub)} className="p-1.5 bg-white border-2 border-slate-900 shadow-hard hover:translate-y-0.5 transition-all">
                            <Edit className="w-4 h-4 text-slate-900" />
                          </button>
                          <button onClick={() => handleDelete(sub, false, 0)} className="p-1.5 bg-white border-2 border-slate-900 shadow-hard hover:shadow-hard-red hover:border-red-600 transition-all">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="solid-card bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-primary border-b-2 border-slate-900 px-8 py-6 z-10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 uppercase tracking-widest">
                {editingItem ? t("edit") : t("addNew")} {modalType === "main" ? t("categoryName") : t("subcategory")}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 bg-white border-2 border-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
              >
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-bold text-slate-700 uppercase tracking-widest mb-2 ml-1">{t("categoryName")} (Khmer) *</label>
                  <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none font-bold text-xs uppercase tracking-widest transition-all" value={formData.nameKhmer} onChange={(e) => setFormData({...formData, nameKhmer: e.target.value})} />
                </div>
                <div>
                  <label className="block text-base font-bold text-slate-700 uppercase tracking-widest mb-2 ml-1">{t("categoryName")} (English) *</label>
                  <input type="text" required className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none font-bold text-xs uppercase tracking-widest transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-base font-bold text-slate-700 uppercase tracking-widest mb-2 ml-1">{t("description")} (Khmer)</label>
                  <textarea rows={3} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none font-bold text-xs uppercase tracking-widest transition-all resize-none" value={formData.descriptionKhmer} onChange={(e) => setFormData({...formData, descriptionKhmer: e.target.value})} />
                </div>
                <div>
                  <label className="block text-base font-bold text-slate-700 uppercase tracking-widest mb-2 ml-1">{t("description")} (English)</label>
                  <textarea rows={3} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none font-bold text-xs uppercase tracking-widest transition-all resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-base font-bold text-slate-700 uppercase tracking-widest mb-2 ml-1">Sort Order</label>
                  <input type="number" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-900 focus:bg-white outline-none font-bold text-xs uppercase tracking-widest transition-all" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})} />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-base font-bold text-slate-700 uppercase tracking-widest mb-2 ml-1">{t("categoryImage") || "Category Image"}</label>
                  {!previewImage && !formData.image ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-900 cursor-pointer hover:bg-white transition-all">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-900">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs font-bold uppercase tracking-widest">{t("clickToSelectImage")}</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    <div className="relative group p-2 border-2 border-slate-900 bg-slate-50">
                      <img 
                        src={previewImage || formData.image} 
                        alt="Category" 
                        className="w-full h-40 object-cover border-2 border-slate-900" 
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-4 right-4 p-2 bg-white text-red-600 border-2 border-slate-900 shadow-hard hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-8 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 border-2 border-slate-900 accent-primary" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t("active")}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} className="w-5 h-5 border-2 border-slate-900 accent-primary" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t("featured")}</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t-2 border-slate-900">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 border-2 border-slate-900 bg-white font-bold text-xs text-slate-900 uppercase tracking-widest hover:bg-slate-50 hover:shadow-hard transition-all">{t("cancel")}</button>
                <button type="submit" disabled={uploadingImage} className="flex-1 btn-primary py-4 px-6 font-bold text-xs flex items-center justify-center gap-2">
                  {uploadingImage ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : (editingItem ? t("update") : t("create"))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
