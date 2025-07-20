
import { Button } from "@/components/ui/button"
import H2 from "./ui/h2"

export default function HomePageBanner() {
  return (
    <div className="w-full  mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto lg:h-[400px]">
        {/* Back to School Section */}
        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl overflow-hidden min-h-[300px] lg:min-h-full">
          <div className="absolute inset-0">
            <img
              src={`image/image-3.jpg`}
              alt="Back to school supplies and decor"
              className="object-cover object-left"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/90 via-yellow-50/70 to-transparent" />
          </div>

          <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-center">
            <div className="max-w-md">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">Back to school</h1>
              <p className="text-lg lg:text-xl text-gray-700 mb-8 font-medium">For the first day and beyond</p>
              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full text-base font-semibold transition-colors duration-200"
              >
                Shop school supplies
              </Button>
            </div>
          </div>
        </div>

        {/* Teacher Appreciation Gifts Section */}
        <div className="relative bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl overflow-hidden min-h-[300px] lg:min-h-full">
          <div className="absolute inset-0">
            <img
              src={`image/image-4.jpg`}
              alt="Teacher appreciation gifts and stickers"
              
              className="object-cover object-right"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-purple-400/80 via-purple-300/60 to-purple-200/40" />
          </div>

          <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-end">
            <div className="max-w-md">
              <H2 className=" mb-3 leading-tight">
                Teacher Appreciation Gifts
              </H2>
              <button className="text-black text-lg font-semibold hover:underline transition-all duration-200 text-left  cursor-pointer">
                Shop now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
