"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "../../../lib/supabase/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faBox, faTags, faEnvelope, faSignOutAlt,
  faPlus, faChartLine, faEye, faEdit, faTrash
} from "@fortawesome/free-solid-svg-icons"

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, inquiries: 0 })
  const [recentProducts, setRecentProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    if (!isLoggedIn) {
      router.push("/admin/login")
      return
    }
    fetchStats()
    fetchRecentProducts()
  }, [])

  async function fetchStats() {
    const supabase = createClient()
    
    const { count: productsCount } = await supabase
      .from("Product")
      .select("*", { count: "exact", head: true })
    
    const { count: categoriesCount } = await supabase
      .from("Category")
      .select("*", { count: "exact", head: true })
    
    const { count: inquiriesCount } = await supabase
      .from("Inquiry")
      .select("*", { count: "exact", head: true })

    setStats({
      products: productsCount || 0,
      categories: categoriesCount || 0,
      inquiries: inquiriesCount || 0
    })
    setLoading(false)
  }

  async function fetchRecentProducts() {
    const supabase = createClient()
    const { data } = await supabase
      .from("Product")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(5)
    
    setRecentProducts(data || [])
  }

  const handleLogout = () => {
    document.cookie = "adminLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    localStorage.removeItem("adminLoggedIn")
    localStorage.removeItem("adminEmail")
    router.push("/admin/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#003485]">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your YSG Machinery website</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Products</p>
                <p className="text-3xl font-bold mt-2">{stats.products}</p>
              </div>
              <FontAwesomeIcon icon={faBox} className="text-4xl opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Categories</p>
                <p className="text-3xl font-bold mt-2">{stats.categories}</p>
              </div>
              <FontAwesomeIcon icon={faTags} className="text-4xl opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Inquiries</p>
                <p className="text-3xl font-bold mt-2">{stats.inquiries}</p>
              </div>
              <FontAwesomeIcon icon={faEnvelope} className="text-4xl opacity-80" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/products/new" className="bg-[#003485] text-white rounded-xl p-6 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faPlus} className="text-2xl" />
              <div>
                <h3 className="font-semibold text-lg">Add Product</h3>
                <p className="text-sm opacity-90">Create new product listing</p>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/categories" className="bg-gray-700 text-white rounded-xl p-6 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faTags} className="text-2xl" />
              <div>
                <h3 className="font-semibold text-lg">Categories</h3>
                <p className="text-sm opacity-90">Manage categories</p>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/inquiries" className="bg-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faEnvelope} className="text-2xl" />
              <div>
                <h3 className="font-semibold text-lg">Inquiries</h3>
                <p className="text-sm opacity-90">View customer messages</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.brand}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">${Number(product.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <Link href={`/products/${product.slug}`} target="_blank" className="text-blue-600 hover:text-blue-800">
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        <Link href={`/admin/products/edit/${product.id}`} className="text-green-600 hover:text-green-800">
                          <FontAwesomeIcon icon={faEdit} />
                        </Link>
                        <button className="text-red-600 hover:text-red-800">
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {recentProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
