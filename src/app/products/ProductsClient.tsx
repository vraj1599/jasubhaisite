'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import SkeletonCard from '@/components/SkeletonCard'

const CATEGORIES = ['Sandals', 'Chappals', 'Kolhapuri', 'Mojaris', 'Sports', 'Formal', 'Casual', 'Kids']
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

export default function ProductsClient() {
  const searchParams = useSearchParams()
  const initCat      = searchParams.get('category') ?? ''
  const initSearch   = searchParams.get('search') ?? ''

  const [products, setProducts] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [category, setCategory] = useState(initCat)
  const [sort, setSort]         = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        ...(category && { category }),
        ...(initSearch && { search: initSearch }),
      })
      const { data } = await axios.get(`/api/products?${params}`)
      let prods = data.products as Record<string, unknown>[]

      if (sort === 'price_asc')  prods = [...prods].sort((a, b) => (a.price as number) - (b.price as number))
      if (sort === 'price_desc') prods = [...prods].sort((a, b) => (b.price as number) - (a.price as number))

      prods = prods.filter((p) => {
        const sp = (p.price as number) - ((p.price as number) * (p.discount as number)) / 100
        return sp >= priceRange[0] && sp <= priceRange[1]
      })

      setProducts(prods)
      setTotal(data.total)
      setPages(data.pages)
    } finally {
      setLoading(false)
    }
  }, [page, category, sort, initSearch, priceRange])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const clearFilters = () => { setCategory(''); setSort('newest'); setPriceRange([0, 5000]); setPage(1) }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {category || initSearch ? `${category || `"${initSearch}"`}` : 'All Products'}
            </h1>
            <p className="text-sm text-gray-500">{total} items found</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-amber-400 hover:bg-amber-50 transition-all"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>
            {(category || sort !== 'newest') && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-500 hover:underline">
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        {/* Sidebar Filters */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.aside
              initial={{ opacity: 0, x: -20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 240 }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              className="flex-shrink-0 overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-5 w-60 space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setCategory('')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${!category ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${category === cat ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={0}
                      max={5000}
                      step={100}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹0</span>
                      <span className="font-semibold text-amber-600">Up to ₹{priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {loading
              ? Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p, i) => (
                  <ProductCard key={p._id as string} product={p as Parameters<typeof ProductCard>[0]['product']} index={i} />
                ))
            }
          </div>

          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                    p === page ? 'bg-amber-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
