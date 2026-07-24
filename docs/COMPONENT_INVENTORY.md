# COMPONENT INVENTORY — LOCKED

Reusable components required to recreate the Whiff visual system in original Shopify OS 2.0 Liquid (no scraped proprietary source).

---

## Global shell

| Component | Behavior notes | Key measurements |
|-----------|----------------|------------------|
| Announcement bar | Swiper/rotating messages; social left | H 46px, bg `#729855`, text white 16px |
| Utility / localization | Country + language dropdowns in header group | Compact controls |
| Header | Logo + inline nav + icons | H 96px / 64px mobile |
| Desktop navigation | Capitalize links; Shop opens mega-menu | 15–16px, pad ~14px |
| Mega menu / dropdown | Column headings 20px / 1.5px tracking; product links 15px @ 0.8 opacity | Transition 0.2–0.3s |
| Mobile menu drawer | `header-drawer` / `.menu-drawer`; opens on mobile | Present; display block when open |
| Search drawer/modal | Opens from Search control; predictive popular searches | Input H 60px |
| Cart drawer | `cart-drawer` exists; empty + populated states | Found in DOM |
| Sticky header | `<sticky-header>` element | Relative until scroll logic engages |
| Footer | 4 content zones + logo blurb + payments | Inverse colors |
| Cookie banner | GDPR section | Hidden until needed |
| Newsletter modal | Overlay popup | Document; dismiss for QA |

---

## Marketing / content sections

| Component | Shopify-style type | Notes |
|-----------|--------------------|-------|
| Hero slideshow | `slideshow` | Full-bleed, overlay copy, outline CTA |
| Section heading | Shared | Centered editorial titles on product-led areas |
| Collection list / tiles | `collection-list` | Image cards, consistent ratio, cover crop |
| Featured collection | `featured-collection` | 4-col desktop product grid |
| Image with text / video | `image-with-video` | Split storytelling |
| Hotspot / flex showcase | `collection-flex-hotspot`, `section-hotspot` | Mixed image proportions |
| Number counter / stats | `section-number-counter` | Large figures + small labels |
| Video section | `video-section` | Lifestyle |
| Marquee | `section-marquee` | Blush bg `#e8d4c2` |
| Slideshow with tabs | `slideshow-with-tabs` | Tabbed lookbook |
| Testimonial (product) | `testimonial-product` | Quote + product tie-in |
| Testimonial (brand) | `testimonial-brand` | About page |
| Featured blog | `featured-blog` | Journal cards |
| Deal / countdown banner | `section-deal-banner` | Offer block |
| Instagram / social gallery | custom section | Flexible height |
| Service icon strip | multicolumn / icons | 4 trust items on product |
| Grid banner | `section-grid-banner` | About story splits |
| Team section | `section-team-section` | Avatar + role + social |
| Image comparison banner | `section-image-comparison-banner` | Product page |
| Image banner | `section-image-banner` | Collections promo |
| Breadcrumbs / page banner | shared | Product / about / collections |

---

## Commerce components

| Component | Notes |
|-----------|-------|
| Product card | Image-first; title 26px; price 14px; hover underline/swap; gap 20px |
| Collection card | Title + product count + “view collection”; fully clickable |
| Price | Sale / compare-at support; `.price--on-sale` |
| Sale / sold-out badges | Radius 0; uppercase small |
| Quantity selector | `quantity-input`, H 50px |
| Variant picker / swatches | Radio fieldset (Weight) |
| Product gallery | Media gallery + thumbnails + modal |
| Product form | ATC + dynamic checkout |
| Product tabs / accordions | `<details>` / summary pattern |
| Product recommendations | Related products section |
| Cart line item controls | Qty update / remove (cart drawer) |
| Filter / sort / pagination | Match reference on collection templates when present |

---

## Forms

| Component | Fields / style |
|-----------|----------------|
| Contact form | Name, Email*, Message/Additional info*, checkbox, Send |
| Newsletter | Email + subscribe control in footer / modal |
| Search field | 60px height, beige border |

---

## Primitives

- Button variants: solid primary, outline dark, outline light-on-media, full-width
- Icon buttons: search, cart (with count badge), account, close, menu
- Dividers: 1px `#ddccbd`
- Focus states: theme `focus-inset` pattern — keep visible AA focus
- Empty / error / success states for cart, forms, sold-out

---

## Implementation plan (architecture only — not built yet)

Prepare OS 2.0 folders later:

`layout/`, `templates/*.json`, `sections/`, `snippets/`, `assets/`, `config/`, `locales/`

Each major section needs schema: headings, richtext, images, links, blocks, presets, spacing within safe limits.
