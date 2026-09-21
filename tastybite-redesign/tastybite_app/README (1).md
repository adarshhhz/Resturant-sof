# TastyBite — Real Multi-Phone MVP

This version uses **Supabase Postgres + Realtime** so phones/screens share the same database.

## 1. Create the database

1. Create a Supabase project.
2. Open SQL Editor.
3. Paste `supabase-schema.sql`.
4. Run it.

## 2. Configure the web app

Copy `.env.example` to `.env.local`:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Get both values from Supabase Project Settings -> API.

## 3. Run locally

```bash
npm install
npm run dev
```

## 4. Deploy to Vercel

Push this folder to GitHub and import it into Vercel.

Add these Vercel Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Then redeploy.

## 5. Open each screen on different phones

Customer/table:
`https://YOUR-APP.vercel.app/?role=customer&table=TABLE_UUID`

Waiter:
`https://YOUR-APP.vercel.app/?role=waiter`

Kitchen:
`https://YOUR-APP.vercel.app/?role=kitchen`

Admin:
`https://YOUR-APP.vercel.app/?role=admin`

## Important production security note

The included SQL has intentionally open demo policies so the MVP can be tested immediately. Do NOT use those policies for a public production restaurant.

The next production layer should add Supabase Auth and a `staff_profiles` table with roles:

- owner
- admin
- waiter
- kitchen

Customers can remain anonymous/QR-based, while staff screens require login. Then RLS should enforce restaurant and role permissions.

## Intended live flow

Customer phone
  -> creates order
  -> Supabase orders/order_items
  -> Realtime
  -> Kitchen screen

Kitchen
  -> preparing
  -> ready
  -> Realtime
  -> Waiter

Waiter
  -> served
  -> completed
  -> table cleaning/available

Admin
  -> reads the same live database
  -> sales/order/table reporting
