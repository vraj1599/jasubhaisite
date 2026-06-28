import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Coupon from '@/models/Coupon'
import { requireAdmin } from '@/lib/auth'

function errStatus(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Server error'
  const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
  return { msg, status }
}

// Admin: list all coupons.
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ coupons })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}

// Admin: create a coupon.
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const b = await req.json()

    const code = String(b.code ?? '').toUpperCase().trim()
    if (!code) return NextResponse.json({ message: 'Code is required' }, { status: 400 })
    if (!['percent', 'flat'].includes(b.type)) return NextResponse.json({ message: 'Invalid type' }, { status: 400 })
    if (!(Number(b.value) > 0)) return NextResponse.json({ message: 'Value must be greater than 0' }, { status: 400 })

    const existing = await Coupon.findOne({ code })
    if (existing) return NextResponse.json({ message: 'A coupon with this code already exists' }, { status: 409 })

    const coupon = await Coupon.create({
      code,
      type:        b.type,
      value:       Number(b.value),
      active:      b.active !== false,
      minSubtotal: Math.max(0, Number(b.minSubtotal) || 0),
      maxDiscount: Math.max(0, Number(b.maxDiscount) || 0),
      usageLimit:  Math.max(0, Number(b.usageLimit) || 0),
      expiresAt:   b.expiresAt ? new Date(b.expiresAt) : null,
    })
    return NextResponse.json({ coupon }, { status: 201 })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}
