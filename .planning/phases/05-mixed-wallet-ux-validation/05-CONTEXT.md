# Phase 5: Mixed Wallet UX Validation - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Validate the mixed custom+catalog wallet experience for general users so comparison stays clear, the main screen remains easy to scan, and mixed-wallet ranking behavior feels trustworthy across edge cases. This phase refines validation, presentation, and acceptance confidence within the existing wallet/catalog feature set; it does not add new card-management capabilities.

</domain>

<decisions>
## Implementation Decisions

### Main-screen emphasis and flow
- The app should feel compare-first for someone landing on the main screen.
- Section order should be: Compare, Your Cards, Add Card, then Catalog.
- The catalog remains available on the main screen but should be collapsed by default.

### Comparison presentation
- The main comparison view should show only the top 4 qualifying cards to keep the screen clean.
- If more than 4 cards qualify, provide an expandable "View all" option rather than showing the full list immediately.
- Keep the top recommendation terse: card name plus multiplier only.

### Final polish scope
- Keep Phase 5 polish minimal and functional rather than adding heavy UX treatment.
- Do not add extra custom-vs-catalog visual distinction inside the comparison experience beyond the current UI approach.
- Continue treating the wallet list as the primary place where custom vs catalog state is visibly differentiated.

### Claude's Discretion
- Exact expand/collapse interaction design and copy for the catalog section.
- Exact "View all" interaction copy and any companion collapse behavior for the ranking list.
- Minor copy refinements and spacing adjustments as long as the compare-first layout and minimal-polish intent remain intact.

</decisions>

<specifics>
## Specific Ideas

- "Let's only show the top 4 cards to make it clean."
- The catalog should feel lower priority than comparison and wallet management, but still be easy to reach when needed.
- The final main screen should favor quick scanning over extra explanation.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app.js` `renderComparison()`: already computes ranked results and renders the best-card callout plus ranking list; this is the natural integration point for top-4 display and a "View all" toggle.
- `app.js` `renderCards()`: already shows custom/catalog source badges and read-only cues in the wallet list, matching the decision to keep origin distinction strongest there.
- `index.html`: the app uses a simple stacked panel layout, so section order changes can be handled by reordering existing panels instead of introducing a new shell.
- `styles.css`: existing panel, ranking, and list styles provide a base for a collapsed catalog section and compact comparison treatment without introducing a new design system.

### Established Patterns
- The app uses a single-page vanilla JS render pipeline with DOM references in `app.js` and explicit rerender functions for wallet, catalog, and comparison state.
- Comparison correctness is already centralized through `comparison-core.js` and normalized wallet data from `wallet-core.js`, which supports consistent mixed-wallet validation without new ranking logic branches.
- Product copy and affordance changes are currently lightweight and inline, which aligns with the minimal-polish direction for this phase.

### Integration Points
- `index.html`: reorder the panel sequence so Add Card appears before Catalog.
- `app.js` `renderComparison()`: cap default ranking output to four entries and wire any expand/collapse state for the ranking list.
- `app.js` catalog render/event wiring: support collapsed-by-default catalog behavior while preserving current search/filter/add interactions.
- Existing comparison and wallet tests: extend coverage where needed to validate mixed-wallet behavior and any UI-facing ranking constraints.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 05-mixed-wallet-ux-validation*
*Context gathered: 2026-03-05*
