"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "../../../lib/supabase/client"
import toast, { Toaster } from "react-hot-toast"

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInquiry, setShowInquiry] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    message: ""
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  async function fetchProduct() {
    const supabase = createClient()
    
    const { data } = await supabase
      .from("Product")
      .select("*")
      .eq("slug", slug)
      .single()
    
    if (data) {
      setProduct(data)
      
      if (data.categoryId) {
        const { data: related } = await supabase
          .from("Product")
          .select("*")
          .eq("categoryId", data.categoryId)
          .neq("id", data.id)
          .limit(4)
        
        setRelatedProducts(related || [])
      }
    }
    setLoading(false)
  }

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    
    const supabase = createClient()
    const { error } = await supabase
      .from("Inquiry")
      .insert([{
        productId: product.id,
        customerName: inquiryForm.customerName,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        message: inquiryForm.message,
        status: "new"
      }])
    
    if (error) {
      toast.error("Failed to send inquiry. Please try again.")
    } else {
      toast.success("Inquiry sent! We will contact you within 24 hours.")
      setShowInquiry(false)
      setInquiryForm({ customerName: "", email: "", phone: "", message: "" })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-12 w-1/3 rounded mb-8"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-10 w-3/4 rounded"></div>
                <div className="bg-gray-200 h-6 w-1/2 rounded"></div>
                <div className="bg-gray-200 h-16 w-full rounded"></div>
                <div className="bg-gray-200 h-32 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <Link href="/products" className="text-[#003485] hover:underline">← Browse All Products</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#003485]">Home</Link>
            <span>›</span>
            <Link href="/products" className="hover:text-[#003485]">Products</Link>
            <span>›</span>
            <span className="text-gray-800">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-8" />
              ) : (
                <div className="text-center">
                  <div className="text-8xl mb-4">🔧</div>
                  <p className="text-gray-400">Product Image</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-2">
              <span className="inline-block bg-blue-100 text-[#003485] text-sm px-3 py-1 rounded-full">
                {product.categoryId ? "Heavy Equipment" : "Industrial Machinery"}
              </span>
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.brand} • Model: {product.model}</p>
            
            <div className="mb-6">
              <span className="text-3xl font-bold text-[#003485]">
                {product.price ? `$${Number(product.price).toLocaleString()}` : "Price on Request"}
              </span>
            </div>
            
            <button
              onClick={() => setShowInquiry(true)}
              className="w-full bg-[#003485] text-white py-4 rounded-xl font-semibold hover:bg-[#002664] transition-all transform hover:scale-[1.02] active:scale-100 shadow-md mb-8"
            >
              Request a Quote →
            </button>

            {(product.year || product.hours || product.location || product.condition) && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>📊</span> Key Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.brand && (
                    <div className="border-b pb-2">
                      <p className="text-gray-500 text-sm">Brand</p>
                      <p className="font-medium text-gray-900">{product.brand}</p>
                    </div>
                  )}
                  {product.model && (
                    <div className="border-b pb-2">
                      <p className="text-gray-500 text-sm">Model</p>
                      <p className="font-medium text-gray-900">{product.model}</p>
                    </div>
                  )}
                  {product.year && (
                    <div className="border-b pb-2">
                      <p className="text-gray-500 text-sm">Year</p>
                      <p className="font-medium text-gray-900">{product.year}</p>
                    </div>
                  )}
                  {product.hours && (
                    <div className="border-b pb-2">
                      <p className="text-gray-500 text-sm">Operating Hours</p>
                      <p className="font-medium text-gray-900">{product.hours.toLocaleString()} hrs</p>
                    </div>
                  )}
                  {product.location && (
                    <div className="border-b pb-2">
                      <p className="text-gray-500 text-sm">Location</p>
                      <p className="font-medium text-gray-900">{product.location}</p>
                    </div>
                  )}
                  {product.condition && (
                    <div className="border-b pb-2">
                      <p className="text-gray-500 text-sm">Condition</p>
                      <p className="font-medium text-green-600 capitalize">{product.condition}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(product.description || product.shortDescription) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span>📝</span> Description
                </h3>
                <p className="text-gray-600 leading-relaxed">{product.description || product.shortDescription}</p>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((related: any) => (
                <Link key={related.id} href={`/products/${related.slug}`}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {related.thumbnail ? (
                        <img src={related.thumbnail} alt={related.name} className="w-full h-full object-contain p-4" />
                      ) : (
                        <span className="text-4xl text-gray-400">🔧</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{related.name}</h3>
                      <p className="text-gray-500 text-xs mb-2">{related.brand}</p>
                      <p className="text-[#003485] font-bold text-sm">
                        {related.price ? `$${Number(related.price).toLocaleString()}` : "Price on Request"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {showInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInquiry(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Request a Quote</h3>
              <button onClick={() => setShowInquiry(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">You are inquiring about:</p>
                <p className="font-semibold text-[#003485]">{product.brand} {product.name}</p>
              </div>
              <form onSubmit={handleInquiry} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003485] focus:border-transparent" value={inquiryForm.customerName} onChange={(e) => setInquiryForm({...inquiryForm, customerName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003485] focus:border-transparent" value={inquiryForm.email} onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003485] focus:border-transparent" value={inquiryForm.phone} onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003485] focus:border-transparent" value={inquiryForm.message} onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowInquiry(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-[#003485] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#002664] transition disabled:opacity-50">{submitting ? "Sending..." : "Send Request"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
