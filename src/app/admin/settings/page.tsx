'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Save, Truck } from 'lucide-react'
import { calcShipping } from '@/lib/shipping'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [charge, setCharge]       = useState(49)
  const [threshold, setThreshold] = useState(499)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    axios.get('/api/admin/store-settings')
      .then(({ data }) => {
        setCharge(data.settings.shippingCharge)
        setThreshold(data.settings.freeShippingThreshold)
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await axios.put('/api/admin/store-settings', { shippingCharge: charge, freeShippingThreshold: threshold })
      toast.success('Shipping settings saved')
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-400 animate-pulse">Loading settings…</div>

  const settings = { shippingCharge: charge, freeShippingThreshold: threshold }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white">Store Settings</h1>
        <p className="text-gray-400 mt-0.5 text-sm">Shipping charges applied to every order</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-3 pb-2">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Truck size={20} className="text-amber-400" />
          </div>
          <div>
            <p className="text-white font-bold">Shipping</p>
            <p className="text-gray-400 text-xs">Set the delivery fee and free-shipping rule</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Shipping charge (₹)</label>
            <input type="number" min={0} className="admin-input" value={charge}
              onChange={(e) => setCharge(Math.max(0, parseInt(e.target.value) || 0))} />
            <p className="text-gray-500 text-xs mt-1">Flat fee added to each order below the threshold.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Free shipping above (₹)</label>
            <input type="number" min={0} className="admin-input" value={threshold}
              onChange={(e) => setThreshold(Math.max(0, parseInt(e.target.value) || 0))} />
            <p className="text-gray-500 text-xs mt-1">Orders at/above this ship free. Set <b>0</b> to disable free shipping.</p>
          </div>
        </div>

        {/* Live preview */}
        <div className="border-t border-gray-700 pt-4">
          <p className="text-xs font-semibold text-gray-400 mb-2">Preview</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[200, threshold > 0 ? threshold : 800, 1500].map((amt, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-3">
                <p className="text-gray-400 text-xs">Cart ₹{amt}</p>
                <p className={`font-bold ${calcShipping(amt, settings) === 0 ? 'text-green-400' : 'text-white'}`}>
                  {calcShipping(amt, settings) === 0 ? 'FREE' : `₹${calcShipping(amt, settings)} ship`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-60">
          <Save size={16} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
