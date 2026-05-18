'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { ShoppingCart, Users, Package, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface Stats {
  totalOrders: number
  totalUsers: number
  totalProducts: number
  totalRevenue: number
  recentOrders: {
    _id: string
    user: { name: string; email: string }
    total: number
    status: string
    createdAt: string
  }[]
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'text-yellow-400 bg-yellow-400/10',
  confirmed: 'text-blue-400 bg-blue-400/10',
  shipped:   'text-indigo-400 bg-indigo-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Revenue', value: stats ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '—', icon: DollarSign, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500/10' },
    { label: 'Total Orders',  value: stats?.totalOrders  ?? '—', icon: ShoppingCart, color: 'from-blue-400 to-blue-600',   bg: 'bg-blue-500/10' },
    { label: 'Total Users',   value: stats?.totalUsers   ?? '—', icon: Users,        color: 'from-purple-400 to-purple-600', bg: 'bg-purple-500/10' },
    { label: 'Active Products',value: stats?.totalProducts ?? '—',icon: Package,     color: 'from-green-400 to-green-600',  bg: 'bg-green-500/10' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-5 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={`bg-gradient-to-br ${color} bg-clip-text`} style={{ color: 'transparent', backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                <Icon size={20} className="text-amber-400" />
              </div>
              <TrendingUp size={16} className="text-green-400" />
            </div>
            <p className="text-3xl font-black text-white mb-1">
              {loading ? <span className="skeleton w-20 h-8 block rounded" /> : value}
            </p>
            <p className="text-sm text-gray-400">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Clock size={18} className="text-amber-500" /> Recent Orders
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-700">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                stats?.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-amber-400">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-white">{order.user?.name ?? 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">₹{Math.round(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${STATUS_COLORS[order.status] ?? 'text-gray-400 bg-gray-400/10'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
