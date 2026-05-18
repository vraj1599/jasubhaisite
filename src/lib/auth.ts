import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: 'user' | 'admin'
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  const cookie = req.cookies.get('token')
  return cookie?.value ?? null
}

export function getUserFromRequest(req: NextRequest): JWTPayload | null {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAuth(req: NextRequest): JWTPayload {
  const user = getUserFromRequest(req)
  if (!user) throw new Error('Unauthorized')
  return user
}

export function requireAdmin(req: NextRequest): JWTPayload {
  const user = requireAuth(req)
  if (user.role !== 'admin') throw new Error('Forbidden')
  return user
}
