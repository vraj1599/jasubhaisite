'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Save, Eye, EyeOff, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  _id: string
  name: string
  emoji: string
  description: string
  active: boolean
  order: number
}

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    axios.get('/api/admin/categories')
      .then(({ data }) => setCats(data.categories))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  const patch = async (id: string, body: Partial<Category>) => {
    const { data } = await axios.patch(`/api/admin/categories/${id}`, body)
    setCats((prev) => prev.map((c) => (c._id === id ? data.category : c)))
  }

  const toggle = async (c: Category) => {
    try { await patch(c._id, { active: !c.active }) }
    catch { toast.error('Update failed') }
  }

  const setLocal = (id: string, key: keyof Category, val: string | number) =>
    setCats((prev) => prev.map((c) => (c._id === id ? { ...c, [key]: val } : c)))

  const saveRow = async (c: Category) => {
    setSavingId(c._id)
    try {
      await patch(c._id, { emoji: c.emoji, description: c.description, order: c.order })
      toast.success(`${c.name} saved`)
    } catch {
      toast.error('Save failed')
    } finally {
      setSavingId(null)
    }
  }

  const activeCount = cats.filter((c) => c.active).length

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white">Categories</h1>
        <p className="text-gray-400 mt-0.5 text-sm">
          {activeCount} of {cats.length} shown on the storefront · toggle to show or hide a category
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-800 rounded-2xl border border-gray-700 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {cats.map((c) => (
            <div
              key={c._id}
              className={`bg-gray-800 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-opacity ${
                c.active ? 'border-gray-700' : 'border-gray-800 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
                <GripVertical size={16} className="text-gray-600 hidden sm:block" />
                <input
                  value={c.emoji}
                  onChange={(e) => setLocal(c._id, 'emoji', e.target.value)}
                  className="w-12 h-12 text-2xl text-center bg-gray-900 border border-gray-700 rounded-xl"
                  aria-label={`${c.name} icon`}
                />
                <div>
                  <p className="text-white font-bold">{c.name}</p>
                  <p className="text-gray-500 text-xs">order {c.order}</p>
                </div>
              </div>

              <input
                value={c.description}
                onChange={(e) => setLocal(c._id, 'description', e.target.value)}
                placeholder="Short description"
                className="admin-input flex-1"
              />

              <input
                type="number"
                value={c.order}
                onChange={(e) => setLocal(c._id, 'order', parseInt(e.target.value) || 0)}
                className="admin-input w-20"
                aria-label={`${c.name} order`}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => saveRow(c)}
                  disabled={savingId === c._id}
                  className="flex items-center gap-1.5 px-3 py-2 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  <Save size={14} /> Save
                </button>
                <button
                  onClick={() => toggle(c)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${
                    c.active ? 'bg-green-400/10 text-green-400' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {c.active ? <><Eye size={14} /> Shown</> : <><EyeOff size={14} /> Hidden</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-500 text-xs mt-5">
        Category names are fixed because they must match existing products. Hiding a category only removes it
        from the storefront menus — its products remain accessible by direct link.
      </p>
    </div>
  )
}
