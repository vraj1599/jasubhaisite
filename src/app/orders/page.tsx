'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import axios from 'axios'
import Link from 'next/link'
import { Package, ChevronRight, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  shipped:    'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered:  'bg-green-100 text-green-700 border-green-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
}

const STATUS_STEP: Record<string, number> = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4, cancelled: -1,
}

interface Order {
  _id: string
  items: { name: string; size: string; quantity: number; price: number; image: string }[]
  total: number
  status: string
  paymentStatus: string
  razorpayPaymentId: string
  createdAt: string
  shippingAddress: { name: string; city: string; state: string; pincode: string }
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/orders')
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">My Orders</h1>

          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <ShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-500 mb-6 text-sm">Your order history will appear here</p>
              <Link href="/products">
                <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
                  Start Shopping
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => {
                const step = STATUS_STEP[order.status] ?? 0
                const trackSteps = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered']

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 md:p-5 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-amber-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">#{order._id.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' · '}{order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="font-black text-gray-900 text-sm">₹{Math.round(order.total)}</span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Mini tracking bar */}
                    {order.status !== 'cancelled' && (
                      <div className="px-4 md:px-5 pb-4">
                        <div className="flex items-center gap-0">
                          {trackSteps.map((label, idx) => (
                            <div key={label} className="flex items-center flex-1 min-w-0">
                              <div className="flex flex-col items-center">
                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${idx <= step ? 'bg-amber-500' : 'bg-gray-200'}`} />
                                <span className={`text-[9px] mt-0.5 font-medium hidden sm:block ${idx <= step ? 'text-amber-600' : 'text-gray-400'}`}>{label}</span>
                              </div>
                              {idx < trackSteps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-0.5 ${idx < step ? 'bg-amber-500' : 'bg-gray-200'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-4 md:px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </p>
                      <Link href={`/orders/${order._id}`}>
                        <button className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700">
                          View Details <ChevronRight size={14} />
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
