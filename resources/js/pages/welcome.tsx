import type { SharedData } from "@/types"
import { Head, Link, usePage } from "@inertiajs/react"
import { Search, ShoppingCart, Star, Heart, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { route } from "inertiajs" // Import route function

// Mock product data
const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    originalPrice: 399.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.8,
    reviews: 124,
    category: "Electronics",
    isNew: true,
    discount: 25,
  },
  {
    id: 2,
    name: "Minimalist Watch Collection",
    price: 189.99,
    originalPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.6,
    reviews: 89,
    category: "Accessories",
    isNew: false,
    discount: 0,
  },
  {
    id: 3,
    name: "Organic Cotton T-Shirt",
    price: 49.99,
    originalPrice: 69.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.9,
    reviews: 256,
    category: "Clothing",
    isNew: false,
    discount: 29,
  },
  {
    id: 4,
    name: "Smart Fitness Tracker",
    price: 159.99,
    originalPrice: 199.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.7,
    reviews: 178,
    category: "Electronics",
    isNew: true,
    discount: 20,
  },
  {
    id: 5,
    name: "Leather Crossbody Bag",
    price: 129.99,
    originalPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.5,
    reviews: 67,
    category: "Accessories",
    isNew: false,
    discount: 0,
  },
  {
    id: 6,
    name: "Wireless Charging Pad",
    price: 39.99,
    originalPrice: 59.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4.4,
    reviews: 143,
    category: "Electronics",
    isNew: false,
    discount: 33,
  },
]

const categories = [
  "All Products",
  "Electronics",
  "Clothing",
  "Accessories",
  "Home & Garden",
  "Books",
  "Sports & Outdoors",
  "Beauty & Personal Care",
]

export default function Welcome() {
  const { auth } = usePage<SharedData>().props

  return (
    <>
      <Head title="ShopHub - Premium Products">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
        style={{ fontFamily: "Outfit, sans-serif" }}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">SH</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">ShopHub</span>
                </Link>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Wishlist */}
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Heart className="h-5 w-5" />
                </Button>

                {/* Cart */}
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                    3
                  </Badge>
                </Button>

                {/* Auth buttons */}
                {auth.user ? (
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                    <Link href={route("dashboard")}>
                      <Button  size="sm">
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center space-x-2">
                    <Link href={route("login")}>
                      <Button  size="sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href={route("register")}>
                      <Button size="sm">Sign up</Button>
                    </Link>
                  </div>
                )}

                {/* Mobile menu */}
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section with Search Bar */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-slate-50 dark:bg-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Find Your Perfect Product
              </h1>
              <div className="relative w-full flex gap-10">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  placeholder="What are you looking for?"
                  className="w-full pl-10 pr-4 py-3 rounded-full border-slate-200 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                />
                <Button>Search</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section with Categories */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
           
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Handpicked items that combine quality, style, and functionality
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Category List */}
              <aside className="w-full lg:w-64 p-4 bg-white rounded-lg shadow-sm dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {category}
                      </Button>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Product Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="group overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-slate-800"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={`https://picsum.photos/${Math.floor(Math.random() * 201)}/${Math.floor(Math.random() * 201)}`}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {product.isNew && (
                        <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600">New</Badge>
                      )}
                      {product.discount > 0 && (
                        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">
                          -{product.discount}%
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary "
                        style={{ display: product.discount > 0 ? "none" : "flex" }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-4">
                      <div className="mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1 line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-600 dark:text-slate-400 ml-1">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <span className="text-xl font-bold text-slate-900 dark:text-white">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-slate-500 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button   className="w-full ">
                        <ShoppingCart className="h-5 w-5 mr-1.5" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        {/* <section className="py-16 bg-primary dark:bg-primary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-primary-foreground mb-4">Stay Updated</h3>
              <p className="text-primary-foreground/80 mb-8">
                Subscribe to our newsletter and be the first to know about new products and exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/70"
                />
                <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">Subscribe</Button>
              </div>
            </div>
          </div>
        </section> */}

        {/* Footer */}
        {/* <footer className="bg-slate-900 text-white py-12 dark:bg-slate-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">SH</span>
                  </div>
                  <span className="text-xl font-bold">ShopHub</span>
                </div>
                <p className="text-slate-400">
                  Your trusted destination for premium products and exceptional shopping experience.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Shipping
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Categories</h4>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Electronics
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Clothing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Accessories
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Home & Garden
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Returns
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
              <p>&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
            </div>
          </div>
        </footer> */}
      </div>
    </>
  )
}
