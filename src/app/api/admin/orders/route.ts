import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const { searchParams } = new URL(req.url)
    const page   = parseInt(searchParams.get('page') ?? '1')
    const limit  = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status')

    const query = status ? { status } : {}
    const total  = await Order.countDocuments(query)
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
