import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  phone: string
  password?: string
  googleId?: string
  avatar?: string
  role: 'user' | 'admin'
  resetToken?: string | null
  resetTokenExpiry?: Date | null
  address: {
    line1: string
    locality: string
    city: string
    state: string
    country: string
    pincode: string
  }
  createdAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:    { type: String, default: '', trim: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null, index: true },
    avatar:   { type: String, default: '' },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    resetToken:       { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    address: {
      line1:    { type: String, default: '' },
      locality: { type: String, default: '' },
      city:     { type: String, default: '' },
      state:    { type: String, default: '' },
      country:  { type: String, default: 'India' },
      pincode:  { type: String, default: '' },
    },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = function (candidate: string) {
  if (!this.password) return Promise.resolve(false)
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
