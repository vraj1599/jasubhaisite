'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'register'
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: Props) {
  const [mode, setMode]         = useState<'login' | 'register'>(defaultMode)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { login, register }     = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    line1: '', locality: '', city: '', state: '', country: 'India', pincode: '',
  })

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
        toast.success('Welcome back!')
      } else {
        await register({
          name: form.name, email: form.email, phone: form.phone, password: form.password,
          address: { line1: form.line1, locality: form.locality, city: form.city, state: form.state, country: form.country, pincode: form.pincode },
        })
        toast.success('Account created!')
      }
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 relative">
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-xl">JC</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                  <p className="text-gray-400 text-sm">{mode === 'login' ? 'Sign in to continue shopping' : 'Join Jasubhai Chappal'}</p>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex mt-4 bg-gray-800 rounded-xl p-1">
                {(['login', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${
                      mode === m ? 'bg-amber-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {m === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
              {mode === 'register' && (
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input-field pl-10" placeholder="Full Name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </div>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input-field pl-10" type="email" placeholder="Email Address" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              </div>

              {mode === 'register' && (
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input-field pl-10" type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
                </div>
              )}

              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pl-10 pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {mode === 'register' && (
                <>
                  <hr className="border-gray-100" />
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Address</p>
                  <input className="input-field" placeholder="Address Line 1" value={form.line1} onChange={(e) => set('line1', e.target.value)} />
                  <input className="input-field" placeholder="Locality / Area" value={form.locality} onChange={(e) => set('locality', e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-field" placeholder="City" value={form.city} onChange={(e) => set('city', e.target.value)} required />
                    <input className="input-field" placeholder="State" value={form.state} onChange={(e) => set('state', e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-field" placeholder="Country" value={form.country} onChange={(e) => set('country', e.target.value)} required />
                    <input className="input-field" placeholder="Pincode" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} required />
                  </div>
                </>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all duration-200 disabled:opacity-60 mt-2"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </motion.button>

              {mode === 'login' && (
                <p className="text-center text-xs text-gray-500">
                  New here?{' '}
                  <button type="button" onClick={() => setMode('register')} className="text-amber-600 font-semibold hover:underline">
                    Create an account
                  </button>
                </p>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
