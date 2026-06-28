import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { razorpay } from '@/lib/razorpay'
import Cart from '@/models/Cart'
import StoreSettings from '@/models/StoreSettings'
import { requireAuth } from '@/lib/auth'
import { calcShipping, DEFAULT_SHIPPING } from '@/lib/shipping'

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    await connectDB()

    // SECURITY: never trust a client-supplied amount. Compute it from the
    // user's own cart + admin shipping settings so the charge can't be tampered.
    const cart = await Cart.findOne({ user: userId })
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 })
    }

    const subtotal = cart.items.reduce(
      (s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity,
      0
    )
    const settings = await StoreSettings.findOne().lean<{ shippingCharge: number; freeShippingThreshold: number }>()
    const shipping = calcShipping(subtotal, settings ?? DEFAULT_SHIPPING)
    const total    = subtotal + shipping

    const order = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `rcpt_${userId}_${cart.items.length}`,
    })

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
