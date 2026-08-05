"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import toast from "react-hot-toast"
import { useLanguage } from "./LanguageContext"

export type Product = {
  id: string
  name: string
  nameKhmer?: string
  slug: string
  brand: string
  price: number
  thumbnail?: string
  images?: string[]
  model?: string
}

type WishlistContextType = {
  wishlistItems: Product[]
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  isLoaded: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const { language } = useLanguage()

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ysg_wishlist")
      if (saved) {
        setWishlistItems(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load wishlist", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ysg_wishlist", JSON.stringify(wishlistItems))
    }
  }, [wishlistItems, isLoaded])

  const addToWishlist = (product: Product) => {
    let added = false
    setWishlistItems(prev => {
      if (prev.some(item => item.id === product.id)) return prev
      added = true
      return [...prev, product]
    })

    // React batches state updates. We use a microtask or just wait a tick to show the toast
    // But since it's just a local variable flag, we can just do:
    setTimeout(() => {
      if (added) {
        const productName = language === "kh" && product.nameKhmer ? product.nameKhmer : product.name
        toast.success(language === "kh" ? `បានបន្ថែម ${productName} ទៅបញ្ជីចំណូលចិត្ត!` : `${productName} added to wishlist!`)
      }
    }, 0)
  }

  const removeFromWishlist = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId)
  }

  const clearWishlist = () => {
    setWishlistItems([])
  }

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, isLoaded }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
