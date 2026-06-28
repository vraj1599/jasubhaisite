import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Banner from '@/models/Banner'
import { requireAdmin } from '@/lib/auth'

function errStatus(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Server error'
  const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
  return { msg, status }
}

// Admin: list all banners (active + inactive).
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 }).lean()
    return NextResponse.json({ banners })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}

// Admin: create a banner.
export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()
    const banner = await Banner.create({
      title:    body.title,
      subtitle: body.subtitle,
      ctaText:  body.ctaText,
      ctaLink:  body.ctaLink,
      theme:    body.theme,
      active:   body.active,
      order:    body.order,
    })
    return NextResponse.json({ banner }, { status: 201 })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}
