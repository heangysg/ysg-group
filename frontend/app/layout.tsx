import type { Metadata, Viewport } from "next"
import { Inter, Outfit, Kantumruy_Pro } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "../contexts/LanguageContext"
import { CartProvider } from "../contexts/CartContext"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const kantumruy = Kantumruy_Pro({ 
  subsets: ["khmer"], 
  variable: "--font-kantumruy",
  weight: ["300", "400", "500", "600", "700"]
})

export async function generateMetadata(): Promise<Metadata> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  let meta_title = "YSG Machinery - Premium Heavy Equipment Solutions"
  let meta_description = "Quality heavy machinery for construction, mining, and industrial applications"

  try {
    const res = await fetch(`${API_URL}/api/public/settings`, { next: { revalidate: 60 } })
    const json = await res.json()
    if (json.data) {
      if (json.data.meta_title) meta_title = json.data.meta_title
      if (json.data.meta_description) meta_description = json.data.meta_description
    }
  } catch (error) {
    console.error("Failed to fetch settings metadata", error)
  }

  return {
    title: meta_title,
    description: meta_description,
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="km" suppressHydrationWarning data-scroll-behavior="smooth" className={`${inter.variable} ${outfit.variable} ${kantumruy.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
