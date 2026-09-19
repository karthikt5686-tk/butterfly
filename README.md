# Butterfly Kindergarten — website

A small static website for a kindergarten: home page, about page and contact page.
Plain HTML, CSS and JavaScript — no build step, no dependencies.

## Pages

| File | Page | Contents |
| --- | --- | --- |
| `index.html` | Home | Hero, four age-group programmes, why-us section with a daily schedule, parent testimonials, call to action |
| `about.html` | About Us | Our story, at-a-glance facts, four values, teacher profiles, FAQ |
| `contact.html` | Contact | Address, phone, email, travel notes, opening-hours table, map embed and an enquiry form |

Shared assets:

- `css/styles.css` — the whole design system (colour tokens, layout, components, responsive rules)
- `js/main.js` — mobile navigation, footer year, contact-form validation

## Running it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

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
  correctly offline.

## Accessibility

Skip link, keyboard-operable menu that closes on `Escape`, visible focus rings,
labelled form fields with inline error messages, `aria-current` on the active nav
item, and a `prefers-reduced-motion` rule that disables transitions.
