// Centralized, admin-configurable shipping calculation.
// Kept as pure functions so they can be unit-tested and reused on both the
// client (checkout display) and the server (authoritative order total).

export interface ShippingSettings {
  /** Flat shipping fee applied to an order, in rupees. */
  shippingCharge: number
  /** Orders with subtotal >= this amount ship free. Set to 0 to disable free shipping. */
  freeShippingThreshold: number
}

export const DEFAULT_SHIPPING: ShippingSettings = {
  shippingCharge: 49,
  freeShippingThreshold: 499,
}

/**
 * Returns the shipping fee for a given cart subtotal.
 * - Empty/zero subtotal → 0 (nothing to ship).
 * - subtotal >= freeShippingThreshold (when threshold > 0) → 0 (free shipping).
 * - otherwise → the configured flat shippingCharge.
 */
export function calcShipping(subtotal: number, settings: ShippingSettings): number {
  const charge    = Math.max(0, Number(settings?.shippingCharge) || 0)
  const threshold = Math.max(0, Number(settings?.freeShippingThreshold) || 0)

  if (!(subtotal > 0)) return 0
  if (threshold > 0 && subtotal >= threshold) return 0
  return charge
}

/** Subtotal + shipping. */
export function calcTotal(subtotal: number, settings: ShippingSettings): number {
  return subtotal + calcShipping(subtotal, settings)
}
