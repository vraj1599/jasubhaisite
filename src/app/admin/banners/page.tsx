'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Save, X, Megaphone } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Banner {
  _id: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  theme: string
  active: boolean
  order: number
}

const THEMES: { key: string; label: string; className: string }[] = [
  { key: 'red',    label: 'Red',    className: 'from-red-500 via-orange-500 to-amber-500' },
  { key: 'amber',  label: 'Amber',  className: 'from-amber-500 to-orange-500' },
  { key: 'green',  label: 'Green',  className: 'from-emerald-500 to-green-600' },
  { key: 'blue',   label: 'Blue',   className: 'from-sky-500 to-blue-600' },
  { key: 'purple', label: 'Purple', className: 'from-fuchsia-500 to-purple-600' },
  { key: 'dark',   label: 'Dark',   className: 'from-gray-800 to-gray-950' },
]

const themeClass = (key: string) =>
  THEMES.find((t) => t.key === key)?.className ?? THEMES[1].className

type Draft = Omit<Banner, '_id'>

const blankDraft: Draft = {
  title: '', subtitle: '', ctaText: 'Shop Now', ctaLink: '/products', theme: 'amber', active: true, order: 0,
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)   // banner _id or 'new'
  const [draft, setDraft]     = useState<Draft>(blankDraft)
  const [saving, setSaving]   = useState(false)

  const fetchBanners = () => {
    axios.get('/api/admin/banners')
      .then(({ data }) => setBanners(data.banners))
      .catch(() => toast.error('Failed to load banners'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBanners() }, [])

  const startNew = () => { setDraft(blankDraft); setEditing('new') }
  const startEdit = (b: Banner) => {
    setDraft({ title: b.title, subtitle: b.subtitle, ctaText: b.ctaText, ctaLink: b.ctaLink, theme: b.theme, active: b.active, order: b.order })
    setEditing(b._id)
  }
  const cancel = () => { setEditing(null); setDraft(blankDraft) }

  const save = async () => {
    if (!draft.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      if (editing === 'new') {
        await axios.post('/api/admin/banners', draft)
        toast.success('Banner created')
      } else {
        await axios.patch(`/api/admin/banners/${editing}`, draft)
        toast.success('Banner updated')
      }
      cancel()
      fetchBanners()
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (b: Banner) => {
    try {
      await axios.patch(`/api/admin/banners/${b._id}`, { active: !b.active })
      setBanners((prev) => prev.map((x) => (x._id === b._id ? { ...x, active: !x.active } : x)))
    } catch {
      toast.error('Update failed')
    }
  }

  const remove = async (b: Banner) => {
    if (!confirm(`Delete banner "${b.title}"?`)) return
    try {
      await axios.delete(`/api/admin/banners/${b._id}`)
      setBanners((prev) => prev.filter((x) => x._id !== b._id))
      toast.success('Banner deleted')
    } catch {
      toast.error('Delete failed')
    }
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Sales Banners</h1>
          <p className="text-gray-400 mt-0.5 text-sm">{banners.length} banner(s) · only active ones show on the homepage</p>
        </div>
        {editing === null && (
          <motion.button onClick={startNew} whileTap={{ scale: 0.97 }} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/30 text-sm whitespace-nowrap">
            <Plus size={16} /> <span className="hidden sm:inline">New Banner</span><span className="sm:hidden">New</span>
          </motion.button>
        )}
      </div>

      {/* Editor */}
      {editing !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 md:p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold">{editing === 'new' ? 'New Banner' : 'Edit Banner'}</h2>
            <button onClick={cancel} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>

          {/* Live preview */}
          <div className={`rounded-2xl p-6 bg-gradient-to-r ${themeClass(draft.theme)} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <div className="text-white text-center sm:text-left">
              <h3 className="text-2xl font-black">{draft.title || 'Banner title'}</h3>
              {draft.subtitle && <p className="text-white/90 mt-1">{draft.subtitle}</p>}
            </div>
            <span className="px-5 py-2.5 bg-white text-gray-900 font-black rounded-xl shadow">{draft.ctaText || 'Shop Now'}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Title *">
              <input className="admin-input" value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Up to 60% OFF!" />
            </Field>
            <Field label="Subtitle">
              <input className="admin-input" value={draft.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="On selected Kolhapuri & Sandals" />
            </Field>
            <Field label="Button text">
              <input className="admin-input" value={draft.ctaText} onChange={(e) => set('ctaText', e.target.value)} placeholder="Grab Deal" />
            </Field>
            <Field label="Button link">
              <input className="admin-input" value={draft.ctaLink} onChange={(e) => set('ctaLink', e.target.value)} placeholder="/products?category=Kolhapuri" />
            </Field>
            <Field label="Display order">
              <input type="number" className="admin-input" value={draft.order} onChange={(e) => set('order', parseInt(e.target.value) || 0)} />
            </Field>
            <Field label="Status">
              <label className="flex items-center gap-2 text-gray-300 text-sm h-[46px]">
                <input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                Active (visible on homepage)
              </label>
            </Field>
          </div>

          <Field label="Theme">
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => set('theme', t.key)}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-r ${t.className} ring-2 transition-all ${draft.theme === t.key ? 'ring-white scale-110' : 'ring-transparent'}`}
                  title={t.label}
                />
              ))}
            </div>
          </Field>

          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-60">
              <Save size={16} /> {saving ? 'Saving…' : 'Save Banner'}
            </button>
            <button onClick={cancel} className="px-5 py-2.5 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-800 rounded-2xl border border-gray-700 animate-pulse" />)}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Megaphone size={40} className="mx-auto mb-3 opacity-50" />
          <p>No banners yet. Create one to promote a sale on the homepage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b._id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${themeClass(b.theme)} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{b.title}</p>
                {b.subtitle && <p className="text-gray-400 text-sm truncate">{b.subtitle}</p>}
                <p className="text-gray-500 text-xs mt-0.5">{b.ctaText} → {b.ctaLink} · order {b.order}</p>
              </div>
              <button
                onClick={() => toggleActive(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${b.active ? 'bg-green-400/10 text-green-400' : 'bg-gray-700 text-gray-400'}`}
              >
                {b.active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => startEdit(b)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20">Edit</button>
              <button onClick={() => remove(b)} className="p-2 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
