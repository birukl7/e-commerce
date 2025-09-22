import React from 'react'
import { Head } from "@inertiajs/react"
import Header from "@/components/header"
import { CartProvider } from "@/contexts/cart-context"
import HomePageBanner from "@/components/home-page-banner"
import { FeaturedInterests } from "@/components/homepage/featured-interests"
import GiftShowcase from "@/components/homepage/gift-showcase"
import DealsCarousel from "@/components/homepage/deals-carousel"
import Section from "@/components/ui/section"
import CTASection from "@/components/homepage/cta-section"
import AboutSection from "@/components/homepage/about-section"
import Footer from "@/components/footer"

interface WelcomeProps {
  settings?: Record<string, string>;
}

function WelcomeContent({ settings }: WelcomeProps) {
  React.useEffect(() => {
    // safe debugging logs (won't be rendered into DOM)
    console.log('[WelcomeContent] Mounted with settings:', settings)
    return () => console.log('[WelcomeContent] Unmounted')
  }, [])

  React.useEffect(() => {
    console.log('[WelcomeContent] Settings updated:', settings)
  }, [settings])

  return (
    <>
      <Head title="ShopHub - Premium Products" />

      <div
        className="min-h-screen bg-white text-slate-900"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {/* Header */}
        <Header />

        {/* Hero Section with Search Bar */}
        <section className="relative py-20 lg:py-22 overflow-hidden bg-slate-50 container mx-auto">
          <HomePageBanner settings={settings} />
        </section>

        <section className="container mx-auto">
          <FeaturedInterests />
        </section>

        <Section>
          <CTASection />
        </Section>

        <section className="container mx-auto">
          <GiftShowcase />
        </section>

        <section className="container mx-auto">
          <DealsCarousel />
        </section>

        <AboutSection settings={settings} />
        <Footer settings={settings} />
      </div>
    </>
  )
}

export default function Welcome({ settings }: WelcomeProps) {
  React.useEffect(() => {
    // type-safe check for Inertia to avoid TS errors at runtime
    const hasInertia = typeof (window as any).Inertia !== 'undefined'

    console.log('[Welcome] Mounted with props:', settings)
    console.log('[Welcome] document.readyState:', document.readyState)
    console.log('[Welcome] root element:', document.getElementById('app'))
    console.log('[Welcome] Inertia available:', hasInertia)

    // Try to list stylesheets for debugging (wrap in try/catch because of CORS)
    try {
      const styles = Array.from(document.styleSheets || [])
      console.log('[Welcome] stylesheets count:', styles.length)
    } catch (err) {
      console.warn('[Welcome] Could not enumerate stylesheets (CORS)')
    }

    return () => console.log('[Welcome] Unmounted')
  }, [])

  React.useEffect(() => {
    console.log('[Welcome] Props updated:', settings)
  }, [settings])

  try {
    return (
      <CartProvider>
        <div id="welcome-root" data-testid="welcome-root">
          <WelcomeContent settings={settings} />
        </div>
      </CartProvider>
    )
  } catch (error: any) {
    console.error('[Welcome] Rendering error:', error)
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h1>Error loading page</h1>
        <p>Check console for details</p>
        <pre>{error?.message}</pre>
      </div>
    )
  }
}
