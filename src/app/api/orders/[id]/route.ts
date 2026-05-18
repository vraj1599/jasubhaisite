import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = requireAuth(req)
    await connectDB()
    const order = await Order.findOne({ _id: params.id, user: userId })
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
