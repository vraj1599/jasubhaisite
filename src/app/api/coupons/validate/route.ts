import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { resolveCoupon } from '@/lib/couponServer'

export const dynamic = 'force-dynamic'

// Public: check a coupon for a given subtotal (used by cart/checkout to preview
// the discount). The real, authoritative discount is recomputed at payment time.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const subtotal = Number(body.subtotal) || 0
    await connectDB()
    const { valid, discount, message, code } = await resolveCoupon(body.code, subtotal)
    return NextResponse.json({ valid, discount, message, code })
  } catch {
    return NextResponse.json({ valid: false, discount: 0, message: 'Could not validate coupon', code: '' }, { status: 500 })
  }
}
