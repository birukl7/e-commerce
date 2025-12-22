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
  } catch (error: unknown) {
    console.error('Error in Welcome component:', error);
    
    // Get error message safely
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-2">We're having trouble loading the page.</p>
          <p className="text-sm text-gray-500 mb-6">Error: {errorMessage}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}
