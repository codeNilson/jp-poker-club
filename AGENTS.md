<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## App Routes

- `/` — Home page with carousel (public, static)
- `/login` — Login page
- `/auth/callback` — Supabase auth callback handler
- `/noticias` — News feed (public, time-based cache)
- `/noticias/todas` — Full paginated news listing
- `/noticias/[slug]` — Individual news article
- `/eventos` — Events listing (public, time-based cache)
- `/promocoes` — Promotions page (public)
- `/fale-conosco` — Contact page (public)
- `/termos-de-uso` — Terms of use (public, indefinite cache)
- `/politicas-de-privacidade` — Privacy policy (public, indefinite cache)

## Rules

- Only touch the readme.md file if explicitly requested.

## Theme

- The default theme is always dark, with no light/dark toggle.
- Use these visual tokens as the base: --primary #32e035, --background #070707, --card and --muted #121217.

## UI and Layout

- JP Poker Club UI uses rounded corners.
- Prefer components from src/components/ui before creating new ones.
- Always think mobile-first.
- For toast messages, use Sonner (src/components/ui/sonner.tsx) as the default when needed.

## Navigation

- Keep active state, hover, and smooth transitions consistent in navigation and other visual controls.
- For internal redirects, use `useRouter` with `router.push()` or `router.replace()`, and `router.refresh()` when session/SSR needs to be reflected; avoid `window.location.assign()` to prevent a full reload.
- Reserve `window.location.assign()` only for external flows or absolute redirects outside the app.
- Visible authentication components should receive the initial session state through server/SSR when possible to avoid FOUC; client-side `useEffect` should be used only for later synchronization.

## Project Structure

- src/app contains routes, layouts, and pages.
- src/components contains reusable components, with priority for src/components/ui before creating new ones.
- src/lib contains utilities and integrations.
- src/lib/supabase contains Supabase clients for browser, server/SSR, and admin.
- src/types/database.ts is generated automatically and must not be edited manually.
- supabase/migrations stores versioned database migrations.
- public stores static assets.
- src/data, src/constants, src/services, and src/hooks separate data, constants, access rules, and hooks.

## Where to Look

- Database changes: check supabase/migrations first.
- Supabase integration: check src/lib/supabase.
- New UI: check src/components/ui first, then layout components.
- Route or page: check src/app.

## Architecture Decisions

- Any change that alters schema, relationships, RLS, auth flow, or the project structure must be recorded here.
- If a change affects Supabase, the schema must be defined in a versioned migration, never only in the dashboard.
- If a decision changes where something should live in the project, update this documentation before continuing with related implementations.

## Architecture and Cache Rules

- **Cache by Default Strategy:** Assume every page (Server Component) should be rendered statically unless there is an explicit requirement for real-time data or user session dependence.
- **Dynamic Pages (No Cache):**
  - **When to use:** Private pages (Dashboard, Wallet, Profile) or routes that read URL parameters (`searchParams`).
  - **Implementation rule:** In these cases, you must use `createSupabaseServerClient` (which reads cookies). Reading cookies or `searchParams` alone already makes the page dynamic. If strictly necessary, declare `export const dynamic = 'force-dynamic'`.
- **Static Pages (Indefinite Cache or Time-Based Cache):**
  - **When to use:** Public pages that are identical for every visitor.
  - **Implementation rule:** Do NOT read cookies on the server for these routes. Use ONLY `createSupabaseServerPublicClient` (with `persistSession: false`) to fetch public data from Supabase, ensuring Next.js does not disable static caching.
  - **Indefinite Cache:** For institutional routes (Terms, Privacy), do not add any revalidation variable. These pages remain statically cached until the next build/deploy.
  - **Time-Based Cache:** For showcase pages that change at a moderate frequency, add `export const revalidate = 3600` (or another suitable value) at the top of page.tsx.
- **Server Actions and On-Demand Revalidation:** EVERY time you create or edit a Server Action that mutates the database (INSERT, UPDATE, DELETE), especially in the Admin Panel, you MUST include Next.js `revalidatePath()` to clear the cache of the public routes affected by that change.
- **Pending Reminder (News):** This item is only an architecture reminder. The implementation will be requested later by the requester.
- **Chosen Strategy (News):** Keep server cache for public pages and invalidate on demand when there are changes in `news`.
  - In the app's internal flow (create, update, delete, publish, unpublish), invalidate cache with `revalidatePath()` or `revalidateTag()`.
  - As a fallback, configure a Supabase webhook to an internal invalidation endpoint, covering changes made outside the app (Supabase dashboard, scripts, integrations).
  - Webhook security: use a dedicated secret per environment (dev and production with different secrets) and strictly validate the signature/secret header at the endpoint before performing any invalidation.
  - Goal: avoid a dynamic public page hitting the database on every request while keeping content updated after mutations.
- **The Navbar Dilemma (Client vs Server):** The base layout (`RootLayout`) must never read cookies on the server to avoid contaminating the entire site. Global visual components that depend on session state (such as a Navbar showing the user) must be Client Components (`"use client"`) and actively fetch the session via `createSupabaseBrowserClient`, using Skeleton Loaders to avoid FOUC (Flash of Unstyled Content).

## Product Language

- Avoid technical wording for end users on screens, especially in login, onboarding, and help messages.
- Prefer short, simple, direct copy for user actions.
- If a UX or architecture change affects visible app behavior, record the decision here before continuing with new implementations.

## Environment Variables

- `NEXT_PUBLIC_APP_URL` — Public base URL of the app.
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anonymous key.
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server/admin only).
- `ABACATEPAY_API_KEY` — AbacatePay API key (payment integration).
- `PAGARME_SECRET_KEY` — Pagar.me secret key (payment integration).
- `PAGARME_WEBHOOK_SECRET` — Pagar.me webhook signature secret.

All variables are validated at runtime via `src/lib/env.ts` using Zod. Add new variables to that schema before using them.

## Supabase

- Do not edit src/types/database.ts manually; it is generated automatically.
- After creating or altering tables in Supabase, regenerate src/types/database.ts.
- The Supabase schema must be treated as code and versioned in supabase/migrations.
- Use src/lib/supabase/client.ts in the browser.
- Use src/lib/supabase/server.ts on the server/SSR with cookies in getAll/setAll.
- Use src/lib/supabase/admin.ts only on the server for administrative operations.

## Data Domain

- auth.users is the source of truth for authentication; new accounts must automatically generate a profile and wallet.
- profiles stores the player profile and the business layer of the user: display_name, avatar_url, elo_points, elo_tier, is_subscriber, and user_role.
- wallets stores the player's current balance; balance is a persisted field and must be updated together with each movement.
- wallet_transactions is the wallet history/audit trail; each movement must record amount, balance_before, balance_after, type, and an optional reference.
- subscriptions controls the user's subscription status; status indicates the current state and is_subscriber in profiles must reflect that condition when applicable.
- events represents tournaments/events; each event has status, buy_in, date, player limit, and optional highlight fields (featured_title, featured_short_desc, featured_image_url, is_featured) for use on home and radar.
- news represents the club's news/editorial content; each record has title, description, content, slug, category, published_at, is_active, is_featured, is_hot, read_time_minutes, and an optional cover_image_url.
- news.is_featured must work as a unique global highlight among active news items; when there is no active highlight, the UI may fall back to the most recent news item.
- news.is_hot is only a visual relevance badge and can coexist across multiple news items at the same time.
- news must not receive fake images in the database; when there is no real banner, the UI should simply hide the image block.
- tournament_entries records each player's result in each event; final_position and points_earned are the basis for the Elo ranking.
- The weekly radar must be assembled from real database data, combining nearby events and recently published news, with no hardcoding in the UI.

## Expected Flow

- New user: auth.users triggers the creation of profiles and wallets.
- Login: the session comes from Supabase Auth; the app reads the logged-in user and the corresponding profile.
- Deposit: generates wallet_transactions and updates wallets.balance atomically.
- Subscription: the status change must be reflected in subscriptions and, when applicable, in profiles.is_subscriber.
- Tournament result: admin saves tournament_entries, computes points_earned, and updates profiles.elo_points and profiles.elo_tier.
- Ranking: profiles.elo_points is the main reference; elo_tier is derived from the total points.

## Relevant Columns

- profiles.id must always match auth.users.id.
- wallets.user_id must always match auth.users.id.
- wallet_transactions.user_id always points to the owner of the movement.
- wallet_transactions.balance_before and balance_after must reflect the real balance progression.
- subscriptions.user_id identifies the player's subscription.
- events.status controls the upcoming, ongoing, and finished cycle; featured_* and is_featured are used to highlight the event in cards and editorial blocks.
- news.slug must be unique and serve as the editorial key for visual references and future detail routes.
- news.category controls the editorial taxonomy; published_at defines publication order; is_active and is_featured determine visibility.
- Keep only one active `is_featured = true` at a time in the database; `is_hot` remains without uniqueness restrictions.
- tournament_entries.event_id and user_id form the link between event and player; final_position defines placement and points_earned the impact on Elo.
