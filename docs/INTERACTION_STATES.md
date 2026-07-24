# INTERACTION STATES — LOCKED

Probed on live reference 2026-07-24. Evidence: `audit/data/interactions.json`, product/contact deep dives, browser inspection.

---

## Header & navigation

| State | Observation |
|-------|-------------|
| Default | Announcement 46px + header 96px (desktop) / 64px (mobile) |
| Sticky | `<sticky-header>` custom element; relative until scroll engagement |
| Scrolled | Mobile probe: header translates upward while sticky behavior active |
| Mega-menu / dropdown | Shop uses mega-menu classes; column headings + product links |
| Active / hover | Nav `0.2s linear`; mega links underline color `0.3s ease` |
| Mobile hamburger | Present; drawer `display: block` when opened on mobile |
| Keyboard | Focus-inset classes present — preserve visible focus + Escape closes drawers |

## Search

| State | Observation |
|-------|-------------|
| Closed | Icon button in header |
| Open | `searchOpened: true` on desktop + mobile after click |
| Field | 60px height, beige border, popular search chips |

## Cart drawer

| State | Observation |
|-------|-------------|
| Control | Cart button / `#cart-icon-bubble` |
| Element | `cart-drawer` found (`display: flex`) |
| Closed | `visibility: hidden` when not active |
| Open / empty / populated | Must support empty text, line items, qty update, remove (match theme drawer UX) |
| Escape / close | Close icon + Escape |

## Product cards

| State | Observation |
|-------|-------------|
| Default | Image + title 26px + price 14px |
| Hover | `cardHover: true`; image `transform 0.3s ease`; title `0.2s linear` |
| Image swap | Support secondary image on hover when media available |
| Quick actions | Preserve if present in reference theme (wishlist/compare optional) |

## Product page

| State | Observation |
|-------|-------------|
| Variant selected | Radio Weight 75g checked by default; others available |
| Unavailable / sold out | Must disable ATC + show messaging (not all combos present on Lemon White Snow) |
| Quantity | Inc/dec buttons + spinbutton; height 50px |
| Add to cart | Outline secondary full-width; loading/success/failure required |
| Dynamic checkout | Buy it now / Shopify payment button present |
| Gallery | Thumbnail loaders + “Open media in modal” |
| Accordions | Description / Shipping / Returns — closed by default; summary toggles |
| Availability | “Hurry! Only N left…” + delivery/shipping notes |

## Collections

| State | Observation |
|-------|-------------|
| Card hover | Same card system |
| Click | Entire card / “view collection” navigates |
| Banner | Promo image banner above title |

## Contact form

| State | Observation |
|-------|-------------|
| Default | Name, Email*, Additional information*, checkbox, Send |
| Focus | 0.1s transition; 1px `#ddccbd` border |
| Validation | Required attributes on live fields — show native/theme errors |
| Success | Shopify contact success message pattern |
| Submit button | Solid `#e8d4c2` / `#222121` text, 52px |

## Newsletter

| State | Observation |
|-------|-------------|
| Footer field | Email + Subscribe |
| Modal | Newsletter overlay section exists (dismiss for inspection) |

## Other

| State | Observation |
|-------|-------------|
| Marquee | Continuous promo strip on blush ground |
| Slideshow | Prev/next controls; autoplay possible — respect reduced-motion |
| Countdown / deal | Deal banner family present on homepage |
| Cookie banner | GDPR section present |

## Accessibility contract for interactions

- Escape closes drawers/modals
- Focus trap inside open drawers
- Icon buttons need accessible names (Search, Cart, Menu, Close)
- Prefer `prefers-reduced-motion: reduce` (audit used reducedMotion)
