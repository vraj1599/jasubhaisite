'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Plus, Trash2, Save, X, Ticket } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Coupon {
  _id: string
  code: string
  type: 'percent' | 'flat'
  value: number
  active: boolean
  minSubtotal: number
  maxDiscount: number
  usageLimit: number
  usedCount: number
  expiresAt: string | null
}

type Draft = {
  code: string; type: 'percent' | 'flat'; value: number; active: boolean
  minSubtotal: number; maxDiscount: number; usageLimit: number; expiresAt: string
}

const blank: Draft = { code: '', type: 'percent', value: 10, active: true, minSubtotal: 0, maxDiscount: 0, usageLimit: 0, expiresAt: '' }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<Draft>(blank)
  const [saving, setSaving] = useState(false)

  const fetchCoupons = () => {
    axios.get('/api/admin/coupons')
      .then(({ data }) => setCoupons(data.coupons))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchCoupons() }, [])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const create = async () => {
    if (!draft.code.trim()) { toast.error('Code is required'); return }
    if (!(draft.value > 0)) { toast.error('Value must be greater than 0'); return }
    setSaving(true)
    try {
      await axios.post('/api/admin/coupons', { ...draft, expiresAt: draft.expiresAt || null })
      toast.success('Coupon created')
      setDraft(blank); setCreating(false); fetchCoupons()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Create failed')
    } finally { setSaving(false) }
  }

  const toggle = async (c: Coupon) => {
    try {
      await axios.patch(`/api/admin/coupons/${c._id}`, { active: !c.active })
      setCoupons((prev) => prev.map((x) => (x._id === c._id ? { ...x, active: !x.active } : x)))
    } catch { toast.error('Update failed') }
  }

  const remove = async (c: Coupon) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return
    try {
      await axios.delete(`/api/admin/coupons/${c._id}`)
      setCoupons((prev) => prev.filter((x) => x._id !== c._id))
      toast.success('Coupon deleted')
    } catch { toast.error('Delete failed') }
  }

  const fmtValue = (c: Coupon) => c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Coupons</h1>
          <p className="text-gray-400 mt-0.5 text-sm">{coupons.length} coupon(s) · validated server-side at checkout</p>
        </div>
        {!creating && (
          <motion.button onClick={() => setCreating(true)} whileTap={{ scale: 0.97 }} className="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/30 text-sm whitespace-nowrap">
            <Plus size={16} /> <span className="hidden sm:inline">New Coupon</span><span className="sm:hidden">New</span>
          </motion.button>
        )}
      </div>

      {creating && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 md:p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold">New Coupon</h2>
            <button onClick={() => { setCreating(false); setDraft(blank) }} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Code"><input className="admin-input uppercase" value={draft.code} onChange={(e) => set('code', e.target.value.toUpperCase())} placeholder="WELCOME10" /></Field>
            <Field label="Type">
              <select className="admin-input" value={draft.type} onChange={(e) => set('type', e.target.value as Draft['type'])}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat amount (₹)</option>
              </select>
            </Field>
            <Field label={draft.type === 'percent' ? 'Discount %' : 'Discount ₹'}><input type="number" min={0} className="admin-input" value={draft.value} onChange={(e) => set('value', parseFloat(e.target.value) || 0)} /></Field>
            <Field label="Max discount ₹ (0 = no cap)"><input type="number" min={0} className="admin-input" value={draft.maxDiscount} onChange={(e) => set('maxDiscount', parseFloat(e.target.value) || 0)} /></Field>
            <Field label="Min cart subtotal ₹"><input type="number" min={0} className="admin-input" value={draft.minSubtotal} onChange={(e) => set('minSubtotal', parseFloat(e.target.value) || 0)} /></Field>
            <Field label="Usage limit (0 = unlimited)"><input type="number" min={0} className="admin-input" value={draft.usageLimit} onChange={(e) => set('usageLimit', parseInt(e.target.value) || 0)} /></Field>
            <Field label="Expires on (optional)"><input type="date" className="admin-input" value={draft.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} /></Field>
            <Field label="Status">
              <label className="flex items-center gap-2 text-gray-300 text-sm h-[42px]">
                <input type="checkbox" checked={draft.active} onChange={(e) => set('active', e.target.checked)} className="w-4 h-4 accent-amber-500" /> Active
              </label>
            </Field>
          </div>
          <button onClick={create} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving…' : 'Create Coupon'}
          </button>
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-800 rounded-2xl border border-gray-700 animate-pulse" />)}</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 text-gray-500"><Ticket size={40} className="mx-auto mb-3 opacity-50" /><p>No coupons yet. Create one to offer a discount at checkout.</p></div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <div key={c._id} className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0"><Ticket size={20} className="text-amber-400" /></div>
              <div className="flex-1 min-w-[140px]">
                <p className="text-white font-bold font-mono tracking-wider">{c.code}</p>
                <p className="text-gray-400 text-sm">{fmtValue(c)}{c.minSubtotal > 0 ? ` · min ₹${c.minSubtotal}` : ''}{c.maxDiscount > 0 ? ` · cap ₹${c.maxDiscount}` : ''}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  used {c.usedCount}{c.usageLimit > 0 ? `/${c.usageLimit}` : ''}
                  {c.expiresAt ? ` · expires ${new Date(c.expiresAt).toLocaleDateString('en-IN')}` : ''}
                </p>
              </div>
              <button onClick={() => toggle(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${c.active ? 'bg-green-400/10 text-green-400' : 'bg-gray-700 text-gray-400'}`}>{c.active ? 'Active' : 'Inactive'}</button>
              <button onClick={() => remove(c)} className="p-2 rounded-lg text-red-400 bg-red-400/10 hover:bg-red-400/20"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-semibold text-gray-400 mb-1.5">{label}</label>{children}</div>
}
