import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  image: string
  size: string
  quantity: number
  price: number
}

export interface IOrder extends Document {
  user: Types.ObjectId
  items: IOrderItem[]
  shippingAddress: {
    name: string
    phone: string
    line1: string
    locality: string
    city: string
    state: string
    country: string
    pincode: string
  }
  subtotal: number
  shipping: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  createdAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  product:  { type: Schema.Types.ObjectId, ref: 'Product' },
  name:     { type: String, required: true },
  image:    { type: String, default: '' },
  size:     { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price:    { type: Number, required: true },
})

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    shippingAddress: {
      name:     { type: String, required: true },
      phone:    { type: String, required: true },
      line1:    { type: String, required: true },
      locality: { type: String, default: '' },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      country:  { type: String, default: 'India' },
      pincode:  { type: String, required: true },
    },
    subtotal:         { type: Number, required: true },
    shipping:         { type: Number, default: 0 },
    total:            { type: Number, required: true },
    status:           { type: String, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'], default: 'pending' },
    paymentStatus:    { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
    razorpayOrderId:  { type: String, default: '' },
    razorpayPaymentId:{ type: String, default: '' },
    razorpaySignature:{ type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
