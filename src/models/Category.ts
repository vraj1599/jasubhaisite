import mongoose, { Schema, Document } from 'mongoose'

// Canonical categories — names MUST match the Product schema enum so that
// /products?category=<name> filtering works. Formal & Casual default to hidden
// to preserve the storefront's original 6-category display.
export const CATEGORY_DEFAULTS = [
  { name: 'Sandals',   emoji: '🩴', description: 'Light & breezy',     active: true,  order: 0 },
  { name: 'Chappals',  emoji: '👡', description: 'Daily comfort',      active: true,  order: 1 },
  { name: 'Kolhapuri', emoji: '🥿', description: 'Traditional craft',  active: true,  order: 2 },
  { name: 'Mojaris',   emoji: '👟', description: 'Festival wear',      active: true,  order: 3 },
  { name: 'Sports',    emoji: '⚡', description: 'Active lifestyle',   active: true,  order: 4 },
  { name: 'Kids',      emoji: '🌟', description: 'Tiny feet, big fun', active: true,  order: 5 },
  { name: 'Formal',    emoji: '👞', description: 'Office & occasions', active: false, order: 6 },
  { name: 'Casual',    emoji: '👟', description: 'Everyday ease',      active: false, order: 7 },
]

export interface ICategory extends Document {
  name: string
  emoji: string
  description: string
  active: boolean
  order: number
}

const CategorySchema = new Schema<ICategory>(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    emoji:       { type: String, default: '🛍️' },
    description: { type: String, default: '' },
    active:      { type: Boolean, default: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
