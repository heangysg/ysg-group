"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit, ChevronDown, ChevronUp, Image as ImageIcon, X, Check, Loader2, Save } from "lucide-react"
import toast from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"
import imageCompression from "browser-image-compression"
import { uploadImageToSecureProxy } from "../../../lib/upload"

interface Banner {
  id: string
  imageUrl: string
  link: string
  alt: string
  isActive: boolean
  sortOrder: number
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Banner | null>(null)
  
  const [uploadingImage, setUploadingImage] = useState(false)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string>("")
  
  const [formData, setFormData] = useState<Partial<Banner>>({
    imageUrl: "",
    link: "",
    alt: "",
    isActive: true,
    sortOrder: 0
  })

  const { t, language } = useLanguage()

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    try {
      const res = await fetch(`${API_URL}/api/public/settings`)
      if (res.ok) {
        const data = await res.json()
        const settings = data.data || {}
        if (settings.homepage_banners) {
          const parsed = typeof settings.homepage_banners === 'string' 
            ? JSON.parse(settings.homepage_banners) 
            : settings.homepage_banners
          setBanners(parsed.sort((a: Banner, b: Banner) => a.sortOrder - b.sortOrder))
        }
      }
    } catch (err) {
      console.error("Failed to fetch banners", err)
      toast.error("Failed to load banners")
    } finally {
      setLoading(false)
    }
  }

  const saveBannersToDB = async (newBanners: Banner[]) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const token = localStorage.getItem("ysg_admin_token")
    
    try {
      // Upsert Setting logic - using admin/crud
      // First try to find if it exists
      const res = await fetch(`${API_URL}/api/public/settings`)
      let hasBannersKey = false
      if (res.ok) {
        const data = await res.json()
        hasBannersKey = 'homepage_banners' in (data.data || {})
      }

      const action = hasBannersKey ? 'update' : 'insert'
      const match = hasBannersKey ? { key: 'homepage_banners' } : undefined
      const dataToSave = { 
        key: 'homepage_banners', 
        value: JSON.stringify(newBanners), 
        updatedAt: new Date().toISOString()
      }

      const saveRes = await fetch(`${API_URL}/api/admin/crud`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ table: "Setting", action, match, data: dataToSave })
      })

      if (!saveRes.ok) throw new Error("Failed to save banners")
      setBanners(newBanners)
      toast.success("Banners saved successfully")
    } catch (err) {
      console.error(err)
      toast.error("Error saving banners to database")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    setPendingImageFile(file)
    setPreviewImage(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: "" })
    setPendingImageFile(null)
    setPreviewImage("")
  }

  const openAddModal = () => {
    setEditingItem(null)
    setFormData({
      imageUrl: "",
      link: "",
      alt: "",
      isActive: true,
      sortOrder: banners.length
    })
    setPendingImageFile(null)
    setPreviewImage("")
    setShowAddModal(true)
  }

  const openEditModal = (banner: Banner) => {
    setEditingItem(banner)
    setFormData(banner)
    setPendingImageFile(null)
    setPreviewImage("")
    setShowAddModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === "kh" ? "តើអ្នកប្រាកដជាចង់លុបបដានេះទេ?" : "Are you sure you want to delete this banner?")) return
    const updated = banners.filter(b => b.id !== id)
    await saveBannersToDB(updated)
  }

  const handleToggleActive = async (banner: Banner) => {
    const updated = banners.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b)
    await saveBannersToDB(updated)
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === banners.length - 1)) return
    
    const newBanners = [...banners]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newBanners[index].sortOrder
    newBanners[index].sortOrder = newBanners[swapIndex].sortOrder
    newBanners[swapIndex].sortOrder = temp
    
    newBanners.sort((a, b) => a.sortOrder - b.sortOrder)
    await saveBannersToDB(newBanners)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingImage(true)
    let finalImageUrl = formData.imageUrl

    if (pendingImageFile) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }
        const compressedFile = await imageCompression(pendingImageFile, options)
        finalImageUrl = await uploadImageToSecureProxy(compressedFile)
      } catch (err: any) {
        setUploadingImage(false)
        toast.error("Failed to upload image: " + err.message)
        return
      }
    }

    if (!finalImageUrl) {
      setUploadingImage(false)
      toast.error("Please upload a banner image")
      return
    }

    const newBanner: Banner = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      imageUrl: finalImageUrl,
      link: formData.link || "",
      alt: formData.alt || "",
      isActive: formData.isActive ?? true,
      sortOrder: formData.sortOrder ?? banners.length
    }

    let updated: Banner[]
    if (editingItem) {
      updated = banners.map(b => b.id === editingItem.id ? newBanner : b)
    } else {
      updated = [...banners, newBanner]
    }

    updated.sort((a, b) => a.sortOrder - b.sortOrder)
    
    await saveBannersToDB(updated)
    setUploadingImage(false)
    setShowAddModal(false)
    setEditingItem(null)
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto font-sans pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{t("banners") || "Homepage Banners"}</h1>
          <p className="text-slate-500 font-medium mt-1">Manage the hero image slider on your homepage.</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          {t("addNew") || "Add Banner"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#004691]" />
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p>No banners found. Add your first banner above!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {banners.map((banner, index) => (
              <div key={banner.id} className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 hover:bg-slate-50 transition-colors">
                
                {/* Drag / Order Controls */}
                <div className="flex md:flex-col items-center gap-2 text-slate-400">
                  <button onClick={() => moveOrder(index, 'up')} disabled={index === 0} className="p-1 hover:text-[#004691] disabled:opacity-30 transition-colors">
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{index + 1}</span>
                  <button onClick={() => moveOrder(index, 'down')} disabled={index === banners.length - 1} className="p-1 hover:text-[#004691] disabled:opacity-30 transition-colors">
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Image */}
                <div className="w-full md:w-64 h-32 bg-slate-100 border border-slate-200 shrink-0 relative overflow-hidden group">
                  <img src={banner.imageUrl} alt={banner.alt} className="w-full h-full object-cover" />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold text-xs uppercase tracking-wider px-2 py-1 bg-black/50">Disabled</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2 w-full text-left">
                  <p className="text-sm font-bold text-slate-900">{banner.alt || "No Alt Text"}</p>
                  <p className="text-xs font-medium text-slate-500 truncate max-w-md">{banner.link ? `Link: ${banner.link}` : "No link attached"}</p>
                  <div className="pt-2">
                    <button 
                      onClick={() => handleToggleActive(banner)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                        banner.isActive 
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button onClick={() => openEditModal(banner)} className="p-3 text-slate-400 hover:text-[#004691] hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all rounded-full" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all rounded-full" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white w-full max-w-2xl relative shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="text-xl font-extrabold text-slate-900">{editingItem ? "Edit Banner" : "Add New Banner"}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-white border border-slate-200 shadow-sm hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Banner Image *</label>
                  {!previewImage && !formData.imageUrl ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 cursor-pointer hover:bg-white transition-all">
                      <div className="flex flex-col items-center justify-center gap-3 text-slate-900">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs font-bold">Click to upload image (1920x600 recommended)</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  ) : (
                    <div className="relative group p-2 border border-slate-200 bg-slate-50">
                      <img src={previewImage || formData.imageUrl} alt="Banner Preview" className="w-full h-48 object-cover border border-slate-200" />
                      <button type="button" onClick={removeImage} className="absolute top-4 right-4 p-2 bg-white text-red-600 border border-slate-200 shadow-sm hover:scale-105 active:scale-95 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Target Link (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. /products/category/machine"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none font-semibold text-sm transition-all" 
                    value={formData.link || ""} 
                    onChange={(e) => setFormData({...formData, link: e.target.value})} 
                  />
                  <p className="text-xs text-slate-500 font-medium mt-1.5">Where the user is taken when they click this banner.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Alt Text (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Summer Sale 2026"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none font-semibold text-sm transition-all" 
                    value={formData.alt || ""} 
                    onChange={(e) => setFormData({...formData, alt: e.target.value})} 
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 border border-slate-200 accent-primary" />
                    <span className="text-sm font-bold text-slate-900">Active (Visible on Website)</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 border border-slate-200 bg-white font-bold text-sm text-slate-900 hover:bg-slate-50 shadow-sm transition-all">Cancel</button>
                <button type="submit" disabled={uploadingImage} className="flex-1 btn-primary py-4 px-6 font-bold text-sm flex items-center justify-center gap-2">
                  {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {uploadingImage ? "Saving..." : (editingItem ? "Update Banner" : "Save Banner")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
