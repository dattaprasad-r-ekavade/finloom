# Multi-Broker Per-User Credentials Plan

## Goal
Move from a single shared Angel One credential model to a per-user, multi-broker model where each trader/admin can connect their own broker account credentials and the platform uses that specific user's credentials for:
- market data/chart loading
- order execution
- position/order-book/holdings reads

Initial brokers in scope: **Angel One** (existing) and **Zerodha Kite** (new).
The abstraction layer must be designed so additional brokers can be added with minimal code changes.

This document is a plan only. No implementation is included here.

## Scope
### In Scope
- Data model changes for user-specific broker credentials (multi-broker ready)
- Broker abstraction layer with Angel One and Zerodha as first two supported brokers
- API and service-layer flow changes to resolve credentials by authenticated user and broker
- UI flow for users to connect/update/test credentials for any supported broker
- Broker selection UX (user picks their broker before entering credentials)
- Session/token lifecycle per user per broker
- Migration approach from existing Angel One singleton model
- Security, auditing, and failure handling

### Out of Scope
- Full credential rotation automation
- Historical backfill of old trading data under new credential ownership
- Brokers beyond Angel One and Zerodha (handled in future phases)

## Proposed Target Behavior
1. User signs in to Finloom.
2. User opens "Broker Credentials" settings, selects their broker (Angel One or Zerodha), and submits the required fields for that broker.
3. System stores those credentials mapped to that user and broker.
4. When user loads trading/chart pages, backend resolves the correct broker and fetches credentials for that exact user.
5. If user has no credentials configured, trading/chart APIs return an actionable error prompting setup.
6. Tokens/session data are maintained per user per broker, not globally.
7. A user may optionally connect multiple brokers (e.g., Angel One for charts, Zerodha for execution) — architecture supports this even if UI exposes one active broker initially.

## Required Inputs Per User

All credential fields should be easy for users to locate and copy from their broker account. No developer tools or broker support calls should be required.

### Angel One
| Field | Where to Get It | Notes |
|---|---|---|
| `apiKey` | [Angel One API Portal](https://smartapi.angelone.in/) → My Profile → API key | Created once per account |
| `clientCode` | Angel One app/website → Profile → Client ID | e.g. `A12345` |
| `mpin` | Set during Angel One app onboarding | 4–6 digit PIN, not login password |
| `totpSecret` | Angel One app → My Profile → Enable TOTP → Copy the secret key shown during setup | 32-char base32 string |

> **Note:** The `totpSecret` is the raw TOTP seed shown once during TOTP activation, not the 6-digit rotating code. Users should save it when they first enable TOTP.

### Zerodha (Kite Connect)
| Field | Where to Get It | Notes |
|---|---|---|
| `apiKey` | [Kite Connect Dev Console](https://developers.kite.trade/) → Create App → API Key | Free tier available for personal use |
| `apiSecret` | Same Kite Connect app page → API Secret | Shown alongside API Key |
| `userId` | Zerodha Kite / Console → Profile → Client ID | e.g. `AB1234` |
| `password` | Zerodha Kite login password | User's standard login password |
| `totpSecret` | Zerodha Console → My Profile → Two-factor authentication → Setup TOTP → Copy secret | Same as Angel One — save during setup |

> **Note:** Kite Connect requires a free or paid app registration (free for personal/single-user use). The `apiKey` and `apiSecret` are available immediately after creating an app. No broker approval required.

## Data Model Plan

### Broker Enum
```
enum BrokerType {
  ANGEL_ONE
  ZERODHA
}
```

### Option A (Recommended): Generic per-user per-broker table
Replace `UserAngelOneCredentials` with a broker-agnostic `UserBrokerCredentials` table:

| Field | Type | Notes |
|---|---|---|
| `id` | pk | |
| `userId` | fk → User.id | |
| `broker` | `BrokerType` enum | |
| `credentialsJson` | encrypted text | Broker-specific fields stored as encrypted JSON (see below) |
| `accessToken` | nullable text | Active session token (broker-specific name: jwtToken / access_token) |
| `refreshToken` | nullable text | For brokers that support refresh |
| `feedToken` | nullable text | Angel One specific; null for others |
| `tokenGeneratedAt` | nullable datetime | |
| `tokenExpiresAt` | nullable datetime | |
| `isActive` | bool, default true | |
| `lastValidatedAt` | nullable datetime | |
| `lastValidationStatus` | nullable text | `SUCCESS` / `FAILED` / `EXPIRED` |
| `createdAt` | datetime | |
| `updatedAt` | datetime | |

Indexes:
- unique(`userId`, `broker`) — one record per user per broker
- index(`tokenExpiresAt`)

#### `credentialsJson` shape per broker (stored encrypted)

**Angel One:**
```json
{ "apiKey": "...", "clientCode": "...", "mpin": "...", "totpSecret": "..." }
```

**Zerodha:**
```json
{ "apiKey": "...", "apiSecret": "...", "userId": "...", "password": "...", "totpSecret": "..." }
```

Reason:
- single table supports any number of future brokers without schema migrations
- broker-specific fields are isolated in encrypted JSON, never exposed raw
- unique constraint on `(userId, broker)` prevents duplicate records cleanly
- simpler rollback path from existing Angel One singleton structure

## Service Layer Refactor Plan

### Broker Interface (Abstraction)
Define a common `IBrokerAdapter` interface that each broker implements:

```ts
interface IBrokerAdapter {
  login(credentials: BrokerCredentials): Promise<BrokerSession>
  refreshSession(session: BrokerSession): Promise<BrokerSession>
  getLTP(symbols: string[]): Promise<LTPMap>
  getHistoricalData(params: HistoricalParams): Promise<Candle[]>
  placeOrder(order: OrderRequest): Promise<OrderResult>
  getPositions(): Promise<Position[]>
  getOrderBook(): Promise<Order[]>
  getHoldings(): Promise<Holding[]>
  squareOff(params: SquareOffParams): Promise<SquareOffResult>
}
```

Concrete implementations:
- `AngelOneBrokerAdapter` — wraps existing Angel One SmartAPI logic
- `ZerodhaBrokerAdapter` — wraps Kite Connect SDK

### New core resolvers
Replace singleton credential fetch with broker-aware functions:
- `getBrokerSessionForUser(userId: string, broker: BrokerType): Promise<IBrokerAdapter>`
- `updateBrokerCredentialsForUser(userId: string, broker: BrokerType, payload: unknown)`
- `clearBrokerSessionForUser(userId: string, broker: BrokerType)`
- `getActiveBrokerForUser(userId: string): Promise<BrokerType | null>` — returns the user's currently active/default broker

### Rules
- All broker calls must require `userId` and `broker`.
- No default/fallback to global credentials.
- If token expired for user, refresh/login only for that user and that broker.
- If credentials missing, return typed domain error: `CREDENTIALS_NOT_CONFIGURED`.
- If broker is unsupported, return: `BROKER_NOT_SUPPORTED`.
- Adapters are never instantiated outside the resolver — callers always receive an `IBrokerAdapter`.

## API Plan
### New/Updated Endpoints

1. `GET /api/user/broker-credentials`
- returns list of all brokers the user has configured, with masked status (no raw secrets)
- includes per-broker: `connected`, `lastValidatedAt`, `tokenExpiresAt`, `lastValidationStatus`

2. `GET /api/user/broker-credentials/:broker`
- returns masked status for one specific broker

3. `PUT /api/user/broker-credentials/:broker`
- body: broker-specific fields (see Required Inputs section)
- validates inputs and stores encrypted for current authenticated user
- clears old token fields so next call re-authenticates cleanly
- `:broker` values: `angel-one`, `zerodha`

4. `DELETE /api/user/broker-credentials/:broker`
- removes credentials and session for that broker

5. `POST /api/user/broker-credentials/:broker/test`
- attempts login/session generation using saved creds
- updates `lastValidatedAt` and `lastValidationStatus`
- returns `{ success, message, tokenExpiresAt }`

6. `GET /api/user/active-broker` / `PUT /api/user/active-broker`
- get or set the user's currently selected default broker

7. Refactor existing trading APIs to be broker-agnostic
- `market-data` — resolves broker adapter from user's active broker
- `historical/chart`
- `execute`
- `square-off`
- `positions/orderbook/holdings`
- All accept optional `?broker=angel-one|zerodha` query param to override active broker

## UI Plan
### New user-facing page
- Route: `/dashboard/user/broker-credentials`
- Broker selector tabs or cards at the top (Angel One, Zerodha, + future slots)
- Per-broker form shown when a tab is selected:
  - Angel One: `apiKey`, `clientCode`, `mpin`, `totpSecret`
  - Zerodha: `apiKey`, `apiSecret`, `userId`, `password`, `totpSecret`
- All sensitive fields masked by default (show/hide toggle)
- Inline helper text per field explaining where to find the value (based on Required Inputs table)
- Actions per broker:
  - **Save Credentials** — stores encrypted
  - **Test Connection** — calls `/test` endpoint and shows result inline
  - **Disconnect** — removes credentials
- Status cards per broker:
  - Connected / Not Connected badge
  - Last validated timestamp
  - Token expiry countdown (if available)
- "Set as Active Broker" control if user has multiple brokers connected

### Trading page behavior
- If no broker configured: show blocking CTA → "Connect your broker to start trading"
- If credentials present but token expired/failed: show inline reconnect CTA with broker-specific help text
- Active broker indicator visible in trading header

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
1. Add new `UserBrokerCredentials` table and `BrokerType` enum, deploy schema migration.
2. Keep old singleton Angel One path temporarily behind feature flag (`BROKER_PER_USER_MODE=false`).
3. Build broker adapter abstraction layer (`IBrokerAdapter`, `AngelOneBrokerAdapter`, `ZerodhaBrokerAdapter`).
4. Build/update UI + APIs for per-user, per-broker credentials.
5. Enable per-user mode in staging for Angel One first.
6. Validate with test users on Angel One.
7. Enable Zerodha adapter and validate with Zerodha test users.
8. Enable per-user mode in production.
9. Remove singleton dependency after stabilization window.

### Optional transitional strategy
- For first admin/trader pilot users, manually populate per-user records.
- Do not auto-copy singleton credentials to all users (security risk).

## Backward Compatibility / Feature Flag
Use feature flag:
- `BROKER_PER_USER_MODE=true|false` (replaces `ANGELONE_PER_USER_MODE`)

When `false`:
- existing singleton Angel One behavior stays active (temporary only).

When `true`:
- all credential resolution is user-scoped and broker-scoped.

## Testing Plan
### Unit
- user credential lookup by userId + broker
- token refresh path per user per broker
- missing credentials path returns `CREDENTIALS_NOT_CONFIGURED`
- `IBrokerAdapter` contract satisfied by both `AngelOneBrokerAdapter` and `ZerodhaBrokerAdapter`
- credential JSON encryption/decryption roundtrip

### Integration
- user A credentials never used for user B requests
- Angel One credentials never used for Zerodha calls and vice versa
- concurrent trading requests by different users use isolated sessions
- update credentials invalidates old token for that user + broker only
- Zerodha adapter produces same normalized output shape as Angel One adapter

### E2E
- Angel One: connect credentials -> open chart -> place order -> square off
- Zerodha: connect credentials -> open chart -> place order -> square off
- invalid creds -> clear error path and retry
- broker switch: user changes active broker, trading page reflects new broker
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
- Mitigation: central masking utility + log review; `credentialsJson` never logged raw.

2. Risk: cross-user credential mixup
- Mitigation: hard `(userId, broker)` checks in service boundary + integration tests.

3. Risk: cross-broker credential mixup (Angel One key passed to Zerodha adapter)
- Mitigation: `IBrokerAdapter` instantiation always requires explicit `BrokerType`; validated at resolver layer.

4. Risk: migration confusion during dual-mode period
- Mitigation: strict feature flag rollout and clear deprecation date.

5. Risk: Zerodha Kite Connect session expiry differs from Angel One
- Mitigation: adapter encapsulates expiry logic; token refresh strategy decided per adapter.

## Suggested Delivery Phases
1. **Phase 1:** Schema migration (`UserBrokerCredentials` table + `BrokerType` enum) + feature flag wiring
2. **Phase 2:** Broker adapter abstraction layer — `IBrokerAdapter` interface + `AngelOneBrokerAdapter` (migrated from existing code)
3. **Phase 3:** User credential APIs + UI page (broker selector + per-broker forms)
4. **Phase 4:** Trading/market APIs switched to user-scoped broker-agnostic resolver
5. **Phase 5:** `ZerodhaBrokerAdapter` — Kite Connect integration
6. **Phase 6:** Staging soak (Angel One first, then Zerodha) + production rollout
7. **Phase 7:** Remove singleton path, remove `BROKER_PER_USER_MODE=false` code path, clean up dead code

## Acceptance Criteria
- Each authenticated user can store and manage credentials for any supported broker (Angel One, Zerodha).
- Trading and chart APIs use only that user's credentials for that user's active broker.
- The broker adapter interface is satisfied by both Angel One and Zerodha — adding a third broker requires no changes outside a new adapter file.
- No global/shared credentials are used in per-user mode.
- Missing or invalid user credentials produce clear UX and API responses with actionable setup CTAs.
- Cross-broker credential use is impossible by design (enforced at resolver layer).
- No secret values are exposed in API responses or logs.
- Zerodha and Angel One credential forms explain exactly where to find each required field.

---

## Broker Abstraction Reference

### Supported Brokers

| Broker | Adapter Class | Session Type | TOTP Required | Notes |
|---|---|---|---|---|
| Angel One | `AngelOneBrokerAdapter` | JWT + Feed token | Yes | Existing implementation |
| Zerodha | `ZerodhaBrokerAdapter` | Access token (daily) | Yes | Kite Connect SDK |

### Zerodha Session Notes
- Kite Connect access tokens are valid for one trading day, expiring at midnight IST.
- Automated login requires headless session generation using `userId` + `password` + TOTP.
- The `apiKey` + `apiSecret` pair is required to exchange a request token for an access token.
- Feed/WebSocket data uses the same access token (no separate feed token like Angel One).

### Adding a Future Broker
To add a new broker (e.g., Upstox, Fyers):
1. Add enum value to `BrokerType`.
2. Define credential JSON shape for that broker.
3. Implement `IBrokerAdapter` in a new adapter class.
4. Register adapter in the broker resolver factory.
5. Add UI form fields for that broker's credentials.
6. No changes needed to trading APIs or the core resolver interface.
