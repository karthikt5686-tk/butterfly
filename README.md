# Butterfly Kindergarten — website

A static website for a kindergarten: home, about us, academics and contact.
Plain HTML, CSS and JavaScript — no build step, no dependencies. It also
installs on a phone as a progressive web app and works offline.

## Pages

| File | Page | Contents |
| --- | --- | --- |
| `index.html` | Home | Hero, four age-group programmes, why-us section with a daily schedule, parent testimonials, call to action |
| `about.html` | About Us | Our story, at-a-glance facts, four values, teacher profiles, FAQ |
| `academics.html` | Academics | Curriculum approach, six learning areas, year-by-year goals, weekly timetable, assessment, school readiness, FAQ |
| `contact.html` | Contact | Address, phone, email, travel notes, opening-hours table, map embed and an enquiry form |
| `offline.html` | Offline fallback | Shown by the service worker when an uncached page is opened with no connection |

Shared assets:

- `css/styles.css` — the whole design system (colour tokens, layout, components, responsive rules)
- `js/main.js` — mobile navigation, footer year, contact-form validation, service-worker registration, install banner
- `manifest.webmanifest` — app name, icons, theme colours and home-screen shortcuts
- `sw.js` — service worker: precaches the site, serves it offline
- `icons/` — app icons (192, 512, maskable, Apple touch, favicon)

## Running it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Installing it as a mobile app

The site is a **progressive web app**, so it installs to a phone's home screen
with its own icon and opens full-screen with no browser chrome — no app store
involved. It must be served over **https:// (or localhost)**; service workers
are disabled on `file://`, so opening the HTML directly gives you the plain
website without offline support.

- **Android / Chrome / Edge** — an "Install" banner appears at the bottom of the
  page. Tapping it installs the app. (Also available under ⋮ → *Install app*.)
- **iPhone / iPad — Safari** — tap **Share**, then **Add to Home Screen**. iOS has
  no install prompt, so the site shows a short reminder instead.
- **Desktop Chrome / Edge** — an install icon appears in the address bar.

Once installed, all four pages work with no connection. Anything not yet
visited falls back to `offline.html`.

### Updating the app

Cached copies are keyed by `CACHE_VERSION` in `sw.js`. **Bump that string
whenever you change the site** (`butterfly-v1` → `butterfly-v2`), or returning
visitors will keep seeing the old pages from their cache.

### If you need a real App Store / Play Store build

A PWA cannot be submitted to the stores as-is. To produce an `.apk` or `.ipa`
you would wrap this same folder with [Capacitor](https://capacitorjs.com):

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Butterfly Kindergarten" com.butterfly.kindergarten --web-dir=.
npx cap add android   # needs Android Studio
npx cap add ios       # needs macOS, Xcode and an Apple Developer account
```

Publishing to the Play Store needs a one-off developer account fee; the App
Store needs a yearly one, plus a Mac to build on.

## Notes

- **The contact form has no backend.** It validates in the browser and shows a
  confirmation message, then resets. To make it deliver real enquiries, point the
  `<form>` at a form-handling service or your own endpoint and remove the local
  confirmation block at the end of `js/main.js`.
- **Content is placeholder.** The name, address, phone number, email, staff,
  testimonials and registration number are invented. Replace them before this
  goes live — the contact details appear in the footer of all three pages.
- The map on the contact page is an OpenStreetMap embed pointing at sample
  coordinates; swap the `bbox` in the `iframe` for the real location.
- Fonts load from Google Fonts with system fallbacks, so the site still renders
  correctly offline. The service worker deliberately does not cache cross-origin
  requests, so fonts and the map fall back gracefully rather than failing the
  install.

## Accessibility

Skip link, keyboard-operable menu that closes on `Escape`, visible focus rings,
labelled form fields with inline error messages, `aria-current` on the active nav
item, and a `prefers-reduced-motion` rule that disables transitions.
