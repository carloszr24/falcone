import type { Lead, LeadIntent, LeadPriority, LeadSource, LeadStatus } from '@/types'

export const LEAD_STATUSES: LeadStatus[] = [
  'nuevo',
  'contactado',
  'visita_agendada',
  'visita_realizada',
  'oferta',
  'reserva',
  'cerrado',
  'descartado',
]

export const LEAD_SOURCES: LeadSource[] = [
  'facebook',
  'web_contacto',
  'web_valoracion',
  'web_calculadora',
  'whatsapp',
  'telefono',
  'otro',
]

export const LEAD_PRIORITIES: LeadPriority[] = ['alta', 'media', 'baja']
export const LEAD_INTENTS: LeadIntent[] = ['comprar', 'vender', 'alquilar', 'otro']

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  visita_agendada: 'Visita agendada',
  visita_realizada: 'Visita realizada',
  oferta: 'Oferta',
  reserva: 'Reserva',
  cerrado: 'Cerrado',
  descartado: 'Descartado',
}

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  facebook: 'Facebook',
  web_contacto: 'Web contacto',
  web_valoracion: 'Web valoracion',
  web_calculadora: 'Calculadora web',
  whatsapp: 'WhatsApp',
  telefono: 'Telefono',
  otro: 'Otro',
}

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export const LEAD_INTENT_LABELS: Record<LeadIntent, string> = {
  comprar: 'Comprar',
  vender: 'Vender',
  alquilar: 'Alquilar',
  otro: 'Otro',
}

export type LeadRow = {
  id: string
  full_name: string
  email: string | null
  phone: string
  source: LeadSource
  intent: LeadIntent
  status: LeadStatus
  priority: LeadPriority
  property_ref: string | null
  notes: string | null
  sale_timeline: string | null
  assigned_to: string | null
  first_response_at: string | null
  last_contact_at: string | null
  created_at: string
  updated_at: string
}

export function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    intent: row.intent,
    status: row.status,
    priority: row.priority,
    propertyRef: row.property_ref,
    notes: row.notes,
    saleTimeline: row.sale_timeline,
    assignedTo: row.assigned_to,
    firstResponseAt: row.first_response_at ? new Date(row.first_response_at) : null,
    lastContactAt: row.last_contact_at ? new Date(row.last_contact_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

export function rowsToLeads(rows: LeadRow[] | null | undefined): Lead[] {
  return (rows ?? []).map(rowToLead)
}

export function hoursToFirstResponse(lead: Lead): number | null {
  if (!lead.firstResponseAt) return null
  return (lead.firstResponseAt.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60)
}

export function isLeadInSla(lead: Lead, nowMs = Date.now()): boolean {
  if (lead.firstResponseAt) return true
  const createdMs = lead.createdAt.getTime()
  return nowMs - createdMs <= 15 * 60 * 1000
}

