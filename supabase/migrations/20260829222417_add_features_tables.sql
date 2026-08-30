-- Catalog tables (shared reference data, not user-owned)
create table if not exists standard_features (
  id bigint generated always as identity primary key,
  name text not null,
  keywords text[]
);

create table if not exists standard_tasks (
  id bigint generated always as identity primary key,
  feature_id bigint not null references standard_features(id) on delete cascade,
  title text not null,
  description text,
  recur_frequency text check (recur_frequency in ('daily','weekly','monthly','yearly')),
  recur_anchor text check (recur_anchor in ('due_date','completion'))
);

-- Join table: which features a given property has
create table if not exists property_features (
  property_id uuid not null references properties(id) on delete cascade,
  feature_id bigint not null references standard_features(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (property_id, feature_id)
);

-- RLS
alter table standard_features enable row level security;
alter table standard_tasks enable row level security;
alter table property_features enable row level security;

-- Catalog tables: any authenticated user can read; only service role writes
create policy "Authenticated users can read standard_features"
  on standard_features for select
  to authenticated
  using (true);

create policy "Authenticated users can read standard_tasks"
  on standard_tasks for select
  to authenticated
  using (true);

-- property_features: only accessible for properties the user owns
create policy "Users manage features on their own properties"
  on property_features for all
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_features.property_id
      and properties.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from properties
      where properties.id = property_features.property_id
      and properties.user_id = auth.uid()
    )
  );