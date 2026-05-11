"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingCart, User } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useCart } from "../contexts/CartContext"

export default function BottomNav() {
  const pathname = usePathname()
  const { t, language } = useLanguage()
  const { cartCount } = useCart()

  const navItems = [
    { name: t("home") || "Home", href: "/", icon: Home },
    { name: t("allProducts") || "Products", href: "/products", icon: Package },
    { name: t("cart") || "Cart", href: "/checkout", icon: ShoppingCart, badge: cartCount },
    { name: t("account") || "Account", href: "/account", icon: User },
  ]

  return (
    <nav className="fixed bottom-8 left-0 right-0 z-[100] md:hidden px-6">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 flex items-center justify-around h-[76px] px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 transition-all duration-500 relative h-full ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              <div className="flex flex-col items-center gap-1 relative">
                <div className={`transition-all duration-500 ${isActive ? "scale-110 -translate-y-0.5" : "hover:text-slate-600"}`}>
                  <Icon className={`w-6 h-6 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                </div>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                    {item.badge}
                  </span>
                )}
                
                <span className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-500 ${
                  isActive ? "opacity-100 scale-105" : "opacity-40"
                }`}>
                  {item.name}
                </span>
              </div>
              
              {isActive && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/40 animate-in zoom-in duration-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
