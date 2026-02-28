# Technology Stack

**Analysis Date:** 2026-02-28

## Languages

**Primary:**
- JavaScript (ES2020+) for application and service worker logic in `app.js` and `sw.js`

**Secondary:**
- HTML5 for structure in `index.html`
- CSS3 for styling in `styles.css`
- SVG for app icon asset in `assets/icon.svg`

## Runtime

**Environment:**
- Modern browser runtime with Web APIs (`document`, `indexedDB`, `caches`, `serviceWorker`)
- Service worker runtime for offline behavior in `sw.js`

**Package Manager:**
- None detected
- Lockfile: none detected

## Frameworks

**Core:**
- None (vanilla web platform)

**Testing:**
- None detected

**Build/Dev:**
- No bundler or transpiler detected
- Local development served as static files (README suggests `python3 -m http.server 8080`)

## Key Dependencies

**Critical:**
- Browser `IndexedDB` API for local persistence in `openDb`, `readCards`, `saveCard`, `deleteCard` (`app.js`)
- Browser `Service Worker` API for install/activate/fetch lifecycle (`sw.js`)
- Browser `Cache Storage` API for app shell and runtime response caching (`sw.js`)

**Infrastructure:**
- Browser `crypto.randomUUID()` for card id generation in `onSubmitCard` (`app.js`)

## Configuration

**Environment:**
- No `.env` files or environment variable usage detected
- PWA metadata configured in `manifest.webmanifest`

**Build:**
- No build config files detected (`package.json`, `vite.config.*`, `webpack.*`, `tsconfig.*` absent)

## Platform Requirements

**Development:**
- Any OS with a static HTTP server and a modern browser

**Production:**
- Static hosting that serves root assets and `manifest.webmanifest`
- HTTPS recommended for installability and service worker behavior outside localhost

---

*Stack analysis: 2026-02-28*
*Update after major dependency changes*
