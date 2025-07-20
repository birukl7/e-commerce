

interface InterestCardProps {
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
}

export function InterestCard({ title, subtitle, imageSrc }: InterestCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl bg-white transition-all duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-black/10 ">
        <div   style={{ backgroundImage: `url(${imageSrc || "/placeholder.svg"})` }}
  className="bg-cover h-[200px] sm:h-[300px] md:h-[400px] w-full">
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
