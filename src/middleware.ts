import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback_secret')

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; email: string; role: string }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token =
    req.cookies.get('token')?.value ??
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login?redirect=/admin', req.url))
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  if (pathname.startsWith('/checkout') || pathname.startsWith('/orders')) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
    }
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*', '/orders/:path*'],
}
