import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_LOCK_MS = 30 * 60 * 1000

type AttemptRecord = { count: number; firstAt: number; lockedUntil?: number }

const loginAttempts = new Map<string, AttemptRecord>()

export function getClientIp(request: NextRequest | Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export function getAllowedAdminIps(): string[] {
  const raw = process.env.ADMIN_ALLOWED_IPS?.trim()
  if (!raw) return []
  return raw
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)
}

export function isAdminIpAllowed(request: NextRequest | Request): boolean {
  const allowed = getAllowedAdminIps()
  if (allowed.length === 0) return true
  const ip = getClientIp(request)
  return allowed.includes(ip)
}

export function adminSecurityHeaders(): HeadersInit {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cache-Control': 'no-store, max-age=0',
  }
}

export function applyAdminSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(adminSecurityHeaders())) {
    response.headers.set(key, value)
  }
  return response
}

export function adminAccessDeniedResponse(status = 403): NextResponse {
  return applyAdminSecurityHeaders(
    NextResponse.json({ error: 'Acceso no permitido' }, { status })
  )
}

export function checkLoginRateLimit(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (record?.lockedUntil && record.lockedUntil > now) {
    return { ok: false, retryAfterSec: Math.ceil((record.lockedUntil - now) / 1000) }
  }

  if (record?.lockedUntil && record.lockedUntil <= now) {
    loginAttempts.delete(ip)
  }

  return { ok: true }
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || now - record.firstAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAt: now })
    return
  }

  const nextCount = record.count + 1
  if (nextCount >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.set(ip, {
      count: nextCount,
      firstAt: record.firstAt,
      lockedUntil: now + LOGIN_LOCK_MS,
    })
    return
  }

  loginAttempts.set(ip, { count: nextCount, firstAt: record.firstAt })
}

export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip)
}

export function safeCompareStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

export function getSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    ''
  )
}

export function passwordSessionVersion(): string {
  const password = process.env.ADMIN_PASSWORD?.trim() || ''
  if (!password || !getSessionSecret()) return ''
  return createHmac('sha256', getSessionSecret()).update(password).digest('base64url').slice(0, 16)
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD?.trim() &&
    process.env.ADMIN_PIN?.trim() &&
    getSessionSecret()
  )
}

/**
 * Temporary bypass: password/PIN/session checks are off unless explicitly re-enabled.
 * Set ADMIN_AUTH_DISABLED=false to restore normal admin authentication.
 */
export function isAdminAuthDisabled(): boolean {
  const raw = process.env.ADMIN_AUTH_DISABLED?.trim().toLowerCase()
  if (raw === 'false' || raw === '0' || raw === 'no') return false
  // Default: auth disabled (de momento). Explicit true/empty/unset all bypass.
  return true
}

export function verifyAdminPassword(password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD?.trim() || ''
  if (!expectedPassword) return false
  return safeCompareStrings(password, expectedPassword)
}

export function verifyAdminPin(pin: string): boolean {
  const expectedPin = process.env.ADMIN_PIN?.trim() || ''
  if (!expectedPin) return false
  return safeCompareStrings(pin, expectedPin)
}

export function verifyAdminLogin(password: string, pin: string): boolean {
  return verifyAdminPassword(password) && verifyAdminPin(pin)
}

export function getAdminSessionMaxAgeSeconds(): number {
  const hours = Number(process.env.ADMIN_SESSION_MAX_AGE_HOURS)
  if (Number.isFinite(hours) && hours > 0 && hours <= 168) {
    return Math.floor(hours * 60 * 60)
  }
  return 12 * 60 * 60
}

export function getAdminCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  }
}
