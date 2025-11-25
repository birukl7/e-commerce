"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  maxQuantity: number
  stockStatus: 'in_stock' | 'out_of_stock' | 'low_stock'
  manageStock: boolean
}

interface CartContextType {
  items: CartItem[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addToCart: (product: any) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  getTotalItems: () => number
  getTotalPrice: () => number
  clearCart: () => void
  isCartDrawerOpen: boolean
  openCartDrawer: () => void
  closeCartDrawer: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Initialize state from localStorage
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cartItems")
      return savedCart ? JSON.parse(savedCart) : []
    }
    return []
  })

  // Explicitly initialize drawer as closed
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cartItems", JSON.stringify(items))
    }
  }, [items])

  // Add to cart with stock validation
  const addToCart = async (product: any) => {
    // Extract quantity from product object
    const requestedQuantity = typeof product.quantity === 'number' && product.quantity > 0 
      ? Math.floor(product.quantity) 
      : 1

    // Use product data we already have (optimistic update)
    const stock_quantity = product.stock_quantity ?? 0
    const stock_status = product.stock_status ?? 'in_stock'
    const manage_stock = product.manage_stock ?? false

    // Quick validation with available data
    if (manage_stock && requestedQuantity > stock_quantity) {
      alert(`Sorry, only ${stock_quantity} items available in stock.`)
      return
    }

    // Optimistically add to cart and open drawer immediately
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      
      // SET the quantity to the selected amount (don't add to existing)
      // This means if cart has 3 and user selects 5, cart becomes 5 (not 8)
      const newQuantity = requestedQuantity
      
      if (existingItem) {
        return prevItems.map((item) => 
          item.id === product.id 
            ? { 
                ...item, 
                quantity: newQuantity,
                maxQuantity: stock_quantity,
                stockStatus: stock_status,
                manageStock: manage_stock
              } 
            : item
        )
      }
      
      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.current_price,
          image: product.primary_image,
          quantity: requestedQuantity,
          maxQuantity: stock_quantity,
          stockStatus: stock_status,
          manageStock: manage_stock
        },
      ]
    })
    
    // Open drawer immediately for better UX
    openCartDrawer()

    // Fetch latest stock data in the background and update if needed
    try {
      const response = await fetch(`/api/products/${product.id}`)
      if (response.ok) {
        const productData = await response.json()
        const { stock_quantity: latestStock, stock_status: latestStatus, manage_stock: latestManageStock } = productData.data
        
        // Update cart with latest stock information
        setItems((prevItems) => {
          const itemToUpdate = prevItems.find((item) => item.id === product.id)
          if (!itemToUpdate) return prevItems
          
          // If stock validation fails with latest data, adjust quantity
          if (latestManageStock && itemToUpdate.quantity > latestStock) {
            // Show notification but don't block - user already sees the cart
            if (itemToUpdate.quantity !== latestStock) {
              alert(`Stock updated: Only ${latestStock} items available. Quantity adjusted.`)
            }
            
            return prevItems.map((item) => 
              item.id === product.id 
                ? { 
                    ...item, 
                    quantity: Math.min(item.quantity, latestStock),
                    maxQuantity: latestStock,
                    stockStatus: latestStatus,
                    manageStock: latestManageStock
                  } 
                : item
            )
          }
          
          // Just update stock info without changing quantity
          return prevItems.map((item) => 
            item.id === product.id 
              ? { 
                  ...item, 
                  maxQuantity: latestStock,
                  stockStatus: latestStatus,
                  manageStock: latestManageStock
                } 
              : item
          )
        })
      }
    } catch (error) {
      // Silently fail - cart is already open and item is added
      // Log for debugging but don't disrupt user experience
      console.warn('Failed to fetch latest stock data:', error)
    }
  }

  const removeFromCart = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, newQuantity: number) => {
    // Ensure quantity is at least 1
    if (newQuantity < 1) {
      removeFromCart(id)
      return
    }
    
    setItems((prevItems) => {
      const itemToUpdate = prevItems.find(item => item.id === id)
      
      if (!itemToUpdate) {
        return prevItems
      }
      
      // Ensure quantity is at least 1
      const quantity = Math.max(1, Math.floor(newQuantity))
      
      // Check if the new quantity exceeds available stock
      if (itemToUpdate.manageStock && quantity > itemToUpdate.maxQuantity) {
        alert(`Sorry, only ${itemToUpdate.maxQuantity} items available in stock.`)
        return prevItems
      }
      
      return prevItems.map((item) => 
        item.id === id 
          ? { ...item, quantity } 
          : item
      )
    })
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const clearCart = () => {
    setItems([])
    setIsCartDrawerOpen(false) // Close drawer when cart is cleared
  }

  const openCartDrawer = () => {
    setIsCartDrawerOpen(true)
  }

  const closeCartDrawer = () => {
    setIsCartDrawerOpen(false)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
