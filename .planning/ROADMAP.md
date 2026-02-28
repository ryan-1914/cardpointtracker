# Roadmap: CardTracker

## Overview

This milestone evolves CardTracker from manual-entry only into a dual-path wallet builder for general users: add from a curated popular-card catalog or create custom cards manually. Work is sequenced so discovery and data integrity land before wallet integration and UX guardrails, while preserving the core ranking experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Baseline Comparison Hardening** - Lock down existing comparison behavior and baseline wallet flows as foundation (completed 2026-02-28)
- [x] **Phase 2: Catalog Discovery Experience** - Add built-in catalog browsing with name and issuer discovery (completed 2026-02-28)
- [x] **Phase 3: Catalog-to-Wallet Integration** - Allow adding/removing catalog cards with duplicate prevention (completed 2026-02-28)
- [x] **Phase 4: Card Type Rules & Editability** - Enforce read-only catalog cards while preserving editable custom cards (completed 2026-02-28)
- [ ] **Phase 5: Mixed Wallet UX Validation** - Validate combined custom+catalog ranking UX for general users

## Phase Details

### Phase 1: Baseline Comparison Hardening
**Goal:** Ensure baseline ranking UI and top-card feedback stay correct while architecture evolves for catalog support.
**Depends on:** Nothing (first phase)
**Requirements:** [WAL-01, WAL-02]
**Success Criteria** (what must be TRUE):
  1. User can select any available category and see wallet cards ranked highest-to-lowest multiplier.
  2. User can clearly identify the best card recommendation for the selected category.
  3. Existing baseline comparison behavior remains stable after foundation refactors.
**Plans:** 2/2 plans complete

Plans:
- [ ] 01-01-PLAN.md — Extract deterministic comparison core with regression tests
- [ ] 01-02-PLAN.md — Harden top-card callout clarity and edge-state messaging

### Phase 2: Catalog Discovery Experience
**Goal:** Introduce a built-in catalog that users can browse and discover cards by name and issuer.
**Depends on:** Phase 1
**Requirements:** [CAT-01, CAT-02, CAT-03]
**Success Criteria** (what must be TRUE):
  1. User can open a catalog flow and see popular cards with predefined multipliers.
  2. User can search catalog by card name and quickly narrow results.
  3. User can filter catalog by issuer and combine it with search.
**Plans:** 3/3 plans complete

Plans:
- [ ] 02-01: Add static catalog dataset and normalization model for predefined rewards
- [ ] 02-02: Build catalog UI list with performant name search
- [ ] 02-03: Add issuer filtering controls and empty-state handling

### Phase 3: Catalog-to-Wallet Integration
**Goal:** Connect catalog selection to wallet state with integrity constraints.
**Depends on:** Phase 2
**Requirements:** [CAT-04, CAT-05, CAT-07]
**Success Criteria** (what must be TRUE):
  1. User can add a catalog card to wallet and immediately see it in wallet list and ranking.
  2. User cannot add the same catalog card more than once.
  3. User can remove a previously added catalog card from wallet.
**Plans:** 3/3 plans complete

Plans:
- [ ] 03-01: Implement add-from-catalog action and wallet persistence for catalog card origin
- [ ] 03-02: Enforce duplicate prevention rules and user feedback for already-added cards
- [ ] 03-03: Support delete flow parity for catalog-sourced wallet entries

### Phase 4: Card Type Rules & Editability
**Goal:** Define wallet behaviors by card origin so catalog cards are immutable and custom cards remain user-managed.
**Depends on:** Phase 3
**Requirements:** [CAT-06, CUS-01, CUS-02, CUS-03]
**Success Criteria** (what must be TRUE):
  1. User can create custom cards manually with reward multipliers.
  2. User can edit custom cards but cannot edit catalog cards.
  3. User can delete custom cards from wallet without affecting catalog definitions.
**Plans:** 3/3 plans complete

Plans:
- [ ] 04-01: Introduce explicit card-origin/type model in wallet entities
- [ ] 04-02: Gate edit affordances to custom cards only and hide/disable catalog edit paths
- [ ] 04-03: Preserve custom create/edit/delete workflows alongside catalog workflows

### Phase 5: Mixed Wallet UX Validation
**Goal:** Validate the complete dual-source wallet experience for general users and ensure mixed ranking accuracy.
**Depends on:** Phase 4
**Requirements:** [WAL-03]
**Success Criteria** (what must be TRUE):
  1. Ranking logic treats catalog and custom cards consistently for the same category.
  2. Main screen experience remains fast and understandable with mixed wallet composition.
  3. Key edge cases (empty wallet, single card, catalog-only, custom-only, mixed) behave correctly.
**Plans:** 2 plans

Plans:
- [ ] 05-01: Validate mixed-wallet ranking and fallback behavior across edge cases
- [ ] 05-02: Ship UX polish, copy clarity, and final acceptance checks for general users

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Baseline Comparison Hardening | 2/2 | Complete    | 2026-02-28 |
| 2. Catalog Discovery Experience | 3/3 | Complete    | 2026-02-28 |
| 3. Catalog-to-Wallet Integration | 3/3 | Complete    | 2026-02-28 |
| 4. Card Type Rules & Editability | 3/3 | Complete    | 2026-02-28 |
| 5. Mixed Wallet UX Validation | 0/2 | Not started | - |
