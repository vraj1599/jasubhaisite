import Coupon from '@/models/Coupon'
import { evaluateCoupon, type CouponLike, type CouponResult } from '@/lib/coupon'

// Looks up a coupon by code and evaluates it against a subtotal. Used by the
// validate endpoint AND the order/payment flow so the discount is always
// server-authoritative. Assumes the DB connection is already open.
export async function resolveCoupon(
  code: string | undefined | null,
  subtotal: number
): Promise<CouponResult & { code: string }> {
  const trimmed = typeof code === 'string' ? code.toUpperCase().trim() : ''
  if (!trimmed) return { valid: false, discount: 0, message: '', code: '' }

  const doc = await Coupon.findOne({ code: trimmed }).lean()
  const result = evaluateCoupon(doc as unknown as CouponLike | null, subtotal, Date.now())
  return { ...result, code: result.valid ? trimmed : '' }
}
