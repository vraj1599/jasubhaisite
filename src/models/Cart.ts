import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICartItem {
  product: Types.ObjectId
  size: string
  quantity: number
  price: number
}

export interface ICart extends Document {
  user: Types.ObjectId
  items: ICartItem[]
  updatedAt: Date
}

const CartItemSchema = new Schema<ICartItem>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  size:     { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price:    { type: Number, required: true },
})

const CartSchema = new Schema<ICart>(
  {
    user:  { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
)

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema)
