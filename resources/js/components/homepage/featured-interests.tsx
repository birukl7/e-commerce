import H2 from "../ui/h2"
import { InterestCard } from "./interest-card"


const interestsData = [
  {
    title: "Homestead",
    subtitle: "Cozy, handcrafted home",
    imageSrc: "/placeholder.svg?height=300&width=400",
    imageAlt: "Homestead style decor with scattered letters and dried flowers",
  },
  {
    title: "Dark Academia Decor",
    subtitle: "Romantic and mysterious",
    imageSrc: "/placeholder.svg?height=300&width=400",
    imageAlt: "Vintage brass candlesticks with white candles",
  },
  {
    title: "Linen Spotlight",
    subtitle: "Relaxed linen style",
    imageSrc: "/placeholder.svg?height=300&width=400",
    imageAlt: "Woman in purple linen dress among tropical plants",
  },
  {
    title: "Upcycled Home",
    subtitle: "Sustainable home decor",
    imageSrc: "/placeholder.svg?height=300&width=400",
    imageAlt: "Modern table lamp with white shade and wooden base",
  },
]

export function FeaturedInterests() {
  return (
    <section className="w-full mx-auto px-4 py-12">
      <H2 className="">Jump into featured interests</H2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {interestsData.map((interest, index) => (
          <InterestCard
            key={index}
            title={interest.title}
            subtitle={interest.subtitle}
            imageSrc={`image/image-${index+1}.jpg`}
            imageAlt={interest.imageAlt}
          />
        ))}
      </div>
    </section>
  )
}
