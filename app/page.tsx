"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "../lib/supabase/client"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight, faCheckCircle, faTruck, faHeadset, faChartLine } from "@fortawesome/free-solid-svg-icons"

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient()
      const { data } = await supabase
        .from("Product")
        .select("*")
        .eq("isPublished", true)
        .limit(6)
      
      setFeaturedProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#003485] to-[#002664] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Premium Heavy Equipment Solutions
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              Quality machinery for construction, mining, and industrial applications. Trusted by industry leaders worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-white text-[#003485] px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                Browse Equipment
                <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#003485]">500+</div>
              <div className="text-sm text-gray-600 mt-2">Equipment Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#003485]">50+</div>
              <div className="text-sm text-gray-600 mt-2">Trusted Brands</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#003485]">25+</div>
              <div className="text-sm text-gray-600 mt-2">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#003485]">15+</div>
              <div className="text-sm text-gray-600 mt-2">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Equipment</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our most popular heavy machinery for various applications</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-xl h-80 animate-pulse"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-contain p-6" />
                      ) : (
                        <div className="text-6xl text-gray-300">🔧</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-3">{product.brand} / {product.model}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#003485]">
                          ${Number(product.price).toLocaleString()}
                        </span>
                        <span className="text-[#003485] group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose YSG?</h2>
            <p className="text-gray-600">We deliver excellence in every aspect of our service</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-2xl text-[#003485]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">All equipment inspected and certified by our expert team</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faTruck} className="text-2xl text-[#003485]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Delivery</h3>
              <p className="text-gray-600">Worldwide shipping to over 25 countries</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faHeadset} className="text-2xl text-[#003485]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Dedicated customer support and parts availability</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
