import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import StoreSettings from '@/models/StoreSettings'
import { DEFAULT_SHIPPING } from '@/lib/shipping'

// Always read fresh so admin changes apply immediately.
export const dynamic = 'force-dynamic'

// Public: shipping config the checkout page needs to show the right charge.
export async function GET() {
  try {
    await connectDB()
    const settings = await StoreSettings.findOne().lean<{ shippingCharge: number; freeShippingThreshold: number }>()
    return NextResponse.json({
      shippingCharge:        settings?.shippingCharge        ?? DEFAULT_SHIPPING.shippingCharge,
      freeShippingThreshold: settings?.freeShippingThreshold ?? DEFAULT_SHIPPING.freeShippingThreshold,
    })
  } catch {
    return NextResponse.json(DEFAULT_SHIPPING)
  }
}
