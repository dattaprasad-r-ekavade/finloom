# Finloom

Finloom is a market-learning and simulated (paper) trading product for aspiring trading professionals in India. Learners study, practise with virtual orders, take a published skills assessment, and can earn a private Finloom certificate.

Simulated profits and losses have no cash value and are never paid out. A certificate is not a job offer or a promise of trading capital.

**Direction and roadmap live in [PLAN.md](./PLAN.md).** When another document disagrees with it, PLAN.md wins.

## Status

This is a preview build, not a paid launch:
- Checkout, mock payment activation and identity submission are off in production by default.
- The trading screen is off in production by default.
- Market data is moving from the old AngelOne prototype to a separate jugaad-data worker. Quotes are delayed and always labelled with an as-of time; see PLAN.md §3.
- The legal, data-licence and commercial release gates are in [docs/release-review-2026-09.md](./docs/release-review-2026-09.md).

The landing-page chart is an illustration and shows no market data. Seeded challenge prices are placeholders.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Material UI 7 with CSS-variable colour schemes (light and dark)
- Prisma 6 on PostgreSQL (Neon or Supabase in hosted environments)
- Vercel hosting, Analytics and Speed Insights

## Project layout

```
src/app/(marketing)/   public site: landing, about, legal, plans
src/app/(auth)/        login, signup, password reset
src/app/(app)/         signed-in learner and admin pages (shared AppShell)
src/components/shell/  SiteHeader, Footer, AppShell, ThemeToggle, nav config
src/components/ui/     reusable primitives: PageHeader, StatTile, StatusPill, EmptyState, …
src/theme/             design tokens, theme, ThemeProvider
docs/                  business model, release review, historical notes
```

The UI conventions are in PLAN.md §5. In short:
- Use theme tokens, never hex colours in components. Lint enforces this.
- Build new pages from `src/components/ui/`.
- Put a page in a route group, not behind its own navbar.

## Local development

Use Node.js 24 for the built-in TypeScript test runner and PostgreSQL. Create a local `.env` (never commit it):

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/finloom?schema=public"
JWT_SECRET="a-long-random-development-secret"
CRON_SECRET="a-random-secret-for-scheduled-jobs"
```

Then run:

```bash
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seeded plans are development fixtures.

For local invited practice, set `ENABLE_PILOT_GRANTS=true`, create a trader, then use **Admin → Users → Grant pilot practice**. This activates a non-paid challenge without collecting identity details. The existing practice terminal still requires the local AngelOne development integration and fresh quotes; fixture/replay practice is the next pilot gate in PLAN.md §11. Never put broker credentials in a hosted deployment.

## Vercel

Use a dedicated PostgreSQL database per environment. Set `DATABASE_URL`, a strong `JWT_SECRET` and `CRON_SECRET`. Apply migrations to that database deliberately before using routes that need it.

Keep commerce disabled until the release gates pass. The UI flag `NEXT_PUBLIC_COMMERCE_ENABLED` and the server flag `RELEASE_COMMERCE_ENABLED` both default to off.

Do not add broker (AngelOne) credentials to any Vercel environment.

## Commands

```bash
npm run dev
npm run lint
npm test
npm run build
npx prisma validate
```

Focused tests cover daily progress and IST boundaries. CI runs lint, tests, types and a build. Database concurrency and migration tests remain in PLAN.md §11.
