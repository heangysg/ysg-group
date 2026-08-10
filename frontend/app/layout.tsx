import type { Metadata, Viewport } from "next"
import { Inter, Outfit, Kantumruy_Pro, Oswald } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "../contexts/LanguageContext"
import { CartProvider } from "../contexts/CartContext"
import { WishlistProvider } from "../contexts/WishlistContext"
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" })

const kantumruy = Kantumruy_Pro({ 
  subsets: ["khmer"], 
  variable: "--font-kantumruy",
  weight: ["300", "400", "500", "600", "700"]
})

export async function generateMetadata(): Promise<Metadata> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  let meta_title = "Yeung Shi Group - Premium Heavy Equipment Solutions"
  let meta_description = "Quality heavy machinery for construction, mining, and industrial applications"

  try {
    const res = await fetch(`${API_URL}/api/public/settings`, { next: { revalidate: 60 } })
    if (res.ok) {
      const json = await res.json()
      if (json.data) {
        if (json.data.meta_title) meta_title = json.data.meta_title
        if (json.data.meta_description) meta_description = json.data.meta_description
      }
    }
  } catch (error) {
    console.error("Failed to fetch settings metadata", error)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    metadataBase: new URL(baseUrl),
    title: meta_title,
    description: meta_description,
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/logo.png", type: "image/png" },
      ],
      apple: [
        { url: "/logo.png", sizes: "180x180", type: "image/png" },
      ],
      shortcut: "/logo.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Yeung Shi Group",
      startupImage: "/logo.png",
    },
    openGraph: {
      title: meta_title,
      description: meta_description,
      type: "website",
      siteName: "Yeung Shi Group",
      images: [
        {
          url: "/logo/ysg-logo.png",
          width: 1200,
          height: 630,
          alt: "Yeung Shi Group",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta_title,
      description: meta_description,
      images: ["/logo/ysg-logo.png"],
    }
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${kantumruy.variable} ${oswald.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yeung Shi Group" />
        <meta name="theme-color" content="#004691" />
        <meta name="msapplication-TileColor" content="#004691" />
        <meta name="msapplication-TileImage" content="/logo.png" />
        {/* Google Analytics GA4 - set NEXT_PUBLIC_GA_ID in .env to activate */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <NextTopLoader 
          color="#004691"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #004691,0 0 5px #004691"
        />
        <LanguageProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="relative flex min-h-screen flex-col">
                {children}
              </div>
            </WishlistProvider>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
