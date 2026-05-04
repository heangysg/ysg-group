"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, FolderOpen, Mail, Info, ShoppingCart } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { cartCount } = useCart()

  const navItems = [
    { name: t("home"), href: "/", icon: Home },
    { name: t("allProducts"), href: "/products", icon: Package },
    { name: t("categories"), href: "/categories", icon: FolderOpen },
    { name: t("cart"), href: "/checkout", icon: ShoppingCart, badge: cartCount },
    { name: t("about"), href: "/about", icon: Info },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-[100] md:hidden safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center h-16 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 transition-all relative h-full ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              <div className="relative flex flex-col items-center gap-1">
                <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                    {item.badge}
                  </span>
                )}
                <span className={`text-[9px] font-bold uppercase tracking-tight transition-all duration-300 ${isActive ? "text-primary" : "text-slate-400"}`}>
                  {item.name}
                </span>
              </div>
              
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
