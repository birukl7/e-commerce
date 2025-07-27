"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "./ui/button"
import { X, Plus, Minus, ShoppingCart } from "lucide-react"
import { Link } from "@inertiajs/react"
// import { route } from "@/utils/route" // Import the route function

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ETB",
    }).format(price)
  }

  // Don't render anything if not open
  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Backdrop overlay - Fixed the opacity issue */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Explicit inline style as fallback
      />

      {/* Cart Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 bg-white shadow-xl h-screen w-full sm:w-96 md:w-[400px] max-w-full transform transition-transform duration-300 ease-in-out"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="flex h-full flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4 bg-white sticky top-0 z-10">
            <h2 id="cart-drawer-title" className="text-lg font-semibold truncate text-gray-900">
              Your Cart ({items.length})
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
              <X className="h-5 w-5" />
              <span className="sr-only">Close cart</span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 px-4">
                <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mb-4" />
                <p className="text-base sm:text-lg text-center">Your cart is empty.</p>
                <Button onClick={onClose} className="mt-4 w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg?height=80&width=80&query=product"}
                          alt={item.name}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-md object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 truncate pr-2">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{formatPrice(item.price)}</p>

                        {/* Quantity Controls and Remove Button */}
                        <div className="flex items-center justify-between mt-3 gap-2">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-transparent border-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                              <span className="sr-only">Decrease quantity</span>
                            </Button>
                            <span className="text-sm font-medium px-2 min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 bg-transparent border-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                              <span className="sr-only">Increase quantity</span>
                            </Button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm whitespace-nowrap">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-700 flex-shrink-0"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer with Total and Checkout Button */}
          {items.length > 0 && (
            <div className="border-t p-4 bg-white sticky bottom-0">
              <div className="flex justify-between items-center text-lg font-semibold mb-4">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(getTotalPrice())}</span>
              </div>
              <Link href={route("checkout")} className="block w-full">
                <Button className="w-full text-base sm:text-lg py-3" onClick={onClose}>
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
