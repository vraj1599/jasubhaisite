'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { ShoppingBag, Zap, Shield, Truck, RefreshCw, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/AuthModal'
import Link from 'next/link'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  discount: number
  category: string
  sizes: string[]
  stock: number
  images: { url: string; publicId: string }[]
}

export default function ProductDetailClient({ id }: { id: string }) {
  const [product, setProduct]   = useState<Product | null>(null)
  const [loading, setLoading]   = useState(true)
  const [selSize, setSelSize]   = useState('')
  const [selImage, setSelImage] = useState(0)
  const [authModal, setAuthModal] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const { user }   = useAuth()
  const { addToCart, loading: cartLoading } = useCart()
  const router     = useRouter()

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(({ data }) => { setProduct(data.product); setSelSize(data.product.sizes[0] ?? '') })
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false))
  }, [id, router])

  const salePrice = product ? product.price - (product.price * product.discount) / 100 : 0
  const savings   = product ? product.price - salePrice : 0

  const handleCart = async () => {
    if (!user) { setAuthModal(true); return }
    if (!selSize) { setSizeError(true); return }
    await addToCart(product!._id, selSize, salePrice)
  }

  const handleBuyNow = async () => {
    if (!user) { setAuthModal(true); return }
    if (!selSize) { setSizeError(true); return }
    await addToCart(product!._id, selSize, salePrice)
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-2 gap-12">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-3/4 rounded" />
          <div className="skeleton h-12 w-1/2 rounded" />
          <div className="skeleton h-24 w-full rounded" />
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100"
              whileHover={{ scale: 1.01 }}
            >
              <Image
                src={product.images[selImage]?.url ?? 'https://via.placeholder.com/600x600?text=No+Image'}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-sm px-3 py-1.5 rounded-xl shadow-lg">
                  -{product.discount}% OFF
                </div>
              )}
            </motion.div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelImage(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selImage === i ? 'border-amber-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">{product.category}</p>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-gray-900">₹{Math.round(salePrice)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    Save ₹{Math.round(savings)}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
              </span>
            </div>

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">Select Size</p>
                  <button className="text-xs text-amber-600 underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelSize(size); setSizeError(false) }}
                      className={`w-12 h-12 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
                        selSize === size
                          ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md'
                          : 'border-gray-200 text-gray-700 hover:border-amber-300'
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence>
                  {sizeError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-xs mt-2"
                    >
                      Please select a size
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* CTAs */}
            <div className="flex gap-3 flex-wrap">
              <motion.button
                onClick={handleCart}
                disabled={cartLoading || product.stock === 0}
                whileTap={{ scale: 0.97 }}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 bg-gray-900 hover:bg-amber-500 text-white font-bold rounded-2xl transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                <ShoppingBag size={20} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </motion.button>
              {product.stock > 0 && (
                <motion.button
                  onClick={handleBuyNow}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 min-w-[150px] flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 transition-all duration-200"
                >
                  <Zap size={20} />
                  Buy Now
                </motion.button>
              )}
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck,    label: 'Free Delivery', sub: 'Above ₹499' },
                { icon: RefreshCw,label: '7-Day Return',  sub: 'Easy returns' },
                { icon: Shield,   label: '100% Genuine',  sub: 'Authentic product' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <Icon size={18} className="text-amber-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-3">Product Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
            </div>

          </div>
        </div>
      </div>

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} defaultMode="login" />
    </>
  )
}
