"use client"

import { useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "./ui/button"
import { Heart, Menu, ShoppingCart, User } from "lucide-react"
import { Badge } from "./ui/badge"
import type { SharedData } from "@/types"
import CartDropdown from "./cart-dropdown"
// import { route } from "@/router" // Import route function

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { auth } = usePage<SharedData>().props
  const { getTotalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SH</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">ShopHub</span>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Heart className="h-5 w-5" />
            </Button>

            {/* Cart with dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCartOpen(true)}
              onMouseLeave={() => setIsCartOpen(false)}
            >
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
              <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>

            {/* Auth buttons */}
            {auth.user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
                <Link href={route("dashboard")}>
                  <Button size="sm">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href={route("login")}>
                  <Button size="sm">Log in</Button>
                </Link>
                <Link href={route("register")}>
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
