"use client"

import { useState, useRef, useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Minus, Plus, Trash2 } from "lucide-react"
import CheckoutDialog from "./checkout-dialog"

interface CartDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDropdown({ isOpen, onClose }: CartDropdownProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle clicking outside to close dropdown - but only when checkout is not open
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close dropdown if checkout dialog is open
      if (isCheckoutOpen) return

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen && !isCheckoutOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, isCheckoutOpen])

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
    onClose() // Close the cart dropdown when opening checkout
  }

  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-96 z-50">
        <Card className="shadow-lg border border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-lg">Shopping Cart</h3>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Your cart is empty</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 border rounded-lg">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-sm text-slate-600">ETB {item.price}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          {items.length > 0 && (
            <CardFooter className="flex flex-col gap-3 pt-3">
              <div className="flex justify-between items-center w-full">
                <span className="font-semibold">Total: ETB {getTotalPrice().toFixed(2)}</span>
                <Button variant="outline" size="sm" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Checkout
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog isOpen={isCheckoutOpen} onClose={handleCheckoutClose} />
    </>
  )
}
