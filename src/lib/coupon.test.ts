import { describe, it, expect } from 'vitest'
import { evaluateCoupon, type CouponLike } from './coupon'

const NOW = 1_700_000_000_000 // fixed reference time

const base: CouponLike = {
  code: 'SAVE', type: 'percent', value: 10, active: true,
  minSubtotal: 0, maxDiscount: 0, usageLimit: 0, usedCount: 0, expiresAt: null,
}

describe('evaluateCoupon', () => {
  it('applies a percentage discount', () => {
    const r = evaluateCoupon(base, 1000, NOW)
    expect(r.valid).toBe(true)
    expect(r.discount).toBe(100)
  })

  it('applies a flat discount', () => {
    const r = evaluateCoupon({ ...base, type: 'flat', value: 50 }, 1000, NOW)
    expect(r.discount).toBe(50)
  })

  it('caps a percentage discount at maxDiscount', () => {
    const r = evaluateCoupon({ ...base, value: 50, maxDiscount: 200 }, 1000, NOW)
    expect(r.discount).toBe(200) // 50% of 1000 = 500, capped to 200
  })

  it('never discounts more than the subtotal', () => {
    const r = evaluateCoupon({ ...base, type: 'flat', value: 9999 }, 300, NOW)
    expect(r.discount).toBe(300)
  })

  it('rejects an inactive coupon', () => {
    expect(evaluateCoupon({ ...base, active: false }, 1000, NOW).valid).toBe(false)
  })

  it('rejects a missing coupon', () => {
    expect(evaluateCoupon(null, 1000, NOW).valid).toBe(false)
  })

  it('rejects an expired coupon', () => {
    const r = evaluateCoupon({ ...base, expiresAt: new Date(NOW - 1000).toISOString() }, 1000, NOW)
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/expired/i)
  })

  it('accepts a not-yet-expired coupon', () => {
    expect(evaluateCoupon({ ...base, expiresAt: new Date(NOW + 86_400_000).toISOString() }, 1000, NOW).valid).toBe(true)
  })

  it('enforces minimum subtotal', () => {
    const r = evaluateCoupon({ ...base, minSubtotal: 500 }, 400, NOW)
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/₹500/)
  })

  it('enforces usage limit', () => {
    expect(evaluateCoupon({ ...base, usageLimit: 5, usedCount: 5 }, 1000, NOW).valid).toBe(false)
    expect(evaluateCoupon({ ...base, usageLimit: 5, usedCount: 4 }, 1000, NOW).valid).toBe(true)
  })

  it('treats usageLimit 0 as unlimited', () => {
    expect(evaluateCoupon({ ...base, usageLimit: 0, usedCount: 9999 }, 1000, NOW).valid).toBe(true)
  })
})
