import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search   = searchParams.get('search')
    const featured = searchParams.get('featured')
    const sort     = searchParams.get('sort')
    const minPrice = parseFloat(searchParams.get('minPrice') ?? '')
    const maxPrice = parseFloat(searchParams.get('maxPrice') ?? '')
    const page     = parseInt(searchParams.get('page') ?? '1')
    const limit    = parseInt(searchParams.get('limit') ?? '12')

    const query: Record<string, unknown> = { isActive: true }
    if (category) query.category = category
    if (featured === 'true') query.featured = true
    if (search) query.name = { $regex: search, $options: 'i' }

    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      const priceQ: Record<string, number> = {}
      if (!Number.isNaN(minPrice)) priceQ.$gte = minPrice
      if (!Number.isNaN(maxPrice)) priceQ.$lte = maxPrice
      query.price = priceQ
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      newest:     { createdAt: -1 },
    }
    const sortObj = sortMap[sort ?? 'newest'] ?? { createdAt: -1 }

    const total    = await Product.countDocuments(query)
    const products = await Product.find(query)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({ products, total, page, pages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()
    const product = await Product.create(body)
    return NextResponse.json({ product }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
