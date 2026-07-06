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
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-slate-950 border-t-[4px] border-primary text-white safe-pb">
      <div className="flex items-center justify-around h-[72px] px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                isActive ? "text-primary bg-slate-900" : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <div className="flex flex-col items-center gap-1.5 relative">
                <div className={`transition-transform duration-300 ${isActive ? "scale-110" : ""}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                </div>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-3 -right-3 bg-primary text-slate-900 text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center border-2 border-slate-950 px-1">
                    {item.badge}
                  </span>
                )}
                
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  isActive ? "opacity-100" : "opacity-60"
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
