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
  items: Product[]
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

    setTimeout(() => {
      if (added) {
        const message = language === "kh" ? "បានបន្ថែមទៅបញ្ជីបំណង" : "Added to wishlist"
        toast.success(message, {
          style: {
            background: '#16a34a',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontWeight: '600',
            fontSize: '11px'
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#16a34a'
          }
        })
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
    <WishlistContext.Provider value={{ wishlistItems, items: wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, isLoaded }}>
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
