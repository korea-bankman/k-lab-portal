create extension if not exists "uuid-ossp";

create type public.user_role as enum ('member', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nickname text not null unique,
  role public.user_role not null default 'member',
  department text,
  region text,
  created_at timestamptz not null default now()
);

create table public.boards (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  board_group text not null,
  description text not null default '',
  is_notice boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references public.boards(id) on delete restrict,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text not null,
  view_count integer not null default 0,
  like_count integer not null default 0,
  comment_count integer not null default 0,
  is_notice boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.job_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  base_url text not null,
  api_ready boolean not null default false,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default uuid_generate_v4(),
  hospital_name text not null,
  department text not null,
  region text not null,
  experience text not null,
  employment_type text not null,
  deadline date not null,
  original_url text not null,
  source_id uuid references public.job_sources(id),
  description text not null default '',
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique
);

create table public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.boards enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.jobs enable row level security;
alter table public.job_sources enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.notifications enable row level security;

create policy "public read boards" on public.boards for select using (true);
create policy "public read posts" on public.posts for select using (true);
create policy "public read comments" on public.comments for select using (true);
create policy "public read jobs" on public.jobs for select using (true);
create policy "members write own posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "members update own posts" on public.posts for update using (auth.uid() = author_id);
create policy "members write comments" on public.comments for insert with check (auth.uid() = author_id);
create policy "members like posts" on public.post_likes for insert with check (auth.uid() = user_id);
