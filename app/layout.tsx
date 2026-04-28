import type { Metadata, Viewport } from "next"
import "./globals.css"
import Layout from "../components/Layout"

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
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
