import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/jasubhaichappal'

async function seed() {
  await mongoose.connect(MONGODB_URI)
  console.log('Connected to MongoDB')

  const UserModel = (await import('../models/User')).default
  const ProductModel = (await import('../models/Product')).default

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@jasubhaichappal.com'
  const adminPass  = process.env.ADMIN_PASSWORD ?? 'Admin@123456'

  const existing = await UserModel.findOne({ email: adminEmail })
  if (!existing) {
    const hashedPass = await bcrypt.hash(adminPass, 12)
    await UserModel.create({
      name:     'Admin',
      email:    adminEmail,
      phone:    '8140191762',
      password: hashedPass,
      role:     'admin',
      address:  { city: 'Mahemdavad', state: 'Gujarat', country: 'India', pincode: '387130' },
    })
    console.log(`Admin created: ${adminEmail} / ${adminPass}`)
  } else {
    console.log('Admin already exists')
  }

  // Sample products
  const products = [
    { name: 'Classic Kolhapuri Chappal', description: 'Handcrafted genuine leather Kolhapuri in traditional design. Perfect for festive occasions.', price: 899, discount: 20, category: 'Kolhapuri', sizes: ['6','7','8','9','10','11'], stock: 50, featured: true },
    { name: 'Daily Comfort Chappal', description: 'Lightweight rubber sole chappal perfect for everyday use. Extra cushioned for all-day comfort.', price: 299, discount: 0, category: 'Chappals', sizes: ['6','7','8','9','10','11'], stock: 100, featured: true },
    { name: 'Premium Leather Sandal', description: 'Premium genuine leather sandal with adjustable buckle straps.', price: 1299, discount: 15, category: 'Sandals', sizes: ['6','7','8','9','10'], stock: 30, featured: true },
    { name: 'Embroidered Mojari', description: 'Beautiful hand-embroidered Rajasthani mojari. Ideal for ethnic wear.', price: 1099, discount: 10, category: 'Mojaris', sizes: ['6','7','8','9','10','11'], stock: 25, featured: true },
    { name: 'Sports Chappal Pro', description: 'Anti-slip sole chappal with arch support, ideal for sports and outdoor activities.', price: 599, discount: 5, category: 'Sports', sizes: ['6','7','8','9','10','11','12'], stock: 80 },
    { name: 'Kids Fun Sandal', description: 'Colorful and durable sandal for kids with velcro strap for easy wear.', price: 399, discount: 10, category: 'Kids', sizes: ['1','2','3','4','5'], stock: 60 },
  ]

  for (const p of products) {
    const exists = await ProductModel.findOne({ name: p.name })
    if (!exists) {
      await ProductModel.create({ ...p, images: [{ url: 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(p.name), publicId: '' }] })
      console.log(`Created: ${p.name}`)
    }
  }

  console.log('Seeding complete!')
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
