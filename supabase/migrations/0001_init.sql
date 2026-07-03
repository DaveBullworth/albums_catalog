-- ============================================================
-- Resonance — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ============================================================

-- ---------------------- profiles ----------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- ----------------------- albums -----------------------------
create table if not exists public.albums (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  spotify_id     text,
  name           text not null,
  artist         text not null,
  year           int,
  cover_url      text,
  dominant_color text,
  review         text,
  liked          boolean not null default false,
  favorite       boolean not null default false,
  spotify_url    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists albums_user_idx on public.albums (user_id);
create index if not exists albums_user_created_idx on public.albums (user_id, created_at desc);

-- ----------------------- tracks -----------------------------
create table if not exists public.tracks (
  id          uuid primary key default gen_random_uuid(),
  album_id    uuid not null references public.albums (id) on delete cascade,
  position    int not null,
  name        text not null,
  spotify_url text,
  starred     boolean not null default false
);

create index if not exists tracks_album_idx on public.tracks (album_id, position);

-- ---------------- keep albums.updated_at fresh --------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists albums_touch_updated_at on public.albums;
create trigger albums_touch_updated_at
  before update on public.albums
  for each row execute function public.touch_updated_at();

-- ---------- auto-create a profile on user signup ------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'user')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- helper: is the current user an admin? -----------
-- Defined after the tables exist (an SQL-language function body is validated
-- at creation time). SECURITY DEFINER so it bypasses RLS and never recurses
-- into the profiles policies below.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.albums   enable row level security;
alter table public.tracks   enable row level security;

-- profiles: a user sees their own row; admins see everyone.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (id = auth.uid());

-- albums: full CRUD on your own; admins may read all.
drop policy if exists albums_select on public.albums;
create policy albums_select on public.albums
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists albums_insert on public.albums;
create policy albums_insert on public.albums
  for insert with check (user_id = auth.uid());

drop policy if exists albums_update on public.albums;
create policy albums_update on public.albums
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists albums_delete on public.albums;
create policy albums_delete on public.albums
  for delete using (user_id = auth.uid());

-- tracks: scoped through the owning album.
drop policy if exists tracks_select on public.tracks;
create policy tracks_select on public.tracks
  for select using (
    exists (
      select 1 from public.albums a
      where a.id = tracks.album_id
        and (a.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists tracks_write on public.tracks;
create policy tracks_write on public.tracks
  for all using (
    exists (
      select 1 from public.albums a
      where a.id = tracks.album_id and a.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.albums a
      where a.id = tracks.album_id and a.user_id = auth.uid()
    )
  );
