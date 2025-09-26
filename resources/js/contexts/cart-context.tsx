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
    try {
      // Fetch the latest product data including stock information
      const response = await fetch(`/api/products/${product.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch product data')
      }
      
      const productData = await response.json()
      const { stock_quantity, stock_status, manage_stock } = productData.data
      
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id)
        const newQuantity = existingItem ? existingItem.quantity + 1 : 1
        
        // Check stock availability
        if (manage_stock && newQuantity > stock_quantity) {
          alert(`Sorry, only ${stock_quantity} items available in stock.`)
          return prevItems
        }
        
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
            quantity: 1,
            maxQuantity: stock_quantity,
            stockStatus: stock_status,
            manageStock: manage_stock
          },
        ]
      })
      
      openCartDrawer() // Open drawer when item is added
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart. Please try again.')
    }
  }

  const removeFromCart = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setItems((prevItems) => {
      const itemToUpdate = prevItems.find(item => item.id === id)
      
      // Check if the new quantity exceeds available stock
      if (itemToUpdate?.manageStock && quantity > itemToUpdate.maxQuantity) {
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
