import { Button } from "@/components/ui/button"
import H2 from "../ui/h2"


export default function CTASection() {
  return (
    <section className="w-full bg-primary rounded-3xl">
      <div className="mx-auto px-4 md:px-6 lg:px-8 pr-0 mr-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <div className="text-center lg:text-left">
            <H2 className="font-bold text-white mb-4">Can't Find It? Request It</H2>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Tell us what you're looking for - we'll source it, stock it, or custom order it for you.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-3 text-lg font-semibold bg-white text-primary hover:bg-gray-100 transition-colors"
            >
              Request
            </Button>
          </div>

          {/* Image Side */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full ">
              <img
                src="image/image-9.jpg"
                alt="Person searching for custom items"
                
                className="object-top object-cover w-full h-[300px] rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
