# RestaurantOS progress

## 2026-10-29 — Web foundation

- Next.js App Router, Tailwind CSS 3 and strict TypeScript are configured in `apps/web`.
- The RTL Persian landing page is responsive and production-buildable.
- `/r/[slug]` reads the published menu from the public Catalog API on the server.
- The customer menu exposes categories, final prices, allergens and a local interactive cart.
- Final checkout is intentionally disabled until the public Quote and Order endpoints land.
- Money formatting and cart arithmetic are covered by Vitest; the UI was smoke-tested in Chrome at desktop and mobile widths.
