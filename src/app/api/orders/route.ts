import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Cart from '@/models/Cart'
import StoreSettings from '@/models/StoreSettings'
import { requireAuth } from '@/lib/auth'
import { calcShipping, DEFAULT_SHIPPING } from '@/lib/shipping'
import { resolveCoupon } from '@/lib/couponServer'

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
    const { shippingAddress, razorpayOrderId, couponCode } = await req.json()

    const cart = await Cart.findOne({ user: userId }).populate('items.product')
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = cart.items.map((item: any) => {
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

    // Validate stock availability before creating the order (prevents overselling).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of cart.items as any[]) {
      const product = item.product as Record<string, unknown>
      const stock = Number(product.stock ?? 0)
      if (stock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product.name}. Only ${stock} left.` },
          { status: 409 }
        )
      }
    }

    const subtotal = items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0)

    // Shipping is computed server-side from admin settings (authoritative).
    const settings = await StoreSettings.findOne().lean<{ shippingCharge: number; freeShippingThreshold: number }>()
    const shipping = calcShipping(subtotal, settings ?? DEFAULT_SHIPPING)
    const { discount, code } = await resolveCoupon(couponCode, subtotal)
    const total    = subtotal - discount + shipping

    const order = await Order.create({
      user: userId,
      items,
      shippingAddress,
      subtotal,
      discount,
      couponCode: code,
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
