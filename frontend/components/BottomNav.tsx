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
    <nav className="fixed bottom-6 left-0 right-0 z-[100] md:hidden px-6 transition-soft">
      <div className="max-w-md mx-auto bg-white rounded-[3rem] shadow-lux-deep border border-slate-100/50 backdrop-blur-xl flex items-center justify-around h-20 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 transition-soft relative h-full group ${
                isActive ? "text-primary" : "text-slate-400"
              }`}
            >
              <div className="relative flex flex-col items-center gap-1.5">
                <div className={`transition-soft ${isActive ? "scale-110 -translate-y-1" : "group-active:scale-90"}`}>
                  <Icon className={`w-6 h-6 transition-soft ${isActive ? "stroke-[2.5] text-primary" : "stroke-[2] opacity-30"}`} />
                </div>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                    {item.badge}
                  </span>
                )}
                
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-soft ${
                  isActive ? "text-slate-950 scale-105" : "text-slate-400"
                }`}>
                  {item.name}
                </span>
              </div>
              
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-lg shadow-primary/20 animate-in zoom-in duration-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
