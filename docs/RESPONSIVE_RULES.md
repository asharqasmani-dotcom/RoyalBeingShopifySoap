# RESPONSIVE RULES — LOCKED

## Audited viewports

| Name | Size | Status |
|------|------|--------|
| Desktop | 1440 × 1000 | Captured all 5 pages |
| Laptop | 1280 × 800 | Captured all 5 pages |
| Tablet portrait | 768 × 1024 | Captured all 5 pages |
| Mobile | 390 × 844 | Captured all 5 pages |
| Narrow mobile | 360 × 800 | Captured all 5 pages |

Screenshots: `audit/screenshots/{page}/{viewport}/full-page.png` + `above-fold.png` (+ region crops on desktop/mobile).

## Theme breakpoints to honor

Primary media queries observed in CSS:

- `749px` / `750px` — mobile ↔ tablet commerce layout
- `989px` / `990px` — header inline nav vs drawer
- `1200px` — large desktop refinements
- `1440px` — wide desktop

Also present: 480, 575–581, 768, 1280, 1640 clusters — implement fluidly but test the five audit sizes as gates.

## Layout rules by viewport

### Desktop / laptop (≥990)

- Inline navigation visible; mega-menu on Shop
- `.page-width` max **1720px**, gutters **40px**
- Featured products **4 columns** where section allows
- Product page **50/50** media/info (680/680 @1440)
- Header height **96px**
- Hero **900px**

### Tablet (768)

- Nav collapses toward drawer behavior near 990
- Grids reduce column count (2-col product cards typical)
- Product stacks toward single column below ~990
- Gutters remain ~40px until smaller mobile rules

### Mobile / narrow (≤750, tested 390 & 360)

- Header **64px**; hamburger / `header-drawer` primary nav
- Hero ~**482px**
- Single-column stacking for image-with-text, team, product
- Collection grid becomes 1-col list of taller cards (~2583px main section @390)
- Footer stacks; newsletter full width
- Type scales down (H2 ≈28px, H3 ≈26px observed)
- Touch targets: buttons remain ≥50px height

## Overflow

`overflowX: false` on all audited page/viewport combinations.

## Image behavior

- `object-fit: cover` on cards/collection media
- `object-position: 50% 50%` default
- Radius **0** unless a specific organic mask section uses editorial framing — preserve per-section when implementing
- Do not lazy-load LCP hero; lazy-load below-fold

## Sticky / scroll

- `<sticky-header>` present
- Mobile scroll probe showed header translating (`y: -64` when scrolled) — implement sticky without content jump; announcement may scroll away

## Consistency rules

1. Same container + gutter system on every template
2. Same button + input tokens everywhere
3. Same card title/price hierarchy on home, collection, recommendations
4. No second visual language at any breakpoint
