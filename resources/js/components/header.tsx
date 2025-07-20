"use client"

import { useState, useRef, useEffect } from "react"
import { Link, usePage } from "@inertiajs/react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "./ui/button"
import { Heart, ShoppingCart, User } from "lucide-react"
import { Badge } from "./ui/badge"
import type { SharedData } from "@/types"
import CartDropdown from "./cart-dropdown"
// import { DropdownMenu } from "./ui/dropdown-menu"
import { CategoryDropdown } from "./ui/drop-down-menu"
import SearchBar from "./header-search-bar"
// import { route } from "@/router" // Import route function

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { auth } = usePage<SharedData>().props
  const { getTotalItems } = useCart()
  const cartButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  const closeCart = () => {
    setIsCartOpen(false)
  }

  // Close cart when clicking outside of header area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsCartOpen(false)
      }
    }

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isCartOpen])

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60"
    >
      <div className="container mx-auto px-2 sm:px-2 lg:px-2">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SH</span>
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">ShopHub</span>
            </Link>
            
            <CategoryDropdown/>

          </div>

          {/* Search Bar */}
          <div className="w-full px-10 hidden md:block">
            <SearchBar/>
          </div>
  

          {/* Right side actions */}
          <div className="flex items-center space-x-2">


            {/* Cart with dropdown */}

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
              <div className="flex sm:flex items-center space-x-1 pl-2">
                <Link href={route("login")} className="hidden sm:block">
                  <Button size="sm">Log in</Button>
                </Link>
                <Link href={route("register")}>
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}

          


            {/* Wishlist */}
            <Button variant="ghost" size="icon" className=" sm:flex">
              <Heart className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Button ref={cartButtonRef} variant="ghost" size="icon" className="relative" onClick={toggleCart}>
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
              <CartDropdown isOpen={isCartOpen} onClose={closeCart} />
            </div>
          </div>
        </div>
        <div className="w-full px-6 block md:hidden">
            <SearchBar/>
          </div>
      </div>
    </header>
  )
}

export default Header
