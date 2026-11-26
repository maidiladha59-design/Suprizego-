alter table public.surprise_pages
  add column if not exists special_day text;

comment on column public.surprise_pages.special_day is
  'NULL berarti memakai tema biasa; lainnya adalah id dari lib/special-days.ts.';
