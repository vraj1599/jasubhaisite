'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Mail, Phone, Lock, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const { register, user }      = useAuth()
  const router                  = useRouter()

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    line1: '', locality: '', city: '', state: '', country: 'India', pincode: '',
  })

  useEffect(() => { if (user) router.push('/') }, [user, router])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register({
        name: form.name, email: form.email, phone: form.phone, password: form.password,
        address: { line1: form.line1, locality: form.locality, city: form.city, state: form.state, country: form.country, pincode: form.pincode },
      })
      toast.success('Account created! Welcome!')
      router.push('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-sm transition-all'

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-white font-black text-xl">JC</span>
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white mb-1">Create Account</h1>
            <p className="text-gray-400 text-sm">Join Jasubhai Chappal family</p>
          </div>

          {/* Google Sign Up */}
          <a href="/api/auth/google">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-white/20 shadow-sm transition-all text-sm mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
                <path d="M6.3 14.7l7 5.1C15.2 16.4 19.3 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
                <path d="M24 46c5.5 0 10.5-1.8 14.4-5l-6.7-5.5C29.6 37.2 26.9 38 24 38c-6 0-10.7-3.9-11.8-9.1L5.2 34c3.3 7.3 10 12 18.8 12z" fill="#4CAF50"/>
                <path d="M44.5 20H24v8.5h11.8C35.3 31.4 33.5 33.3 31.3 34.5l6.7 5.5C42.3 36.4 45 30.7 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
              </svg>
              Sign up with Google
            </motion.button>
          </a>

          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">or create account manually</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={inputClass} placeholder="Full Name *" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={inputClass} type="email" placeholder="Email Address *" value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={inputClass} type="tel" placeholder="Phone Number *" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className={`${inputClass} pr-12`}
                type={showPass ? 'text' : 'password'}
                placeholder="Password (min 6 chars) *"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required minLength={6}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Address */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <MapPin size={13} /> Delivery Address
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <input className={inputClass} placeholder="Address Line 1" value={form.line1} onChange={(e) => set('line1', e.target.value)} />
                </div>
                <input className={inputClass} placeholder="Locality / Area" value={form.locality} onChange={(e) => set('locality', e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="City *" value={form.city} onChange={(e) => set('city', e.target.value)} required />
                  <input className={inputClass} placeholder="State *" value={form.state} onChange={(e) => set('state', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputClass} placeholder="Country *" value={form.country} onChange={(e) => set('country', e.target.value)} required />
                  <input className={inputClass} placeholder="Pincode *" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} required />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-60 text-sm mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
