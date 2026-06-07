import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/auth'
import { rateLimit } from '@/lib/rateLimit'

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 registrations per IP per hour
    const ip = getIP(req)
    const limit = rateLimit(`register:${ip}`, 3, 60 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { message: `Too many registration attempts. Try again in ${limit.retryAfterSeconds} seconds.` },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const body = await req.json()
    const name     = typeof body.name     === 'string' ? body.name.trim()           : ''
    const email    = typeof body.email    === 'string' ? body.email.trim().toLowerCase() : ''
    const phone    = typeof body.phone    === 'string' ? body.phone.trim()          : ''
    const password = typeof body.password === 'string' ? body.password              : ''
    const address  = body.address ?? {}

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ message: 'All required fields must be filled' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })
    }

    if (name.length > 100 || email.length > 200 || phone.length > 20) {
      return NextResponse.json({ message: 'Invalid input length' }, { status: 400 })
    }

    await connectDB()
    const existing = await User.findOne({ email })
    if (existing) {
      // Generic message — don't reveal whether email exists
      return NextResponse.json({ message: 'Account could not be created. Please try a different email.' }, { status: 409 })
    }

    const user = await User.create({ name, email, phone, password, address })
    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role })

    const res = NextResponse.json(
      { message: 'Account created successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role }, token },
      { status: 201 }
    )

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return res
  } catch (err: unknown) {
    console.error('Register error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
