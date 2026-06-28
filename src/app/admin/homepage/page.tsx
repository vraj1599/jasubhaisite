'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { Save, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  _id: string
  name: string
  category: string
  images: { url: string }[]
}

interface Config {
  sliderActive: boolean
  sliderTitle: string
  sliderSubtitle: string
  sliderSource: 'bestselling' | 'featured' | 'manual'
  sliderLimit: number
  manualProducts: string[]
}

const SOURCES: { key: Config['sliderSource']; label: string; desc: string }[] = [
  { key: 'bestselling', label: 'Best Selling', desc: 'Auto-ranked by quantity sold (paid orders)' },
  { key: 'featured',    label: 'Featured',     desc: 'Products you marked as Featured' },
  { key: 'manual',      label: 'Hand-picked',  desc: 'Choose exactly which products to show' },
]

export default function AdminHomepagePage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/home-config'),
      axios.get('/api/admin/products?limit=200'),
    ]).then(([c, p]) => {
      const cfg = c.data.config
      setConfig({
        sliderActive:   cfg.sliderActive,
        sliderTitle:    cfg.sliderTitle,
        sliderSubtitle: cfg.sliderSubtitle,
        sliderSource:   cfg.sliderSource,
        sliderLimit:    cfg.sliderLimit,
        manualProducts: (cfg.manualProducts ?? []).map((id: unknown) => String(id)),
      })
      setProducts(p.data.products)
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof Config>(k: K, v: Config[K]) =>
    setConfig((c) => (c ? { ...c, [k]: v } : c))

  const toggleProduct = (id: string) => {
    setConfig((c) => {
      if (!c) return c
      const has = c.manualProducts.includes(id)
      return { ...c, manualProducts: has ? c.manualProducts.filter((x) => x !== id) : [...c.manualProducts, id] }
    })
  }

  const save = async () => {
    if (!config) return
    setSaving(true)
    try {
      await axios.put('/api/admin/home-config', config)
      toast.success('Homepage updated')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !config) {
    return <div className="p-8 text-gray-400 animate-pulse">Loading settings…</div>
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white">Homepage Slider</h1>
        <p className="text-gray-400 mt-0.5 text-sm">Control the product carousel shown on the homepage</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 md:p-6 space-y-5">
        {/* Active toggle */}
        <label className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white font-semibold text-sm">Show slider on homepage</p>
            <p className="text-gray-400 text-xs">Turn the whole carousel section on or off</p>
          </div>
          <input type="checkbox" checked={config.sliderActive} onChange={(e) => set('sliderActive', e.target.checked)} className="w-5 h-5 accent-amber-500" />
        </label>

        <div className="border-t border-gray-700 pt-5 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Section title</label>
            <input className="admin-input" value={config.sliderTitle} onChange={(e) => set('sliderTitle', e.target.value)} placeholder="Best Sellers" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Subtitle</label>
            <input className="admin-input" value={config.sliderSubtitle} onChange={(e) => set('sliderSubtitle', e.target.value)} placeholder="Most loved by our customers" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Max products to show</label>
            <input type="number" min={1} max={30} className="admin-input" value={config.sliderLimit} onChange={(e) => set('sliderLimit', parseInt(e.target.value) || 1)} />
          </div>
        </div>

        {/* Source */}
        <div className="border-t border-gray-700 pt-5">
          <label className="block text-xs font-semibold text-gray-400 mb-2">What should it show?</label>
          <div className="grid sm:grid-cols-3 gap-3">
            {SOURCES.map((s) => (
              <button
                key={s.key}
                onClick={() => set('sliderSource', s.key)}
                className={`text-left p-3 rounded-xl border-2 transition-all ${config.sliderSource === s.key ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 hover:border-gray-600'}`}
              >
                <p className={`font-bold text-sm ${config.sliderSource === s.key ? 'text-amber-400' : 'text-white'}`}>{s.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Manual picker */}
        {config.sliderSource === 'manual' && (
          <div className="border-t border-gray-700 pt-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-400">Pick products ({config.manualProducts.length} selected)</label>
            </div>
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input className="admin-input pl-9" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filtered.map((p) => {
                const selected = config.manualProducts.includes(p._id)
                return (
                  <button
                    key={p._id}
                    onClick={() => toggleProduct(p._id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl border transition-all text-left ${selected ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 hover:bg-gray-700/50'}`}
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {p.images[0]?.url && <Image src={p.images[0].url} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{p.name}</p>
                      <p className="text-gray-400 text-xs">{p.category}</p>
                    </div>
                    <span className={`w-4 h-4 rounded-full border flex-shrink-0 ${selected ? 'bg-amber-500 border-amber-500' : 'border-gray-500'}`} />
                  </button>
                )
              })}
              {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No products match.</p>}
            </div>
          </div>
        )}

        <div className="border-t border-gray-700 pt-5">
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
