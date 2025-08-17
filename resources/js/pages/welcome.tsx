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

  return (
    <>
      <Head title="ShopHub - Premium Products">
      </Head>
      
      <div
        className="min-h-screen bg-white text-slate-900 "
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {/* Header */}
        <Header />

        {/* Hero Section with Search Bar */}
        
        <section className="relative py-20 lg:py-22 overflow-hidden bg-slate-50  container mx-auto">
          <HomePageBanner settings={settings} />
        </section>

        <section className="container mx-auto">
          <FeaturedInterests/>
        </section>

        <Section>
          <CTASection/>
        </Section>
        

        <section className="container mx-auto">
          <GiftShowcase/>
        </section>

        <section className="container mx-auto">
          <DealsCarousel/>
        </section>

        {/* <section className="container mx-auto">
          <GiftShowcase/>
        </section> */}

        {/* <section className="container mx-auto">
          <DealsCarousel/>
        </section> */}
        
          <AboutSection settings={settings} />
        
          <Footer settings={settings} />

      </div>
    </>
  )
}

export default function Welcome({ settings }: WelcomeProps) {
  return (
    <CartProvider>
      <WelcomeContent settings={settings} />
    </CartProvider>
  )
}
