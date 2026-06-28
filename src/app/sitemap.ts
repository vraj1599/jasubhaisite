import type { MetadataRoute } from 'next'
import { connectDB } from '@/lib/db'
import Product from '@/models/Product'

// Regenerated on request so newly added products appear.
export const dynamic = 'force-dynamic'

const BASE = 'https://jasubhaichappal.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,        changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/products`, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${BASE}/login`,    changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/signup`,   changeFrequency: 'yearly', priority: 0.3 },
  ]

  let products: { _id: unknown; updatedAt?: Date }[] = []
  try {
    await connectDB()
    products = await Product.find({ isActive: true }).select('_id updatedAt').lean()
  } catch {
    // If the DB is unreachable, still return the static routes.
  }

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${String(p._id)}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
