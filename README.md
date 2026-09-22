# Finloom

Finloom is being built as a market-learning and simulated-practice product for aspiring trading professionals in India. The planned path is learning, historical-session paper practice, a published skills assessment, a private Finloom certificate, then a separate application process for any prop-desk role.

Simulated profits and losses have no cash value and are never paid to learners. A certificate is not a job offer or a promise of trading capital. AngelOne endpoints and screens are for internal development only. The planned customer product is historical replay using properly licensed data at least 30 full days old; replay is not implemented yet.

## Preview status

This branch is suitable for a Vercel UI preview, not for accepting paid learners. Production checkout, mock payment activation, identity submission, live-data practice and AngelOne tooling are disabled by default. Legal identity, support details, paid subscription terms, the NSE/data-provider agreement, and Indian legal review are release gates. See [plan.md](./plan.md) and [business.md](./business.md).

The landing-page replay chart is an illustration; it does not display market data. Challenge prices in seeded development data are placeholders, not an offer for sale.

## Stack

- Next.js 16 App Router, React 19 and TypeScript
- Material UI 7 and Emotion
- Prisma 6 with PostgreSQL
- Razorpay integration code (paid checkout remains disabled in production)
- Vercel Analytics and Speed Insights

## Local development

Use Node.js 20.9 or later and PostgreSQL. Create a local `.env` (never commit it) with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/finloom?schema=public"
JWT_SECRET="a-long-random-development-secret"

# Optional, only for internal local AngelOne development:
ANGELONE_CREDENTIALS_KEY="a-separate-long-random-key"
```

Then run:

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Seeded plans and any broker integration are development fixtures. Keep local credentials separate from Vercel preview/production.

## Vercel preview

Use a dedicated preview PostgreSQL database and set `DATABASE_URL` and a strong `JWT_SECRET` in the Vercel project environment. Apply migrations to that database deliberately before using database-backed routes. Keep commerce disabled; the UI checkout flag defaults off, and the server also requires `RELEASE_COMMERCE_ENABLED=true` before creating or verifying a production payment. Do not set that flag until the commercial and data-license gates in `plan.md` are complete.

Do not add AngelOne credentials to Vercel. Production intentionally blocks that integration. Do not use public preview accounts to submit real PAN, date-of-birth or address details.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
npx prisma validate
npx prisma generate
```

The current lint command reports eight warnings and no errors. There is not yet an automated regression suite or CI pipeline. The remaining dependency audit and rollout work are tracked in `plan.md`.
