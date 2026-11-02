# Guardrail UI

PWA frontend for Guardrail AI. The visual design comes from the Magic Patterns export (`guardrail-ai 2/docs/design/`). Specs live in `guardrail-ai 2/docs/` (see `frontend/FRONTEND_SPECIFICATION.md`, `api/API_CONTRACT.md`, `frontend/PWA_REQUIREMENTS.md`).

## Run locally

```bash
# 1. API (Guardrail_API repo) on http://localhost:5080
dotnet run --project src/Guardrail.Api --launch-profile http

# 2. UI on http://localhost:5173
npm install
npm run dev
```

Vite proxies `/api` and `/images` to `localhost:5080`. The browser therefore sees one origin, and the httpOnly refresh cookie (`gr_rt`, `Path=/api/v1/auth`) works in dev.

| Script | |
|---|---|
| `npm run dev` | dev server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | typecheck + production build (with the service worker) |
| `npm run preview` | serve `dist/` (use this to test install/offline) |

## Layout

```
src/
  lib/api.ts          fetch transport: in-memory token, single-flight refresh, ProblemDetails → ApiError
  lib/schemas.ts      Zod schemas mirroring the backend DTOs (every response is parsed here)
  lib/queries.ts      TanStack Query hooks + mutations, query keys, money invalidation
  lib/rulesMapping.ts PolicyDocument ⇄ Spending Rules form model
  lib/timeline.ts     purchase + ledger entries → status timeline
  contexts/           Auth (refresh on boot, logout clears caches), Approvals badge (20 s poll), Theme
  components/         design-system components from the Magic Patterns export, fed by props
  pages/              one per route
```

## Rules carried over from the spec

- Money comes from API fields. The client only formats it and computes bar widths.
- Approvals send the `cartSnapshotHash` from the approval as loaded, plus the password. The password is cleared from state straight after the request. `REAUTHENTICATION_FAILED` never triggers a token refresh or logout.
- Checkout and capture use idempotency keys. The capture key is the only thing written to `sessionStorage`. Success is shown only when `PurchaseDto.status == COMPLETED`.
- The service worker precaches the app shell. `/api/**` is `NetworkOnly`. No API data is persisted, and offline mode shows no balances.
- `vercel.json` rewrites `/api` to the Render API. **Set the real Render URL before deploying.**
