import mongoose, { Schema, Document } from 'mongoose'

export interface IStoreSettings extends Document {
  shippingCharge: number
  freeShippingThreshold: number
  updatedAt: Date
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    shippingCharge:        { type: Number, default: 49,  min: 0 },
    freeShippingThreshold: { type: Number, default: 499, min: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.StoreSettings || mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema)
