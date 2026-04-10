# JP Poker Club

Platform for the JP Poker Club community — managing events, news, rankings, promotions, and player wallets.

Built with [Next.js 16](https://nextjs.org), [Supabase](https://supabase.com), [Tailwind CSS v4](https://tailwindcss.com), and [TypeScript](https://www.typescriptlang.org).

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (see [Supabase Setup](#supabase-setup) below)

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server/admin only) |
| `ABACATEPAY_API_KEY` | AbacatePay API key (payment integration) |
| `PAGARME_SECRET_KEY` | Pagar.me secret key (payment integration) |
| `PAGARME_WEBHOOK_SECRET` | Pagar.me webhook signature secret |

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
src/
├── app/                  # Next.js App Router — routes, layouts, pages
│   ├── auth/             # Auth callback route
│   ├── eventos/          # Events listing page
│   ├── fale-conosco/     # Contact page
│   ├── login/            # Login page
│   ├── noticias/         # News feed and article pages
│   ├── politicas-de-privacidade/  # Privacy policy
│   ├── promocoes/        # Promotions page
│   └── termos-de-uso/    # Terms of use
├── components/
│   ├── ui/               # Base UI components (button, alert, dropdown, skeleton, sonner)
│   ├── layout/           # Structural components (Navbar, footer, home carousel, background)
│   └── forms/            # Form-specific components
├── constants/            # Shared domain constants
├── data/                 # Static or mock data
├── hooks/                # Shared React hooks
├── lib/
│   ├── supabase/         # Supabase clients (browser, server, admin)
│   ├── utils.ts          # CSS class helper (cn)
│   └── env.ts            # Environment variable schema and validation
├── services/             # Server-only data access and external integrations
│   ├── news.service.ts   # News feed, featured article, article by slug
│   └── radar.service.ts  # Weekly radar combining events and news
└── types/
    └── database.ts       # Auto-generated Supabase database types (do not edit manually)

public/                   # Static assets (logos, icons, images, illustrations)
supabase/
├── migrations/           # Versioned SQL migrations
└── seed.sql              # Seed data for local development
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## Supabase Setup

### Supabase clients

| Client | File | Usage |
|---|---|---|
| Browser | `src/lib/supabase/client.ts` | Client components |
| Server | `src/lib/supabase/server.ts` | Server components, server actions (reads cookies) |
| Server Public | `src/lib/supabase/server.ts` | Public server components (no cookies, safe for static cache) |
| Admin | `src/lib/supabase/admin.ts` | Administrative operations (service role) |

### Database types

Types are generated automatically from the Supabase schema. Do **not** edit `src/types/database.ts` manually. To regenerate:

```bash
npx supabase gen types typescript --project-id <your-project-id> > src/types/database.ts
```

### Migrations

All schema changes must be versioned in `supabase/migrations/`. Never apply schema changes only through the Supabase dashboard.

---

## Architecture Notes

See [AGENTS.md](./AGENTS.md) for full architecture decisions, caching strategy, data domain, and agent guidelines.
