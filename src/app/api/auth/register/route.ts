import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const { name, email, phone, password, address } = body

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ message: 'All required fields must be filled' }, { status: 400 })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 })
    }

    const user = await User.create({ name, email, phone, password, address })

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role })

    const res = NextResponse.json(
      {
        message: 'Account created successfully',
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      },
      { status: 201 }
    )
    res.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: '/' })
    return res
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
