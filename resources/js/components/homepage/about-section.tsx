import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"

interface AboutSectionProps {
  settings?: {
    about_title?: string;
    about_subtitle?: string;
    about_column1_title?: string;
    about_column1_text?: string;
    about_column2_title?: string;
    about_column2_text?: string;
    about_column3_title?: string;
    about_column3_text?: string;
    about_cta_text?: string;
    about_cta_button_text?: string;
  };
}

export default function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section className="w-full bg-amber-50 py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            {settings?.about_title || "What is ShopHub?"}
          </h2>
          <a
            href="#"
            className="text-gray-700 hover:text-gray-900 underline underline-offset-2 text-sm md:text-base transition-colors"
          >
            {settings?.about_subtitle || "Discover our Ethiopian heritage story"}
          </a>
        </div>

        {/* Three Column Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-20">
          {/* Column 1 */}
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {settings?.about_column1_title || "Celebrating Ethiopian Heritage"}
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {settings?.about_column1_text || "ShopHub is Ethiopia's premier marketplace, connecting artisans and modern creators with customers worldwide. We showcase the rich cultural heritage of Ethiopia through traditional crafts like Jebena coffee pots, handwoven textiles, and contemporary Ethiopian art, while also offering modern products for today's lifestyle."}
            </p>
          </div>

          {/* Column 2 */}
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {settings?.about_column2_title || "Supporting Local Artisans"}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {settings?.about_column2_text || "From the highlands of Ethiopia to your home, we bring you authentic Ethiopian craftsmanship. Our platform empowers local artisans, coffee farmers, and modern entrepreneurs to reach global markets while preserving traditional techniques and promoting sustainable practices."}
            </p>
          </div>

          {/* Column 3 */}
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {settings?.about_column3_title || "Quality & Authenticity"}
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {settings?.about_column3_text || "Every product on ShopHub is carefully curated to ensure authenticity and quality. Whether you're looking for traditional Ethiopian coffee ceremonies, contemporary Ethiopian fashion, or modern tech products, we guarantee genuine craftsmanship and exceptional service."}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-700 text-lg md:text-xl mb-6">
            {settings?.about_cta_text || "Questions about our products or Ethiopian culture?"}
          </p>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 text-gray-700 border-gray-400 hover:bg-gray-100 hover:border-gray-500 bg-transparent transition-colors"
          >
            {settings?.about_cta_button_text || "Contact Our Team"}
          </Button>
        </div>
      </div>
    </section>
  )
}
