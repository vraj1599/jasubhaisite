import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req)
    if (!payload) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const user = await User.findById(payload.userId).select('-password')
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ message: 'Logged out' })
  res.cookies.delete('token')
  return res
}
