'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Upload, X, Plus, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

const CATEGORIES = ['Sandals', 'Chappals', 'Kolhapuri', 'Mojaris', 'Sports', 'Formal', 'Casual', 'Kids']
const ALL_SIZES  = ['5', '6', '7', '8', '9', '10', '11', '12', 'S', 'M', 'L', 'XL', 'Free Size']

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [images, setImages]   = useState<{ url: string; publicId: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', price: '', discount: '0', category: 'Sandals',
    stock: '', featured: false, isActive: true,
  })
  const [sizes, setSizes] = useState<string[]>([])

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))
  const toggleSize = (s: string) => setSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader()
        reader.onloadend = async () => {
          const { data } = await axios.post('/api/upload', { image: reader.result })
          setImages((prev) => [...prev, data])
        }
        reader.readAsDataURL(file)
      }
      await new Promise((r) => setTimeout(r, 2000))
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) { toast.error('Add at least one image'); return }
    setLoading(true)
    try {
      await axios.post('/api/products', {
        ...form,
        price: Number(form.price),
        discount: Number(form.discount),
        stock: Number(form.stock),
        sizes,
        images,
      })
      toast.success('Product created!')
      router.push('/admin/products')
    } catch {
      toast.error('Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm transition-all'

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white">Add New Product</h1>
          <p className="text-gray-400 mt-1">Fill in the product details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Upload size={16} className="text-amber-500" /> Product Images</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-gray-600 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors">
              {uploading ? <span className="text-xs text-gray-400 animate-pulse">...</span> : <><Plus size={20} className="text-gray-400" /><span className="text-xs text-gray-500 mt-1">Add</span></>}
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <p className="text-xs text-gray-500">Upload multiple product images (max 5 recommended)</p>
        </div>

        {/* Basic Info */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-4">
          <h2 className="font-bold text-white">Product Details</h2>
          <input className={inputClass} placeholder="Product Name *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          <textarea className={`${inputClass} resize-none`} rows={4} placeholder="Product Description *" value={form.description} onChange={(e) => set('description', e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Category *</label>
              <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value)} required>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Stock *</label>
              <input className={inputClass} type="number" min="0" placeholder="e.g. 50" value={form.stock} onChange={(e) => set('stock', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Price (₹) *</label>
              <input className={inputClass} type="number" min="0" placeholder="e.g. 599" value={form.price} onChange={(e) => set('price', e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Discount (%)</label>
              <input className={inputClass} type="number" min="0" max="90" placeholder="e.g. 20" value={form.discount} onChange={(e) => set('discount', e.target.value)} />
            </div>
          </div>
          {form.price && form.discount && (
            <p className="text-sm text-amber-400">
              Sale Price: ₹{Math.round(Number(form.price) - (Number(form.price) * Number(form.discount)) / 100)}
            </p>
          )}
        </div>

        {/* Sizes */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="font-bold text-white mb-4">Available Sizes</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  sizes.includes(s)
                    ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 flex items-center gap-8">
          {[{ key: 'featured', label: 'Mark as Featured' }, { key: 'isActive', label: 'Active (visible to customers)' }].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set(key, !form[key as keyof typeof form])}
                className={`w-11 h-6 rounded-full relative transition-all duration-200 ${form[key as keyof typeof form] ? 'bg-amber-500' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${form[key as keyof typeof form] ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-gray-300 font-medium">{label}</span>
            </label>
          ))}
        </div>

        <motion.button
          type="submit"
          disabled={loading || uploading}
          whileTap={{ scale: 0.97 }}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl shadow-lg shadow-amber-900/30 disabled:opacity-60 text-base"
        >
          {loading ? 'Creating Product...' : 'Create Product'}
        </motion.button>
      </form>
    </div>
  )
}
