import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { signToken } from '@/lib/auth'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  error?: string
}

interface GoogleUserInfo {
  sub: string
  name: string
  email: string
  picture: string
  email_verified: boolean
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const clientId    = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${appUrl}/api/auth/google/callback`

  // User denied access
  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`)
  }

  // Verify state (CSRF protection)
  const storedState = req.cookies.get('oauth_state')?.value
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`)
  }

  if (!code || !clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_config`)
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })

    const tokens: GoogleTokenResponse = await tokenRes.json()
    if (tokens.error || !tokens.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange`)
    }

    // 2. Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const googleUser: GoogleUserInfo = await userInfoRes.json()

    if (!googleUser.email || !googleUser.email_verified) {
      return NextResponse.redirect(`${appUrl}/login?error=email_unverified`)
    }

    // 3. Find or create user in MongoDB
    await connectDB()

    let user = await User.findOne({
      $or: [{ googleId: googleUser.sub }, { email: googleUser.email }],
    })

    if (user) {
      // Update Google ID if signing in with Google for first time via existing email
      if (!user.googleId) {
        user.googleId = googleUser.sub
        user.avatar   = googleUser.picture
        await user.save()
      }
    } else {
      // New user — create account
      user = await User.create({
        name:     googleUser.name,
        email:    googleUser.email,
        googleId: googleUser.sub,
        avatar:   googleUser.picture,
        phone:    '',
        password: null,
        role:     'user',
      })
    }

    // 4. Generate our custom JWT and set cookie
    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role })

    const res = NextResponse.redirect(`${appUrl}/`)
    res.cookies.set('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 30,
      path:     '/',
    })
    // Clear the OAuth state cookie
    res.cookies.delete('oauth_state')

    return res
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(`${appUrl}/login?error=server_error`)
  }
}
