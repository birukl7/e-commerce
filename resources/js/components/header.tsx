"use client"

import { useRef, useEffect, useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "./ui/button"
import { Heart, ShoppingCart, User, Menu } from "lucide-react"
import { Badge } from "./ui/badge"
import type { SharedData } from "@/types"
import { CartDrawer } from "./cart-drawer"
// import { CategoryDropdown } from "./ui/category-dropdown"
import SearchBarAdvanced from "./header-search-bar-adv"
import SearchBar from "./header-search-bar"
import { CustomLink } from "./link"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CategoryDropdown } from "./ui/drop-down-menu"

const Header = () => {
  const { auth } = usePage<SharedData>().props
  const { getTotalItems, isCartDrawerOpen, openCartDrawer, closeCartDrawer } = useCart()
  const cartButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      >
        <div className="container mx-auto px-2 sm:px-2 lg:px-2">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link prefetch href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">SH</span>
                </div>
                {/* Hide company name on mobile */}
                <span className="text-xl font-bold text-slate-900 hidden sm:block">Serdo</span>
              </Link>
              {/* Hide CategoryDropdown on mobile */}
              <div className="hidden sm:block">
                <CategoryDropdown />
              </div>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="w-full px-10 hidden md:block">
              <SearchBarAdvanced />
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Desktop Auth buttons */}
              <div className="hidden sm:flex items-center space-x-2">
                {auth.user ? (
                  <CustomLink
                    href={route("user.dashboard")}
                    variant="ghost"
                    sizes="icon"
                    className="bg-primary hover:bg-amber-600"
                  >
                    <User className="h-5 w-5 text-white" />
                  </CustomLink>
                ) : (
                  <div className="flex items-center space-x-1 pl-2">
                    <Link prefetch href={route("login")}>
                      <Button size="sm">Log in</Button>
                    </Link>
                    <Link prefetch href={route("register")}>
                      <Button size="sm">Sign up</Button>
                    </Link>
                  </div>
                )}

                {/* Desktop Wishlist */}
                <CustomLink href={"/user-wishlist"} variant="ghost" sizes="icon">
                  <Heart className="h-5 w-5" />
                </CustomLink>
              </div>

              {/* Mobile Hamburger Menu */}
              <div className="sm:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col space-y-4 mt-6">
                      {/* Categories in mobile menu */}
                      <div className="pb-4 border-b">
                        <CategoryDropdown />
                      </div>

                      {/* Auth section */}
                      {auth.user ? (
                        <div className="flex flex-col space-y-3">
                          <CustomLink
                            href={route("user.dashboard")}
                            variant="outline"
                            className="justify-start"
                            onClick={closeMobileMenu}
                          >
                            <User className="h-5 w-5 mr-2" />
                            Dashboard
                          </CustomLink>
                        </div>
                      ) : (
                        <div className="flex flex-col space-y-3">
                          <Link prefetch href={route("login")} onClick={closeMobileMenu}>
                            <Button className="w-full">Log in</Button>
                          </Link>
                          <Link prefetch href={route("register")} onClick={closeMobileMenu}>
                            <Button variant="outline" className="w-full bg-transparent">
                              Sign up
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* Wishlist in mobile menu */}
                      <CustomLink
                        href={"/user-wishlist"}
                        variant="outline"
                        className="justify-start"
                        onClick={closeMobileMenu}
                      >
                        <Heart className="h-5 w-5 mr-2" />
                        Wishlist
                      </CustomLink>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Cart (always visible) */}
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
