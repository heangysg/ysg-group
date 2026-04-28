// Database types matching your actual schema
export type Product = {
  id: string
  categoryId?: string
  subcategoryId?: string
  name?: string
  title?: string
  nameKhmer?: string
  titleKhmer?: string
  slug: string
  shortDescription?: string
  shortDescriptionKhmer?: string
  description?: string
  descriptionKhmer?: string
  model?: string
  brand?: string
  sku?: string
  price?: number
  currency?: string
  stock?: number
  year?: number
  hours?: number
  location?: string
  condition?: string
  status?: string
  isFeatured?: boolean
  isPublished?: boolean
  isActive?: boolean
  priceOnRequest?: boolean
  thumbnail?: string
  brochureUrl?: string
  videoUrl?: string
  specifications?: any
  features?: string[]
  viewCount?: number
  inquiryCount?: number
  metaTitle?: string
  metaDescription?: string
  metaDesc?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
  images?: ProductImage[]
  category?: Category
}

export type Category = {
  id: string
  name: string
  nameKhmer?: string
  slug: string
  description?: string
  descriptionKhmer?: string
  image?: string
  icon?: string
  isFeatured?: boolean
  isActive?: boolean
  sortOrder?: number
  parentId?: string
  createdAt?: string
  updatedAt?: string
}

export type ProductImage = {
  id: string
  productId: string
  imageUrl: string
  url?: string
  altText?: string
  isPrimary: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

export type Inquiry = {
  id: string
  productId?: string
  userId?: string
  customerName: string
  companyName?: string
  email: string
  phone?: string
  country?: string
  message: string
  quantity?: number
  status?: string
  source?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status?: string
  createdAt?: string
  updatedAt?: string
}
