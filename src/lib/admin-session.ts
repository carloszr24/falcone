import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import {
  getAdminSessionMaxAgeSeconds,
  getSessionSecret,
  isAdminAuthDisabled,
  passwordSessionVersion,
} from '@/lib/admin-security'

export const ADMIN_COOKIE_NAME = 'falcone_admin'

export function createAdminSessionToken(): string {
  const secret = getSessionSecret()
  const version = passwordSessionVersion()
  if (!secret || !version) return ''

  const exp = Date.now() + getAdminSessionMaxAgeSeconds() * 1000
  const payload = Buffer.from(JSON.stringify({ exp, v: version }), 'utf8').toString('base64url')
  const sig = createHmac('sha256', secret).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  // TEMP: skip password/PIN/session cookie checks until ADMIN_AUTH_DISABLED=false
  if (isAdminAuthDisabled()) return true

  const secret = getSessionSecret()
  const version = passwordSessionVersion()
  if (!token || !secret || !version) return false

  const dot = token.indexOf('.')
  if (dot === -1) return false
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  try {
    const a = Buffer.from(sig, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    if (a.length !== b.length) return false
    if (!timingSafeEqual(a, b)) return false
  } catch {
    return false
  }
  try {
    const { exp, v } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp: number
      v: string
    }
    return typeof exp === 'number' && exp > Date.now() && v === version
  } catch {
    return false
  }
}

export function getAdminTokenFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(ADMIN_COOKIE_NAME)?.value
}
