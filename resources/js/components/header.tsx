"use client"

import { useRef, useEffect, useState } from "react"
import { Link, usePage, router } from "@inertiajs/react"
import { useCart } from "@/contexts/cart-context"
import { Button, buttonVariants } from "./ui/button"
import {
  Bookmark,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package2,
  Settings,
  ShoppingBag,
  Heart,
  ShoppingCart,
  User,
  Menu,
} from "lucide-react"
import { Badge } from "./ui/badge"
import type { SharedData } from "@/types"
import { CartDrawer } from "./cart-drawer"
// import { CategoryDropdown } from "./ui/category-dropdown"
import SearchBarAdvanced from "./header-search-bar-adv"
import SearchBar from "./header-search-bar"
import { CustomLink } from "./link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CategoryDropdownContent as CategoryDropdown } from "./ui/drop-down-menu"
import { cn } from "@/lib/utils"
import { LoginDialog } from "./auth/login-dialog"
import { SignupDialog } from "./auth/signup-dialog"
import { ChooseRoleDialog } from "./auth/choose-role-dialog"

const Header = () => {
  const { auth, shouldChooseRole = false } = usePage<SharedData>().props
  const { getTotalItems, isCartDrawerOpen, openCartDrawer, closeCartDrawer } = useCart()
  const cartButtonRef = useRef<HTMLButtonElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

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

  useEffect(() => {
    if (shouldChooseRole) {
      window.dispatchEvent(new Event("auth:choose-role"))
    }
  }, [shouldChooseRole])

  return (
    <>
      <SignupDialog listenForOpenEvent />
      <ChooseRoleDialog listenForOpenEvent />
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "bg-primary hover:bg-amber-600"
                        )}
                      >
                        <User className="h-5 w-5 text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuItem asChild>
                        <a
                          href={route("profile.edit")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-2 py-2 cursor-pointer"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={(auth.user.avatar as string) ?? undefined} alt={auth.user.name} />
                            <AvatarFallback>{getInitials(auth.user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{auth.user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">View your profile</p>
                          </div>
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {[
                        {
                          title: "Dashboard",
                          href: route("user.dashboard"),
                          icon: LayoutDashboard,
                        },
                        {
                          title: "BookMarked Products",
                          href: route("user.wishlist"),
                          icon: Bookmark,
                        },
                        {
                          title: "Orders",
                          href: route("user.orders"),
                          icon: ShoppingBag,
                        },
                        {
                          title: "Requests",
                          href: route("user.request"),
                          icon: MessageSquare,
                        },
                        {
                          title: "Bought Products",
                          href: route("user.products"),
                          icon: Package2,
                        },
                        {
                          title: "Settings",
                          href: route("profile.edit"),
                          icon: Settings,
                        },
                      ].map((item) => {
                        const Icon = item.icon
                        return (
                          <DropdownMenuItem key={item.title} asChild>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm">{item.title}</span>
                            </a>
                          </DropdownMenuItem>
                        )
                      })}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onSelect={(event) => {
                          event.preventDefault()
                          router.post(route("logout"))
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-1 pl-2">
                    <LoginDialog trigger={<Button size="sm">Sign in</Button>} />
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
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                    >
                      <Menu className="h-5 w-5" />
                    </button>
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
                          <LoginDialog
                            trigger={<Button className="w-full">Log in</Button>}
                          />
                          <SignupDialog
                            trigger={<Button variant="outline" className="w-full bg-transparent">Sign up</Button>}
                          />
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
              <button
                ref={cartButtonRef}
                type="button"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
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
              </button>
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
