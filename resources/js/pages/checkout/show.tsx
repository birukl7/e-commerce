"use client"

import { Head } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ShoppingCart, X, Minus, Plus } from "lucide-react"
import { CartProvider, useCart } from "@/contexts/cart-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
// import { route } from "inertiajs"

function CheckoutContent() {
  const { items, getTotalPrice, removeFromCart, updateQuantity, clearCart, getTotalItems } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price)
  }

  const handlePayNow = () => {
    console.log("Processing payment for:", getTotalPrice())
    alert("Payment successful! Your order has been placed.")
    clearCart()
    window.location.href = route("home")
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
      <Header />
      <div className="max-w-[1280px] mx-auto py-8">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">Checkout</h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
              <ShoppingCart className="h-16 md:h-20 w-16 md:w-20 mb-4" />
              <p className="text-lg md:text-xl mb-4">Your cart is empty.</p>
              <Link href={route("home")}>
                <Button>Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Order Summary - Mobile First Responsive */}
              <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Order Summary</h2>
                <ul className="space-y-4 md:space-y-6">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <img
                        src={item.image || "/placeholder.svg?height=100&width=100&query=product"}
                        alt={item.name}
                        className="h-20 w-20 md:h-24 md:w-24 rounded-md object-cover mx-auto sm:mx-0"
                      />
                      <div className="flex-1 w-full">
                        <div className="flex flex-col gap-3">
                          <div>
                            <h3 className="font-medium text-base md:text-lg text-gray-900 text-center sm:text-left">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 text-center sm:text-left">
                              {formatPrice(item.price)} each
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="text-base font-medium px-3">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-base md:text-lg">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Total - Responsive */}
              <div className="lg:col-span-1 bg-white p-4 md:p-6 rounded-lg shadow-md h-fit">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Order Total</h2>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-gray-700 text-sm md:text-base">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-sm md:text-base">
                    <span>Shipping</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-sm md:text-base">
                    <span>Tax</span>
                    <span>{formatPrice(0)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg md:text-xl font-bold">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
                <Button onClick={handlePayNow} className="w-full mt-6 md:mt-8 text-base md:text-lg py-3">
                  Pay Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function Show() {
  return (
    <CartProvider>
      <Head title="Checkout" />
      <CheckoutContent />
    </CartProvider>
  )
}
