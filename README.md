# SPECTRA — a spec-first laptop store

A complete, production-shaped e-commerce storefront for laptops: React + Vite on the front, Supabase (Postgres + Auth + Realtime) on the back. It ships with a real catalog of **50 laptops**, advanced filtering and instant search, a persistent cart with live tax/shipping math, email sign-up with a **6-digit verification code**, a **one-time admin claim** that locks forever, and a hidden admin panel that edits inventory, copy, theme colors, and the checkout link — with every change broadcasting to all open sessions over realtime, no reload.

This is not a mockup. Wire up a free Supabase project (about ten minutes, below) and it runs.

---

## What you get

- **Storefront** — hero with a live catalog "spec plate", featured grid, and four purpose tiles (Gaming / Business / Creator / Everyday).
- **Catalog** — instant client-side search across brand, model, CPU, GPU, and category; filters for purpose, price range, brand (with counts), memory, storage, graphics type, and stock; four sort orders.
- **Product pages** — full machined spec table with a generated "anodized lid" artwork per model (no external image dependencies; admins can override with a real image URL).
- **Cart** — slide-out drawer, quantity controls, subtotal + configurable tax + shipping with a free-shipping progress meter, and a checkout button that redirects to a payment provider you set. Cart survives reloads via `localStorage`.
- **Auth** — email + password sign-up, activated by a one-time 6-digit code sent by email; sign-in detects an unactivated account and routes back to verification; resend with a 60-second cooldown.
- **One-time admin** — visit `/admin-setup` once, claim the single master admin seat, and that route locks permanently. The lock lives in the database, so it holds across every device and browser.
- **Admin panel** at `/portal-management` (hidden; no link unless you're the admin) — five tabs: Overview, Inventory (full CRUD + stock/featured toggles), Content (site name, announcement, hero copy, banner), Theme (live color editing), System (checkout URL, tax, shipping).
- **Realtime everywhere** — inventory edits, content changes, theme changes, and pricing rules all push to every connected browser instantly.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Build / dev | Vite 6 |
| UI | React 18, React Router 6 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) with a runtime CSS-variable theme layer |
| Backend | Supabase — Postgres, Auth, Realtime |
| Fonts | Space Grotesk (display), IBM Plex Sans (body), IBM Plex Mono (specs) |

No build step beyond Vite, no CSS framework config file — Tailwind v4 is configured inline in `src/index.css`.

---

## Directory structure

```
spectra/
├── index.html                  # entry, Google Fonts, favicon
├── package.json
├── vite.config.js
├── vercel.json                 # SPA rewrite for Vercel
├── .env.example                # copy to .env and fill in
├── public/
│   └── _redirects              # SPA fallback for Netlify
├── scripts/
│   ├── laptops.js              # the 50-laptop dataset (source of truth)
│   ├── seed.mjs                # Node seeder (uses service-role key)
│   └── generate-seed-sql.mjs   # regenerates supabase/seed.sql from laptops.js
├── supabase/
│   ├── schema.sql              # tables, functions, RLS, realtime — run first
│   └── seed.sql                # 50 INSERTs, safe to re-run — run second
└── src/
    ├── main.jsx
    ├── App.jsx                 # providers + routes
    ├── config.js               # DEFAULT_CHECKOUT_URL, route names, defaults
    ├── index.css               # Tailwind v4 + theme tokens + component classes
    ├── lib/
    │   ├── supabase.js         # client + isSupabaseConfigured guard
    │   └── format.js           # money, spec buckets, categories
    ├── context/
    │   ├── SiteConfigContext.jsx   # settings + realtime + theme engine
    │   ├── AuthContext.jsx         # session + admin status
    │   ├── ProductsContext.jsx     # catalog + realtime
    │   └── CartContext.jsx         # cart + persistence + totals
    ├── components/
    │   ├── Navbar.jsx  Footer.jsx  ScrollToTop.jsx  SetupNotice.jsx
    │   ├── LaptopLid.jsx  ProductCard.jsx  FilterSidebar.jsx
    │   ├── CartDrawer.jsx  AdminRoute.jsx
    │   └── admin/
    │       ├── OverviewTab.jsx  InventoryTab.jsx  ContentTab.jsx
    │       ├── ThemeTab.jsx  SystemTab.jsx  ProductFormModal.jsx
    └── pages/
        ├── Home.jsx  Catalog.jsx  ProductDetail.jsx
        ├── Login.jsx  Register.jsx  VerifyEmail.jsx
        ├── AdminSetup.jsx  AdminPanel.jsx  NotFound.jsx
```

---

## Setup

### 1. Create a Supabase project
At [supabase.com](https://supabase.com) → New project. Once it's provisioned, open **Project Settings → API** and keep these handy:
- **Project URL**
- **anon public** key
- **service_role** key (only if you want to seed from Node — never ship this to the browser)

### 2. Run the schema
Open the **SQL Editor**, paste the entire contents of `supabase/schema.sql`, and run it. This creates the `products`, `admin_account`, and `site_settings` tables, the security-definer functions, the Row Level Security policies, and adds both data tables to the realtime publication. It also seeds the single `site_settings` row with sensible defaults.

### 3. Seed the 50 laptops
Two ways — pick one:

**A. Paste (simplest).** Open the SQL Editor, paste `supabase/seed.sql`, run it. It upserts on `(brand, model)`, so it's safe to run more than once.

**B. Node seeder.** Copy `.env.example` to `.env`, fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`, then:
```bash
npm install
npm run seed
```

If you ever edit `scripts/laptops.js`, regenerate the SQL with `npm run gen:sql`.

### 4. Turn on the 6-digit email code
By default Supabase emails a confirmation **link**, not a code. To get the 6-digit code this app expects:

1. **Authentication → Providers → Email** — leave **Confirm email** ON.
2. **Authentication → Email Templates → Confirm signup** — edit the template body to include the token. The simplest working body:
   ```
   <h2>Confirm your signup</h2>
   <p>Your verification code is:</p>
   <h1>{{ .Token }}</h1>
   ```
   The `{{ .Token }}` variable is the 6-digit code. (You can keep or remove the link — the app only uses the code.)
3. **Authentication → URL Configuration** — set **Site URL** to where the app runs (`http://localhost:5173` in dev; your deployed URL in production).

### 5. Point the app at your project
Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
(Only the two `VITE_` values are needed to run the store. The service-role key is for seeding only.)

### 6. Run it
```bash
npm install
npm run dev
```
Open the printed URL. Register an account, check your email for the 6-digit code, and you're in.

### 7. Claim admin (once)
Navigate to **`/admin-setup`** and claim the master admin seat with your account. The moment you claim it, that route locks forever and a discreet gear icon appears in your navbar linking to **`/portal-management`**.

---

## Using the admin panel

- **Overview** — live counts and your most recently updated machines.
- **Inventory** — add, edit, and delete laptops; flip stock and featured with toggles. Every field from the catalog is editable, including the lid gradient (with a live preview) and an optional real image URL.
- **Content** — site name (drives the wordmark, footer, and tab title), the announcement ribbon (empty hides it), hero title/subtitle, primary button text, and an optional hero banner image.
- **Theme** — three colors (accent, accent-2, background). They preview live as you pick, and saving restyles every open session.
- **System** — the checkout redirect URL, tax rate, flat shipping, and free-shipping threshold, with a live worked example on a $1,500 cart.

Open the storefront in a second tab while you edit — changes land there without a refresh.

---

## Swapping the checkout link

The checkout button resolves its destination in two layers:

1. **Admin panel → System → Checkout redirect URL.** This is the live value, stored in the database, editable without redeploying. Paste a **Stripe Payment Link** or **PayPal button link** here to go to production.
2. **`src/config.js` → `DEFAULT_CHECKOUT_URL`.** The fallback used when the admin field is empty. You can also set `VITE_CHECKOUT_URL` in `.env` to override the default at build time.

So day-to-day you change the link in the panel; the code constant is just the safety net.

---

## Security model — read this

- **Row Level Security is the real enforcement.** Every write to `products` and `site_settings` is gated by an `is_admin()` check in Postgres. Even if someone bypasses the UI entirely and calls the API with the anon key, non-admin writes are rejected by the database.
- **The client route guard is UX, not security.** `AdminRoute` hides the panel and bounces non-admins, but a hidden route is not a locked door — the lock is RLS.
- **The admin claim is atomic.** `admin_account` has a single-row primary key (`id = 1`); `claim_admin()` inserts with `on conflict do nothing`, so only the first caller can ever win the seat, even under a race between two devices.
- **Never put the service-role key in the browser.** It's for the Node seeder only. The app runs entirely on the anon key plus RLS.

---

## How realtime works

`ProductsContext` and `SiteConfigContext` each open a Supabase realtime channel and subscribe to changes on their table. When an admin saves, Postgres emits the change and every subscribed browser updates its state — inventory, prices, copy, and theme colors all shift live. The theme is applied by writing CSS variables (`--accent`, `--accent2`, `--void`) onto `<html>`, which Tailwind's tokens reference, so a color save repaints instantly.

---

## Deploying

Any static host works. Set the two `VITE_` environment variables in the host's dashboard, then:

- **Vercel** — import the repo; the included `vercel.json` handles the SPA rewrite so deep links like `/portal-management` resolve.
- **Netlify** — build command `npm run build`, publish directory `dist`; `public/_redirects` handles the SPA fallback.

After deploying, update **Site URL** (and add the domain to redirect URLs) in Supabase → Authentication → URL Configuration so verification emails point at the live site.

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

---

## Troubleshooting

- **No code in the verification email** — the "Confirm signup" template doesn't include `{{ .Token }}`. See setup step 4.
- **"Email not confirmed" on sign-in** — the account was created but never activated; the app routes you to `/verify` automatically. Enter the code or resend.
- **Admin changes don't appear in other tabs** — the realtime publication wasn't applied. Re-run the `alter publication supabase_realtime add table …` lines from `schema.sql`, and confirm **Database → Replication** lists both tables.
- **"Save failed — are you the admin?"** — RLS rejected the write because the session isn't the admin. Only the account that claimed `/admin-setup` can write.
- **Setup screen instead of the store** — `.env` is missing or still has the placeholder URL. Fill in real values and restart `npm run dev`.
- **Catalog is empty** — schema ran but seed didn't. Paste `supabase/seed.sql` or run `npm run seed`.

---

## A note on the data

The 50 laptops are real 2025–2026 models with representative configurations; prices are approximate US street prices as of early 2026 and are fully editable in the admin panel. Card artwork is generated from per-model gradients rather than product photos, so the catalog is self-contained — attach real images anytime via the image URL field.
