import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import Order from '@/models/Order'
import HomeConfig from '@/models/HomeConfig'

// Always read fresh from the DB so admin changes show immediately.
export const dynamic = 'force-dynamic'

// Public: resolves the admin-configured homepage product carousel into a
// concrete, ordered list of active products. Always falls back to newest
// active products so the slider is never empty (e.g. a brand-new store with
// no orders yet).
export async function GET() {
  try {
    await connectDB()

    const config = await HomeConfig.findOne().lean<{
      sliderActive: boolean
      sliderTitle: string
      sliderSubtitle: string
      sliderSource: string
      sliderLimit: number
      manualProducts: unknown[]
    }>()

    // Sensible defaults when the admin has never saved a config.
    const sliderActive   = config?.sliderActive ?? true
    const sliderTitle    = config?.sliderTitle ?? 'Best Sellers'
    const sliderSubtitle = config?.sliderSubtitle ?? 'Most loved by our customers'
    const sliderSource   = config?.sliderSource ?? 'bestselling'
    const limit          = config?.sliderLimit ?? 10

    if (!sliderActive) {
      return NextResponse.json({ active: false, title: sliderTitle, subtitle: sliderSubtitle, products: [] })
    }

    let products: unknown[] = []

    if (sliderSource === 'manual') {
      const ids = (config?.manualProducts ?? []) as { toString(): string }[]
      const docs = await Product.find({ _id: { $in: ids }, isActive: true }).lean()
      // Preserve the admin's chosen order.
      const byId = new Map(docs.map((d) => [String((d as { _id: unknown })._id), d]))
      products = ids.map((id) => byId.get(id.toString())).filter(Boolean)
    } else if (sliderSource === 'featured') {
      products = await Product.find({ featured: true, isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    } else {
      // bestselling: rank by total quantity sold across paid orders.
      const ranked = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product', sold: { $sum: '$items.quantity' } } },
        { $sort: { sold: -1 } },
        { $limit: limit },
      ])
      const ids = ranked.map((r) => r._id).filter(Boolean)
      if (ids.length) {
        const docs = await Product.find({ _id: { $in: ids }, isActive: true }).lean()
        const byId = new Map(docs.map((d) => [String((d as { _id: unknown })._id), d]))
        products = ids.map((id) => byId.get(id.toString())).filter(Boolean)
      }
    }

    // Fallback / top-up with newest active products so the carousel is never empty.
    if (products.length < limit) {
      const have = new Set(products.map((p) => (p as { _id: { toString(): string } })._id.toString()))
      const fillers = await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit * 2)
        .lean()
      for (const f of fillers) {
        const fid = (f as { _id: { toString(): string } })._id.toString()
        if (!have.has(fid)) {
          products.push(f)
          have.add(fid)
        }
        if (products.length >= limit) break
      }
    }

    return NextResponse.json({ active: true, title: sliderTitle, subtitle: sliderSubtitle, products })
  } catch {
    return NextResponse.json({ active: false, title: '', subtitle: '', products: [] })
  }
}
