# TastyBite — Complete Multi-Workspace Restaurant App

A React + Vite restaurant system with four workspaces:

- Customer
- Waiter
- Kitchen
- Admin

## Login

There is a single login screen — just email and password. There is no
workspace picker anymore: after sign-in, the app looks up the email in the
`staff` table (which holds staff **and** customers) and automatically opens
the matching workspace (Customer, Waiter, Kitchen or Admin).

### Adding people (staff or customers)

For every person who should be able to log in:

1. In the Supabase dashboard, go to **Authentication → Users → Add user**
   and create them with their email (Gmail works fine) and a password.
2. In the app, sign in as Admin → **Staff & Customer Directory** → **Add
   Staff or Customer**, using the *same* email, and pick their **Login
   Access** (Customer / Waiter / Kitchen / Admin).

Once both steps are done, that person just enters their email and password
on the single login screen and lands in the right workspace automatically.
You can also add/edit rows directly in the Supabase Table Editor's `staff`
table.

### Demo accounts (no Supabase configured)

| Workspace | Email | Password |
|---|---|---|
| Customer | customer@tastybite.local | customer123 |
| Waiter | waiter@tastybite.local | waiter123 |
| Kitchen | kitchen@tastybite.local | kitchen123 |
| Admin | admin@tastybite.local | admin123 |

In demo mode the role is still auto-detected from the email you type — just
without a real backend. Login is remembered in browser localStorage until
logout or site data is cleared.

### Supabase authentication

Create a `.env.local` file from `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

With these values configured, Supabase Auth is used, sessions persist
automatically (`persistSession: true`), and roles come from the `staff`
table (see `supabase-schema.sql` — run it once in the SQL Editor to create
the table, or re-run just the new `staff` section if you already have the
other tables).

The current RLS policies on `staff` are intentionally open (`using (true)`)
so the app can resolve anyone's role right after they log in. Before going
to production, tighten these to restrict writes to admins only.

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
