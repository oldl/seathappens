-- SeatHappens · Supabase schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)

create extension if not exists "pgcrypto";

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  pseudo text not null,
  avatar_type text not null check (avatar_type in ('sticker', 'draw')),
  avatar_value text not null,
  created_at timestamp with time zone default now()
);

-- Optional: block exact duplicate pseudos (case-insensitive) at the DB level.
-- Remove this if you'd rather only enforce it client-side.
create unique index if not exists participants_pseudo_unique_idx
  on participants (lower(pseudo));

-- Row Level Security: this is a public, no-login app.
-- Anyone can read the wall, and anyone can insert their own entry.
alter table participants enable row level security;

create policy "Public read access"
  on participants for select
  using (true);

create policy "Public insert access"
  on participants for insert
  with check (
    char_length(trim(pseudo)) > 0
    and char_length(pseudo) <= 24
  );
