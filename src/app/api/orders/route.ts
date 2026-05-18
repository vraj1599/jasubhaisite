import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Cart from '@/models/Cart'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    await connectDB()
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 })
    return NextResponse.json({ orders })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    await connectDB()
    const { shippingAddress, razorpayOrderId } = await req.json()

    const cart = await Cart.findOne({ user: userId }).populate('items.product')
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 })
    }

    const items = cart.items.map((item) => {
      const product = item.product as Record<string, unknown>
      return {
        product: product._id,
        name:    product.name,
        image:   (product.images as { url: string }[])[0]?.url ?? '',
        size:    item.size,
        quantity:item.quantity,
        price:   item.price,
      }
    })

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const shipping = subtotal > 499 ? 0 : 49
    const total    = subtotal + shipping

    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      subtotal,
      shipping,
      total,
      razorpayOrderId,
      status: 'pending',
      paymentStatus: 'pending',
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
