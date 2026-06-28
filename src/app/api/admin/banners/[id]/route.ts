import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Banner from '@/models/Banner'
import { requireAdmin } from '@/lib/auth'

function errStatus(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Server error'
  const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
  return { msg, status }
}

// Admin: update a banner (edit fields or toggle active).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()
    const allowed = ['title', 'subtitle', 'ctaText', 'ctaLink', 'theme', 'active', 'order']
    const update: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) update[key] = body[key]
    }
    const banner = await Banner.findByIdAndUpdate(params.id, update, { new: true })
    if (!banner) return NextResponse.json({ message: 'Banner not found' }, { status: 404 })
    return NextResponse.json({ banner })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}

// Admin: delete a banner.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const banner = await Banner.findByIdAndDelete(params.id)
    if (!banner) return NextResponse.json({ message: 'Banner not found' }, { status: 404 })
    return NextResponse.json({ message: 'Deleted' })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}
