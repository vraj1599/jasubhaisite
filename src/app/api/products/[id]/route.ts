import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const product = await Product.findOne({
      $or: [{ _id: params.id.match(/^[0-9a-fA-F]{24}$/) ? params.id : null }, { slug: params.id }],
      isActive: true,
    })
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const body    = await req.json()
    const product = await Product.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    await Product.findByIdAndUpdate(params.id, { isActive: false })
    return NextResponse.json({ message: 'Product deleted' })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
