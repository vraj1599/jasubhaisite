'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, User, Mail, Phone, MapPin, Calendar } from 'lucide-react'

interface UserRecord {
  _id: string
  name: string
  email: string
  phone: string
  address: { city: string; state: string }
  createdAt: string
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    axios.get('/api/admin/users?limit=100')
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white">Users</h1>
        <p className="text-gray-400 mt-0.5 text-sm">{users.length} registered customers</p>
      </div>

      <div className="relative mb-4 md:mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 p-4 flex gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-700 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : filtered.map((user) => (
          <div key={user._id} className="bg-gray-800 rounded-2xl border border-gray-700 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{user.name}</p>
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Mail size={11} />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <Phone size={11} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.address?.city && (
                    <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <MapPin size={11} />
                      <span>{user.address.city}, {user.address.state}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Calendar size={11} />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-700">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <tr key={i}>{Array(4).fill(0).map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 w-full bg-gray-700 rounded animate-pulse" /></td>)}</tr>
              ))
            ) : filtered.map((user) => (
              <tr key={user._id} className="hover:bg-gray-700/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-400">{user.phone || '—'}</td>
                <td className="px-5 py-4 text-sm text-gray-400">
                  {user.address?.city ? `${user.address.city}, ${user.address.state}` : '—'}
                </td>
                <td className="px-5 py-4 text-sm text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
