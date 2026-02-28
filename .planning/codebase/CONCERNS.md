# Codebase Concerns

**Analysis Date:** 2026-02-28

## Tech Debt

**Monolithic script architecture:**
- Issue: Rendering, event wiring, business logic, and persistence are tightly coupled
- Why: Fast MVP implementation in a single `app.js`
- Impact: Higher regression risk when touching unrelated behavior
- Fix approach: Split by concern (state, persistence, UI render, event handlers) and keep a thin composition entry

**No explicit data migration plan for IndexedDB:**
- Issue: Schema version is fixed at `DB_VERSION = 1` with no migration branches documented
- Why: Initial schema has remained simple
- Impact: Future schema changes may break upgrades or force data resets
- Fix approach: Add explicit migration cases in `onupgradeneeded` and document migration expectations

## Known Bugs

**Potential invalid multiplier persistence above UI max:**
- Symptoms: Runtime guard enforces multiplier `> 0` but does not enforce upper bound
- Trigger: Non-UI input path or modified DOM could persist values greater than 20
- Workaround: Use standard UI form controls only
- Root cause: `collectRewards()` validates lower bound only

## Security Considerations

**Client-side only validation boundary:**
- Risk: Invalid or unexpected values can be written to local storage if client-side controls are bypassed
- Current mitigation: HTML constraints and numeric parsing/guard checks
- Recommendations: Add stricter runtime schema validation before `saveCard()`

**No hosting security policy in repo:**
- Risk: CSP and related headers depend entirely on deployment defaults
- Current mitigation: Escaping of user-facing strings via `escapeHtml()`
- Recommendations: Configure CSP and hardening headers at hosting layer

## Performance Bottlenecks

**Full rerender after each mutation:**
- Problem: `render()` rebuilds complete card/ranking markup with `innerHTML`
- Cause: no keyed incremental render path
- Improvement path: introduce targeted updates or small component boundaries

**Unbounded runtime cache growth:**
- Problem: Service worker caches successful GET responses without eviction
- Cause: runtime `cache.put` strategy with no size/time limit
- Improvement path: restrict cacheable routes and add cache pruning policy

## Fragile Areas

**DOM attribute-coupled event delegation:**
- Why fragile: edit/delete behavior depends on `data-edit-id` and `data-delete-id` markup contracts
- Common failures: markup changes that break handler lookups
- Safe modification: update event handlers and template markup together
- Test coverage: no automated regression tests detected

**Reward row lifecycle assumptions:**
- Why fragile: user can remove all rows and submit silently no-op
- Common failures: confusion due missing validation feedback
- Safe modification: require at least one row or show explicit form error
- Test coverage: no automated form behavior tests detected

## Scaling Limits

**Browser-profile scoped storage:**
- Current capacity: constrained by browser IndexedDB quota
- Limit: data does not sync across devices/profiles
- Symptoms at limit: write failures when quota is exceeded
- Scaling path: add export/import and optional remote sync layer

## Dependencies at Risk

**Browser API compatibility constraints:**
- Risk: older browsers may not support `crypto.randomUUID` or service worker behavior as expected
- Impact: app can fail to create IDs or provide offline support on older clients
- Migration plan: add capability checks and fallbacks/polyfills

## Missing Critical Features

**No backup/export and import flow:**
- Problem: users cannot migrate or recover card data easily
- Current workaround: none
- Blocks: safe device migration and disaster recovery
- Implementation complexity: low to medium

## Test Coverage Gaps

**Core persistence and ranking logic untested:**
- What's not tested: `IndexedDB` CRUD helpers and category fallback ranking rules
- Risk: regressions can ship without detection
- Priority: High
- Difficulty to test: moderate (requires test harness for DOM + IndexedDB mocks)

---

*Concerns audit: 2026-02-28*
*Update as issues are fixed or discovered*
