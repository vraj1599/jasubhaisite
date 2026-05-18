'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

interface CartItem {
  _id: string
  product: {
    _id: string
    name: string
    images: { url: string }[]
    price: number
    discount: number
  }
  size: string
  quantity: number
  price: number
}

interface CartContextType {
  items: CartItem[]
  totalItems: number
  subtotal: number
  loading: boolean
  addToCart: (productId: string, size: string, price: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => void
  fetchCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({} as CartContextType)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user }    = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    if (!user) return
    try {
      const { data } = await axios.get('/api/cart')
      setItems(data.cart?.items ?? [])
    } catch {
      /* silent */
    }
  }

  useEffect(() => { fetchCart() }, [user])

  const addToCart = async (productId: string, size: string, price: number) => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/cart', { productId, size, quantity: 1, price })
      setItems(data.cart.items)
      toast.success('Added to cart!')
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const { data } = await axios.put('/api/cart', { itemId, quantity })
      setItems(data.cart.items)
    } catch {
      toast.error('Failed to update cart')
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const { data } = await axios.delete('/api/cart', { data: { itemId } })
      setItems(data.cart.items)
      toast.success('Item removed')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const subtotal   = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, totalItems, subtotal, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
