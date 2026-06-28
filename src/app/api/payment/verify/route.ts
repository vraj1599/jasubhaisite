import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Cart from '@/models/Cart'
import Product from '@/models/Product'
import Coupon from '@/models/Coupon'
import { razorpay, verifyRazorpaySignature } from '@/lib/razorpay'
import { requireAuth } from '@/lib/auth'
import { sendEmail, orderConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = requireAuth(req)
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = await req.json()

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) {
      return NextResponse.json({ message: 'Payment verification failed' }, { status: 400 })
    }

    await connectDB()

    // Load the order first so we can reconcile the paid amount against it.
    const order = await Order.findOne({ _id: orderId, user: userId })
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 })

    // Idempotency: if already paid, just return it (avoids double stock decrement).
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({ message: 'Payment verified', order })
    }

    // SECURITY: confirm the amount actually charged by Razorpay equals the
    // server-computed order total — defends against any amount tampering.
    const rzpOrder = await razorpay.orders.fetch(razorpayOrderId)
    if (Number(rzpOrder.amount) !== Math.round(order.total * 100)) {
      order.paymentStatus = 'failed'
      await order.save()
      return NextResponse.json({ message: 'Payment amount mismatch' }, { status: 400 })
    }

    order.razorpayPaymentId = razorpayPaymentId
    order.razorpaySignature = razorpaySignature
    order.paymentStatus     = 'paid'
    order.status            = 'confirmed'
    await order.save()

    // Decrement stock atomically (guard prevents going negative on races).
    await Promise.all(
      order.items.map((item: { product: unknown; quantity: number }) =>
        Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        )
      )
    )

    // Count the coupon use now that the order is actually paid.
    if (order.couponCode) {
      await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } })
    }

    await Cart.findOneAndUpdate({ user: userId }, { items: [] })

    // Send the order confirmation email (best-effort — never blocks the response).
    if (email) {
      const { subject, html } = orderConfirmationEmail({
        _id: String(order._id),
        items: order.items.map((i: { name: string; size: string; quantity: number; price: number }) => ({
          name: i.name, size: i.size, quantity: i.quantity, price: i.price,
        })),
        subtotal: order.subtotal,
        discount: order.discount ?? 0,
        shipping: order.shipping,
        total: order.total,
      })
      await sendEmail({ to: email, subject, html })
    }

    return NextResponse.json({ message: 'Payment verified', order })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
