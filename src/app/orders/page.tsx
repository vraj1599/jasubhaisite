'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import axios from 'axios'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
}

interface Order {
  _id: string
  items: { name: string; size: string; quantity: number; price: number; image: string }[]
  total: number
  status: string
  paymentStatus: string
  createdAt: string
  shippingAddress: { name: string; line1: string; city: string; state: string; pincode: string }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    axios.get('/api/orders')
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black text-gray-900 mb-8">My Orders</h1>

          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Package size={64} className="text-gray-200 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-6">Your order history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Package size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                      <span className="font-black text-gray-900">₹{Math.round(order.total)}</span>
                      {expanded === order._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expanded === order._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-gray-100 space-y-3 pt-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                <p className="text-gray-500 text-xs">Size: {item.size} · Qty: {item.quantity}</p>
                              </div>
                              <p className="font-bold">₹{Math.round(item.price * item.quantity)}</p>
                            </div>
                          ))}
                          <div className="border-t pt-3 text-sm text-gray-500">
                            <p><span className="font-semibold">Deliver to:</span> {order.shippingAddress.name}, {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
