"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../../lib/supabase/client"
import { Plus, Trash2, Edit, ChevronRight, ChevronDown, Folder } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { logActivity } from "../../../lib/audit"
import { useLanguage } from "../../../contexts/LanguageContext"

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState("main")
  const [selectedParent, setSelectedParent] = useState<any>(null)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameKhmer: "",
    slug: "",
    description: "",
    descriptionKhmer: "",
    parentId: "",
    isActive: true,
    isFeatured: false,
    sortOrder: 0
  })
  const router = useRouter()
  const { t, language } = useLanguage()

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    const supabase = createClient()
    
    const { data: mainCats } = await supabase
      .from("Category")
      .select("*")
      .is("parentId", null)
      .order("sortOrder", { ascending: true })
    
    const { data: subCats } = await supabase
      .from("Category")
      .select("*")
      .not("parentId", "is", null)
      .order("sortOrder", { ascending: true })
    
    setCategories(mainCats || [])
    setSubcategories(subCats || [])
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
      sortOrder: categories.length
    })
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
      sortOrder: getSubcategories(parent.id).length
    })
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
      sortOrder: item.sortOrder || 0
    })
    setShowAddModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
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
      updatedAt: new Date().toISOString()
    }

    let error
    if (editingItem) {
      const { error: updateError } = await supabase
        .from("Category")
        .update(dataToSave)
        .eq("id", editingItem.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("Category")
        .insert([{ ...dataToSave, createdAt: new Date().toISOString() }])
      error = insertError
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
      setFormData({ name: "", nameKhmer: "", slug: "", description: "", descriptionKhmer: "", parentId: "", isActive: true, isFeatured: false, sortOrder: 0 })
      fetchCategories()
    }
  }

  const handleDelete = async (item: any, hasChildren: boolean, subItemsCount: number) => {
    if (hasChildren) {
      toast.error(`Cannot delete "${item.name}" because it has ${subItemsCount} subcategory(ies)`)
      return
    }

    const supabase = createClient()
    
    // Check for products associated with this category or subcategory
    const { count: productCount } = await supabase
      .from("Product")
      .select("*", { count: "exact", head: true })
      .or(`categoryId.eq.${item.id},subcategoryId.eq.${item.id}`)

    if (productCount && productCount > 0) {
      toast.error(`Cannot delete "${item.name}" because it contains ${productCount} product(s). Please move or delete the products first.`)
      return
    }
    
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      const supabase = createClient()
      const { error } = await supabase
        .from("Category")
        .delete()
        .eq("id", item.id)
      
      if (error) {
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
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("categories")}</h1>
          <p className="text-sm text-gray-600 mt-1">{t("manageMainCategories")}</p>
        </div>
        <button
          onClick={openAddMainModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          <Plus className="w-4 h-4" />
          {t("addMainCategory")}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <h2 className="font-semibold text-gray-900">{t("categoryStructure")}</h2>
          <p className="text-xs text-gray-500 mt-1">{t("cannotDeleteCategories")}</p>
        </div>
        <div className="divide-y">
          {categories.map((cat: any) => {
            const subItems = getSubcategories(cat.id)
            const isExpanded = expanded[cat.id]
            const hasChildren = subItems.length > 0
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3 flex-1">
                    {hasChildren && (
                      <button onClick={() => toggleExpand(cat.id)} className="p-1 hover:bg-gray-200 rounded">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    )}
                    {!hasChildren && <div className="w-6" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{language === "kh" && cat.nameKhmer ? cat.nameKhmer : cat.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {cat.isActive ? t('active') : t('inactive')}
                        </span>
                        {cat.isFeatured && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">{t('featured')}</span>}
                      </div>
                      {cat.description && <div className="text-xs text-gray-500 mt-0.5">{cat.description}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openAddSubModal(cat)} className="px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100 transition flex items-center gap-1">
                      <Plus className="w-3 h-3" />
                      {t("addSub")}
                    </button>
                    <button onClick={() => openEditModal(cat)} className="p-1 text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat, hasChildren, subItems.length)} className="p-1 text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {isExpanded && hasChildren && (
                  <div className="bg-gray-50 pl-12 border-t">
                    {subItems.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-100 transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900">{language === "kh" && sub.nameKhmer ? sub.nameKhmer : sub.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {sub.isActive ? t('active') : t('inactive')}
                            </span>
                          </div>
                          {sub.description && <div className="text-xs text-gray-500 mt-0.5">{sub.description}</div>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(sub)} className="p-1 text-blue-600 hover:text-blue-800">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(sub, false, 0)} className="p-1 text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem ? t("edit") : t("addNew")} {modalType === "main" ? t("categoryName") : t("subcategory")}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (English) *</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (Khmer)</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.nameKhmer} onChange={(e) => setFormData({...formData, nameKhmer: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                <textarea rows={2} className="w-full px-3 py-2 border rounded-lg" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Khmer)</label>
                <textarea rows={2} className="w-full px-3 py-2 border rounded-lg" value={formData.descriptionKhmer} onChange={(e) => setFormData({...formData, descriptionKhmer: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.sortOrder} onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value)})} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} /><span className="text-sm">{t("active")}</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})} /><span className="text-sm">{t("featured")}</span></label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">{t("cancel")}</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark">{editingItem ? t("update") : t("create")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
