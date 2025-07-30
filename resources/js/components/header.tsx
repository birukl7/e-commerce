"use client"

import { useRef, useEffect } from "react"
import { Link, usePage } from "@inertiajs/react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "./ui/button"
import { Heart, ShoppingCart, User } from "lucide-react"
import { Badge } from "./ui/badge"
import type { SharedData } from "@/types"
import { CartDrawer } from "./cart-drawer"
import { CategoryDropdown } from "./ui/drop-down-menu"
import SearchBarAdvanced from "./header-search-bar-adv"
import SearchBar from "./header-search-bar"
import { CustomLink } from "./link"

const Header = () => {
  const { auth } = usePage<SharedData>().props
  const { getTotalItems, isCartDrawerOpen, openCartDrawer, closeCartDrawer } = useCart()
  const cartButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)

  // Close cart when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isCartDrawerOpen) {
        closeCartDrawer()
      }
    }

    if (isCartDrawerOpen) {
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isCartDrawerOpen, closeCartDrawer])

  const handleCartClick = () => {
    if (isCartDrawerOpen) {
      closeCartDrawer()
    } else {
      openCartDrawer()
    }
  }

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 "
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
              <CategoryDropdown />
            </div>
            {/* Search Bar (Desktop) */}
            <div className="w-full px-10 hidden md:block">
              <SearchBarAdvanced />
            </div>
            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Auth buttons */}
              {auth.user ? (
                <div className="flex items-center space-x-2">
                  <CustomLink
                    href={route("user.dashboard")}
                    variant="ghost"
                    sizes="icon"
                    className=" bg-primary hover:bg-amber-600"
                  >
                    <User className="h-5 w-5 text-white" />
                  </CustomLink>
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
              {/* Cart */}
              <Button
                ref={cartButtonRef}
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleCartClick}
                aria-expanded={isCartDrawerOpen}
                aria-haspopup="dialog"
              >
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
          {/* Search Bar (Mobile) */}
          <div className="w-full px-6 block md:hidden">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Cart Drawer - Rendered outside header to avoid z-index issues */}
      <CartDrawer isOpen={isCartDrawerOpen} onClose={closeCartDrawer} />
    </>
  )
}

export default Header
