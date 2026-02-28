# Coding Conventions

**Analysis Date:** 2026-02-28

## Naming Patterns

**Files:**
- Lowercase file naming at project root (`app.js`, `sw.js`, `styles.css`, `index.html`)
- No module split naming scheme yet (single main script)

**Functions:**
- `camelCase` for helper and workflow functions (`populateCategoryPickers`, `collectRewards`)
- Event-style handlers prefixed with `on`/verb semantics (`onSubmitCard`, `startEdit`, `resetForm`)

**Variables:**
- `UPPER_SNAKE_CASE` for constants (`CATEGORIES`, `DB_NAME`, `CACHE_NAME`)
- `camelCase` for mutable and local values (`state`, `dbPromise`, `editingCard`)

**Types:**
- No TypeScript conventions (JavaScript-only codebase)

## Code Style

**Formatting:**
- Two-space indentation used consistently
- Double quotes used for JavaScript strings
- Semicolons used consistently
- Trailing commas present in multiline arrays/objects

**Linting:**
- No linter configuration detected (`eslint` config not present)

## Import Organization

**Order:**
1. Not applicable; no ES module imports are used

**Path Aliases:**
- None detected

## Error Handling

**Patterns:**
- Top-level startup catch via `init().catch(...)`
- Promise wrappers for IndexedDB request and transaction errors
- Guard clauses for invalid form input and missing entity references

## Logging

**Framework:**
- `console.error`

**Patterns:**
- Logging focused on startup and service worker registration errors
- No structured logger abstraction

## Comments

**When to Comment:**
- Minimal inline comments in source files
- Codebase leans on clear names and compact helpers over heavy annotation

**JSDoc/TSDoc:**
- Not used

## Function Design

**Size:**
- Mix of small helpers (`escapeHtml`, `deleteCard`) and larger UI functions (`renderCards`, `wireEvents`)

**Parameters:**
- Positional parameters for small helpers
- Defaults used for optional UI row values (`addRewardRow(category = "other", multiplier = "1")`)

**Return Values:**
- Async persistence helpers return promises
- UI handlers usually mutate state/DOM and return void

## Module Design

**Exports:**
- Not applicable; browser script is non-module

**Barrel Files:**
- Not applicable

---

*Convention analysis: 2026-02-28*
*Update when patterns change*
