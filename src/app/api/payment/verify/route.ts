import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Order from '@/models/Order'
import Cart from '@/models/Cart'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { requireAuth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = await req.json()

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
    if (!isValid) {
      return NextResponse.json({ message: 'Payment verification failed' }, { status: 400 })
    }

    await connectDB()
    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      {
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: 'paid',
        status: 'confirmed',
      },
      { new: true }
    )

    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 })

    await Cart.findOneAndUpdate({ user: userId }, { items: [] })

    return NextResponse.json({ message: 'Payment verified', order })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
