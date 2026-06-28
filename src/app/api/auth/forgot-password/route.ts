import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { rateLimit } from '@/lib/rateLimit'
import { sendEmail, passwordResetEmail } from '@/lib/email'

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req)
    const limit = rateLimit(`forgot:${ip}`, 4, 15 * 60 * 1000)
    if (!limit.allowed) {
      return NextResponse.json(
        { message: `Too many requests. Try again in ${limit.retryAfterSeconds} seconds.` },
        { status: 429 }
      )
    }

    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

    // Always respond the same way so attackers can't probe which emails exist.
    const generic = NextResponse.json({ message: 'If that email is registered, a reset link is on its way.' })

    if (!email) return generic
    await connectDB()
    const user = await User.findOne({ email })
    if (!user || !user.password) return generic // no account, or Google-only account

    const rawToken = crypto.randomBytes(32).toString('hex')
    user.resetToken = crypto.createHash('sha256').update(rawToken).digest('hex')
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jasubhaichappal.com'
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`
    const { subject, html } = passwordResetEmail(resetUrl)
    await sendEmail({ to: email, subject, html })

    return generic
  } catch (err) {
    console.error('forgot-password error:', err)
    return NextResponse.json({ message: 'If that email is registered, a reset link is on its way.' })
  }
}
