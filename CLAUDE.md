# CLAUDE.md — Black Amatis · EMMA 2026 Portfolio

## Project

Web portfolio for **Black Amatis**, a Honda Odyssey car-audio build in a **two-face** style, competing in **EMMA (European Mobile Media Association) 2026**. The site has two faces of its own:

1. **Public site (UI)**: for spectators and EMMA judges. Read-only, fast, mobile-friendly; reached by a QR code at the car.
2. **Editor (CMS)**: for the owner and team, behind login. Everything on the public site is edited here.

The approved prototype (design canvas) is the visual reference:
https://claude.ai/artifact/QPLWhofacbUMACm7aXsG7m

### Hosting
- Site: **https://blackamatis.concerto.id**, static export on **GitHub Pages** (public repo `concertomediasby-arch/blackamatis`, same setup as the `hub` and `dealer` subdomains). Deployed by `.github/workflows/deploy.yml` on push to `main`.
- The Hostinger plan for `concerto.id` is Website Builder (no file hosting); Hostinger is used **only for DNS**: one record `CNAME blackamatis → concertomediasby-arch.github.io`. Never change other DNS records or the nameservers.
- Data, auth and storage on **Supabase** project `black-amatis` (ref `ddxcjzykcrozxqwubexr`, region Singapore).
- Static export: `output: 'export'`, `trailingSlash: true`, `images.unoptimized`. No Route Handlers, Server Actions, middleware or `revalidatePath`.
- Public pages fetch published content in the browser (anon key + RLS) with loading skeletons and an error state. Editor is client-only (Supabase Auth). Evidence-pack PDF is built in the browser (`@react-pdf/renderer`).
- Public build values in `.env.production` (committed, public by design). Never commit a service-role / secret key; the repo is public.
- `NEXT_PUBLIC_SITE_URL` = `https://blackamatis.concerto.id`; the print QR is generated from it at build time.
- Deploy guide (Indonesian): `docs/DEPLOY.md`.

### Open decision
The car is lime green + black with gold, purple and white line art; the site palette is Prussian / amber / lemon. Do not change the design tokens until the user decides whether to switch to the car's colours.

### Working rules
- Talk to the user in **Indonesian**. All site copy is in **English**.
- **Never invent product specs, scores, dates or names.** Unknown values stay as visible placeholders like `[BRAND / MODEL]`, `[__ mm²]`, `[OWNER NAME]` until the editor fills them.
- EMMA rule numbers in this file come from the *EMMA Install Judge Book 2026* and *EMMA Rulebook 2026*. Do not change them without a newer rulebook.
- No "Face 01 / Face 02" labels anywhere in the UI; the two faces are shown through colour only.
- No logo mark: the brand is the wordmark **BLACK AMATIS** alone.
- Small, reviewable commits. Run lint, typecheck and tests before each commit.

## Stack

- **Next.js 15** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** for styling, with design tokens below as CSS variables
- **Supabase**: Postgres (content), Auth (editor login), Storage (photos, PDFs)
- **Zod** for form/data validation, **React Hook Form** in the editor
- `next/font/local` with self-hosted @fontsource variable fonts (no Google Fonts fetch at build), `next/image` for all photos
- `qrcode` package to generate the QR for the print display
- Hosting on **GitHub Pages** (static export) + **Supabase** (data, auth, storage); DNS at Hostinger. No Vercel.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck  # tsc --noEmit
npm run test       # vitest
npm run build
```

Env vars (`.env.local`, never commit):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=        # used for the QR code
```

## Folder structure

```
app/
  (public)/
    page.tsx                 # Home
    history/page.tsx
    theme/page.tsx
    installation/page.tsx
    bonus/page.tsx
    judge/page.tsx           # Judge Mode
    layout.tsx               # glass header + footer + background orbs
  editor/
    login/page.tsx
    layout.tsx               # sidebar shell, auth guard
    page.tsx                 # Overview
    vehicle/page.tsx         # Vehicle & Story
    components/page.tsx
    photos/page.tsx          # Photo Log
    bonus/page.tsx
  print/qr/page.tsx          # A4 QR display, print-ready
components/
  ui/                        # GlassPanel, Pill, SegmentedTabs, Placeholder, ...
  public/                    # Hero, SystemDiagram, WiringDiagram, SpecPopover, BeforeAfter, ...
  editor/                    # Field, UploadZone, ComponentList, ...
lib/
  emma/                      # matrix.ts, criteria.ts, fuses.ts, bonus.ts, bonus-locations.ts (rule data + helpers)
  supabase/                  # client.ts, server.ts, queries.ts
  types.ts
supabase/migrations/
```

## Design tokens

### Colours (two palettes = two faces)
| Token | Hex | Use |
|---|---|---|
| `--prussian` | `#000231` | Dark face background, primary buttons in editor |
| `--prussian-2` | `#011435` | Dark panels |
| `--navy` | `#00006A` | Accent on light surfaces, background glow |
| `--amber` | `#E5A90A` | Accent on dark (eyebrows, arrows, links, CTA) |
| `--black` | `#000000` | Light-face text, light-face CTA |
| `--lemon` | `#FEF112` | Light face background, light glass |
| `--pale-amber` | `#E6DF63` | Secondary light accent |
| `--text` | `#F2F0E6` | Body text on dark |
| `--text-muted` | `#C9C6CF` / `#BFBDC8` | Secondary text on dark |
| `--text-dark-muted` | `#2E2E34` | Secondary text on lemon |

Contrast: body text ≥ 4.5:1 on every glass panel. Muted grey on dark must stay at `#BFBDC8` or lighter.

### Type
- Display: **Big Shoulders Display** 700/800/900 (headings, big numbers, wordmark)
- Body: **Inter** 400/500/600/700
- Labels / eyebrows / data: **JetBrains Mono** 400/500, uppercase, letter-spacing 0.12–0.16em

### Glassmorphism
```css
.glass-dark  { background: rgba(1,20,53,.62); backdrop-filter: blur(24px) saturate(140%);
               border: 1px solid rgba(255,255,255,.14);
               box-shadow: 0 20px 60px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1); }
.glass-light { background: rgba(254,241,18,.84); backdrop-filter: blur(24px) saturate(140%);
               border: 1px solid rgba(255,255,255,.6);
               box-shadow: 0 20px 60px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.8); color: #000; }
```
- Page background: `--prussian` with large blurred orbs (amber ~0.3 opacity, navy ~0.9, lemon ~0.16, `filter: blur(120–150px)`).
- Radii: panels 32–36px, cards 24–28px, header/footer pill 32px, buttons 999px.
- Alternate dark glass and lemon glass between sections, so the two faces read down the page.
- Provide a `@supports not (backdrop-filter: blur(1px))` fallback with more opaque panels.
- Respect `prefers-reduced-motion`.

### Editor look
Calm and functional, not glass: surface `#F4F2EC`, cards white with `#D9D6CC` borders, sidebar `--prussian`, active item lemon with prussian text, primary button prussian with lemon text.

## Public pages

Shared: floating glass header (wordmark, nav: History · Theme · Installation · Bonus Point · Judge Mode, `EMMA 2026 · [CATEGORY]` pill), glass footer with prev/next links. Fluid layout, max-width ~1280–1360px, works at 360px wide.

### Home `/`
- **Hero** (inspired by a product-landing layout): huge word **AMATIS** behind a cut-out car photo (transparent PNG; silhouette until uploaded), splatter dots around the car. Left glass card: tag line + "ONE CAR. TWO FACES." + short copy. Right glass card: **Choose face** (two round swatches) + **Category** chips E/S/M/X. Bottom row: social icons, "Scroll to explore", CTA "View installation ↗". Top: glass nav pill + "Contact".
- **Face toggle** switches the whole hero: dark face = prussian bg, amber word, light text; light face = lemon bg, black word, black text. Glow orbs and glass tints switch too. Animate background/colour 0.5s.
- Vehicle data strip (Car, Year, EMMA category, Owner, Installer), project statement, four page cards, **Team & partners** (4 people + 6 partner logos), footer with `id="contact"`.

### History `/history`
- **Before/after slider** with tabs Exterior / Dashboard / Trunk. Accessible: real `<input type="range">` plus keyboard support.
- Build timeline (from DB), competition history table (event, city, category, install points, result).

### Theme `/theme`
- Two-face split hero (dark glass + lemon glass cards) with the dark/light side descriptions.
- "The theme in every zone": Exterior / Interior / Trunk cards mapped to judge criteria *Overall design*, *Design of interior*, *Design of trunk*.
- Sketches & moodboard grid.
- No palette/material section (removed on purpose).

### Installation `/installation`
In this order:
1. **System diagram — Signal flow**: if the team uploaded their own diagram image (editor › Components › *System diagram image*, `vehicle.system_diagram_path` + `system_diagram_alt`), it is shown first with *Open full size*; the interactive diagram below stays as a second tab (*Specs per product*). Devices on the image are clickable: in the editor, pick a component and drag a box over it (several boxes per component allowed; stored in `components.hotspots` as % of the image); a click opens that component's spec popover (beside the device on wide screens, below the image on phones). The interactive diagram: Head Unit → DSP → Amplifier A / Amplifier B → Tweeter, Midrange, Midbass (from Amp A) and Subwoofer (from Amp B). Default front stage is 3-way; it must be data-driven.
2. **Wiring diagram — Power & fuses**: Main Battery → Main Fuse (≤ 40 cm from + post) → Distribution → Amp A, Amp B, DSP, Head Unit; dashed line to Chassis Ground. Cable size labels on links, `[__ mm²] · [__ A]` on each output.
   - If the team uploaded their own cable diagram (`vehicle.wiring_diagram_path`), it is shown first. Its clickable areas belong to **circuits** (table `circuits`, editor › Components › *Cable diagram circuits*): a *main run* (Battery + → main fuse → ultracap → VSS → fuse → distribution; Battery − → … → ground block) and one *circuit* per device that continues from a main run. A click opens the circuit card: power (+) and ground (−) runs with cable name, AWG, length and fuses, signal (RCA) and speaker cables, and a VW75212 check of every fused cable against the nearest fuse before it (by AWG; cables before the first fuse against the 40 cm rule). The generated diagram stays as the second tab (*Cable sizes & fuses*).
3. **Photo log — "Behind the panels"** (lemon glass): area tabs Engine Bay, Doors, Dashboard, Trunk, Under Floor; each photo has a code (`EB-01`), caption and a "✓ proves: <criterion>" pill.
4. **Craftsmanship close-up**: tabs Wiring, Head Unit, Amplifiers, Speakers, Other Components; 3 close-ups + "What to look at" checklist; note "M: 2 pts · X: 10 pts per category".

Diagrams: render as SVG (lines/arrows) with HTML buttons for products positioned over it; horizontal scroll inside a rounded container on small screens.

**Spec popover** (not a modal): clicking a product opens a small glass panel **next to that card** inside the diagram (right side if it fits, else left), with photo thumb, role, title, brand/model, spec rows, an EMMA note and "Download spec sheet (PDF)". Active card gets an amber ring. Close via the same card, the × button, Esc, or clicking another product. Focus moves into the popover and back on close; `aria-expanded` on the card.

Spec fields by type:
- Head unit: Type, Outputs, Digital output, Screen/control, Power fuse, Mounting location
- DSP: Inputs, Outputs, Sample rate, Control, Power fuse, Mounting location
- Amplifier: Channels, RMS @ 4Ω, RMS @ 2Ω, Class, Power cable, Fuse, Mounting location
- Speaker/sub: Size, Impedance, RMS power, Sensitivity, Frequency response, Mounting location, Driven by
- Battery: Type, Capacity (Ah), CCA, Location, Positive cable
- Main fuse: Fuse type, Rating, Distance to + post, Cable size, Cover
- Distribution: Inputs, Outputs, Fuse ratings, Cable sizes, Location

### Bonus Point `/bonus`
- Hero copy: "Our bonus requests cover the whole car: glass, lights, rims, body, cabin and trunk. Each request is worth up to 3 points: 1 for the idea, plus 1 for average or 2 for good execution."
- Four eligible elements: A Highlight components, B Attract spectators (no noise), C Normal everyday use, D Creative presentation.
- **Request list** inside a lemon glass panel, a read-only showcase (no scores, Submit ticks or estimate on the public page; those stay in the editor):
  - Filter pills with counts: All · Glass · Lights · Rims & Wheels · Body · Interior · Trunk & Audio · (New, shown when it has rows).
  - Row: photo thumb · code (auto: group prefix + number, e.g. `L05`; new ones `N62…`) · group · element A–D · name · buttons **Idea · Process · Result**.
  - Each button opens a panel under the row: **Idea** = text (`description`); **Process** = numbered photos/videos, each with a caption (`process` jsonb); **Result** = photos/videos with captions (`result` jsonb). Videos: uploaded file or link (YouTube plays inline, other links open in a new tab).
- Editor › Bonus Requests keeps the class limits: Limited ≤ 20 requests / 15 pts, Unlimited ≤ 50 requests / 100 pts, with "Submitted n / max".
- `strength` is editor-only and never reaches a public page (column not readable by `anon`; stripped in queries).
- Group codes: Glass `G`, Lights `L`, Rims & Wheels `R`, Body `B`, Interior `I`, Trunk & Audio `T`, New `N`. New requests are numbered after the 61-spot location catalogue (`lib/emma/bonus-locations.ts`).

### Judge Mode `/judge`
- Category selector E / S / M / X / X Unl → max points and judged criteria from the matrix.
- "Evidence ready" progress bar (points with ticked evidence ÷ max). Ticks are stored per editor in the DB; on the public page they are read-only.
- Key-rule cards: 40 cm main fuse, 7 min explanation (15 min X Unl), 3 min to show all fuses, 3 pts max per bonus request.
- Criteria grouped (Presentation & Documentation, Electrical & Safety, Mounting & Function, Design & Craftsmanship); each row: tick, name, what judges check, evidence + link ("View in Installation · Photo log"), and a **MAX PTS** label above the number. Group header shows "NN PTS MAX".
- Button "Download evidence pack (PDF)": generated in the browser from the published data.

### Print QR display `/print/qr`
A4 portrait (210×297 mm), lemon background, "SCAN TO SEE WHAT'S INSIDE.", large real QR to `NEXT_PUBLIC_SITE_URL`, a list of what's on the site, "Questions about the build? Ask us — the team is right here.", prussian footer band with URL, Instagram, installer. Use `@page { size: A4; margin: 0 }` and print colours.

## EMMA rule data (`lib/emma/`)

Installation matrix (max points per class; `—` = not judged):

| Criterion | E | S | M | X | X Unl |
|---|---|---|---|---|---|
| Presentation to the public | 10 | 10 | 10 | 10 | 10 |
| Bonus presentation to the public | — | — | 5 | 5 | 5 |
| Cleanliness | 6 | 6 | 6 | 6 | 6 |
| System / wiring diagram | 4 | 4 | — | — | — |
| System documentation | — | — | 10 | 10 | 10 |
| Explanation of system to the judges | — | — | 5 | 10 | 10 |
| Main fuse(s) present | 10 | 10 | 10 | 10 | 10 |
| All wires to components fused | — | 15 | 15 | 15 | 15 |
| Fuse value appropriate | — | 20 | 20 | 20 | 20 |
| Interior wires invisible | — | 5 | 5 | 5 | 5 |
| Wires properly terminated | — | — | 5 | 5 | 5 |
| Wire terminations protected | — | — | 10 | 10 | 10 |
| Wires protected from damage | — | — | 5 | 5 | 5 |
| All components securely mounted | 24 | 24 | 24 | 24 | 24 |
| Protection of speakers | 5 | 5 | 5 | 5 | — |
| Normal use of the vehicle | — | 6 | 6 | 6 | — |
| First optic impression | 10 | 10 | 10 | 10 | 10 |
| Craftsmanship | — | — | 10 | 50 | 50 |
| Design of interior | — | — | — | 5 | 10 |
| Design of trunk | — | — | — | 5 | 10 |
| Overall design of vehicle | — | — | — | — | 10 |
| Bonus points | — | — | — | 15 | 100 |
| **Total** | **69** | **115** | **161** | **231** | **325** |

Classes: E = Entry, S = Skilled, M = Master, X = Expert, X Unl = Expert Unlimited. **Write a unit test that the column sums equal the totals.**

Fuse table (VW75212, rating by smallest cable in the circuit):
0.5 mm²/20 AWG → 10 A · 1.0/17 → 15 A · 1.5/15 → 20 A · 2.5/13 → 20 A · 4.0/11 → 30 A · 6.0/9 → 50 A · 10/7 → 60 A · 16/5 → 100 A · 25/4 → 125 A · 35/2 → 175 A · 50/0 → 250 A · 70/2-0 → 300 A.

Other rules used in the UI: main fuse ≤ 40 cm from each positive battery post; all component fuses shown within 3 minutes total; explanation max 7 min (15 min X Unl), no videos, −1 pt per 30 s over; bonus max 3 pts per request (1 idea, +1 average or +2 good execution), Limited max 20 requests / 15 pts, Unlimited max 50 requests / 100 pts; sound improvements are not bonus.

## Data model (Supabase)

```
vehicle(id, name, model, year, category, class, event, dark_side_name, light_side_name, car_photo_path, car_photo_layout jsonb,
        statement, owner, installer, designer, tuner, instagram, website, updated_at)
milestones(id, when_label, title, body, photo_path, sort)
competitions(id, event, city, category, install_points, result, date)
components(id, key, title, role, type, brand, model, specs jsonb, photo_path, pdf_path, hotspots jsonb,
           in_system boolean, in_wiring boolean, sort)
wiring_links(id, from_key, to_key, cable_mm2, fuse_a)
tuning(id, driver, hpf_hz, lpf_hz, slope_db, time_align_ms, eq_bands, sort)
photos(id, area, code, caption, proves_criterion, path, sort)
craft_photos(id, category, caption, path, sort)
bonus_requests(id, no, code, "group", title, element, description, photo_path, submit boolean,
               idea boolean, execution int, strength ('strong'|'medium'|'weak'|'unlikely'), process jsonb, result jsonb, sort)
judge_evidence(criterion_key, ready boolean, note, updated_by, updated_at)
team(id, role, name, line, photo_path, sort)
moodboard_items(id, caption, path, sort)
partners(id, name, logo_path, url, sort)
before_after(id, view, before_path, after_path)
circuits(id, name, kind ('trunk'|'channel'), component_key, power_from, ground_from,
         power jsonb, ground jsonb, cables jsonb, wiring_hotspots jsonb, sort)
```
- RLS: public `select` on all content tables; `insert/update/delete` only for authenticated editors (table `editors(user_id, role)` with `owner | editor`). Only `owner` can publish.
- Storage buckets: `photos` (public read), `pdfs` (public read). Resize uploads to max 2400 px, WebP.
- Draft/publish: content tables carry `status ('draft'|'published')`; public pages read only `published` (fetched live in the browser, so no rebuild on publish).

## Editor (CMS) `/editor`

Login: passwordless one-time code by email (Supabase email OTP, `shouldCreateUser: false`; the Magic Link email template shows `{{ .Token }}` and a sign-in link). Sidebar: Overview · Vehicle & Story · History · Theme · Components · Photo Log · Bonus Requests. Top bar: status ("Draft · unpublished changes"), **View public site**, **Save draft**, **Publish**.
- **Overview**: a card per public page (status, last edited by/when, Edit, Preview) + pre-event checklist + link to Judge Mode.
- **Vehicle & Story**: vehicle fields, category/class selects, dark/light side names, statement (≤ 80 words, counter), team & links, timeline list with add/edit/reorder.
- **Components**: list on the left (select, add, reorder), form on the right: brand, model, type-specific spec fields, photo upload (transparent PNG), PDF upload, "Show in System / Wiring diagram" checkboxes; wiring link editor for cable size and fuse per link with an inline warning when the fuse exceeds the VW75212 table for that cable.
- **History**: before/after photo pairs (Exterior, Dashboard, Trunk); competition table (event, city, category, install points, result, date).
- **Theme**: theme zones (name, photo, up to 8 theme elements each); sketches & moodboard (up to 8 images, first one large).
- No tuning section (removed on purpose from the Installation page and the editor; the `tuning` table and `vehicle.tuning_*` columns are kept but unused).
- **Photo Log**: area tabs, slots with upload, caption, "Proves" select (criteria list), add slot, drag to reorder; craftsmanship close-ups (3 per category).
- **Vehicle & Story** also edits partner logos (name, logo, optional link).
- Photo positioning: every cropped photo has a **crop focus** (click the important point; stored as `#fp=x,y` on the photo path, applied as `object-position`). The hero car photo has its own **position & size** per screen (desktop / phone; drag or sliders with a live preview), stored in `vehicle.car_photo_layout`.
- Public pages show a pencil on each editable section for signed-in editors (Edit mode bar can hide them); a pencil deep-links to the editor field.
- **Bonus Requests**: table (code, name, group, element A–D, strength badge, photo, Submit, Edit) + drawer. "New request" offers a location picker (61-spot catalogue) or free text, element, strength, description, photo. Counter "Submitted n / max" with a warning above the class limit.
- Every form: labels, inline Zod errors, autosave draft every 10 s, unsaved-changes guard.

## Accessibility & quality
- Real `<button>`, `<a>`, `<label>`; tab order follows the page; visible focus ring (amber on dark, prussian on lemon).
- Touch targets ≥ 44 px. `aria-pressed` on toggles, `aria-expanded` on product cards, `role="dialog"` on the spec popover.
- Diagrams also exist as a text list for screen readers.
- Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO for the public pages.
- Open Graph image and metadata per page.

## Build order
1. Scaffold Next.js + Tailwind + tokens + fonts; glass primitives; public layout (header, footer, orbs).
2. `lib/emma` data + tests (matrix sums, fuse lookup, bonus calculator).
3. Public pages with static placeholder data: Home → Installation (diagrams + popover) → Judge → History → Theme → Bonus.
4. Supabase schema, RLS, storage; swap static data for queries.
5. Editor: auth, shell, then Vehicle → Components → Photo Log → Bonus → Overview; draft/publish.
6. Print QR page, evidence-pack PDF, OG images, Lighthouse pass, deploy to GitHub Pages.
