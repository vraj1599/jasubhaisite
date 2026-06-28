'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Mail, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setSent(true) // generic response regardless
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-white font-black text-xl">JC</span>
              </div>
            </Link>
            <h1 className="text-3xl font-black text-white mb-1">Forgot Password?</h1>
            <p className="text-gray-400 text-sm">Enter your email and we&apos;ll send a reset link</p>
          </div>

          {sent ? (
            <div className="text-center">
              <p className="text-gray-200 bg-white/5 border border-white/10 rounded-xl p-4 text-sm">
                If that email is registered, a reset link is on its way. Check your inbox (and spam folder).
              </p>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-amber-400 font-semibold hover:underline text-sm mt-6">
                <ArrowLeft size={15} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-60 text-sm">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
              <Link href="/login" className="flex items-center justify-center gap-1.5 text-gray-400 hover:text-amber-400 text-sm mt-2">
                <ArrowLeft size={15} /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  )
}
