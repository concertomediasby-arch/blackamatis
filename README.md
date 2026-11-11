# Black Amatis · EMMA 2026 Portfolio

Web portfolio for **Black Amatis**, a two-face Honda Odyssey car-audio build competing in EMMA 2026.

- **Public site**: Home, History, Theme, Installation, Bonus Point, Judge Mode, plus a print-ready A4 QR display at `/print/qr`.
- **Editor (CMS)** at `/editor`: Overview + checklist, Vehicle & Story, Components (with wiring/fuse editor), Photo Log, Bonus Requests.

See `CLAUDE.md` for the full spec, design tokens and EMMA rule data.

## Run

```bash
npm install
cp .env.example .env.local   # fill in Supabase values (optional for preview)
npm run dev                  # http://localhost:3000
npm run lint && npm run typecheck && npm run test
npm run build                # static export → out/
npm run preview              # serve out/ locally
```

## Without Supabase (preview mode)

If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are empty:

- public pages render the placeholder content from `lib/data/placeholder.ts` (unknown values stay as `[PLACEHOLDERS]`);
- `/editor` opens without login in **preview mode**: drafts are kept in this browser's localStorage and never reach the public site.

## With Supabase

The project `black-amatis` (Singapore) already exists with all migrations and the bonus seed applied.
For a fresh project:

1. Run the files in `supabase/migrations/` in order (tables, RLS, `photos` + `pdfs` buckets, bonus columns, private role helpers), then `supabase/seed.sql`.
2. Create the owner user in Supabase Auth, then add them as an editor:
   ```sql
   insert into public.editors (user_id, role) values ('<auth user id>', 'owner');
   ```
3. Set the env vars in `.env.local` (local) or in the Hostinger web app settings, and restart.

Editors save drafts (autosave every 10 s); only the `owner` role can **Publish**, which marks all drafts as published. Public pages fetch `published` rows in the browser (anon key + RLS), show a loading skeleton, an error state with retry, and fall back to placeholders for empty tables. Content changes never need a rebuild.

## Hosting

Hostinger **Premium** (static files) + Supabase (data, auth, storage). `next.config.ts` uses `output: 'export'`; there is no server runtime, so editor, publish and the evidence-pack PDF all run in the browser. Step-by-step guide (Indonesian): `docs/DEPLOY-HOSTINGER.md`.

## Structure

```
app/(public)/        public pages + glass layout
app/editor/          login + CMS (route group (cms) is auth-guarded)
app/print/qr/        A4 QR display
components/          ui/ (glass primitives), public/, editor/
lib/emma/            matrix, criteria, VW75212 fuses, bonus (+ tests)
lib/diagram.ts       layered layout for system & wiring diagrams (+ tests)
lib/supabase/        browser client, content fetch with placeholder fallback
lib/editor/data.ts   editor reads/writes (RLS-enforced)
lib/pdf/             evidence pack PDF (@react-pdf/renderer, in the browser)
public/.htaccess     folder URLs, 404, HTTPS, caching for Hostinger
supabase/migrations/ schema, RLS, storage
```
