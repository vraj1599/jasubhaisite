import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const clientId    = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

  if (!clientId) {
    return NextResponse.json({ message: 'Google OAuth not configured' }, { status: 503 })
  }

  // CSRF state token
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    state,
    prompt:        'select_account',
  })

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  const res = NextResponse.redirect(googleUrl)
  // Store state in cookie for verification in callback
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  })

  return res
}
