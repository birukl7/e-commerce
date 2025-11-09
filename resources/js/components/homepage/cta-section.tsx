import { useTranslation } from "react-i18next"
import H2 from "../ui/h2"
import { CustomLink } from "../link"


export default function CTASection() {
  const { t } = useTranslation()
  return (
    <section className="w-full bg-primary rounded-3xl">
      <div className="mx-auto px-4 md:px-6 lg:px-8 pr-0 mr-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <div className="text-center lg:text-left">
            <H2 className="font-bold text-white mb-4">{t("cta.title")}</H2>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              {t("cta.description")}
            </p>

            <CustomLink
              sizes="lg"
              variant="secondary"
              className="px-8 py-3 text-lg font-semibold bg-white text-primary hover:bg-gray-100 transition-colors"
              href={route('request.index')}>
              {t("cta.request")}
            </CustomLink>
          </div>

          {/* Image Side */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full ">
              <img
                src="image/Looking.jpg"
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
