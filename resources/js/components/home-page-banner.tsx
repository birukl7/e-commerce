
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import H2 from "./ui/h2"
import H1 from "./ui/h1"

interface HomePageBannerProps {
  settings?: {
    banner_main_title?: string;
    banner_main_subtitle?: string;
    banner_main_button_text?: string;
    banner_main_button_link?: string;
    banner_main_image?: string;
    banner_secondary_title?: string;
    banner_secondary_button_text?: string;
    banner_secondary_button_link?: string;
    banner_secondary_image?: string;
  };
}

export default function HomePageBanner({ settings }: HomePageBannerProps) {
  return (
    <div className="w-full  mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto lg:h-[400px]">
        {/* Back to School Section */}
        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl overflow-hidden min-h-[300px] lg:min-h-full">
          <div className="absolute inset-0">
            <img
              src={settings?.banner_main_image || `image/image-3.jpg`}
              alt={settings?.banner_main_title || "Banner image"}
              className="object-cover object-left w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/90 via-yellow-50/70 to-transparent" />
          </div>

          <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-center">
            <div className="max-w-md">
              <H1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-3 leading-tight">
                {settings?.banner_main_title || "Back to school"}
              </H1>
              <p className="text-lg lg:text-xl text-gray-700 mb-8 font-medium">
                {settings?.banner_main_subtitle || "For the first day and beyond"}
              </p>
              <Link href={settings?.banner_main_button_link || "/categories"}>
                <Button
                  size="lg"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full text-base font-semibold transition-colors duration-200"
                >
                  {settings?.banner_main_button_text || "Shop school supplies"}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Teacher Appreciation Gifts Section */}
        <div className="relative bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl overflow-hidden min-h-[300px] lg:min-h-full">
          <div className="absolute inset-0">
            <img
              src={settings?.banner_secondary_image || `image/image-4.jpg`}
              alt={settings?.banner_secondary_title || "Secondary banner image"}
              className="object-cover object-right"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-purple-400/80 via-purple-300/60 to-purple-200/40" />
          </div>

          <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-end">
            <div className="max-w-md">
              <H2 className=" mb-3 leading-tight">
                {settings?.banner_secondary_title || "Teacher Appreciation Gifts"}
              </H2>
              <Link href={settings?.banner_secondary_button_link || "/categories"}>
                <button className="text-black text-lg font-semibold hover:underline transition-all duration-200 text-left cursor-pointer">
                  {settings?.banner_secondary_button_text || "Shop now"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
