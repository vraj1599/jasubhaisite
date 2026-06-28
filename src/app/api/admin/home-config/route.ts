import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import HomeConfig, { SLIDER_SOURCES } from '@/models/HomeConfig'
import { requireAdmin } from '@/lib/auth'

function errStatus(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Server error'
  const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
  return { msg, status }
}

// Admin: read the homepage config (creates a default singleton on first access).
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    let config = await HomeConfig.findOne()
    if (!config) config = await HomeConfig.create({})
    return NextResponse.json({ config })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}

// Admin: update the homepage product-slider config.
export async function PUT(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()

    const update: Record<string, unknown> = {}
    if ('sliderActive' in body)   update.sliderActive = !!body.sliderActive
    if ('sliderTitle' in body)    update.sliderTitle = String(body.sliderTitle ?? '')
    if ('sliderSubtitle' in body) update.sliderSubtitle = String(body.sliderSubtitle ?? '')
    if ('sliderSource' in body && SLIDER_SOURCES.includes(body.sliderSource)) {
      update.sliderSource = body.sliderSource
    }
    if ('sliderLimit' in body) {
      const n = parseInt(String(body.sliderLimit), 10)
      if (!Number.isNaN(n)) update.sliderLimit = Math.min(30, Math.max(1, n))
    }
    if ('manualProducts' in body && Array.isArray(body.manualProducts)) {
      update.manualProducts = body.manualProducts
    }

    const config = await HomeConfig.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    })
    return NextResponse.json({ config })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}
