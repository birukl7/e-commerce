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


function WelcomeContent() {


  return (
    <>
      <Head title="ShopHub - Premium Products">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
      </Head>
      <div
        className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {/* Header */}
        <Header />

        {/* Hero Section with Search Bar */}
        
        <section className="relative py-20 lg:py-22 overflow-hidden bg-slate-50 dark:bg-slate-800 container mx-auto">
            <HomePageBanner/>
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

        <section className="container mx-auto">
          <GiftShowcase/>
        </section>

        <section className="container mx-auto">
          <DealsCarousel/>
        </section>

        
          <AboutSection/>
        
          <Footer />

      </div>
    </>
  )
}

export default function Welcome() {
  return (
    <CartProvider>
      <WelcomeContent />
    </CartProvider>
  )
}
