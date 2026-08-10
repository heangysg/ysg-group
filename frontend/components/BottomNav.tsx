/* eslint-disable */
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingCart, User, FolderOpen } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"

export default function BottomNav() {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const { cartCount, openCart } = useCart()

  const navItems = [
    { name: t("home") || "Home", href: "/", icon: Home },
    { name: t("allProducts") || "Products", href: "/products", icon: Package },
    { name: t("categories") || "Categories", href: "/categories", icon: FolderOpen },
    { name: t("cart") || "Cart", href: "#", icon: ShoppingCart, badge: cartCount, isCart: true },
    { name: t("account") || "Account", href: "/account", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-pb">
      <div className="flex items-center justify-around h-[56px] px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = item.href !== "#" && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
          const Icon = item.icon
          
          if (item.isCart) {
            return (
              <button
                key={item.name}
                onClick={openCart}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative text-slate-500 hover:text-slate-900"
              >
                <div className="flex flex-col items-center gap-1.5 relative">
                  <div>
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-3 bg-[#004691] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white px-1 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  
                  <span className="text-[10px] sm:text-[11px] font-semibold opacity-90 tracking-tight">
                    {item.name}
                  </span>
                </div>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => {
                if (isActive) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                isActive ? "text-[#004691]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <div className="flex flex-col items-center gap-1.5 relative">
                <div className={`transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                </div>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#004691] text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white px-1 shadow-sm">
                    {item.badge}
                  </span>
                )}
                
                <span className={`text-[10px] sm:text-[11px] tracking-tight transition-all ${
                  isActive ? "opacity-100 font-bold" : "opacity-90 font-semibold"
                }`}>
                  {item.name}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
