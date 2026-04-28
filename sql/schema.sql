create extension if not exists pgcrypto;

create table if not exists public.business_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_name text,
  priority integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists business_categories_name_group_unique
  on public.business_categories (lower(name), lower(coalesce(group_name, '')));

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  province text,
  country text not null default 'South Africa',
  location_type text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists locations_name_province_country_unique
  on public.locations (lower(name), lower(coalesce(province, '')), lower(country));

create table if not exists public.term_patterns (
  id uuid primary key default gen_random_uuid(),
  pattern text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists term_patterns_pattern_unique
  on public.term_patterns (lower(pattern));

create table if not exists public.generated_search_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null unique,
  category_id uuid references public.business_categories(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  pattern_id uuid references public.term_patterns(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'queued', 'skipped')),
  created_at timestamptz not null default now()
);

create index if not exists generated_search_terms_status_idx
  on public.generated_search_terms (status);

create table if not exists public.search_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  region text not null default 'za',
  status text not null default 'pending' check (status in ('pending', 'searched')),
  searched_at timestamptz,
  result_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table if exists public.search_terms
  drop constraint if exists search_terms_term_key;

drop index if exists public.search_terms_term_key;
drop index if exists search_terms_term_key;

create unique index if not exists search_terms_term_region_unique
  on public.search_terms (lower(term), lower(region));

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  place_id text,
  name text not null,
  formatted_address text,
  formatted_phone_number text,
  phone_normalized text,
  website text,
  rating numeric(3,2),
  source_term text,
  lead_status text not null default 'new' check (lead_status in ('new', 'contacted', 'interested', 'quoted', 'won', 'lost')),
  call_outcome text check (call_outcome in ('no_answer', 'wrong_number', 'not_interested', 'call_back_later', 'interested', 'quoted', 'won', 'lost')),
  last_call_at timestamptz,
  lead_notes text,
  follow_up_at timestamptz,
  quoted_amount numeric(12,2),
  won_value numeric(12,2),
  assigned_agent text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.leads add column if not exists lead_status text not null default 'new';
alter table public.leads add column if not exists call_outcome text;
alter table public.leads add column if not exists last_call_at timestamptz;
alter table public.leads add column if not exists lead_notes text;
alter table public.leads add column if not exists follow_up_at timestamptz;
alter table public.leads add column if not exists quoted_amount numeric(12,2);
alter table public.leads add column if not exists won_value numeric(12,2);
alter table public.leads add column if not exists assigned_agent text;
alter table public.leads add column if not exists updated_at timestamptz not null default now();

alter table public.leads drop constraint if exists leads_lead_status_check;
alter table public.leads
  add constraint leads_lead_status_check
  check (lead_status in ('new', 'contacted', 'interested', 'quoted', 'won', 'lost'));

alter table public.leads drop constraint if exists leads_call_outcome_check;
alter table public.leads
  add constraint leads_call_outcome_check
  check (call_outcome in ('no_answer', 'wrong_number', 'not_interested', 'call_back_later', 'interested', 'quoted', 'won', 'lost'));

create unique index if not exists leads_place_id_unique
  on public.leads (place_id)
  where place_id is not null;

create unique index if not exists leads_name_phone_unique
  on public.leads (lower(name), phone_normalized)
  where phone_normalized is not null and phone_normalized <> '';

create table if not exists public.app_settings (
  id integer primary key,
  default_batch_size integer not null default 5,
  default_delay_ms integer not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, default_batch_size, default_delay_ms)
values (1, 5, 1000)
on conflict (id) do nothing;

create or replace function public.touch_app_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_app_settings_updated_at on public.app_settings;

create trigger touch_app_settings_updated_at
before update on public.app_settings
for each row
execute procedure public.touch_app_settings_updated_at();

create or replace function public.touch_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_leads_updated_at on public.leads;

create trigger touch_leads_updated_at
before update on public.leads
for each row
execute procedure public.touch_leads_updated_at();
