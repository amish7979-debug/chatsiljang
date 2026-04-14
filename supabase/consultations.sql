-- Supabase SQL Editor에서 실행하세요. academies 테이블이 먼저 있어야 합니다.

create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid not null references public.academies (id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consultations_academy_id_idx
  on public.consultations (academy_id desc);

create index if not exists consultations_created_at_idx
  on public.consultations (created_at desc);

comment on table public.consultations is '챗실장 AI 상담 대화 로그 (messages: {role, content} 배열)';
