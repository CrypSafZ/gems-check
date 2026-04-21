# gems-check

Public-facing AlphaGEMs Discord stats checker. Search by username or Discord ID, see a shareable 16:9 stat card with your rank, activity, and tier roast.

**Status:** Sprint 1 (UI / mock data). Sprint 2 adds the real snapshot pipeline, PNG generation, share actions, and rate limiting.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- TypeScript

## Dev

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Routes

- `/` — landing with search + preview chips
- `/[id]` — stat card for a given username or Discord ID
- `/api/card/[id].png` — *(Sprint 2)* server-generated 16:9 PNG card

## Data

Sprint 1 uses `lib/mock.ts`. Sprint 2 swaps to a `data/snapshot.json` exported manually from `alphagems-tracker` — no live DB exposed to the public, only aggregate counts + rehosted PFPs on Vercel Blob.

## Tiers

Defined in `lib/tiers.ts`. Ranks map to 9 tiers (💎 Emperor → 🫥 Ghost Gem) plus ☠️ NOT A GEM for strangers.
