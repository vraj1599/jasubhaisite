'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

export interface Product {
  _id: string
  name: string
  slug: string
  price: number
  discount: number
  category: string
  images: { url: string }[]
  sizes: string[]
  stock: number
}

interface Props {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [hovered, setHovered]   = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const { user }    = useAuth()
  const { addToCart, loading } = useCart()
  const router      = useRouter()

  const salePrice    = product.price - (product.price * product.discount) / 100
  const defaultSize  = product.sizes[0]
  const productUrl   = `/products/${product._id}`
  const imageUrl     = product.images[0]?.url ?? 'https://via.placeholder.com/400x400?text=No+Image'

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      router.push(`/login?redirect=${productUrl}`)
      return
    }
    if (!defaultSize) return
    await addToCart(product._id, defaultSize, salePrice)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-amber-200 hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Discount Badge */}
      {product.discount > 0 && (
        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
          -{product.discount}% OFF
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted) }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200 ${
          wishlisted ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-500 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <Link href={productUrl} className="block overflow-hidden aspect-square bg-gray-50">
        <motion.div
          animate={{ scale: hovered ? 1.07 : 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full h-full"
        >
          <Image
            src={imageUrl}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">{product.category}</p>
        <Link href={productUrl}>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight hover:text-amber-700 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-black text-gray-900">₹{Math.round(salePrice)}</span>
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
          )}
        </div>

        {/* Stock */}
        {product.stock === 0 && (
          <p className="text-xs font-medium text-red-500 mb-3">Out of Stock</p>
        )}

        {/* Add to Cart */}
        <motion.button
          onClick={handleAddToCart}
          disabled={loading || product.stock === 0}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-amber-500 text-white'
          }`}
        >
          <ShoppingBag size={15} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  )
}
