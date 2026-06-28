import mongoose, { Schema, Document } from 'mongoose'

export interface ICoupon extends Document {
  code: string
  type: 'percent' | 'flat'
  value: number
  active: boolean
  minSubtotal: number
  maxDiscount: number
  expiresAt: Date | null
  usageLimit: number
  usedCount: number
  createdAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:        { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value:       { type: Number, required: true, min: 0 },
    active:      { type: Boolean, default: true },
    minSubtotal: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 }, // 0 = no cap
    expiresAt:   { type: Date, default: null },
    usageLimit:  { type: Number, default: 0, min: 0 }, // 0 = unlimited
    usedCount:   { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)
