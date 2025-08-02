"use client"

import Footer from "@/components/footer"
import Header from "@/components/header"
import { Head } from "@inertiajs/react"
import type React from "react"
import type { ReactNode } from "react"
import { CartProvider } from "@/contexts/cart-context"
import { BreadcrumbWrapper } from "@/components/breadcrumb-wrapper"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { router } from "@inertiajs/react"
import type { BreadcrumbItem } from "@/types" // or wherever your interface is defined

type MainLayout = {
  children: ReactNode
  title: string
  className?: string
  footerOff?: boolean
  contentMarginTop?: string
  breadcrumbs?: BreadcrumbItem[]
  showBreadcrumbs?: boolean
  showBackButton?: boolean
}

const MainLayout: React.FC<MainLayout> = ({
  children,
  title,
  className = "",
  footerOff,
  contentMarginTop = "",
  breadcrumbs = [],
  showBreadcrumbs = true,
  showBackButton = false,
}) => {
  const handleBack = () => {
    // Try to use Inertia's router first, fallback to browser history
    if (window.history.length > 1) {
      window.history.back()
    } else {
      // Fallback to home page if no history
      router.visit("/")
    }
  }

  return (
    <CartProvider>
      <div className={className}>
        <Head title={title} />
        <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>
          {/* Header */}
          <Header />

          {/* Back Button */}
          {showBackButton && (
            <div className="border-b bg-white">
              <div className="max-w-[1280px] mx-auto px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <div className="border-b bg-gray-50/50">
              <div className="max-w-[1280px] mx-auto px-4 py-3">
                <BreadcrumbWrapper items={breadcrumbs} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={`max-w-[1280px] mx-auto ${contentMarginTop}`}>{children}</div>

          {/* Footer */}
          <div>{footerOff ? <Footer /> : <></>}</div>
        </div>
      </div>
    </CartProvider>
  )
}

export default MainLayout
