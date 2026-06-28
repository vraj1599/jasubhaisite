import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Coupon from '@/models/Coupon'
import { requireAdmin } from '@/lib/auth'

function errStatus(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Server error'
  const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
  return { msg, status }
}

// Admin: update a coupon (edit fields or toggle active).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const b = await req.json()

    const update: Record<string, unknown> = {}
    if ('active' in b)      update.active = !!b.active
    if ('type' in b && ['percent', 'flat'].includes(b.type)) update.type = b.type
    if ('value' in b)       update.value = Math.max(0, Number(b.value) || 0)
    if ('minSubtotal' in b) update.minSubtotal = Math.max(0, Number(b.minSubtotal) || 0)
    if ('maxDiscount' in b) update.maxDiscount = Math.max(0, Number(b.maxDiscount) || 0)
    if ('usageLimit' in b)  update.usageLimit = Math.max(0, Number(b.usageLimit) || 0)
    if ('expiresAt' in b)   update.expiresAt = b.expiresAt ? new Date(b.expiresAt) : null

    const coupon = await Coupon.findByIdAndUpdate(params.id, update, { new: true })
    if (!coupon) return NextResponse.json({ message: 'Coupon not found' }, { status: 404 })
    return NextResponse.json({ coupon })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}

// Admin: delete a coupon.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const coupon = await Coupon.findByIdAndDelete(params.id)
    if (!coupon) return NextResponse.json({ message: 'Coupon not found' }, { status: 404 })
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}
