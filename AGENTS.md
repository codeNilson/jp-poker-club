<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
- `/admin` must be protected at the route-segment level (`src/app/admin/layout.tsx`) using server-side session + `profiles.user_role` checks; only `admin` and `operator` can access the area.
- Post-login redirect should be role-aware in `/auth/callback`: send `admin`/`operator` to `/admin`, others to `/`.
- Admin/content mutations should be enforced in Supabase RLS using `profiles.user_role`; admin gets destructive access, operator gets scoped content-management access, and money-facing tables stay admin-only for writes.
- Wallet balance adjustments in admin flows must be atomic in the database (single function/transaction) and always append a `wallet_transactions` audit record with before/after balances.
- News cover images must be uploaded from the admin form to Supabase Storage and shown with a local preview before submit; do not rely on manual image URLs in the UI.
- News image uploads must use the authenticated server-session client (no admin-key fallback in runtime) and rely on explicit `storage.objects` RLS policies for `admin`/`operator` in the `jp-poker-club-image-vault` bucket.

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
- All user-facing text in Portuguese must use correct accents/diacritics (for example: "Descrição", "Conteúdo", "Publicação", "Notícia").
- If a UX or architecture change affects visible app behavior, record the decision here before continuing with new implementations.

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
- events represents both tournament and cash-game schedules; use `event_type` (`tournament` | `cash_game`) to differentiate behavior, keep `buy_in` nullable for cash-game compatibility, and use optional `blinds` text when the event is a cash game.
- events must keep data integrity by event type: tournament rows require `buy_in`, and cash-game rows require non-empty `blinds`.
- news represents the club's news/editorial content; each record has title, description, content, slug, category, published_at, is_active, is_featured, is_hot, read_time_minutes, and an optional cover_image_url.
- news.is_featured must work as a unique global highlight among active news items; when there is no active highlight, the UI may fall back to the most recent news item.
- news.is_hot is only a visual relevance badge and can coexist across multiple news items at the same time.
- news must not receive fake images in the database; when there is no real banner, the UI should simply hide the image block.
- tournament_entries records each player's result in each event; final_position and points_earned are the basis for the Elo ranking.
- cash_game_sessions records each player's cash-game session summary; keep it separate from tournaments and model it as a user-owned record with buy-in, cash-out, net result, optional notes, and optional `event_id` when the session belongs to a scheduled event.
- cash_game_sessions.net_result must be derived as `cash_out - buy_in` by database logic to prevent payload drift.
- The weekly radar must be assembled from real database data, combining nearby events and recently published news, with no hardcoding in the UI.

## Expected Flow

- New user: auth.users triggers the creation of profiles and wallets.
- Login: the session comes from Supabase Auth; the app reads the logged-in user and the corresponding profile.
- Deposit: generates wallet_transactions and updates wallets.balance atomically.
- Subscription: the status change must be reflected in subscriptions and, when applicable, in profiles.is_subscriber.
- Subscription: the status change must be reflected in subscriptions and in profiles.is_subscriber through database synchronization logic.
- Tournament result: admin saves tournament_entries, computes points_earned, and updates profiles.elo_points and profiles.elo_tier.
- Ranking: profiles.elo_points is the main reference; elo_tier is derived from the total points.

## Relevant Columns

- profiles.id must always match auth.users.id.
- wallets.user_id must always match auth.users.id.
- wallet_transactions.user_id always points to the owner of the movement.
- wallet_transactions.balance_before and balance_after must reflect the real balance progression.
- subscriptions.user_id identifies the player's subscription.
- events.status controls the upcoming, ongoing, and finished cycle; featured_* and is_featured are used to highlight the event in cards and editorial blocks.
- events.event_type controls whether an entry behaves as tournament or cash game; `events.blinds` is optional metadata for cash-game presentation.
- events.buy_in can be null for cash-game events and should remain set for tournament events.
- events integrity should enforce required fields by `event_type` (`buy_in` for tournament, `blinds` for cash_game).
- news.slug must be unique and serve as the editorial key for visual references and future detail routes.
- news.category controls the editorial taxonomy; published_at defines publication order; is_active and is_featured determine visibility.
- Keep only one active `is_featured = true` at a time in the database; `is_hot` remains without uniqueness restrictions.
- tournament_entries.event_id and user_id form the link between event and player; final_position defines placement and points_earned the impact on Elo.
- cash_game_sessions.event_id optionally links a session to a scheduled item in events; null means an avulso cash-game session.
- when `cash_game_sessions.event_id` is present, it must reference an `events` row with `event_type = cash_game`.
