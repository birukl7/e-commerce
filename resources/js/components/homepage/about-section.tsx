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
    about_cta_button_link?: string;
  };
}

export default function AboutSection({ settings }: AboutSectionProps) {
  return (
    <section className="w-full bg-[#F0E6D3] py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#222222] mb-3"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            {settings?.about_title || "What is Serdo?"}
          </h2>
          <a
            href="#"
            className="text-[#595959] hover:text-[#222222] underline underline-offset-4 text-sm md:text-base transition-colors"
          >
            {settings?.about_subtitle || "Discover our Ethiopian heritage story"}
          </a>
        </div>

        {/* Three Column Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-20">
          {/* Column 1 */}
          <div className="text-center md:text-left">
            <h3
              className="text-lg md:text-xl font-bold text-[#222222] mb-4"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {settings?.about_column1_title || "Celebrating Ethiopian Heritage"}
            </h3>
            <p className="text-[#595959] leading-relaxed text-sm">
              {settings?.about_column1_text || "Serdo is Ethiopia's premier marketplace, connecting artisans and modern creators with customers worldwide. We showcase the rich cultural heritage of Ethiopia through traditional crafts like Jebena coffee pots, handwoven textiles, and contemporary Ethiopian art, while also offering modern products for today's lifestyle."}
            </p>
          </div>

          {/* Column 2 */}
          <div className="text-center md:text-left">
            <h3
              className="text-lg md:text-xl font-bold text-[#222222] mb-4"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {settings?.about_column2_title || "Supporting Local Artisans"}
            </h3>
            <p className="text-[#595959] leading-relaxed text-sm">
              {settings?.about_column2_text || "From the highlands of Ethiopia to your home, we bring you authentic Ethiopian craftsmanship. Our platform empowers local artisans, coffee farmers, and modern entrepreneurs to reach global markets while preserving traditional techniques and promoting sustainable practices."}
            </p>
          </div>

          {/* Column 3 */}
          <div className="text-center md:text-left">
            <h3
              className="text-lg md:text-xl font-bold text-[#222222] mb-4"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {settings?.about_column3_title || "Quality & Authenticity"}
            </h3>
            <p className="text-[#595959] leading-relaxed text-sm">
              {settings?.about_column3_text || "Every product on Serdo is carefully curated to ensure authenticity and quality. Whether you're looking for traditional Ethiopian coffee ceremonies, contemporary Ethiopian fashion, or modern tech products, we guarantee genuine craftsmanship and exceptional service."}
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-[#595959] text-base md:text-lg mb-6">
            {settings?.about_cta_text || "Questions about our products or Ethiopian culture?"}
          </p>
          {settings?.about_cta_button_link ? (
            <Link href={settings.about_cta_button_link}>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-[#222222] border-[#222222] hover:bg-[#222222] hover:text-white bg-transparent transition-colors rounded-full"
              >
                {settings?.about_cta_button_text || "Contact Our Team"}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 text-[#222222] border-[#222222] hover:bg-[#222222] hover:text-white bg-transparent transition-colors rounded-full"
            >
              {settings?.about_cta_button_text || "Contact Our Team"}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
