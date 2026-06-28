import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Category, { CATEGORY_DEFAULTS } from '@/models/Category'

// Always fresh so admin show/hide changes apply immediately.
export const dynamic = 'force-dynamic'

// Public: the categories the storefront (homepage, navbar, footer) should show.
export async function GET() {
  try {
    await connectDB()
    const cats = await Category.find({ active: true }).sort({ order: 1, name: 1 }).lean()

    // Before an admin has ever opened the Categories page the collection is
    // empty — fall back to the active defaults so the storefront still works.
    if (!cats.length) {
      const fallback = CATEGORY_DEFAULTS.filter((c) => c.active)
        .map(({ name, emoji, description, order }) => ({ name, emoji, description, order }))
      return NextResponse.json({ categories: fallback })
    }

    const categories = cats.map((c) => ({
      name: c.name, emoji: c.emoji, description: c.description, order: c.order,
    }))
    return NextResponse.json({ categories })
  } catch {
    const fallback = CATEGORY_DEFAULTS.filter((c) => c.active)
      .map(({ name, emoji, description, order }) => ({ name, emoji, description, order }))
    return NextResponse.json({ categories: fallback })
  }
}
