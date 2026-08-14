import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ysg-machinery.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const staticRoutes: MetadataRoute.Sitemap = [
 { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
 { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
 { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
 { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
 { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
 ]

 let productRoutes: MetadataRoute.Sitemap = []
 let categoryRoutes: MetadataRoute.Sitemap = []

 try {
 const prodRes = await fetch(`${API_URL}/api/public/products`, { next: { revalidate: 3600 } })
 if (prodRes.ok) {
 const { data: products } = await prodRes.json()
 if (Array.isArray(products)) {
 productRoutes = products.map((product: any) => ({
 url: `${BASE_URL}/products/${product.id}`,
 lastModified: new Date(product.updatedAt || product.createdAt || Date.now()),
 changeFrequency: 'weekly' as const,
 priority: 0.8,
 }))
 }
 }

 const catRes = await fetch(`${API_URL}/api/public/categories`, { next: { revalidate: 3600 } })
 if (catRes.ok) {
 const { data: categories } = await catRes.json()
 if (Array.isArray(categories)) {
 categoryRoutes = categories.map((cat: any) => ({
 url: `${BASE_URL}/products/category/${cat.slug}`,
 lastModified: new Date(cat.updatedAt || cat.createdAt || Date.now()),
 changeFrequency: 'weekly' as const,
 priority: 0.7,
 }))
 }
 }
 } catch (error) {
 console.error('Sitemap generation error:', error)
 }

 return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
