"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type CartItem = {
  id: string
  name: string
  nameKhmer?: string
  price: number
  image: string
  quantity: number
  brand: string
  model: string
}

type CartContextType = {
  items: CartItem[]
  addToCart: (product: any) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem("ysg_cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error("Failed to parse cart", e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ysg_cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addToCart = (product: any) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      let selectedImage = ""
      if (Array.isArray(product.images) && product.images.length > 0) {
        selectedImage = product.images[0]
      } else if (typeof product.images === 'string' && product.images.length > 0) {
        selectedImage = product.images
      } else if (product.thumbnail) {
        selectedImage = product.thumbnail
      } else if (product.image) {
        selectedImage = product.image
      }

      if (selectedImage && selectedImage.includes('cloudinary.com')) {
        selectedImage = selectedImage.replace('/upload/f_auto,q_auto/', '/upload/w_300,c_fill,f_auto,q_auto/');
      }

      return [...prev, {
        id: product.id,
        name: product.name,
        nameKhmer: product.nameKhmer,
        price: product.price,
        image: selectedImage,
        brand: product.brand,
        model: product.model || "Standard",
        quantity: 1
      }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => setItems([])

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartCount,
      cartTotal,
      isLoaded
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
