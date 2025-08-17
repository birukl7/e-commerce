import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Youtube } from "lucide-react"
import { Link } from "@inertiajs/react"

interface FooterProps {
  settings?: {
    footer_brand_description?: string;
    footer_download_text?: string;
    footer_location_text?: string;
    footer_language_text?: string;
    footer_currency_text?: string;
    footer_copyright_text?: string;
  };
}

const footerLinks = {
  Shop: ["Traditional Crafts", "Modern Products", "Ethiopian Coffee", "Handmade Textiles", "Art Gallery"],
  Sell: ["Become a Seller", "Artisan Program", "Coffee Partnership", "Craft Workshops", "Seller Support"],
  About: ["Our Story", "Ethiopian Heritage", "Sustainability", "Press & Media", "Careers", "Contact Us"],
  Help: ["Customer Support", "Shipping Info", "Returns Policy", "Size Guide"],
}

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

const bottomLinks = [
  { name: "Terms of Service", href: "/terms" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Cookie Policy", href: "/privacy" },
  { name: "Local Shops", href: "#" },
  { name: "Regions", href: "#" }
]


export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="relative">
        {/* App Download Section */}
        <div className="absolute left-0 top-0 bottom-0 w-full md:w-80 bg-gradient-to-r from-amber-600 to-amber-700 flex flex-col items-center justify-center p-8 md:p-12">
          <div className="bg-amber-500 rounded-lg p-4 mb-6">
            <span className="text-white font-bold text-2xl">ShopHub</span>
          </div>
          <p className="text-amber-100 text-center mb-4">
            {settings?.footer_brand_description || "Discover Ethiopian treasures and modern essentials"}
          </p>
          <Button className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 rounded-full font-medium" size="lg">
            {settings?.footer_download_text || "Download ShopHub App"}
          </Button>
        </div>

        {/* Links Section */}
        <div className="pl-0 md:pl-80 py-12 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h3 className="font-semibold text-lg mb-4">{category}</h3>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-end gap-4 mt-8 md:mt-0 md:absolute md:top-12 md:right-8">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="text-gray-300 hover:text-white transition-colors p-2"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
              {/* Ethiopian flag colors icon placeholder */}
              <a href="#" className="text-gray-300 hover:text-white transition-colors p-2" aria-label="Ethiopian Heritage">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 py-4 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Location/Language Selector */}
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>🇪🇹</span>
            <span>{settings?.footer_location_text || "Ethiopia"}</span>
            <span>|</span>
            <span>{settings?.footer_language_text || "Amharic / English"}</span>
            <span>|</span>
            <span>{settings?.footer_currency_text || " (ETB)"}</span>
          </div>

          {/* Copyright and Links */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span>{settings?.footer_copyright_text || "© 2025 ShopHub Ethiopia"}</span>
            {bottomLinks.map((link) => (
              <span key={link.name} className="flex items-center gap-4">
                <Link href={link.href} className="hover:text-white transition-colors">
                  {link.name}
                </Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
