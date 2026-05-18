import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: number
  discount: number
  category: string
  sizes: string[]
  stock: number
  images: { url: string; publicId: string }[]
  featured: boolean
  isActive: boolean
  createdAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    discount:    { type: Number, default: 0, min: 0, max: 100 },
    category:    {
      type: String,
      required: true,
      enum: ['Sandals', 'Chappals', 'Kolhapuri', 'Mojaris', 'Sports', 'Formal', 'Casual', 'Kids'],
    },
    sizes:    { type: [String], default: [] },
    stock:    { type: Number, required: true, default: 0 },
    images:   [{ url: String, publicId: String }],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now()
  }
  next()
})

ProductSchema.virtual('salePrice').get(function () {
  return this.price - (this.price * this.discount) / 100
})

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
