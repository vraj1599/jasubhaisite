import { describe, it, expect } from 'vitest'
import { calcShipping, calcTotal, DEFAULT_SHIPPING, type ShippingSettings } from './shipping'

const settings: ShippingSettings = { shippingCharge: 49, freeShippingThreshold: 499 }

describe('calcShipping', () => {
  it('charges the flat fee below the free-shipping threshold', () => {
    expect(calcShipping(100, settings)).toBe(49)
    expect(calcShipping(498, settings)).toBe(49)
  })

  it('is free at or above the threshold', () => {
    expect(calcShipping(499, settings)).toBe(0)
    expect(calcShipping(500, settings)).toBe(0)
    expect(calcShipping(5000, settings)).toBe(0)
  })

  it('returns 0 for an empty cart', () => {
    expect(calcShipping(0, settings)).toBe(0)
    expect(calcShipping(-10, settings)).toBe(0)
  })

  it('respects a custom shipping charge set by the admin', () => {
    expect(calcShipping(200, { shippingCharge: 99, freeShippingThreshold: 1000 })).toBe(99)
    expect(calcShipping(200, { shippingCharge: 0, freeShippingThreshold: 1000 })).toBe(0)
  })

  it('treats threshold 0 as "no free shipping" — always charges', () => {
    expect(calcShipping(10000, { shippingCharge: 49, freeShippingThreshold: 0 })).toBe(49)
  })

  it('never returns a negative charge', () => {
    expect(calcShipping(100, { shippingCharge: -50, freeShippingThreshold: 499 })).toBe(0)
  })

  it('coerces missing/invalid settings to safe numbers', () => {
    // @ts-expect-error intentionally passing a malformed object
    expect(calcShipping(100, {})).toBe(0)
    // @ts-expect-error intentionally passing undefined
    expect(calcShipping(100, undefined)).toBe(0)
  })
})

describe('calcTotal', () => {
  it('adds shipping to the subtotal', () => {
    expect(calcTotal(100, settings)).toBe(149)
  })

  it('equals the subtotal when shipping is free', () => {
    expect(calcTotal(600, settings)).toBe(600)
  })
})

describe('DEFAULT_SHIPPING', () => {
  it('matches the original hardcoded behaviour (49 / free above 499)', () => {
    expect(calcShipping(300, DEFAULT_SHIPPING)).toBe(49)
    expect(calcShipping(499, DEFAULT_SHIPPING)).toBe(0)
  })
})
