# CardTracker (PWA MVP)

Local-first progressive web app for tracking credit card category multipliers and quickly finding the best card for a purchase type.

## Features

- Save cards on-device using `IndexedDB` (no login required)
- Add multipliers by category per card
- Instant ranking by selected category
- Installable as a PWA
- Offline-capable app shell with a service worker

## Run locally

Because service workers require `http://` (or `https://`) origin, run a local server:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080).

Deployment note: this app currently uses root-absolute asset paths, so host it at domain root (`/`) unless paths are updated.

## Data model (current)

- Card name
- Optional issuer
- Optional card network (Visa, Mastercard, etc.)
- Reward multipliers by category

## Next steps

- Edit existing cards
- Category notes (rotating quarters, caps, or spend limits)
- Optional cloud sync with auth (Supabase/Firebase)
- Backup/export and import JSON
