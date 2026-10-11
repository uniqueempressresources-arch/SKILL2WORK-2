create table if not exists app_profile (
  user_id text primary key,
  full_name text not null,
  user_type text not null default 'job_seeker',
  headline text not null default '',
  bio text not null default '',
  location text not null default '',
  skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_profile_user_type_check check (user_type in ('job_seeker','student','career_changer','freelancer','artisan','employer'))
);

create index if not exists app_profile_user_type_idx on app_profile(user_type);
