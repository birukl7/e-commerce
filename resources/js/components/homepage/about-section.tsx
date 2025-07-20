import { Button } from "@/components/ui/button"

export default function AboutSection() {
  return (
    <section className="w-full bg-amber-50 py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">What is ShopHub?</h2>
          <a
            href="#"
            className="text-gray-700 hover:text-gray-900 underline underline-offset-2 text-sm md:text-base transition-colors"
          >
            Read our wonderfully weird story
          </a>
        </div>

        {/* Three Column Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 md:mb-20">
          {/* Column 1 */}
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">A community doing good</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              ShopHub is a global online marketplace, where people come together to make, sell, buy, and collect unique
              items. We're also a community pushing for positive change for small businesses, people, and the planet.{" "}
              <a href="#" className="text-gray-700 hover:text-gray-900 underline underline-offset-2 transition-colors">
                Here are some of the ways we're making a positive impact, together.
              </a>
            </p>
          </div>

          {/* Column 2 */}
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Support independent creators</h3>
            <p className="text-gray-700 leading-relaxed">
              There's no ShopHub warehouse – just millions of people selling the things they love. We make the whole
              process easy, helping you connect directly with makers to find something extraordinary.
            </p>
          </div>

          {/* Column 3 */}
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Peace of mind</h3>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is the highest priority of our dedicated team. And if you ever need assistance, we are always
              ready to step in for support.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-700 text-lg md:text-xl mb-6">Have a question? Well, we've got some answers.</p>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 text-gray-700 border-gray-400 hover:bg-gray-100 hover:border-gray-500 bg-transparent transition-colors"
          >
            Go to Help Center
          </Button>
        </div>
      </div>
    </section>
  )
}
