# TastyBite — Complete Multi-Workspace Restaurant App

A React + Vite restaurant system with four workspaces:

- Customer
- Waiter
- Kitchen
- Admin

## Login

The app starts behind a shared login screen. Choose a workspace and sign in.

### Demo accounts

| Workspace | Email | Password |
|---|---|---|
| Customer | customer@tastybite.local | customer123 |
| Waiter | waiter@tastybite.local | waiter123 |
| Kitchen | kitchen@tastybite.local | kitchen123 |
| Admin | admin@tastybite.local | admin123 |

In demo mode, login is remembered in browser localStorage until logout or site data is cleared.

### Supabase authentication

Create a `.env.local` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

With these values configured, Supabase Auth is used and sessions are persisted automatically with `persistSession: true`.

For production, enforce user roles with authenticated database policies/RLS rather than trusting a client-selected workspace.

## Install and run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## GitHub / Vercel

Upload the contents of this ZIP to the repository root. Do not upload `node_modules` or `.env.local`.

For Vercel, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

as environment variables before deploying.

## Workspace URLs

The app supports the role query parameter used by the original project:

- `?role=customer`
- `?role=waiter`
- `?role=kitchen`
- `?role=admin`

A table can also be supplied for customer mode with `?role=customer&table=TABLE_UUID`.
