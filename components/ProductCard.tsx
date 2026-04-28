"use client"

import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDollarSign, faMapMarkerAlt, faCheckCircle } from "@fortawesome/free-solid-svg-icons"

type ProductCardProps = {
  product: {
    id: string
    name: string
    slug: string
    brand: string
    price: number
    status?: string
    thumbnail?: string
    location?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7L4 7M8 3L4 7L8 11M16 3L20 7L16 11" />
              </svg>
            </div>
          )}
          {product.status === "available" && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" />
                <span>Available</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
            {product.brand} {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-[#003485] font-bold text-lg">
              <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4" />
              <span>{formatPrice(product.price)}</span>
            </div>
            {product.location && (
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-3 h-3" />
                <span>{product.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
