---
quick_task: 1
slug: default-the-category-picker-to-everythin
description: Default the category picker to Everything Else and move the best-card view-all control to the bottom of the box
commit: 80aaf05
completed: 2026-03-06
key_files:
  - app.js
verification:
  - node --test tests/*.test.mjs
---

# Quick Task 1 Summary

## Outcome

- Defaulted the main purchase category picker to `Everything Else` so the comparison view opens on the fallback category instead of `Dining / Restaurants`.
- Moved the ranking overflow control to render after the ranking list, which places the `View all` button at the bottom of the Find Best Card panel.

## Files Changed

- `app.js` — set the initial category-picker value to `other` and moved the overflow container insertion point below the ranking list.

## Verification

- `node --test tests/*.test.mjs`

## Notes

- The quick task touched comparison presentation only. No roadmap or phase documents were changed.
