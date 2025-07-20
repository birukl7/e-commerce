import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Youtube } from "lucide-react"

const footerLinks = {
  Shop: ["Gift cards", "ShopHub Registry", "Sitemap", "ShopHub blog", "ShopHub United Kingdom", "ShopHub Germany", "ShopHub Canada"],
  Sell: ["Sell on ShopHub", "Teams", "Forums", "Affiliates & Creators"],
  About: ["ShopHub, Inc.", "Policies", "Investors", "Careers", "Press", "Impact", "Legal imprint"],
  Help: ["Help Center", "Privacy settings"],
}

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
]

const bottomLinks = ["Terms of Use", "Privacy", "Interest-based ads", "Local Shops", "Regions"]

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      {/* Main Footer Content */}
      <div className="relative">
        {/* App Download Section */}
        <div className="absolute left-0 top-0 bottom-0 w-full md:w-80 bg-gradient-to-r from-blue-600 to-blue-700 flex flex-col items-center justify-center p-8 md:p-12">
          <div className="bg-orange-500 rounded-lg p-4 mb-6">
            <span className="text-white font-bold text-2xl">ShopHub</span>
          </div>
          <Button className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-full font-medium" size="lg">
            Download the ShopHub App
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
              {/* Pinterest icon placeholder */}
              <a href="#" className="text-gray-300 hover:text-white transition-colors p-2" aria-label="Pinterest">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12 0 17.084 3.163 21.426 7.627 23.174c-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.001 24c6.624 0 11.999-5.373 11.999-12C24 5.372 18.626.001 12.001.001z" />
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
            <span>🌍</span>
            <span>Ethiopia</span>
            <span>|</span>
            <span>English (US)</span>
            <span>|</span>
            <span>$ (USD)</span>
          </div>

          {/* Copyright and Links */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
            <span>© 2025 ShopHub, Inc.</span>
            {bottomLinks.map((link) => (
              <span key={link} className="flex items-center gap-4">
                <a href="#" className="hover:text-white transition-colors">
                  {link}
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
