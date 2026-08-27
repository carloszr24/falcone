-- Falcone Propiedades — tabla de leads en Supabase.
-- Pega este script una vez en el SQL Editor del proyecto Supabase (wweromfiytywgufdmfpa).
-- Motivo: data/leads.json no funciona en Vercel (filesystem de solo lectura en producción).

create table if not exists leads (
  id text primary key,
  full_name text not null,
  email text,
  phone text not null,
  source text not null,
  intent text not null,
  status text not null default 'nuevo',
  priority text not null default 'media',
  property_ref text,
  notes text,
  sale_timeline text,
  assigned_to text,
  first_response_at timestamptz,
  last_contact_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);

-- RLS activada sin policies: bloquea el acceso público vía la API REST/anon.
alter table leads enable row level security;

-- El service role necesita GRANT explícito además de bypassar RLS.
grant all on public.leads to service_role;
