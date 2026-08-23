
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin','retailer')),
  retailer_number text unique,
  mobile text,
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  tr_number text not null unique,
  retailer_id uuid not null references public.profiles(id),
  customer_name_en text not null,
  customer_name_gu text,
  dob date,
  mobile text,
  service_name text not null,
  amount numeric(10,2) not null default 0,
  payment_status text not null default 'Pending' check (payment_status in ('Pending','Paid','Failed')),
  application_status text not null default 'Received' check (application_status in ('Received','Verification','Processing','Completed','Rejected')),
  remark text,
  ration_pdf_path text,
  aadhaar_pdf_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_tr_idx on public.applications(tr_number);
create index if not exists applications_retailer_idx on public.applications(retailer_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

create or replace function public.is_retailer()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='retailer');
$$;

alter table public.profiles enable row level security;
alter table public.applications enable row level security;

drop policy if exists "admin profiles" on public.profiles;
create policy "admin profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "retailer own profile" on public.profiles;
create policy "retailer own profile" on public.profiles for select to authenticated using (id=auth.uid());

drop policy if exists "retailer create applications" on public.applications;
create policy "retailer create applications" on public.applications for insert to authenticated
with check (public.is_retailer() and retailer_id=auth.uid());

drop policy if exists "retailer own applications" on public.applications;
create policy "retailer read own applications" on public.applications for select to authenticated
using (public.is_admin() or retailer_id=auth.uid());

drop policy if exists "admin update applications" on public.applications;
create policy "admin update applications" on public.applications for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public tracking" on public.applications;
create policy "public tracking" on public.applications for select to anon, authenticated
using (true);

-- Private document bucket. Do not make this bucket public.
insert into storage.buckets (id,name,public) values ('documents','documents',false)
on conflict (id) do nothing;

drop policy if exists "retailer upload documents" on storage.objects;
create policy "retailer upload documents" on storage.objects for insert to authenticated
with check (bucket_id='documents' and public.is_retailer());

drop policy if exists "admin read documents" on storage.objects;
create policy "admin read documents" on storage.objects for select to authenticated
using (bucket_id='documents' and public.is_admin());

-- Create the first admin in Supabase Auth, then run:
-- insert into public.profiles(id,full_name,role) values ('YOUR_AUTH_USER_UUID','Admin','admin');
