-- Create recipes table
create table if not exists recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null unique,
  description text,
  ingredients jsonb,
  steps jsonb,
  macros text,
  source_files jsonb,
  macros_normalized jsonb,
  metadata jsonb,
  tags jsonb,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create households table
create table if not exists households (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  household_id uuid references households(id),
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Create weekly_plans table
create table if not exists weekly_plans (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references households(id) on delete cascade,
  week_start_date date not null,
  plan_data jsonb not null, -- Stores the daily meals { "monday": recipe_id, ... }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(household_id, week_start_date)
);

-- Enable Row Level Security
alter table recipes enable row level security;
alter table households enable row level security;
alter table profiles enable row level security;
alter table weekly_plans enable row level security;

-- Simple policies for V1 (Authenticated users can read all recipes, but only their own household data)
create policy "Recipes are viewable by everyone" on recipes for select using (true);

create policy "Users can view their own household" on households 
  for select using (id in (select household_id from profiles where id = auth.uid()));

create policy "Users can view their own profile" on profiles 
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles 
  for update using (auth.uid() = id);

create policy "Users can view their household weekly plans" on weekly_plans 
  for select using (household_id in (select household_id from profiles where id = auth.uid()));

create policy "Users can insert/update their household weekly plans" on weekly_plans 
  for all using (household_id in (select household_id from profiles where id = auth.uid()));
