# xixvi.shop

Storefront + True North. Vite + React SPA, Supabase (Postgres, Auth, Storage), Vercel serverless routes in `api/`.

There is no Convex backend. Do not run `npx convex deploy`, `bunx convex dev`, or add a `convex/` directory. That is what breaks production builds with:

> The route directory convex doesn't exist

## Stack

- Vite + React 19 + Tailwind v4 + shadcn/ui
- Supabase for data, auth (email/password only), and storage
- Vercel `api/` for checkout, webhooks, Printful, privileged writes
- Stripe + Printful for commerce

## Local

```bash
npm install
cp .env.example .env.local   # fill Supabase + Stripe + Printful
npm run dev
```

## Production build

```bash
npm run build        # vite build → dist/
```

Vercel is pinned in `vercel.json`:

- install: `npm install`
- build: `npm run build`
- output: `dist`
- framework: `vite`

Do not set `CONVEX_DEPLOY_KEY`, `CONVEX_DEPLOYMENT`, or `VITE_CONVEX_URL` anywhere.

## Layout

```
api/          Vercel serverless (service role)
src/          SPA
supabase/     SQL / RLS
public/       static assets
```
