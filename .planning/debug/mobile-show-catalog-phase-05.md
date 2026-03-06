---
status: diagnosed
trigger: "Diagnose this UAT gap only. Phase: 05. Gap truth: On first load, the catalog panel is hidden and the toggle reads 'Show Catalog'. Clicking it reveals the search and issuer filter controls. Actual user report: \"the show catalog doesn't work on mobile for some reason\". Severity: major. Test reference: 3. Goal: find_root_cause_only."
created: 2026-03-06T16:50:49Z
updated: 2026-03-06T17:00:04Z
---

## Current Focus

hypothesis: Confirmed. The toggle works, but on a narrow viewport the newly revealed catalog controls land below the fold, so the interaction appears broken on mobile.
test: No further root-cause test needed.
expecting: n/a
next_action: Return diagnosis with evidence and fix direction.

## Symptoms

expected: On first load, the catalog panel is hidden and the toggle reads "Show Catalog". Clicking it reveals the search and issuer filter controls.
actual: User reports that "the show catalog doesn't work on mobile for some reason".
errors: none reported
reproduction: Open the app on mobile, tap "Show Catalog", observe that the catalog does not appear to work.
started: Reported during Phase 05 UAT on 2026-03-06.

## Eliminated

- hypothesis: The mobile issue is caused by broken JS toggle logic or a mobile-only event path failure.
  evidence: In a rendered narrow viewport, tapping the button changes the text from "Show Catalog" to "Hide Catalog", sets `aria-expanded` to `true`, clears `hidden`, and grows the page height from 1300px to 3245px.
  timestamp: 2026-03-06T17:00:04Z

## Evidence

- timestamp: 2026-03-06T16:51:56Z
  checked: app.js catalog toggle/render path
  found: The `click` handler on `#catalogToggle` only flips `state.isCatalogCollapsed` and calls `renderCatalog()`, which updates button text, `aria-expanded`, the panel `hidden` property, and the `catalog-collapsed` class.
  implication: The intended show/hide behavior is implemented in one direct path with no mobile-specific branch.

- timestamp: 2026-03-06T16:51:56Z
  checked: styles.css mobile rules
  found: The only explicit mobile media rule changes `.app` width/margin and `.reward-row` layout; there is no dedicated small-screen rule for `.catalog-panel` or `.catalog-toggle`.
  implication: A mobile-only failure is unlikely to come from an obvious conditional CSS branch and needs runtime reproduction.

- timestamp: 2026-03-06T17:00:04Z
  checked: Rendered app in Firefox WebDriver at a narrow 390x844 window
  found: After clicking `#catalogToggle`, the button text changed to "Hide Catalog", `aria-expanded` became `true`, `#catalogPanel.hidden` became `false`, and page height increased from 1300px to 3245px.
  implication: The tap succeeds and the catalog opens; the failure is not in the click handler.

- timestamp: 2026-03-06T17:00:04Z
  checked: Post-click viewport geometry in the same narrow render
  found: After the click, `window.innerHeight` was 760px, the toggle bottom sat at 759.4px, and the catalog controls started at 776.4px and ended at 917.4px.
  implication: The revealed search/filter controls start entirely below the visible viewport, so mobile users do not see any newly revealed content immediately after tapping.

## Resolution

root_cause:
The catalog toggle opens the panel correctly, but the app does not scroll or reposition the newly revealed catalog content into view. On mobile-height viewports, the toggle sits at the bottom of the screen and the revealed controls start below the fold, making "Show Catalog" appear non-functional even though state changes correctly.
fix:
verification: Verified by rendered narrow-viewport automation in Firefox: the click updates state and DOM correctly, but the controls begin below the viewport immediately after expansion.
files_changed: []
