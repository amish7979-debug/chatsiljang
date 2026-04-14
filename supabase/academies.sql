-- Supabase SQL Editor에서 실행하세요. 테이블이 이미 있으면 컬럼만 맞춰 주세요.

create table if not exists public.academies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  price_info jsonb not null default '[]'::jsonb,
  schedule jsonb not null default '[]'::jsonb,
  faq jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academies_created_at_idx on public.academies (created_at desc);

comment on table public.academies is '학원 기본 정보 및 수강료/시간표/FAQ (JSON 배열)';
