import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    const { image } = await req.json()
    if (!image) return NextResponse.json({ message: 'No image provided' }, { status: 400 })

    const result = await uploadImage(image)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg    = err instanceof Error ? err.message : 'Server error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ message: msg }, { status })
  }
}
