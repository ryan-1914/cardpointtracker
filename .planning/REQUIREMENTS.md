# Requirements: CardTracker

**Defined:** 2026-02-28
**Core Value:** A user can choose a purchase category and immediately see the best card in their wallet, ranked correctly by multiplier.

## v1 Requirements

### Wallet Comparison

- [x] **WAL-01**: User can select a purchase category and see all wallet cards ranked by multiplier (highest first)
- [x] **WAL-02**: User can clearly identify the top-ranked card for the selected category
- [ ] **WAL-03**: Ranking logic applies to both custom and catalog cards using the same category/fallback rules

### Custom Cards

- [ ] **CUS-01**: User can manually add a custom card with one or more category multipliers
- [ ] **CUS-02**: User can edit an existing custom card's details and multipliers
- [ ] **CUS-03**: User can delete a custom card from wallet

### Catalog Cards

- [x] **CAT-01**: User can browse a built-in catalog of popular credit cards with predefined multipliers
- [x] **CAT-02**: User can search catalog cards by card name
- [x] **CAT-03**: User can filter catalog cards by issuer
- [x] **CAT-04**: User can add a catalog card to wallet with predefined multipliers
- [x] **CAT-05**: User cannot add the same catalog card to wallet more than once
- [ ] **CAT-06**: User cannot edit catalog card multipliers/details after adding to wallet
- [x] **CAT-07**: User can delete a catalog card from wallet

## v2 Requirements

### Catalog & Data Expansion

- **CATX-01**: Catalog cards include additional metadata (annual fee, network, benefit notes)
- **CATX-02**: Catalog can be refreshed from external source or API
- **CATX-03**: Catalog supports richer filters beyond name/issuer (network, fee tier, reward category focus)

### Account & Sync

- **SYNC-01**: User can sync wallet across devices
- **SYNC-02**: User can sign in to persist wallet in cloud

## Out of Scope

| Feature | Reason |
|---------|--------|
| External card API integration in v1 | Static curated catalog is faster, simpler, and more reliable for initial release |
| Annual fee/network/benefits metadata in v1 | User prioritized quick add flow over deep card metadata |
| Duplicate catalog entries in wallet | Would create ranking noise and confusing wallet state |
| Cloud account + cross-device sync in v1 | Not required to deliver core local comparison value |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WAL-01 | Phase 1 | Complete |
| WAL-02 | Phase 1 | Complete |
| WAL-03 | Phase 5 | Pending |
| CUS-01 | Phase 4 | Pending |
| CUS-02 | Phase 4 | Pending |
| CUS-03 | Phase 4 | Pending |
| CAT-01 | Phase 2 | Complete |
| CAT-02 | Phase 2 | Complete |
| CAT-03 | Phase 2 | Complete |
| CAT-04 | Phase 3 | Complete |
| CAT-05 | Phase 3 | Complete |
| CAT-06 | Phase 4 | Pending |
| CAT-07 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-28*
*Last updated: 2026-02-28 after roadmap creation*
