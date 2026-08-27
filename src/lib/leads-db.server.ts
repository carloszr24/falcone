import 'server-only'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import type { LeadRow } from '@/lib/leads'

const TABLE = 'leads'

export async function listLeadRows(): Promise<LeadRow[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Error al leer leads: ${error.message}`)
  return (data ?? []) as LeadRow[]
}

export async function getLeadRowById(id: string): Promise<LeadRow | null> {
  const { data, error } = await getSupabaseAdmin().from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Error al leer lead: ${error.message}`)
  return (data as LeadRow | null) ?? null
}

export async function insertLeadRow(
  row: Omit<LeadRow, 'id' | 'created_at' | 'updated_at'>
): Promise<LeadRow> {
  const now = new Date().toISOString()
  const payload: LeadRow = {
    ...row,
    id: `lead-${Date.now()}`,
    created_at: now,
    updated_at: now,
  }
  const { data, error } = await getSupabaseAdmin().from(TABLE).insert(payload).select('*').single()
  if (error) throw new Error(`Error al crear lead: ${error.message}`)
  return data as LeadRow
}

export async function updateLeadRow(id: string, patch: Partial<LeadRow>): Promise<LeadRow> {
  const { data, error } = await getSupabaseAdmin()
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(`Error al actualizar lead: ${error.message}`)
  return data as LeadRow
}

export async function deleteLeadRow(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from(TABLE).delete().eq('id', id)
  if (error) throw new Error(`Error al eliminar lead: ${error.message}`)
}
