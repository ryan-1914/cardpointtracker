---
status: complete
phase: 05-mixed-wallet-ux-validation
source:
  - 05-01-SUMMARY.md
  - 05-02-SUMMARY.md
started: 2026-03-06T16:43:34Z
updated: 2026-03-06T16:49:41Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running instance, clear local storage if needed, start the app fresh. It boots without errors and the main comparison panel renders.
result: issue
reported: "show catalog not working on mobile"
severity: major

### 2. Compare-First Panel Order
expected: The main screen panels are ordered as: Find Best Card, Your Cards, Add Card, then Popular Card Catalog.
result: pass

### 3. Catalog Collapsed by Default
expected: On first load, the catalog panel is hidden and the toggle reads "Show Catalog". Clicking it reveals the search and issuer filter controls.
result: issue
reported: "the show catalog doesn't work on mobile for some reason"
severity: major

### 4. Catalog Filter State Persists
expected: After opening the catalog, set a search term and issuer filter. Collapse the catalog and reopen it; the search term and issuer selection remain unchanged.
result: pass

### 5. Top-Four Ranking with Expand/Collapse
expected: With 5+ qualifying cards for a category, only the top four appear initially with a "View all" control. Clicking expands to show all; clicking "Show fewer" returns to four.
result: pass

### 6. Mixed-Wallet Ranking Stability
expected: Add a catalog card and a custom card with equivalent rewards for the selected category, plus at least one other card. The ranking order is deterministic and does not change after refresh or based on add order.
result: pass

## Summary

total: 6
passed: 4
issues: 2
pending: 0
skipped: 0

## Gaps

- truth: "App boots without errors and the main comparison panel renders after a fresh start."
  status: failed
  reason: "User reported: show catalog not working on mobile"
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "On first load, the catalog panel is hidden and the toggle reads 'Show Catalog'. Clicking it reveals the search and issuer filter controls."
  status: failed
  reason: "User reported: the show catalog doesn't work on mobile for some reason"
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
