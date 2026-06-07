'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Product {
  _id: string
  name: string
  price: number
  discount: number
  category: string
  stock: number
  images: { url: string }[]
  isActive: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  const fetchProducts = () => {
    axios.get('/api/admin/products?limit=50')
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await axios.delete(`/api/products/${id}`)
      setProducts((prev) => prev.filter((p) => p._id !== id))
      toast.success('Product deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Products</h1>
          <p className="text-gray-400 mt-0.5 text-sm">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new">
          <motion.button whileTap={{ scale: 0.97 }} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/30 text-sm whitespace-nowrap">
            <Plus size={16} /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
          </motion.button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 md:mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
        />
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl border border-gray-700 p-4 flex gap-3 animate-pulse">
              <div className="w-16 h-16 bg-gray-700 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : filtered.map((product, i) => {
          const salePrice = product.price - (product.price * product.discount) / 100
          return (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 p-4"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                  {product.images[0]?.url && (
                    <Image src={product.images[0].url} alt={product.name} width={64} height={64} className="object-cover w-full h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg">{product.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg font-semibold ${product.isActive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-white font-bold text-sm">₹{Math.round(salePrice)}</span>
                      {product.discount > 0 && <span className="text-gray-500 text-xs line-through ml-1">₹{product.price}</span>}
                    </div>
                    <span className={`text-xs font-semibold ${product.stock === 0 ? 'text-red-400' : product.stock < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                <Link href={`/admin/products/${product._id}/edit`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 rounded-xl text-sm font-medium transition-colors">
                    <Edit size={14} /> Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(product._id, product.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-xl text-sm font-medium transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-700">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 w-full bg-gray-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((product, i) => {
                const salePrice = product.price - (product.price * product.discount) / 100
                return (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                          {product.images[0]?.url && (
                            <Image src={product.images[0].url} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                          )}
                        </div>
                        <p className="text-sm font-semibold text-white line-clamp-2">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium bg-amber-500/10 text-amber-400 px-2 py-1 rounded-lg">{product.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-white">₹{Math.round(salePrice)}</p>
                      {product.discount > 0 && <p className="text-xs text-gray-500 line-through">₹{product.price}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-400' : product.stock < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${product.isActive ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${product._id}/edit`}>
                          <button className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors">
                            <Edit size={15} />
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
