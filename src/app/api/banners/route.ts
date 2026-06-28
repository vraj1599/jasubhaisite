import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Banner from '@/models/Banner'

// Always read fresh from the DB so admin changes show immediately.
export const dynamic = 'force-dynamic'

// Public: active sales banners for the homepage, in display order.
export async function GET() {
  try {
    await connectDB()
    const banners = await Banner.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    return NextResponse.json({ banners })
  } catch {
    return NextResponse.json({ banners: [] })
  }
}
