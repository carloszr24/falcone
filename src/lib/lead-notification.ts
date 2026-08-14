import { LEAD_SOURCE_LABELS } from '@/lib/leads'
import type { LeadSource } from '@/types'

export type LeadNotificationPayload = {
  full_name: string
  phone: string
  email?: string | null
  source: string
  intent: string
  notes?: string | null
  property_ref?: string | null
  sale_timeline?: string | null
  property_type?: string | null
  location?: string | null
  sq_meters?: string | null
  bedrooms?: string | null
  bathrooms?: string | null
  condition?: string | null
  observations?: string | null
}

const BRAND_BURGUNDY = '#103f91'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://falconepropiedades.com'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sourceLabel(source: string): string {
  return LEAD_SOURCE_LABELS[source as LeadSource] || source
}

function buildSubject(record: LeadNotificationPayload): string {
  const name = record.full_name

  switch (record.source) {
    case 'web_contacto':
      return `Nuevo contacto solicitado! — ${name}`
    case 'web_valoracion':
      return `Nueva valoración gratuita solicitada! — ${name}`
    case 'web_calculadora':
      return `Nuevo cálculo de impuestos solicitado! — ${name}`
    default:
      return `Nuevo lead — ${name}`
  }
}

function buildHeadline(record: LeadNotificationPayload): string {
  switch (record.source) {
    case 'web_contacto':
      return 'Nuevo contacto solicitado'
    case 'web_valoracion':
      return 'Nueva valoración gratuita solicitada'
    case 'web_calculadora':
      return 'Nuevo cálculo de impuestos solicitado'
    default:
      return 'Nuevo aviso en la web'
  }
}

function buildBadge(record: LeadNotificationPayload): { label: string; color: string } {
  switch (record.source) {
    case 'web_contacto':
      return { label: 'Contacto', color: BRAND_BURGUNDY }
    case 'web_valoracion':
      return { label: 'Valoración gratuita', color: BRAND_BURGUNDY }
    case 'web_calculadora':
      return { label: 'Calculadora de impuestos', color: BRAND_BURGUNDY }
    default:
      return { label: sourceLabel(record.source), color: '#57534e' }
  }
}

type FieldRow = { label: string; value: string; href?: string; multiline?: boolean }

function contactFields(record: LeadNotificationPayload): FieldRow[] {
  const fields: FieldRow[] = [
    { label: 'Nombre', value: record.full_name },
    { label: 'Teléfono', value: record.phone, href: `tel:${record.phone.replace(/\s/g, '')}` },
  ]

  if (record.email) {
    fields.push({ label: 'Email', value: record.email, href: `mailto:${record.email}` })
  }

  if (record.notes) {
    fields.push({ label: 'Mensaje', value: record.notes, multiline: true })
  }

  return fields
}

function valoracionFields(record: LeadNotificationPayload): FieldRow[] {
  const fields: FieldRow[] = [
    { label: 'Nombre', value: record.full_name },
    { label: 'Teléfono', value: record.phone, href: `tel:${record.phone.replace(/\s/g, '')}` },
  ]

  if (record.email) {
    fields.push({ label: 'Email', value: record.email, href: `mailto:${record.email}` })
  }

  if (record.property_type) {
    fields.push({ label: 'Tipo de inmueble', value: record.property_type })
  }

  if (record.location) {
    fields.push({ label: 'Zona / Dirección', value: record.location })
  }

  if (record.sq_meters) {
    fields.push({ label: 'Metros cuadrados', value: record.sq_meters })
  }

  if (record.bedrooms) {
    fields.push({ label: 'Habitaciones', value: record.bedrooms })
  }

  if (record.bathrooms) {
    fields.push({ label: 'Baños', value: record.bathrooms })
  }

  if (record.condition) {
    fields.push({ label: 'Estado', value: record.condition })
  }

  if (record.sale_timeline) {
    fields.push({ label: 'Plazo de venta', value: record.sale_timeline })
  }

  if (record.observations) {
    fields.push({ label: 'Observaciones', value: record.observations, multiline: true })
  }

  return fields
}

function calculadoraFields(record: LeadNotificationPayload): FieldRow[] {
  const fields: FieldRow[] = [
    { label: 'Nombre', value: record.full_name },
    { label: 'Teléfono', value: record.phone, href: `tel:${record.phone.replace(/\s/g, '')}` },
  ]

  if (record.email) {
    fields.push({ label: 'Email', value: record.email, href: `mailto:${record.email}` })
  }

  if (record.property_ref) {
    fields.push({ label: 'Calculadora', value: record.property_ref })
  }

  if (record.notes) {
    fields.push({ label: 'Resultado del cálculo', value: record.notes, multiline: true })
  }

  return fields
}

function buildFields(record: LeadNotificationPayload): FieldRow[] {
  switch (record.source) {
    case 'web_contacto':
      return contactFields(record)
    case 'web_valoracion':
      return valoracionFields(record)
    case 'web_calculadora':
      return calculadoraFields(record)
    default:
      return contactFields(record)
  }
}

function renderFieldValue(field: FieldRow): string {
  const safeValue = escapeHtml(field.value)
  if (field.href) {
    return `<a href="${escapeHtml(field.href)}" style="color:${BRAND_BURGUNDY};text-decoration:none;font-weight:600">${safeValue}</a>`
  }
  return `<span style="color:#1c1917">${safeValue}</span>`
}

function buildEmailContent(record: LeadNotificationPayload) {
  const headline = buildHeadline(record)
  const badge = buildBadge(record)
  const fields = buildFields(record)
  const now = new Date().toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const text = [
    headline,
    '',
    ...fields.map((field) => `${field.label}: ${field.value}`),
    '',
    `Recibido: ${now}`,
    SITE_URL,
  ].join('\n')

  const fieldRows = fields
    .map((field) => {
      const labelHtml = `<div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#78716c;margin:0 0 ${field.multiline ? '8px' : '4px'}">${escapeHtml(field.label)}</div>`

      const valueHtml = field.multiline
        ? `<div style="display:block;width:100%;max-width:100%;box-sizing:border-box;padding:12px 16px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;white-space:pre-wrap;line-height:1.6;text-align:left;word-break:break-word">${renderFieldValue(field)}</div>`
        : `<div style="display:block;font-size:15px;line-height:1.5;text-align:left;word-break:break-word">${renderFieldValue(field)}</div>`

      return `
          <tr>
            <td colspan="2" align="left" valign="top" style="padding:${field.multiline ? '16px' : '10px'} 0 0;width:100%;text-align:left">
              ${labelHtml}
              ${valueHtml}
            </td>
          </tr>`
    })
    .join('')

  const ctaButtons = `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0">
      <tr>
        <td align="left" style="padding:0 0 10px;width:100%">
          <a href="tel:${escapeHtml(record.phone.replace(/\s/g, ''))}" style="display:block;max-width:320px;background:${BRAND_BURGUNDY};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:8px;text-align:center">Llamar ahora</a>
        </td>
      </tr>
      ${
        record.email
          ? `<tr>
        <td align="left" style="width:100%">
          <a href="mailto:${escapeHtml(record.email)}" style="display:block;max-width:320px;background:#ffffff;color:${BRAND_BURGUNDY};font-size:14px;font-weight:700;text-decoration:none;padding:11px 20px;border-radius:8px;border:2px solid ${BRAND_BURGUNDY};text-align:center">Responder por email</a>
        </td>
      </tr>`
          : ''
      }
    </table>`

  const html = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(headline)}</title>
  </head>
  <body style="margin:0;padding:24px 12px;background:#f5f5f4;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto">
      <tr>
        <td style="background:${BRAND_BURGUNDY};border-radius:12px 12px 0 0;padding:20px 24px">
          <div style="font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.82)">Falcone Propiedades</div>
          <div style="margin-top:8px;font-size:22px;font-weight:700;line-height:1.25;color:#ffffff">${escapeHtml(headline)}</div>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border-left:1px solid #e7e5e4;border-right:1px solid #e7e5e4;padding:20px 24px 8px">
          <span style="display:inline-block;background:${badge.color};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:6px 10px;border-radius:999px">${escapeHtml(badge.label)}</span>
          <span style="display:inline-block;margin-left:8px;font-size:13px;color:#78716c">${escapeHtml(now)}</span>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border-left:1px solid #e7e5e4;border-right:1px solid #e7e5e4;padding:8px 24px 24px">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%">
            ${fieldRows}
          </table>
          ${ctaButtons}
        </td>
      </tr>
      <tr>
        <td style="background:#fafaf9;border:1px solid #e7e5e4;border-top:none;border-radius:0 0 12px 12px;padding:16px 24px;text-align:center">
          <a href="${SITE_URL}" style="font-size:13px;color:#78716c;text-decoration:none">falconepropiedades.com</a>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()

  return { text, html, subject: buildSubject(record) }
}

function notificationRecipients(): string[] {
  const raw = process.env.LEADS_NOTIFICATION_EMAIL?.trim() || ''
  return raw
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
}

export function isLeadEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && notificationRecipients().length > 0)
}

export async function sendLeadNotificationEmail(
  record: LeadNotificationPayload
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY no configurada' }
  }

  const to = notificationRecipients()
  if (to.length === 0) {
    return { ok: false, error: 'LEADS_NOTIFICATION_EMAIL no configurado' }
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || 'Falcone Propiedades <onboarding@resend.dev>'

  const { text, html, subject } = buildEmailContent(record)
  const body: Record<string, unknown> = {
    from,
    to,
    subject,
    text,
    html,
  }

  if (record.email) {
    body.reply_to = record.email
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[lead-notification] Resend error:', res.status, err)
    return { ok: false, error: err }
  }

  return { ok: true }
}
