// Pure, testable coupon evaluation. Used by the public validate endpoint and
// — authoritatively — by the order/payment flow so a discount can never be
// fabricated on the client.

export interface CouponLike {
  code: string
  type: 'percent' | 'flat'
  value: number
  active: boolean
  minSubtotal: number
  maxDiscount: number          // cap for percent coupons; 0 = no cap
  expiresAt?: string | Date | null
  usageLimit: number           // 0 = unlimited
  usedCount: number
}

export interface CouponResult {
  valid: boolean
  discount: number
  message: string
}

/**
 * Evaluate a coupon against a cart subtotal at a given time.
 * `now` is passed in (epoch ms) so the function stays pure/deterministic.
 */
export function evaluateCoupon(coupon: CouponLike | null | undefined, subtotal: number, now: number): CouponResult {
  if (!coupon || !coupon.active) {
    return { valid: false, discount: 0, message: 'Invalid coupon code' }
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) {
    return { valid: false, discount: 0, message: 'This coupon has expired' }
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: 'This coupon is no longer available' }
  }
  if (subtotal < coupon.minSubtotal) {
    return { valid: false, discount: 0, message: `Spend ₹${coupon.minSubtotal} or more to use this coupon` }
  }

  let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
  if (coupon.type === 'percent' && coupon.maxDiscount > 0) {
    discount = Math.min(discount, coupon.maxDiscount)
  }
  discount = Math.round(Math.min(discount, subtotal)) // never exceed the subtotal

  if (discount <= 0) {
    return { valid: false, discount: 0, message: 'Invalid coupon code' }
  }
  return { valid: true, discount, message: `Coupon applied — you save ₹${discount}` }
}
