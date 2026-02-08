-- PulseTrack Supabase schema

create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz default now()
);

create table if not exists terms (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  term_id uuid references terms(id) on delete set null,
  name text not null,
  color text,
  instructor text,
  office_hours text,
  location text,
  credits numeric default 3,
  created_at timestamptz default now()
);

create table if not exists class_resources (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  label text,
  url text,
  created_at timestamptz default now()
);

create table if not exists syllabus_uploads (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  file_name text,
  created_at timestamptz default now()
);

create table if not exists syllabus_items (
  id uuid primary key default uuid_generate_v4(),
  upload_id uuid references syllabus_uploads(id) on delete cascade,
  type text,
  title text,
  date date,
  time text,
  ambiguous boolean default false,
  notes text,
  created_at timestamptz default now()
);

create table if not exists assignments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  due_time text,
  category text,
  status text,
  priority text,
  tags text[] default '{}',
  reminder_offsets int[] default '{}',
  weight numeric default 0,
  grade numeric,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists study_logs (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete cascade,
  minutes int,
  date date,
  created_at timestamptz default now()
);

create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  content text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists grade_scales (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  active boolean default false,
  created_at timestamptz default now()
);

create table if not exists grade_ranges (
  id uuid primary key default uuid_generate_v4(),
  scale_id uuid references grade_scales(id) on delete cascade,
  label text,
  min numeric,
  max numeric
);

create table if not exists weight_categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  label text,
  weight numeric
);

create table if not exists changelog (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  type text,
  message text,
  at timestamptz default now()
);

alter table profiles enable row level security;
alter table terms enable row level security;
alter table classes enable row level security;
alter table class_resources enable row level security;
alter table syllabus_uploads enable row level security;
alter table syllabus_items enable row level security;
alter table assignments enable row level security;
alter table study_logs enable row level security;
alter table notes enable row level security;
alter table grade_scales enable row level security;
alter table grade_ranges enable row level security;
alter table weight_categories enable row level security;
alter table changelog enable row level security;

create policy "Users can manage own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own terms" on terms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own classes" on classes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage class resources" on class_resources
  for all using (
    exists(select 1 from classes where classes.id = class_resources.class_id and classes.user_id = auth.uid())
  ) with check (
    exists(select 1 from classes where classes.id = class_resources.class_id and classes.user_id = auth.uid())
  );

create policy "Users manage syllabus uploads" on syllabus_uploads
  for all using (
    exists(select 1 from classes where classes.id = syllabus_uploads.class_id and classes.user_id = auth.uid())
  ) with check (
    exists(select 1 from classes where classes.id = syllabus_uploads.class_id and classes.user_id = auth.uid())
  );

create policy "Users manage syllabus items" on syllabus_items
  for all using (
    exists(
      select 1 from syllabus_uploads
      join classes on classes.id = syllabus_uploads.class_id
      where syllabus_uploads.id = syllabus_items.upload_id and classes.user_id = auth.uid()
    )
  ) with check (
    exists(
      select 1 from syllabus_uploads
      join classes on classes.id = syllabus_uploads.class_id
      where syllabus_uploads.id = syllabus_items.upload_id and classes.user_id = auth.uid()
    )
  );

create policy "Users manage own assignments" on assignments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage study logs" on study_logs
  for all using (
    exists(select 1 from assignments where assignments.id = study_logs.assignment_id and assignments.user_id = auth.uid())
  ) with check (
    exists(select 1 from assignments where assignments.id = study_logs.assignment_id and assignments.user_id = auth.uid())
  );

create policy "Users manage own notes" on notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage grade scales" on grade_scales
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage grade ranges" on grade_ranges
  for all using (
    exists(select 1 from grade_scales where grade_scales.id = grade_ranges.scale_id and grade_scales.user_id = auth.uid())
  ) with check (
    exists(select 1 from grade_scales where grade_scales.id = grade_ranges.scale_id and grade_scales.user_id = auth.uid())
  );

create policy "Users manage weight categories" on weight_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage changelog" on changelog
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
