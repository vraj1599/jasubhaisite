import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Category, { CATEGORY_DEFAULTS } from '@/models/Category'
import { requireAdmin } from '@/lib/auth'

function errStatus(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Server error'
  const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
  return { msg, status }
}

// Admin: list all categories. Seeds the canonical set on first access and
// backfills any new categories that were added to the defaults later.
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()

    const existing = await Category.find()
    const have = new Set(existing.map((c) => c.name))
    const missing = CATEGORY_DEFAULTS.filter((d) => !have.has(d.name))
    if (missing.length) await Category.insertMany(missing)

    const categories = await Category.find().sort({ order: 1, name: 1 })
    return NextResponse.json({ categories })
  } catch (err) {
    const { msg, status } = errStatus(err)
    return NextResponse.json({ message: msg }, { status })
  }
}
