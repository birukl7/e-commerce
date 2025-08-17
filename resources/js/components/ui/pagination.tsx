import { Link } from "@inertiajs/react"

export type PaginationLink = {
  url: string | null
  label: string
  active: boolean
}

interface PaginationProps {
  links: PaginationLink[]
}

export default function Pagination({ links }: PaginationProps) {
  // console.log('pagination links', links)
  if (!links || links.length === 0) return null

  return (
    <nav className="mt-8 flex items-center justify-center" aria-label="Pagination">
      <ul className="inline-flex -space-x-px rounded-md shadow-sm">
        {links.map((link, index) => {
          const label = decodeHtml(link.label)
          const isDisabled = link.url === null
          const isActive = link.active

          return (
            <li key={`${label}-${index}`}>
              {isDisabled ? (
                <span
                  className={`px-3 py-2 select-none text-sm border bg-white ${
                    isActive ? "z-10 border-blue-600 text-primary" : "border-gray-300 text-gray-500"
                  }`}
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={link.url ?? "#"}
                  className={`px-3 py-2 text-sm border bg-white hover:bg-gray-50 ${
                    isActive ? "z-10 border-blue-600 text-primary" : "border-gray-300 text-gray-700"
                  }`}
                  preserveScroll
                >
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function decodeHtml(html: string) {
  const txt = typeof window !== "undefined" ? window.document.createElement("textarea") : null
  if (!txt) return html
  txt.innerHTML = html
  return txt.value
}


