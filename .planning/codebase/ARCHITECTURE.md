# Architecture

**Analysis Date:** 2026-02-28

## Pattern Overview

**Overall:** Monolithic client-side PWA with local-first persistence

**Key Characteristics:**
- UI, state, business logic, and persistence are co-located in `app.js`
- Durable storage is browser `IndexedDB` (`cards` object store)
- Offline support is implemented by `sw.js` via app shell + runtime caching

## Layers

**Presentation Layer:**
- Purpose: Render controls, card list, and ranking output
- Location: `index.html`, `styles.css`, rendering helpers in `app.js`
- Contains: DOM structure, style tokens, HTML templates, result/ranking markup
- Depends on: in-memory app state and helper functions
- Used by: browser users

**Application Logic Layer:**
- Purpose: Coordinate events, card CRUD flow, and reward ranking behavior
- Location: `wireEvents`, `onSubmitCard`, `renderComparison`, `startEdit`, `resetForm` in `app.js`
- Contains: event handlers, guards, sorting, comparison fallback rules
- Depends on: DOM element references and persistence helpers
- Used by: event listeners registered during `init()`

**Persistence Layer:**
- Purpose: Read and write card entities in local storage
- Location: `openDb`, `readCards`, `saveCard`, `deleteCard` in `app.js`
- Contains: database open/upgrade logic and transaction wrappers
- Depends on: `indexedDB` API
- Used by: application logic layer

**Offline/Network Layer:**
- Purpose: Keep app shell available offline and cache GET responses
- Location: `sw.js`
- Contains: `install`, `activate`, and `fetch` handlers
- Depends on: `caches` API and service worker lifecycle
- Used by: browser service worker runtime after registration in `registerServiceWorker()`

## Data Flow

**Card Save Flow:**
1. User submits `#cardForm` in `index.html`
2. `onSubmitCard` validates name + rewards and builds the card payload
3. `saveCard` persists the entity to `IndexedDB`
4. `state.cards` is inserted/updated in memory
5. `render()` refreshes card list and ranking output

**Best Card Flow:**
1. User selects category in `#categoryPicker`
2. `renderComparison` computes per-card multiplier with fallback order: category -> `other` -> `1`
3. Results are sorted descending by multiplier
4. Best card summary and full ranking are rendered to `#result` and `#ranking`

**State Management:**
- Single mutable in-memory object: `state` (`cards`, `editingCardId`)
- Durable state stored in `IndexedDB` object store `cards`
- No explicit centralized reducer/store abstraction

## Key Abstractions

**Card Entity:**
- Purpose: canonical record persisted and rendered
- Examples: objects created in `onSubmitCard` and read in `readCards`
- Pattern: plain object with `id`, `name`, `issuer`, `rewards`, `createdAt`, `updatedAt`

**Reward Mapping:**
- Purpose: normalize reward rows and deduplicate categories
- Examples: `collectRewards()` in `app.js`
- Pattern: uses `Map` to keep max multiplier per category before serialization

## Entry Points

**Document Entry:**
- Location: `index.html` loads `/app.js` with `defer`
- Triggers: browser page load
- Responsibilities: initialize category UI, event wiring, DB read, first render, service worker registration

**Service Worker Entry:**
- Location: `sw.js`
- Triggers: service worker lifecycle events (`install`, `activate`, `fetch`)
- Responsibilities: app shell pre-cache, old cache cleanup, GET response caching

## Error Handling

**Strategy:** Promise rejection and top-level startup catch in `init().catch(...)`

**Patterns:**
- Startup failures write user-facing message to `#result`
- `IndexedDB` request/transaction errors reject promises
- Input guards avoid persisting invalid form values

## Cross-Cutting Concerns

**Logging:** `console.error` for startup/service worker failures
**Validation:** HTML constraints + runtime guards in `collectRewards()`
**Authentication:** none (local-only app)

---

*Architecture analysis: 2026-02-28*
*Update when major patterns change*
