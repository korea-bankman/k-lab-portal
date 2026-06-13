alter type public.user_role add value if not exists 'manager';

alter table public.posts add column if not exists hidden_at timestamptz;
alter table public.posts add column if not exists hidden_by uuid references public.profiles(id);
alter table public.posts add column if not exists deleted_at timestamptz;
alter table public.posts add column if not exists deleted_by uuid references public.profiles(id);

alter table public.comments add column if not exists hidden_at timestamptz;
alter table public.comments add column if not exists hidden_by uuid references public.profiles(id);
alter table public.comments add column if not exists deleted_at timestamptz;
alter table public.comments add column if not exists deleted_by uuid references public.profiles(id);

create table if not exists public.manager_board_permissions (
  id uuid primary key default uuid_generate_v4(),
  manager_id uuid not null references public.profiles(id) on delete cascade,
  board_id uuid not null references public.boards(id) on delete cascade,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (manager_id, board_id)
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  handled_by uuid references public.profiles(id),
  handled_at timestamptz,
  created_at timestamptz not null default now(),
  constraint reports_target_check check (post_id is not null or comment_id is not null)
);

create table if not exists public.moderation_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  action text not null,
  reason text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

create or replace function public.is_manager_for_board(user_id uuid, target_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_admin(user_id)
    or exists (
      select 1 from public.manager_board_permissions
      where manager_id = user_id and board_id = target_board_id
    );
$$;

alter table public.manager_board_permissions enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_logs enable row level security;

drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles for update using (public.is_admin(auth.uid()));

drop policy if exists "managers moderate posts" on public.posts;
create policy "managers moderate posts" on public.posts for update using (public.is_manager_for_board(auth.uid(), board_id));

drop policy if exists "managers moderate comments" on public.comments;
create policy "managers moderate comments" on public.comments for update using (
  exists (
    select 1 from public.posts
    where posts.id = comments.post_id
      and public.is_manager_for_board(auth.uid(), posts.board_id)
  )
);

drop policy if exists "admins manage manager permissions" on public.manager_board_permissions;
create policy "admins manage manager permissions" on public.manager_board_permissions for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists "managers read own permissions" on public.manager_board_permissions;
create policy "managers read own permissions" on public.manager_board_permissions for select using (manager_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "members create reports" on public.reports;
create policy "members create reports" on public.reports for insert with check (auth.uid() = reporter_id);

drop policy if exists "managers read reports" on public.reports;
drop policy if exists "moderators read reports" on public.reports;
create policy "moderators read reports" on public.reports for select using (
  public.is_admin(auth.uid())
  or exists (
    select 1 from public.posts
    where posts.id = reports.post_id
      and public.is_manager_for_board(auth.uid(), posts.board_id)
  )
);

drop policy if exists "moderators write logs" on public.moderation_logs;
create policy "moderators write logs" on public.moderation_logs for insert with check (actor_id = auth.uid());
