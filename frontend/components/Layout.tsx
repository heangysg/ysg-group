"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBars, faTimes, faHome, faToolbox, faFolder, faEnvelope, faBuilding } from "@fortawesome/free-solid-svg-icons"

const navItems = [
  { name: "Home", href: "/", icon: faHome },
  { name: "Products", href: "/products", icon: faToolbox },
  { name: "Categories", href: "/categories", icon: faFolder },
  { name: "Contact", href: "/contact", icon: faEnvelope },
  { name: "About", href: "/about", icon: faBuilding },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-white border-b"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-medium text-[#003485]">
              YSG<span className="text-black">Machinery</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-[#003485]"
                      : "text-gray-600 hover:text-[#003485]"
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-sm" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} className="text-xl text-gray-700" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-blue-50 text-[#003485] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-lg" />
                  <span className="text-base">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">
        {children}
      </main>

      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-medium mb-4">YSG Machinery</h3>
              <p className="text-gray-400 text-sm">Premium heavy equipment solutions since 2010</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/products" className="hover:text-white">Products</Link></li>
                <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>sales@ysgmachinery.com</li>
                <li>+855 XX XXX XXXX</li>
                <li>Phnom Penh, Cambodia</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Hours</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Mon-Fri: 8:00 - 17:00</li>
                <li>Sat: 8:00 - 12:00</li>
                <li>Sun: Closed</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 YSG Machinery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
