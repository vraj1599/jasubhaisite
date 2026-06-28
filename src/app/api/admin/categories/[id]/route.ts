import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Category from '@/models/Category'
import { requireAdmin } from '@/lib/auth'

function errStatus(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Server error'
  const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
  return { msg, status }
}

// Admin: update a category (toggle display, edit emoji/description/order).
// Name is intentionally not editable — it must stay aligned with product data.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()

    const update: Record<string, unknown> = {}
    if ('active' in body)      update.active = !!body.active
    if ('emoji' in body)       update.emoji = String(body.emoji ?? '')
    if ('description' in body) update.description = String(body.description ?? '')
    if ('order' in body)       update.order = Number(body.order) || 0

    const category = await Category.findByIdAndUpdate(params.id, update, { new: true })
    if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 })
    return NextResponse.json({ category })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}
