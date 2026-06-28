'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Shield, Truck, RefreshCw, Award, ChevronRight, ChevronLeft } from 'lucide-react'
import ProductCard, { Product } from '@/components/ProductCard'
import SkeletonCard from '@/components/SkeletonCard'

const CATEGORIES = [
  { name: 'Sandals',    emoji: '🩴', desc: 'Light & breezy' },
  { name: 'Chappals',   emoji: '👡', desc: 'Daily comfort' },
  { name: 'Kolhapuri',  emoji: '🥿', desc: 'Traditional craft' },
  { name: 'Mojaris',    emoji: '👟', desc: 'Festival wear' },
  { name: 'Sports',     emoji: '⚡', desc: 'Active lifestyle' },
  { name: 'Kids',       emoji: '🌟', desc: 'Tiny feet, big fun' },
]

const TRUST_BADGES = [
  { icon: Shield,   title: '100% Authentic',   desc: 'Genuine leather & materials' },
  { icon: Truck,    title: 'Free Delivery',     desc: 'On orders above ₹499' },
  { icon: RefreshCw,title: '7-Day Returns',     desc: 'Easy hassle-free returns' },
  { icon: Award,    title: 'Best Quality',      desc: 'Crafted with care since 1985' },
]

// Gradient presets shared with the admin banner editor.
const BANNER_THEME: Record<string, string> = {
  red:    'from-red-500 via-orange-500 to-amber-500',
  amber:  'from-amber-500 to-orange-500',
  green:  'from-emerald-500 to-green-600',
  blue:   'from-sky-500 to-blue-600',
  purple: 'from-fuchsia-500 to-purple-600',
  dark:   'from-gray-800 to-gray-950',
}

interface Banner {
  _id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  theme: string
}

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

// Horizontally scrolling product carousel with arrow controls.
function ProductSlider({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null)
  const scrollBy = (dir: number) => {
    scroller.current?.scrollBy({ left: dir * 260 * 2, behavior: 'smooth' })
  }
  return (
    <div className="relative">
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-amber-50 transition-colors"
      >
        <ChevronLeft size={20} className="text-gray-700" />
      </button>
      <div ref={scroller} className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {products.map((p, i) => (
          <div key={p._id} className="w-[200px] sm:w-[230px] flex-shrink-0 snap-start">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
      <button
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white border border-gray-200 rounded-full shadow-md hover:bg-amber-50 transition-colors"
      >
        <ChevronRight size={20} className="text-gray-700" />
      </button>
    </div>
  )
}

export default function HomeClient() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [trending, setTrending] = useState<Product[]>([])
  const [banners, setBanners]   = useState<Banner[]>([])
  const [slider, setSlider]     = useState<{ active: boolean; title: string; subtitle: string; products: Product[] }>({ active: false, title: '', subtitle: '', products: [] })
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/products?featured=true&limit=4'),
      axios.get('/api/products?limit=8'),
      axios.get('/api/banners'),
      axios.get('/api/home-slider'),
    ]).then(([f, t, b, s]) => {
      setFeatured(f.data.products)
      setTrending(t.data.products)
      setBanners(b.data.banners ?? [])
      setSlider(s.data ?? { active: false, title: '', subtitle: '', products: [] })
    }).finally(() => setLoading(false))
  }, [])

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
        {/* Decorative orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center py-20">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Handcrafted in India since 1985
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none mb-6">
              Walk in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Style.
              </span>
              <br />
              Walk with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Comfort.
              </span>
            </h1>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-md">
              Handcrafted Indian footwear that blends tradition with modern comfort. Starting at just{' '}
              <span className="text-amber-400 font-bold text-xl">₹199</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 flex items-center gap-2 group"
                >
                  Shop Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/products?category=Kolhapuri">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 border-2 border-gray-600 hover:border-amber-500 text-white font-bold rounded-2xl transition-all duration-200"
                >
                  View Kolhapuri
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Hero image placeholder / animated visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-orange-600/30 rounded-full blur-xl" />
              <div className="relative w-full h-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-3xl border border-amber-500/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-[120px]">👟</span>
              </div>
              {/* Floating badge */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-2xl shadow-lg"
              >
                ₹199 Onwards
              </motion.div>
              <motion.div
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 bg-white text-gray-900 text-sm font-bold px-4 py-2 rounded-2xl shadow-lg"
              >
                Free Shipping ✓
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-amber-50 border-y border-amber-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sales Banners (admin-managed) */}
      {banners.length > 0 && (
        <FadeInSection delay={0.1}>
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className={`bg-gradient-to-r ${BANNER_THEME[banner.theme] ?? BANNER_THEME.amber} rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative`}
                >
                  <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }}
                  />
                  <div className="relative text-white text-center sm:text-left">
                    <h3 className="text-3xl font-black">{banner.title}</h3>
                    {banner.subtitle && <p className="text-white/90 mt-1">{banner.subtitle}</p>}
                  </div>
                  <Link href={banner.ctaLink || '/products'} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-white text-gray-900 font-black rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {banner.ctaText || 'Shop Now'}
                    </motion.button>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </FadeInSection>
      )}

      {/* Admin-managed Product Slider */}
      {slider.active && slider.products.length > 0 && (
        <FadeInSection delay={0.1}>
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-gray-900">{slider.title}</h2>
                  {slider.subtitle && <p className="text-gray-500 mt-1">{slider.subtitle}</p>}
                </div>
                <Link href="/products" className="flex items-center gap-1 text-amber-600 font-semibold text-sm hover:underline">
                  View All <ChevronRight size={16} />
                </Link>
              </div>
              {loading ? (
                <div className="flex gap-5 overflow-hidden">
                  {Array(4).fill(0).map((_, i) => <div key={i} className="w-[230px] flex-shrink-0"><SkeletonCard /></div>)}
                </div>
              ) : (
                <ProductSlider products={slider.products} />
              )}
            </div>
          </section>
        </FadeInSection>
      )}

      {/* Categories */}
      <FadeInSection delay={0.1}>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Shop by Category</h2>
                <p className="text-gray-500 mt-1">Find your perfect fit</p>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map(({ name, emoji, desc }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.03 }}
                >
                  <Link href={`/products?category=${name}`}>
                    <div className="bg-white border border-gray-100 hover:border-amber-200 hover:shadow-lg rounded-2xl p-4 text-center transition-all duration-200 cursor-pointer group">
                      <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-200">{emoji}</div>
                      <p className="font-bold text-sm text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Featured Products */}
      <FadeInSection>
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Featured Products</h2>
                <p className="text-gray-500 mt-1">Hand-picked for you</p>
              </div>
              <Link href="/products?featured=true" className="flex items-center gap-1 text-amber-600 font-semibold text-sm hover:underline">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading
                ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : featured.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)
              }
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Trending Now */}
      <FadeInSection>
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Trending Now</h2>
                <p className="text-gray-500 mt-1">What everyone is buying</p>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-amber-600 font-semibold text-sm hover:underline">
                See More <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading
                ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
                : trending.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)
              }
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Brand Story */}
      <FadeInSection>
        <section className="py-16 bg-gradient-to-br from-gray-950 to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-2xl mx-auto">
              <p className="text-amber-400 font-semibold text-sm uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="text-4xl font-black text-white mb-6">
                Crafting Comfort Since{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">1985</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Jasubhai Chappal was born in the narrow lanes of Kolhapur, Maharashtra.
                For over 40 years, we have handcrafted footwear that honors Indian tradition
                while delivering all-day comfort for every walk of life.
              </p>
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-900/40"
                >
                  Explore Collection
                </motion.button>
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>
    </main>
  )
}
