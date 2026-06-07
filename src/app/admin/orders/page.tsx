'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_COLORS: Record<string, string> = {
  pending:    'text-yellow-400 bg-yellow-400/10',
  confirmed:  'text-blue-400 bg-blue-400/10',
  processing: 'text-purple-400 bg-purple-400/10',
  shipped:    'text-indigo-400 bg-indigo-400/10',
  delivered:  'text-green-400 bg-green-400/10',
  cancelled:  'text-red-400 bg-red-400/10',
}

interface Order {
  _id: string
  user: { name: string; email: string; phone: string }
  total: number
  status: string
  paymentStatus: string
  items: { name: string; quantity: number }[]
  createdAt: string
  shippingAddress: { city: string; state: string }
}

export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([])
  const [loading, setLoading]         = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  const fetchOrders = () => {
    const params = filterStatus ? `?status=${filterStatus}` : ''
    axios.get(`/api/admin/orders${params}&limit=50`)
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [filterStatus])

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`/api/admin/orders/${id}`, { status })
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o))
      toast.success('Status updated')
    } catch {
      toast.error('Update failed')
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Orders</h1>
          <p className="text-gray-400 mt-0.5 text-sm">{orders.length} orders</p>
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-2 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-700 rounded w-2/3" />
            </div>
          ))
        ) : orders.map((order) => (
          <div key={order._id} className="bg-gray-800 rounded-2xl border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-mono text-xs font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
              <span className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            <p className="text-white font-semibold text-sm">{order.user?.name}</p>
            <p className="text-gray-500 text-xs mb-2">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">₹{Math.round(order.total)}</span>
                <span className="text-gray-500 text-xs">{order.items?.length} item(s)</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${order.paymentStatus === 'paid' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                {order.paymentStatus}
              </span>
            </div>

            <div className="relative">
              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                className={`w-full appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-semibold border border-gray-600 bg-gray-700 text-white focus:outline-none cursor-pointer`}
              >
                {STATUSES.map((s) => <option key={s} value={s} className="bg-gray-800 capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-700">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 w-full bg-gray-700 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono text-amber-400">#{order._id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-white">{order.user?.name}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{order.items?.length} item(s)</td>
                  <td className="px-5 py-4 text-sm font-bold text-white">₹{Math.round(order.total)}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${order.paymentStatus === 'paid' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-semibold border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[order.status]} bg-transparent`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s} className="bg-gray-800 text-white capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
