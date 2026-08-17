"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { logActivity } from "../../../lib/audit"
import { Plus, Eye, Edit, Trash2, Search, Filter, Package, ChevronRight, MoreHorizontal, X, FileSpreadsheet } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useLanguage } from "../../../contexts/LanguageContext"
import ExcelImportModal from "../../../components/ExcelImportModal"
import Portal from "../../../components/Portal"

export default function AdminProducts() {
 const [products, setProducts] = useState<any[]>([])
 const [categories, setCategories] = useState<any[]>([])
 const [search, setSearch] = useState("")
 const [selectedCategory, setSelectedCategory] = useState("")
 const [statusFilter, setStatusFilter] = useState("all")
 const [loading, setLoading] = useState(true)
 const [currentPage, setCurrentPage] = useState(1)
 const [totalPages, setTotalPages] = useState(1)
 const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null)
 const [selectedProducts, setSelectedProducts] = useState<string[]>([])
 const [bulkActionLoading, setBulkActionLoading] = useState(false)
 const [importModalOpen, setImportModalOpen] = useState(false)
 const { t, language } = useLanguage()

 useEffect(() => {
 async function initialFetch() {
 setLoading(true)
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const token = localStorage.getItem("ysg_admin_token")
 const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
 try {
 const catRes = await fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify({ table: "Category", order: { column: "sortOrder", ascending: true } }) }).then(r => r.json())
 setCategories(catRes.data || [])
 await fetchProducts(1)
 } catch (err) {
 console.error("Initial Fetch Error:", err)
 } finally {
 setLoading(false)
 }
 }
 initialFetch()
 }, [])

 useEffect(() => {
 setCurrentPage(1)
 if (!loading) {
 fetchProducts(1)
 }
 }, [search, selectedCategory, statusFilter])

 useEffect(() => {
 if (!loading) {
 fetchProducts(currentPage)
 }
 }, [currentPage])

 async function fetchProducts(page: number) {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const token = localStorage.getItem("ysg_admin_token")
 const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
 const pageSize = 10
 const start = (page - 1) * pageSize

 const body: any = {
 table: "Product",
 countExact: true,
 order: { column: "createdAt", ascending: false },
 limit: pageSize,
 offset: start
 }
 
 if (search) {
 body.or = `name.ilike.%${search}%,nameKhmer.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`
 }
 if (selectedCategory) {
 body.eq = body.eq || {}
 body.eq.categoryId = selectedCategory
 }
 
 if (statusFilter === "published") {
 body.eq = body.eq || {}
 body.eq.isPublished = true
 } else if (statusFilter === "hidden") {
 body.eq = body.eq || {}
 body.eq.isPublished = false
 }

 // Only fetch non-deleted products
 body.eq = body.eq || {}
 body.eq.isActive = true

 const res = await fetch(`${API_URL}/api/admin/read`, { method: "POST", headers, body: JSON.stringify(body) })
 const { data, count } = await res.json()
 setProducts(data || [])
 if (count !== null && count !== undefined) {
 setTotalPages(Math.ceil(count / pageSize) || 1)
 }
 }

 async function deleteProduct(id: string, name: string) {
 const token = localStorage.getItem("ysg_admin_token")
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const res = await fetch(`${API_URL}/api/admin/crud`, {
 method: "POST",
 headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
 body: JSON.stringify({ 
 table: "Product", 
 action: "update", 
 match: { id },
 data: { isActive: false }
 })
 })
 setDeleteConfirm(null)
 if (!res.ok) {
 toast.error("Failed to move product to trash")
 } else {
 await logActivity({ action: "delete", entityType: "product", entityId: id, details: { name, type: "soft_delete" } })
 toast.success("Product moved to trash")
 fetchProducts(currentPage)
 }
 }

 async function toggleVisibility(id: string, currentStatus: boolean, name: string) {
 const token = localStorage.getItem("ysg_admin_token")
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 const newStatus = !currentStatus
 
 // Optimistic update
 setProducts(products.map(p => p.id === id ? { ...p, isPublished: newStatus } : p))
 
 const res = await fetch(`${API_URL}/api/admin/crud`, {
 method: "POST",
 headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
 body: JSON.stringify({ 
 table: "Product", 
 action: "update", 
 match: { id },
 data: { isPublished: newStatus }
 })
 })

 if (!res.ok) {
 toast.error("Failed to update status")
 // Revert optimistic update
 setProducts(products.map(p => p.id === id ? { ...p, isPublished: currentStatus } : p))
 } else {
 await logActivity({ action: "update", entityType: "product", entityId: id, details: { name, status: newStatus ? "published" : "hidden" } })
 toast.success(newStatus ? "Product published" : "Product hidden")
 }
 }

 const formatPrice = (price: number) => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 }).format(price)
 }

 const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.checked) setSelectedProducts(products.map(p => p.id))
 else setSelectedProducts([])
 }

 const toggleSelect = (id: string) => {
 if (selectedProducts.includes(id)) setSelectedProducts(selectedProducts.filter(pId => pId !== id))
 else setSelectedProducts([...selectedProducts, id])
 }

 const handleBulkAction = async (action: 'delete' | 'publish' | 'unpublish') => {
 if (selectedProducts.length === 0) return
 if (action === 'delete' && !confirm(t("confirmBulkDelete") || "Are you sure you want to delete selected products?")) return

 setBulkActionLoading(true)
 const token = localStorage.getItem("ysg_admin_token")
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
 let successCount = 0

 try {
 await Promise.all(selectedProducts.map(id => {
 const payload = action === 'delete' 
 ? { table: "Product", action: "update", match: { id }, data: { isActive: false } }
 : { table: "Product", action: "update", match: { id }, data: { isPublished: action === 'publish' } }
 
 return fetch(`${API_URL}/api/admin/crud`, {
 method: "POST",
 headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
 body: JSON.stringify(payload)
 }).then(r => { if(r.ok) successCount++ })
 }))

 toast.success(`${successCount} products ${action === 'delete' ? 'moved to trash' : 'updated'}`)
 setSelectedProducts([])
 fetchProducts(currentPage)
 } catch (err) {
 toast.error("Bulk action failed")
 } finally {
 setBulkActionLoading(false)
 }
 }

 const selectedProductsData = products.filter(p => selectedProducts.includes(p.id))
 const allSelectedPublished = selectedProductsData.length > 0 && selectedProductsData.every(p => p.isPublished !== false)
 const allSelectedHidden = selectedProductsData.length > 0 && selectedProductsData.every(p => p.isPublished === false)

 return (
 <div className="space-y-6 animate-in fade-in duration-500 w-full">
 {/* Header section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className="text-2xl font-bold uppercase text-slate-900">{t("products")}</h2>
 <p className="text-sm font-medium text-slate-500 mt-2">{t("manageProductInventory")}</p>
 </div>
 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
 <Link
 href="/admin/products/trash"
 className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-white text-slate-900 border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-xs font-bold font-medium hover:-translate-y-0.5 transition-all"
 >
 <Trash2 className="w-4 h-4" />
 {language === "kh" ? "ធុងសំរាម" : "Trash"}
 </Link>
 <Link
 href="/admin/products/new"
 className="btn-primary w-full sm:w-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-2 text-xs"
 >
 <Plus className="w-4 h-4" />
 {t("addProduct")}
 </Link>
 <button
 onClick={() => setImportModalOpen(true)}
 className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-emerald-600 text-white border border-emerald-700 shadow-sm flex items-center justify-center gap-2 text-xs font-bold font-medium hover:-translate-y-0.5 hover:bg-emerald-700 transition-all rounded-md"
 >
 <FileSpreadsheet className="w-4 h-4" />
 {language === "kh" ? "បញ្ចូលទិន្នន័យ (Excel)" : "Import (Excel)"}
 </button>
 </div>
 </div>

 {/* Bulk Actions Bar */}
 {selectedProducts.length > 0 && (
 <div className="solid-card bg-primary p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
 <div className="flex items-center gap-3">
 <span className="px-3 py-1 bg-white text-slate-900 font-bold text-sm border border-slate-200 shadow-sm">
 {selectedProducts.length}
 </span>
 <span className="text-slate-900 font-bold font-medium text-sm">
 {language === "kh" ? "បានជ្រើសរើស" : "Selected"}
 </span>
 </div>
 <div className="flex flex-wrap items-center gap-3">
 {!allSelectedPublished && (
 <button
 onClick={() => handleBulkAction('publish')}
 disabled={bulkActionLoading}
 className="px-4 py-2 bg-white text-slate-900 font-bold text-xs border border-slate-200 shadow-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50"
 >
 {language === "kh" ? "ផ្សព្វផ្សាយ" : "Publish"}
 </button>
 )}
 {!allSelectedHidden && (
 <button
 onClick={() => handleBulkAction('unpublish')}
 disabled={bulkActionLoading}
 className="px-4 py-2 bg-slate-100 text-slate-900 font-bold text-xs border border-slate-200 shadow-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50"
 >
 {language === "kh" ? "លាក់" : "Unpublish"}
 </button>
 )}
 <button
 onClick={() => handleBulkAction('delete')}
 disabled={bulkActionLoading}
 className="px-4 py-2 bg-red-600 text-white font-bold text-xs border-2 border-red-700 shadow-sm font-medium hover:-translate-y-0.5 transition-all disabled:opacity-50"
 >
 {language === "kh" ? "លុប" : "Delete"}
 </button>
 </div>
 </div>
 )}

 {/* Filters bar */}
 <div className="solid-card bg-white p-4 flex flex-col md:flex-row gap-4 items-center">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input
 type="text"
 placeholder={t("search") || "Search..."}
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-slate-900 font-medium text-xs"
 />
 {search && (
 <button 
 onClick={() => setSearch("")}
 className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-900 hover:text-red-600 transition-colors z-10"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 
 <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
 <div className="relative w-full md:w-48">
 <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
 <select
 value={selectedCategory}
 onChange={(e) => setSelectedCategory(e.target.value)}
 className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-slate-900 font-medium text-xs appearance-none"
 >
 <option value="">{t("allCategories")}</option>
 {categories.map((cat) => (
 <option key={cat.id} value={cat.id}>
 {language === "kh" ? cat.nameKhmer || cat.name : cat.name}
 </option>
 ))}
 </select>
 </div>
 <div className="relative w-full md:w-48">
 <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white outline-none transition-all font-bold text-slate-900 font-medium text-xs appearance-none"
 >
 <option value="all">{language === "kh" ? "ស្ថានភាពទាំងអស់" : "All Status"}</option>
 <option value="published">{language === "kh" ? "បានផ្សព្វផ្សាយ" : "Published"}</option>
 <option value="hidden">{language === "kh" ? "បានលាក់" : "Hidden"}</option>
 </select>
 </div>
 </div>
 </div>

 {/* Products Table */}
 <div className="solid-card bg-white overflow-hidden p-0 flex flex-col">
 {loading ? (
 <div className="p-20 flex flex-col items-center justify-center">
 <div className="w-10 h-10 border-4 border-slate-200 border-t-transparent rounded-full animate-spin mb-4" />
 <p className="text-slate-500 font-bold text-xs font-medium">Loading Inventory...</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-primary border-b border-slate-200">
 <th className="px-6 py-4 w-12">
 <input 
 type="checkbox" 
 className="w-5 h-5 border border-slate-200 accent-primary shadow-sm cursor-pointer"
 checked={products.length > 0 && selectedProducts.length === products.length}
 onChange={toggleSelectAll}
 />
 </th>
 <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("productInfo")}</th>
 <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("category")}</th>
 <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("price")}</th>
 <th className="px-6 py-4 text-xs font-bold text-white font-medium">{t("status")}</th>
 <th className="px-6 py-4 text-xs font-bold text-white font-medium text-right">{t("actions")}</th>
 </tr>
 </thead>
 <tbody className="divide-y-2 divide-slate-900">
 {products.map((product) => (
 <tr key={product.id} className="group hover:bg-primary/5 transition-all duration-200">
 <td className="px-6 py-4">
 <input 
 type="checkbox" 
 className="w-5 h-5 border border-slate-200 accent-primary shadow-sm cursor-pointer"
 checked={selectedProducts.includes(product.id)}
 onChange={() => toggleSelect(product.id)}
 />
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-slate-100 overflow-hidden shrink-0 border border-slate-200 shadow-sm transition-transform">
 {product.images && product.images[0] ? (
 <img src={product.images[0].includes('cloudinary.com') ? product.images[0].replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : product.images[0]} alt={product.name} className="w-full h-full object-cover" />
 ) : product.thumbnail ? (
 <img src={product.thumbnail.includes('cloudinary.com') ? product.thumbnail.replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/') : product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-900">
 <Package className="w-6 h-6" />
 </div>
 )}
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-900 uppercase">
 {language === "kh" ? product.nameKhmer || product.name : product.name}
 </h4>
 <p className="text-xs font-bold text-slate-500 mt-1 font-medium">#{product.id.slice(0, 8)}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className="text-xs font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1.5 font-medium shadow-sm">
 {(() => {
 const cat = categories.find(c => c.id === product.categoryId);
 if (!cat) return t("general");
 return language === "kh" ? cat.nameKhmer || cat.name : cat.name;
 })()}
 </span>
 </td>
 <td className="px-6 py-4">
 <p className="text-sm font-bold text-slate-900 tracking-wider">{formatPrice(product.price)}</p>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-col gap-3">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 border border-slate-200 bg-emerald-500 shadow-sm" />
 <span className="text-xs font-bold text-slate-900 font-medium">{t("inStock") || "In Stock"}</span>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={() => toggleVisibility(product.id, product.isPublished !== false, product.name)}
 className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-md border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
 product.isPublished !== false ? 'bg-blue-600' : 'bg-slate-300'
 }`}
 title={product.isPublished !== false ? "Click to Hide" : "Click to Publish"}
 >
 <span 
 className={`pointer-events-none inline-block h-4 w-4 transform rounded-md bg-white shadow ring-0 transition duration-200 ease-in-out ${
 product.isPublished !== false ? 'translate-x-4' : 'translate-x-0'
 }`} 
 />
 </button>
 <span className={`text-xs font-bold font-medium ${product.isPublished !== false ? "text-blue-600" : "text-slate-500"}`}>
 {product.isPublished !== false ? (language === "kh" ? "បានផ្សព្វផ្សាយ" : "Published") : (language === "kh" ? "បានលាក់" : "Hidden")}
 </span>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-2">
 <Link
 href={`/products/${product.slug}`}
 target="_blank"
 className="p-2 bg-white text-slate-900 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
 title="View on site"
 >
 <Eye className="w-4 h-4" />
 </Link>
 <Link
 href={`/admin/products/edit/${product.slug}`}
 className="p-2 bg-white text-blue-600 border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
 title="Edit"
 >
 <Edit className="w-4 h-4" />
 </Link>
 <button
 onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
 className="p-2 bg-white text-red-600 border border-transparent hover:border-slate-200 hover:shadow-sm-red transition-all"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {products.length === 0 && (
 <tr>
 <td colSpan={5} className="py-20 text-center">
 <div className="flex flex-col items-center">
 <Package className="w-12 h-12 text-slate-200 mb-4" />
 <p className="text-slate-400 font-medium italic">No products found</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 )}
 
 {/* Pagination */}
 {!loading && totalPages > 1 && (
 <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
 <button 
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs font-medium shadow-sm hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
 >
 {t("previous") || "Previous"}
 </button>
 <span className="text-xs font-bold text-slate-900 font-medium">
 Page {currentPage} of {totalPages}
 </span>
 <button 
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 className="px-4 py-2 bg-white border border-slate-200 font-bold text-xs font-medium shadow-sm hover:translate-y-0.5 hover:shadow-sm disabled:opacity-50 disabled:shadow-none transition-all"
 >
 {t("next") || "Next"}
 </button>
 </div>
 )}
 </div>
 
 {/* ─── Delete Confirmation Modal ─── */}
 {deleteConfirm && (
 <Portal>
 <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
 <div className="solid-card bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-md p-6 sm:p-8 space-y-6 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
 {/* drag handle for mobile */}
 <div className="sm:hidden w-10 h-1 bg-slate-200 rounded-md mx-auto mb-2" />
 <div className="flex items-start gap-4">
 <div className="p-3 bg-red-50 border-2 border-red-500 shrink-0">
 <Trash2 className="w-5 h-5 text-red-600" />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 font-medium">លុបផលិតផល</h3>
 <p className="text-sm text-slate-600 mt-2 leading-relaxed">
 តើអ្នកប្រាកដថាចង់លុប <strong>"{deleteConfirm.name}"</strong> មែនទេ? ផលិតផលនេះនឹងត្រូវបានផ្លាស់ទីទៅធុងសំរាម។
 </p>
 </div>
 </div>
 <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
 <button
 onClick={() => setDeleteConfirm(null)}
 className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-900 text-xs font-bold font-medium shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
 >
 បោះបង់
 </button>
 <button
 onClick={() => deleteProduct(deleteConfirm.id, deleteConfirm.name)}
 className="w-full sm:w-auto px-6 py-3 bg-red-600 border-2 border-red-700 text-white text-xs font-bold font-medium hover:bg-red-700 transition-all"
 >
 លុប (ទៅធុងសំរាម)
 </button>
 </div>
 </div>
 </div>
 </Portal>
 )}
 {importModalOpen && (
   <ExcelImportModal 
     onClose={() => setImportModalOpen(false)} 
     onSuccess={() => {
       fetchProducts(1)
       toast.success("Products updated!")
     }}
   />
 )}
 <Toaster position="top-right" />
 </div>
 )
}
