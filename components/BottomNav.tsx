"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHome, faToolbox, faFolder, faEnvelope, faBuilding } from "@fortawesome/free-solid-svg-icons"

const navItems = [
  { name: "Home", href: "/", icon: faHome },
  { name: "Products", href: "/products", icon: faToolbox },
  { name: "Categories", href: "/categories", icon: faFolder },
  { name: "Contact", href: "/contact", icon: faEnvelope },
  { name: "About", href: "/about", icon: faBuilding },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-all ${
                  isActive ? "text-[#003485]" : "text-gray-500"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-xl" />
                <span className={`text-xs mt-1 ${isActive ? "font-semibold" : "font-normal"}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#003485] to-[#002664] bg-clip-text text-transparent">
              YSG Machinery
            </Link>
            <div className="flex gap-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 transition-all hover:text-[#003485] ${
                      isActive ? "text-[#003485] font-semibold" : "text-gray-600"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-sm" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
