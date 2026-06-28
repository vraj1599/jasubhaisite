import mongoose, { Schema, Document, Types } from 'mongoose'

export const SLIDER_SOURCES = ['bestselling', 'featured', 'manual'] as const
export type SliderSource = (typeof SLIDER_SOURCES)[number]

export interface IHomeConfig extends Document {
  sliderActive: boolean
  sliderTitle: string
  sliderSubtitle: string
  sliderSource: SliderSource
  sliderLimit: number
  manualProducts: Types.ObjectId[]
  updatedAt: Date
}

const HomeConfigSchema = new Schema<IHomeConfig>(
  {
    sliderActive:   { type: Boolean, default: true },
    sliderTitle:    { type: String, default: 'Best Sellers', trim: true },
    sliderSubtitle: { type: String, default: 'Most loved by our customers', trim: true },
    sliderSource:   { type: String, enum: SLIDER_SOURCES as unknown as string[], default: 'bestselling' },
    sliderLimit:    { type: Number, default: 10, min: 1, max: 30 },
    manualProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
)

export default mongoose.models.HomeConfig || mongoose.model<IHomeConfig>('HomeConfig', HomeConfigSchema)
