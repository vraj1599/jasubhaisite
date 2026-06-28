import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import StoreSettings from '@/models/StoreSettings'
import { requireAdmin } from '@/lib/auth'

function errStatus(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Server error'
  const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
  return { msg, status }
}

// Admin: read store settings (creates a default singleton on first access).
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    let settings = await StoreSettings.findOne()
    if (!settings) settings = await StoreSettings.create({})
    return NextResponse.json({ settings })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}

// Admin: update shipping settings.
export async function PUT(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()

    const update: Record<string, number> = {}
    if ('shippingCharge' in body) {
      const n = Number(body.shippingCharge)
      if (!Number.isNaN(n)) update.shippingCharge = Math.max(0, n)
    }
    if ('freeShippingThreshold' in body) {
      const n = Number(body.freeShippingThreshold)
      if (!Number.isNaN(n)) update.freeShippingThreshold = Math.max(0, n)
    }

    const settings = await StoreSettings.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    })
    return NextResponse.json({ settings })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}
