import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Cart from '@/models/Cart'
import Product from '@/models/Product'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    await connectDB()
    const cart = await Cart.findOne({ user: userId }).populate('items.product')
    return NextResponse.json({ cart: cart ?? { items: [] } })
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
    const { productId, size, quantity = 1 } = await req.json()

    const product = await Product.findById(productId)
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 })

    const salePrice = product.price - (product.price * product.discount) / 100

    let cart = await Cart.findOne({ user: userId })
    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
    }

    const existingIdx = cart.items.findIndex(
      (i) => i.product.toString() === productId && i.size === size
    )

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity
    } else {
      cart.items.push({ product: productId, size, quantity, price: salePrice })
    }

    await cart.save()
    await cart.populate('items.product')
    return NextResponse.json({ cart })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    await connectDB()
    const { itemId, quantity } = await req.json()

    const cart = await Cart.findOne({ user: userId })
    if (!cart) return NextResponse.json({ message: 'Cart not found' }, { status: 404 })

    const item = cart.items.id(itemId)
    if (!item) return NextResponse.json({ message: 'Item not found' }, { status: 404 })

    if (quantity <= 0) {
      item.deleteOne()
    } else {
      item.quantity = quantity
    }

    await cart.save()
    await cart.populate('items.product')
    return NextResponse.json({ cart })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = requireAuth(req)
    await connectDB()
    const { itemId } = await req.json()

    const cart = await Cart.findOne({ user: userId })
    if (!cart) return NextResponse.json({ message: 'Cart not found' }, { status: 404 })

    if (itemId) {
      cart.items = cart.items.filter((i) => i._id?.toString() !== itemId)
    } else {
      cart.items = []
    }

    await cart.save()
    return NextResponse.json({ cart })
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
