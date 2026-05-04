import type { Metadata, Viewport } from "next"
import "./globals.css"
import { LanguageProvider } from "../contexts/LanguageContext"
import { CartProvider } from "../contexts/CartContext"

export const metadata: Metadata = {
  title: "YSG Machinery - Premium Heavy Equipment Solutions",
  description: "Quality heavy machinery for construction, mining, and industrial applications",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      <body>
        <LanguageProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
