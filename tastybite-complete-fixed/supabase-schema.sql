-- TastyBite multi-phone database
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'TastyBite',
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

create table if not exists restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_number int not null,
  seats int not null default 4,
  status text not null default 'available'
    check (status in ('available','occupied','ordering','cleaning')),
  created_at timestamptz not null default now(),
  unique(restaurant_id, table_number)
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  description text,
  category text not null default 'Mains',
  price numeric(12,2) not null check (price >= 0),
  emoji text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_id uuid not null references restaurant_tables(id),
  status text not null default 'new'
    check (status in ('new','preparing','ready','served','completed','cancelled')),
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  item_name text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  notes text,
  created_at timestamptz not null default now()
);

-- Demo restaurant
insert into restaurants(name) values ('TastyBite')
on conflict do nothing;

do $$
declare r uuid;
begin
  select id into r from restaurants order by created_at limit 1;

  insert into restaurant_tables(restaurant_id, table_number, seats)
  select r, n, case when n in (3,6) then 6 else 4 end
  from generate_series(1,8) n
  on conflict (restaurant_id, table_number) do nothing;

  insert into menu_items(restaurant_id,name,description,category,price,emoji)
  select r,* from (values
    ('Classic Cheeseburger','Beef patty, cheddar, lettuce and tomato','Burgers',249,'🍔'),
    ('Margherita Pizza','Mozzarella, tomato and basil','Pizza',299,'🍕'),
    ('Creamy Alfredo Pasta','Parmesan cream sauce','Pasta',279,'🍝'),
    ('Caesar Salad','Romaine, parmesan and croutons','Salads',189,'🥗'),
    ('Fresh Lemonade','Homemade chilled lemonade','Drinks',99,'🍋'),
    ('Chocolate Lava Cake','Warm cake with molten center','Desserts',159,'🍫'),
    ('Chicken Biryani','Spiced rice with tender chicken','Mains',329,'🍛'),
    ('French Fries','Crispy golden fries','Sides',99,'🍟')
  ) v(name,description,category,price,emoji)
  where not exists (select 1 from menu_items where restaurant_id=r);
end $$;

-- Enable realtime for the tables that need live updates.
alter table orders replica identity full;
alter table order_items replica identity full;
alter table restaurant_tables replica identity full;

do $$
begin
  begin alter publication supabase_realtime add table orders; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table order_items; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table restaurant_tables; exception when duplicate_object then null; end;
end $$;

-- DEVELOPMENT RLS:
-- This allows the frontend demo to read/write the restaurant data.
-- Before taking payments or exposing admin controls publicly, replace these
-- policies with authenticated role-based policies.

alter table restaurants enable row level security;
alter table restaurant_tables enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "demo read restaurants" on restaurants for select using (true);
create policy "demo read tables" on restaurant_tables for select using (true);
create policy "demo write tables" on restaurant_tables for update using (true);
create policy "demo read menu" on menu_items for select using (true);
create policy "demo read orders" on orders for select using (true);
create policy "demo create orders" on orders for insert with check (true);
create policy "demo update orders" on orders for update using (true);
create policy "demo read order items" on order_items for select using (true);
create policy "demo create order items" on order_items for insert with check (true);

-- Production next step:
-- Add auth.users -> staff_profiles with roles: owner/admin/waiter/kitchen.
-- Restrict menu/table/order writes by restaurant_id and staff role.
