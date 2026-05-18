'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useCart } from '@/context/CartContext'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
  const { items, totalItems, subtotal, updateItem, removeItem } = useCart()
  const [coupon, setCoupon]   = useState('')
  const [discount, setDiscount] = useState(0)

  const shipping = subtotal > 499 ? 0 : 49
  const total    = subtotal - discount + shipping

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'WELCOME10') setDiscount(Math.round(subtotal * 0.1))
    else if (coupon.toUpperCase() === 'FLAT50') setDiscount(50)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-gray-900 mb-8">
            Shopping Cart{' '}
            {totalItems > 0 && <span className="text-gray-400 font-normal text-xl">({totalItems} items)</span>}
          </h1>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-2xl border border-gray-100"
            >
              <ShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-8">Add some products to get started</p>
              <Link href="/products" className="btn-primary inline-flex">
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                        <Image
                          src={item.product.images[0]?.url ?? 'https://via.placeholder.com/100'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 truncate">{item.product.name}</h3>
                        <p className="text-xs text-gray-500 mb-1">Size: <span className="font-semibold">{item.size}</span></p>
                        <p className="font-black text-gray-900">₹{Math.round(item.price)}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1">
                            <button
                              onClick={() => updateItem(item._id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-amber-50 transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateItem(item._id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-amber-50 transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="font-black text-gray-900">₹{Math.round(item.price * item.quantity)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                {/* Coupon */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-amber-500" /> Apply Coupon
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      className="input-field flex-1 py-2 text-sm"
                    />
                    <button onClick={applyCoupon} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors">
                      Apply
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Try: WELCOME10 or FLAT50</p>
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                      <span className="font-semibold">₹{Math.round(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Coupon Discount</span>
                        <span className="font-semibold">-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-amber-600">Add ₹{499 - subtotal} more for free shipping</p>
                    )}
                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="font-black text-gray-900">Total</span>
                      <span className="font-black text-xl text-gray-900">₹{Math.round(total)}</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      className="w-full mt-4 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all"
                    >
                      Proceed to Checkout
                      <ArrowRight size={18} />
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
