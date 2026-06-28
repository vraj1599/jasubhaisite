import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token    = typeof body.token === 'string' ? body.token : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!token) return NextResponse.json({ message: 'Invalid or missing reset link' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })

    await connectDB()
    const hashed = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ resetToken: hashed, resetTokenExpiry: { $gt: new Date() } })
    if (!user) {
      return NextResponse.json({ message: 'This reset link is invalid or has expired. Please request a new one.' }, { status: 400 })
    }

    user.password = password            // re-hashed by the pre-save hook
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    return NextResponse.json({ message: 'Password updated. You can now sign in.' })
  } catch (err) {
    console.error('reset-password error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
