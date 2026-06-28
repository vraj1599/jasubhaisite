'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

function ResetContent() {
  const params  = useSearchParams()
  const router  = useRouter()
  const token   = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/reset-password', { token, password })
      toast.success(data.message ?? 'Password updated')
      router.push('/login')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 mx-auto mb-4">
              <span className="text-white font-black text-xl">JC</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Set New Password</h1>
            <p className="text-gray-400 text-sm">Choose a strong password for your account</p>
          </div>

          {!token ? (
            <div className="text-center">
              <p className="text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">
                This reset link is invalid or incomplete. Please request a new one.
              </p>
              <Link href="/forgot-password" className="inline-block text-amber-400 font-semibold hover:underline text-sm mt-6">Request a new link</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'} required minLength={8}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="w-full pl-11 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-60 text-sm">
                {loading ? 'Updating...' : 'Update Password'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetContent /></Suspense>
}
