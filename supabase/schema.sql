-- Falcone Propiedades — tabla de propiedades en Supabase.
-- Pega este script una vez en el SQL Editor del proyecto Supabase (wweromfiytywgufdmfpa).

create table if not exists properties (
  id text primary key,
  title text not null,
  price numeric not null,
  location text not null,
  address text,
  latitude double precision,
  longitude double precision,
  province text,
  type text not null,
  operation text not null default 'venta',
  status text not null default 'disponible',
  description text not null,
  images jsonb not null default '[]'::jsonb,
  fotocasa_url text,
  bedrooms integer,
  bathrooms integer,
  sq_meters numeric,
  availability text,
  hot_water text,
  heating text,
  condition text,
  property_age text,
  floor text,
  garage text,
  elevator text,
  furnished text,
  extras jsonb not null default '[]'::jsonb,
  energy_rating text,
  energy_value numeric,
  emissions_rating text,
  emissions_value numeric,
  featured boolean not null default false,
  archived boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_sort_order_idx on properties (sort_order);

-- RLS activada sin policies: bloquea el acceso público vía la API REST/anon.
alter table properties enable row level security;

-- El service role necesita GRANT explícito además de bypassar RLS.
grant all on public.properties to service_role;
