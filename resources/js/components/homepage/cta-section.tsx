import { useTranslation } from "react-i18next"
import { CustomLink } from "../link"


export default function CTASection() {
  const { t } = useTranslation()
  return (
    <section className="w-full rounded-lg bg-[#F0E6D3] overflow-hidden">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <div className="text-center lg:text-left py-10 lg:py-14">
            <h2
              className="text-2xl md:text-3xl font-bold text-[#222222] mb-4"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              {t("cta.title")}
            </h2>
            <p className="text-base text-[#595959] mb-8 leading-relaxed">
              {t("cta.description")}
            </p>

            <CustomLink
              sizes="lg"
              variant="secondary"
              className="inline-block rounded-full bg-[#222222] px-8 py-3 text-sm font-semibold text-white hover:bg-[#333333] transition-colors border-0"
              href={route('request.index')}>
              {t("cta.request")}
            </CustomLink>
          </div>

          {/* Image Side */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full">
              <img
                src="image/Looking.jpg"
                alt="Person searching for custom items"
                className="object-top object-cover w-full h-[280px] lg:h-[360px] rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
