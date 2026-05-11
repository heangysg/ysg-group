import type { Metadata, Viewport } from "next"
import { Inter, Kantumruy_Pro } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "../contexts/LanguageContext"
import { CartProvider } from "../contexts/CartContext"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const kantumruy = Kantumruy_Pro({ 
  subsets: ["khmer"], 
  variable: "--font-kantumruy",
  weight: ["400", "500", "600", "700"]
})

export const metadata: Metadata = {
  title: "YSG Machinery - Premium Heavy Equipment Solutions",
  description: "Quality heavy machinery for construction, mining, and industrial applications",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      </head>
      <body className={`${inter.variable} ${kantumruy.variable} font-sans antialiased`}>
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
