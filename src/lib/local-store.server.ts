import 'server-only'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')
const LEADS_FILE = join(DATA_DIR, 'leads.json')

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
}

export type StoredLead = {
  id: string
  fullName: string
  email?: string | null
  phone: string
  source: string
  intent: string
  status: string
  priority: string
  propertyRef?: string | null
  notes?: string | null
  saleTimeline?: string | null
  assignedTo?: string | null
  firstResponseAt?: string | null
  lastContactAt?: string | null
  createdAt: string
  updatedAt: string
}

export function readLocalLeads(): StoredLead[] {
  ensureDataDir()
  if (!existsSync(LEADS_FILE)) return []
  return JSON.parse(readFileSync(LEADS_FILE, 'utf8')) as StoredLead[]
}

export function writeLocalLeads(leads: StoredLead[]) {
  ensureDataDir()
  writeFileSync(LEADS_FILE, `${JSON.stringify(leads, null, 2)}\n`, 'utf8')
}

export function appendLocalLead(lead: Omit<StoredLead, 'id' | 'createdAt' | 'updatedAt'>): StoredLead {
  const leads = readLocalLeads()
  const now = new Date().toISOString()
  const row: StoredLead = {
    ...lead,
    id: `lead-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }
  writeLocalLeads([row, ...leads])
  return row
}
