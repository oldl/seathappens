# SeatHappens

Fun, colorful, no-login event registration app. Pick a pseudo, pick or draw an
avatar, optionally share your vibe, hit "Rejoindre la salle", and show up on
the public wall.

## Stack

Next.js 14 (App Router) · React · Tailwind CSS · Supabase (Postgres + public
read/insert via RLS) · deploy target: Vercel.

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates the `participants` table,
   a case-insensitive unique index on `pseudo` (blocks exact duplicates), and
   RLS policies that allow public read + public insert (no login, per spec).
3. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public key**.

## 2. Configure env vars

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to register, `http://localhost:3000/wall` for
the public wall.

## 4. Deploy to Vercel

1. Push this folder to a Git repo.
2. Import it in Vercel.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` env vars in the Vercel project
   settings (Production + Preview).
4. Deploy.

## How it works

- `app/page.tsx` — registration form (pseudo + sticker grid or draw canvas +
  optional vibe), validates pseudo/avatar client-side, stores the just-created
  participant in `sessionStorage` for a snappy wall transition, inserts into
  `participants` via Supabase, then routes to `/wall` with clear handling for
  `23505` duplicate pseudo errors.
- `app/wall/page.tsx` — server component, fetches all participants fresh on
  every request (`export const dynamic = "force-dynamic"`), while a small
  client component merges the optimistic "just joined" participant from
  `sessionStorage` so the user sees themselves instantly.
- `lib/stickers.ts` — the 12 predefined stickers are generated as tiny inline
  SVGs (shape + simple face) at build time, no image assets needed. For
  `avatar_type = "sticker"`, `avatar_value` is a sticker id like `"s3"`.
- `components/DrawCanvas.tsx` — freehand pencil canvas; on pointer-up it
  exports the drawing as a base64 PNG (`canvas.toDataURL()`), which becomes
  `avatar_value` when `avatar_type = "draw"`.
- Duplicate pseudos are blocked two ways: a unique index in Postgres
  (`lower(pseudo)`), surfaced client-side as a friendly error when the insert
  returns a `23505` unique-violation code.
- `app/wall/loading.tsx` adds a lightweight skeleton during route loading, and
  the wall also has a friendly empty state when nobody has joined yet.

## Schema changes

The registration flow now stores two extra text fields on
`participants`:
- `project_idea`
- `theme_focus`

If your Supabase project was already initialized before this change, rerun the
updated [supabase/schema.sql](/Users/olivier/Documents/projects/mini-apps/seathappens/supabase/schema.sql:1)
in the SQL editor so the new columns and relaxed insert policy are applied.

## MVP notes / good next steps

- Drawn avatars are stored as base64 PNG text directly in the `participants`
  row. Fine for an MVP; for scale, switch to Supabase Storage and store a
  URL instead.
- No image moderation/rate-limiting — add if this goes fully public.
- No realtime updates on `/wall` yet — it refetches on load/navigation. Easy
  upgrade: subscribe to `supabase.channel(...).on('postgres_changes', ...)`.
