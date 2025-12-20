import React from 'react'
import { Head } from "@inertiajs/react"
import Header from "@/components/header"
import { CartProvider } from "@/contexts/cart-context"
import HomePageBanner from "@/components/home-page-banner"
import { FeaturedInterests } from "@/components/homepage/featured-interests";
import FeaturedProducts from "@/components/homepage/featured-products";
import GiftShowcase from "@/components/homepage/gift-showcase";
import DealsCarousel from "@/components/homepage/deals-carousel";
import Section from "@/components/ui/section";
import CTASection from "@/components/homepage/cta-section";
import AboutSection from "@/components/homepage/about-section";
import Footer from "@/components/footer";

interface WelcomeProps {
  settings?: Record<string, string>;
  diagnostics?: { 
    totalProducts: number | null; 
    zeroStock: number | null;
  };
  featuredProducts?: Record<string, any>;
}

function WelcomeContent({ settings, featuredProducts }: WelcomeProps) {
  return (
    <>
      <Head title="Serdo - Premium Products" />

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

        {/* Featured Products Section */}
        {featuredProducts && Object.keys(featuredProducts).length > 0 && (
          <section className="py-12">
            <FeaturedProducts products={featuredProducts} />
          </section>
        )}

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

export default function Welcome({ settings, diagnostics, featuredProducts }: WelcomeProps) {
  React.useEffect(() => {
    // type-safe check for Inertia to avoid TS errors at runtime

    // Try to list stylesheets for debugging (wrap in try/catch because of CORS)
    try {
      const styles = Array.from(document.styleSheets || [])
    
    } catch (err) {
      console.warn('[Welcome] Could not enumerate stylesheets (CORS)')
    }

    return () => console.log('[Welcome] Unmounted')
  }, [])



  try {
    return (
      <CartProvider>
        <div id="welcome-root" data-testid="welcome-root">
          {/* Hidden debug snapshot for quick inspection if needed */}
          <pre style={{ display: 'none' }} id="welcome-debug">
            {JSON.stringify({ settings, diagnostics }, null, 2)}
          </pre>
          <WelcomeContent settings={settings} featuredProducts={featuredProducts} />
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
