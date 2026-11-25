-- SuprizeGo Fase 1 — skema halaman kejutan.
-- Semua akses data dilakukan dari server Next.js memakai service role,
-- sehingga RLS aktif tanpa policy publik.

create extension if not exists pgcrypto;

create table public.surprise_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[A-Za-z0-9]{10,64}$'),
  moment text not null check (
    moment in ('pengakuan', 'ulang-tahun', 'anniversary', 'minta-maaf', 'wisuda')
  ),
  recipient_name text not null check (char_length(recipient_name) between 1 and 60),
  sender_name text check (char_length(sender_name) between 1 and 60),
  story text check (char_length(story) <= 4000),
  letter text check (char_length(letter) <= 6000),
  photo_paths text[] not null default '{}',
  music_path text,
  theme text not null default 'klasik',
  active_until timestamptz,
  created_at timestamptz not null default now()
);

comment on column public.surprise_pages.active_until is
  'NULL berarti aktif selamanya (paket Abadi).';

alter table public.surprise_pages enable row level security;

insert into storage.buckets (id, name, public)
values ('surprise-media', 'surprise-media', false)
on conflict (id) do nothing;
