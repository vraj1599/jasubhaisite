import mongoose, { Schema, Document } from 'mongoose'

export interface IBanner extends Document {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  theme: string
  active: boolean
  order: number
  createdAt: Date
}

// Preset gradient themes the homepage knows how to render.
export const BANNER_THEMES = ['red', 'amber', 'green', 'blue', 'purple', 'dark'] as const

const BannerSchema = new Schema<IBanner>(
  {
    title:    { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    ctaText:  { type: String, default: 'Shop Now', trim: true },
    ctaLink:  { type: String, default: '/products', trim: true },
    theme:    { type: String, enum: BANNER_THEMES as unknown as string[], default: 'amber' },
    active:   { type: Boolean, default: false },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema)
