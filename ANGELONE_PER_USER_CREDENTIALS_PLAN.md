# Angel One Per-User Credentials Plan

## Goal
Move from a single shared Angel One credential model to a per-user model where each trader/admin can connect their own Angel One account credentials and the platform uses that specific user's credentials for:
- market data/chart loading
- order execution
- position/order-book/holdings reads

This document is a plan only. No implementation is included here.

## Scope
### In Scope
- Data model changes for user-specific Angel One credentials
- API and service-layer flow changes to resolve credentials by authenticated user
- UI flow for users to connect/update/test their Angel One credentials
- Session/token lifecycle per user
- Migration approach from existing singleton model
- Security, auditing, and failure handling

### Out of Scope
- Broker abstraction for multiple brokers (future)
- Full credential rotation automation
- Historical backfill of old trading data under new credential ownership

## Proposed Target Behavior
1. User signs in to Finloom.
2. User opens "Broker Credentials" settings and submits required Angel One fields.
3. System stores those credentials mapped to that user.
4. When user loads trading/chart pages, backend fetches Angel One credentials for that exact user.
5. If user has no credentials, trading/chart APIs return actionable error prompting setup.
6. Tokens (jwt/refresh/feed + expiry) are maintained per user, not globally.

## Required Inputs Per User
- `apiKey`
- `clientCode`
- `mpin`
- `totpSecret`

## Data Model Plan
### Option A (Recommended): New per-user table
Add `UserAngelOneCredentials` with:
- `id` (pk)
- `userId` (unique, fk -> User.id)
- `apiKey`
- `clientCode`
- `mpin`
- `totpSecret`
- `jwtToken` (nullable)
- `refreshToken` (nullable)
- `feedToken` (nullable)
- `tokenGeneratedAt` (nullable)
- `tokenExpiresAt` (nullable)
- `isActive` (bool, default true)
- `lastValidatedAt` (nullable)
- `lastValidationStatus` (nullable enum/text)
- `createdAt`, `updatedAt`

Indexes:
- unique(`userId`)
- index(`tokenExpiresAt`)

Reason:
- clean separation from existing singleton structure
- simpler rollback path
- avoids mixed semantics in existing table

## Service Layer Refactor Plan
### New core resolver
Replace singleton credential fetch with:
- `getAngelOneSessionForUser(userId: string)`
- `updateAngelOneCredentialsForUser(userId: string, payload)`
- `clearAngelOneSessionForUser(userId: string)` (optional utility)

### Rules
- All Angel One calls must require `userId`.
- No default/fallback to global credentials.
- If token expired for user, refresh/login only for that user.
- If credentials missing, return typed domain error (`CREDENTIALS_NOT_CONFIGURED`).

## API Plan
### New/Updated Endpoints
1. `GET /api/user/angelone-credentials`
- returns masked status only (no raw secrets)
- includes token health and last validation status

2. `PUT /api/user/angelone-credentials`
- body: `{ apiKey, clientCode, mpin, totpSecret }`
- validates and stores for current authenticated user
- clears old token fields so next call re-authenticates cleanly

3. `POST /api/user/angelone-credentials/test`
- attempts login/session generation using submitted/saved creds
- updates `lastValidatedAt` and status

4. Refactor existing trading APIs to enforce user-scoped credentials
- `market-data`
- `historical/chart`
- `execute`
- `square-off`
- `positions/orderbook/holdings` test routes (if retained)

## UI Plan
### New user-facing page
- Route under authenticated user area, e.g. `/dashboard/user/broker-credentials`
- Form with 4 required fields
- Save + Test Connection actions
- Status cards:
  - Connected / Not Connected
  - Last validated timestamp
  - Token expiry snapshot (if available)

### Trading page behavior
- If no credentials: show blocking CTA to setup broker credentials
- If invalid credentials/token refresh fails: show reconnect CTA

## Security Plan
1. Never return raw credential secrets in API responses.
2. Mask values in logs and UI.
3. Role/ownership enforcement: user can only read/write their own broker credentials.
4. Add audit trail events:
- credentials created
- credentials updated
- validation success/failure
- token refresh failure

## Migration Plan
### Current State
- Existing singleton Angel One credential record used globally.

### Migration Steps
1. Add new per-user table and deploy.
2. Keep old singleton path temporarily behind feature flag (`ANGELONE_PER_USER_MODE=false`).
3. Build/update UI + APIs for per-user credentials.
4. Enable per-user mode in staging.
5. Validate with test users.
6. Enable per-user mode in production.
7. Remove singleton dependency after stabilization window.

### Optional transitional strategy
- For first admin/trader pilot users, manually populate per-user records.
- Do not auto-copy singleton credentials to all users (security risk).

## Backward Compatibility / Feature Flag
Use feature flag:
- `ANGELONE_PER_USER_MODE=true|false`

When `false`:
- existing behavior stays active (temporary only).

When `true`:
- all credential resolution is user-scoped.

## Testing Plan
### Unit
- user credential lookup by userId
- token refresh path per user
- missing credentials path

### Integration
- user A credentials never used for user B requests
- concurrent trading requests by different users use isolated sessions
- update credentials invalidates old token for that user only

### E2E
- connect credentials -> open chart -> place order -> square off
- invalid creds -> clear error path and retry
- logout/login persistence checks

## Operational Considerations
- Monitoring:
  - credential validation failure rate
  - token refresh failure rate by user
  - trading API failures due to missing credentials
- Support playbook:
  - user reconnect steps
  - safe credential reset steps

## Risks and Mitigations
1. Risk: accidental credential leakage in logs
- Mitigation: central masking utility + log review.

2. Risk: cross-user credential mixup
- Mitigation: hard userId checks in service boundary + integration tests.

3. Risk: migration confusion during dual-mode period
- Mitigation: strict feature flag rollout and clear deprecation date.

## Suggested Delivery Phases
1. Phase 1: Schema + service abstraction + feature flag wiring
2. Phase 2: User credential APIs + UI page
3. Phase 3: Trading/market APIs switched to user scope
4. Phase 4: Staging soak + production rollout
5. Phase 5: Remove singleton path and clean up dead code

## Acceptance Criteria
- Each authenticated user can store and manage their own Angel One credentials.
- Trading and chart APIs use only that user's credentials.
- No global/shared credentials are used in per-user mode.
- Missing or invalid user credentials produce clear UX and API responses.
- No secret values are exposed in API responses or logs.
