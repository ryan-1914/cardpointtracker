# External Integrations

**Analysis Date:** 2026-02-28

## APIs & External Services

**Third-party APIs:**
- None detected in `app.js`, `sw.js`, or `index.html`

**Remote SDKs:**
- None detected

## Data Storage

**Databases:**
- Browser `IndexedDB`
  - Connection: local browser profile storage
  - Client: native `indexedDB` API in `app.js`
  - Store: `cards` object store (`STORE_CARDS`)

**File Storage:**
- None beyond browser-managed local storage

**Caching:**
- Browser `Cache Storage` via service worker (`sw.js`)
  - App shell cache list (`APP_SHELL`): `/`, `/index.html`, `/styles.css`, `/app.js`, `/manifest.webmanifest`, `/assets/icon.svg`
  - Runtime strategy: cache-first with network fallback for GET requests

## Authentication & Identity

**Auth Provider:**
- None detected (no user accounts, local-only usage)

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- `console.error` in `app.js` for init and service worker registration failures

## CI/CD & Deployment

**Hosting:**
- Static hosting model implied

**CI Pipeline:**
- None detected (`.github/workflows` absent)

## Environment Configuration

**Required env vars:**
- None detected

**Secrets location:**
- Not applicable (no external services requiring credentials)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

---

*Integration audit: 2026-02-28*
*Update when adding/removing external services*
