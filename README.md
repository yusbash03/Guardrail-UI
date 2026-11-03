# Guardrail UI

> **Your money. Your rules. Your AI.**

The installable web app (PWA) for **Guardrail AI**, an AI shopping assistant that can only spend inside rules you set. The AI proposes carts. A deterministic policy engine on the server decides whether each one is allowed. You approve the exact cart with your password, and payment runs through **PayPal**.

Built for the PayPal AI Hackathon 2026. **PayPal Sandbox only; no real money moves.**

Backend: [Guardrail_API](https://github.com/yusbash03/Guardrail_API) (ASP.NET Core, PostgreSQL), deployed at **https://guardrail-api-bxyn.onrender.com** ([health](https://guardrail-api-bxyn.onrender.com/api/v1/health) · [Swagger](https://guardrail-api-bxyn.onrender.com/swagger)).

## What you can do

| Screen | Route | What it does |
|---|---|---|
| Overview | `/` | What's left this week and month, category budgets, pending approvals, recent purchases, insights |
| AI Shopping | `/shop`, `/shop/:conversationId` | Chat with the assistant. It searches products, builds a cart and checks it against your rules; replies show cart, decision, approval and purchase cards |
| Build a cart | `/cart`, `/cart/:cartId` | Build or edit a cart yourself (also the fallback when the assistant is down), check it, then request approval or pay |
| Spending Rules | `/rules` | Category budgets, weekly/monthly limits, approval threshold, max per purchase, merchants, product restrictions, duplicate protection, quiet hours |
| Rule history | `/rules/history` | Every rules version; pick two to see exactly what changed |
| Merchants | `/merchants` | Approve, block or reset merchants |
| Approvals | `/approvals`, `/approvals/:id` | Review the exact cart and approve it with your password; history |
| Transactions | `/transactions`, `/transactions/:purchaseId` | Purchases with PayPal IDs and a status timeline, plus the spending ledger |
| Checkout | `/checkout/return`, `/checkout/cancel` | Finishes the payment after PayPal: final rules check, then capture (or void) |
| Settings | `/settings` | Profile, time zone, log out everywhere |

### How a purchase flows

1. **The AI builds a cart** (or you build one at `/cart`).
2. **The server checks it against your rules:** ALLOWED, REQUIRES_APPROVAL or BLOCKED, with reasons and the budget impact.
3. **You approve that exact cart** with your password. The approval is tied to the cart's fingerprint, works once, and expires after 30 minutes.
4. **You pay with PayPal.** The app redirects you to PayPal, and you approve as the Sandbox buyer.
5. **Back in the app, a final rules check runs**, and only then is the payment taken. If your rules changed in the meantime, the PayPal authorization is voided and you aren't charged.

The AI has no tool that can approve, pay, change rules or touch the ledger.

## Run locally

Requirements: Node 20+.

```bash
npm install
npm run dev:render   # http://localhost:5173, against the deployed Render API
npm run dev          # http://localhost:5173, against a local API on http://localhost:5080
```

The app always calls the API at the same-origin path `/api/v1`. The dev and preview servers proxy `/api` to the target, so the httpOnly refresh cookie works. The proxy also presents the target's own `Origin`, because the API's refresh endpoint rejects cross-origin requests. To run the API locally, see [Guardrail_API](https://github.com/yusbash03/Guardrail_API).

The Render free tier sleeps when idle, so the first request after a while can take about a minute.

| Script | |
|---|---|
| `npm run dev` / `npm run dev:render` | Dev server against the local API / the Render API |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Typecheck + production build, including the service worker |
| `npm run preview` / `npm run preview:render` | Serve `dist/` on http://localhost:4173; use this to test install and offline behaviour |

Environment (see [`.env.example`](.env.example)):

| Variable | Default | |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Keep same-origin; Vite (dev) or Vercel (prod) forwards it to the API |
| `VITE_PAYPAL_ENV_LABEL` | `Sandbox` | Label for the environment badge |
| `API_PROXY_TARGET` | `http://localhost:5080` | Dev/preview proxy target only; not bundled |

`VITE_*` values are public in the bundle. Never put secrets in them.

## Stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS · TanStack Query · React Router · Zod · framer-motion · Lucide · vite-plugin-pwa. The visual design comes from a Magic Patterns export (`guardrail-ai 2/docs/design/`).

```
src/
  lib/api.ts          fetch client: in-memory access token, single-flight refresh, errors → ApiError
  lib/schemas.ts      Zod schemas mirroring the backend DTOs; every response is validated
  lib/queries.ts      TanStack Query hooks and mutations
  lib/rulesMapping.ts policy document ⇄ Spending Rules form
  lib/policyDiff.ts   field-level diff between rules versions
  lib/timeline.ts     purchase + ledger entries → status timeline
  contexts/           auth, pending-approvals badge, theme
  components/         design-system components
  pages/              one per route
```

## Security and data handling

- **Money figures come from the API.** The client only formats them and draws bar widths.
- **The access token lives in memory only.** The refresh token is an httpOnly cookie that scripts and the service worker can't read. Logout clears the query cache, sessionStorage and runtime caches.
- **Approvals** send your password plus the cart fingerprint as loaded from the server. The password is cleared from state straight after the request. A wrong password never logs you out.
- **Payments** use idempotency keys for checkout and capture, so retries can't double-charge. Success is shown only when the purchase status is `COMPLETED`.
- **Offline:**
  - The service worker caches only the app shell; `/api/**` requests are never cached.
  - Nothing financial is stored in the browser or shown offline.
  - `localStorage` holds only the theme preference.

## Deploy (Vercel)

[`vercel.json`](vercel.json) rewrites `/api/*` to `https://guardrail-api-bxyn.onrender.com/api/*` and serves `index.html` for every other route. It also sets the CSP and security headers.

1. Import the repo into Vercel. The framework is Vite, the build command is `npm run build` and the output directory is `dist`.
2. Set `VITE_API_BASE_URL=/api/v1` (the default) and, optionally, `VITE_PAYPAL_ENV_LABEL=Sandbox`.
3. On the **Render API**, set:
   - `Cors__AllowedOrigins` to your Vercel URL, e.g. `https://guardrail-ui.vercel.app`. **This is required.** The rewrite forwards the browser's `Origin`, and without this setting the API rejects session refresh with 403, so users are logged out on every reload.
   - `PayPal__ReturnUrl` to `https://<your-domain>/checkout/return` and `PayPal__CancelUrl` to `https://<your-domain>/checkout/cancel`.

## Docs

Product, architecture, API contract and design specs live in [`guardrail-ai 2/docs/`](guardrail-ai%202/docs/). Start with [`frontend/FRONTEND_SPECIFICATION.md`](guardrail-ai%202/docs/frontend/FRONTEND_SPECIFICATION.md) and [`api/API_CONTRACT.md`](guardrail-ai%202/docs/api/API_CONTRACT.md).

## License

[MIT](LICENSE) © 2026 Yusuf Bashir
