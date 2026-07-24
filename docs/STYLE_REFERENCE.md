# STYLE REFERENCE — LOCKED WHIFF SYSTEM

> Source: live audit of `https://dt-whiff.myshopify.com` (password storefront).  
> Audited: 2026-07-24. Live computed styles win over assumptions.  
> **Do not redesign.** Preserve tokens, rhythm, and component behavior in the next content prompt.

Raw evidence: `audit/data/*.json`, `audit/screenshots/**`.

---

## 1. Visual character (verified)

- Premium handmade / organic skincare aesthetic
- Warm cream page field, soft blush/beige section fills, olive accent bar
- Near-black charcoal headings (`#222121`)
- Elegant editorial serif for **both** display and body: **Asul**
- Minimal shadows; radius mostly `0`
- Fine 1px borders in warm beige `#ddccbd`
- Product-first, generous whitespace, centered section titles on product-led blocks

---

## 2. Exact font families

| Role | Family | Source |
|------|--------|--------|
| Heading | `Asul, serif` | `--font-heading-family` |
| Body / UI | `Asul, serif` | `--font-body-family` |
| Native fallback only | `Arial` | unstyled system buttons |

**Hypothesis correction:** master prompt expected serif + sans pair. Live theme uses **Asul for both**. Lock Asul (or equivalent licensed serif) as the single brand face unless content prompt explicitly changes typography.

Root type scale (CSS variables):

| Token | Value |
|-------|-------|
| `--h1-font-size` | `48px` |
| `--h2-font-size` | `40px` |
| `--h3-font-size` | `32px` |
| `--h4-font-size` | `28px` |
| `--h5-font-size` | `24px` |
| `--h6-font-size` | `16px` |
| `--body_font-size` | `16px` |
| `--heading-line-height` | `1.4` |
| `--body-line-height` | `1.6` |
| `--font-heading-weight` | `normal` (400) |
| `--font-body-weight` | `400` |
| `--font-body-weight-bold` | `700` |
| `--heading-letter-spacing` | `0px` |
| `--body-letter-spacing` | `0px` |
| `--font-heading-style` | `capitalize` |
| Root `html` rem | `10px` |

### Computed samples @1440

| Element | Size | Weight | Transform | Color | Line-height |
|---------|------|--------|-----------|-------|-------------|
| Product H1 | `40.8px` | 400 | capitalize | `#222121` | `50px` |
| Collections H1 | `48px` | 400 | capitalize | `#222121` | `67.2px` |
| Section H2 (cart empty sample / scale) | `34px` | 400 | capitalize | `#222121` | `47.6px` |
| Card title `.card__heading` | `26px` | 400 | capitalize | `#222121` | `36.4px` |
| Nav link | `15–16px` | 400 | capitalize | `#222121` | `24–25.6px` |
| Body / buttons | `16px` | 400 | capitalize (buttons) | `#222121` | 1.6 / normal |
| Price | `14px` | 400 | none | `#222121` | `14px` |
| Small / badges | `11px` | 400 | uppercase | `#222121` | `13.2px` |
| Mega-menu column heading | `20px` | 400 | capitalize | `#222121` | `25px` (+`1.5px` tracking) |

Mobile (@390) observed H2 ≈ `28px`, H3 ≈ `26px` (fluid downscale).

---

## 3. Exact color tokens

Theme stores RGB triples; hex equivalents locked below.

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| `--color-base-background-1` | 241,234,228 | `#f1eae4` | Page background |
| `--color-base-background-2` | 237,223,210 | `#eddfd2` | Soft warm section |
| `--color-base-background-3` | 232,212,194 | `#e8d4c2` | Blush / button fill / marquee |
| `--color-base-background-4` | 114,152,85 | `#729855` | Olive accent (announcement) |
| `--color-base-background-5` | 34,33,33 | `#222121` | Inverse / footer |
| `--color-base-text` | 34,33,33 | `#222121` | Headings / primary text |
| `--color-text` | 121,112,103 | `#797067` | Muted body |
| `--color-border` | 221,204,189 | `#ddccbd` | Borders / input edges |
| `--color-base-solid-button-labels` | 232,212,194 | `#e8d4c2` | Solid button surface pair |
| `--color-base-outline-button-labels` | 34,33,33 | `#222121` | Outline button label |
| `--color-product` | 232,212,194 | `#e8d4c2` | Product accent surface |
| `--color-overlay` | 216,241,225 | `#d8f1e1` | Soft green overlay tint |
| `--input-bg` | — | `#ffffff` | Inputs |
| White | — | `#ffffff` | Announcement text / secondary CTA on dark media |
| Transparent overlays | — | `#222121` @ 0.03–0.8 | Hover / scrims |

Frequency-backed palette on homepage: `#f1eae4`, `#222121`, `#ffffff`, `#e8d4c2`, `#eddfd2`, `#729855`, `#797067`, `#ddccbd`.

---

## 4. Layout / container / gutters

| Token | Value |
|-------|-------|
| `--page-width` | `164rem` (= **1640px** at rem=10) |
| Observed `.page-width` max-width | **1720px** |
| Desktop side gutters | **40px** left/right (some product/footer blocks **50px**) |
| Narrow / text form column (contact) | inputs ≈ **864px** wide @1440 |
| Announcement height | **46px** |
| Header height desktop | **96px** |
| Header height mobile | **64px** |
| Hero slideshow height desktop | **900px** |
| Hero slideshow height mobile | **≈482px** |
| Product media : info @1440 | **680px : 680px** (50/50) |
| Product info padding-left | **50px** |
| Footer background | `#222121`, text `#ffffff` |
| Footer columns | 3× ~18% menus + ~30% newsletter; logo row full width |

No horizontal overflow observed at audited viewports (360–1440).

---

## 5. Spacing scale (mapped from observed values)

| Token | Value | Evidence |
|-------|-------|----------|
| `--space-2xs` | `5px` | product title margin-top |
| `--space-xs` | `10px` | compact gaps |
| `--space-sm` | `15px` | menu / list spacing |
| `--space-md` | `20px` | card gap, textarea padding |
| `--space-lg` | `25px` | title margin-bottom |
| `--space-xl` | `30px` | button horizontal padding, H2 margin |
| `--space-2xl` | `40px` | page gutters |
| `--space-3xl` | `50px` | product info inset / alternate gutter |
| `--section-sm` | `64–96px` | compact strips / header |
| `--section-md` | `250–400px` | counters, service, banners mid |
| `--section-lg` | `700–1100px` | major editorial / product blocks |

---

## 6. Component measurements (locked)

### Buttons
- Height: **52px** (ATC observed **50px**)
- Padding: `0 30px`
- Radius: **0**
- Font: Asul 16px / 400 / capitalize
- Transition: `0.2s linear`
- **Primary / solid:** bg `#e8d4c2`, border `1px solid #ddccbd`, color `#222121`
- **Secondary / outline on media:** transparent bg, `1px solid #ffffff`, color `#ffffff`
- **Secondary / outline on light:** transparent bg, `1px solid #222121`, color `#222121`
- Full-width ATC on product form

### Inputs
- Height: **60px**
- Border: `1px solid #ddccbd`
- Radius: **0**
- Background: `#ffffff`
- Padding: `0 20px 0 30px` (search uses `0 80px 0 40px`)
- Textarea height: **180px**, padding `20px 20px 20px 30px`
- Transition: `0.1s`
- Contact submit: solid button, label “Send”, height 52px

### Product cards
- Image: `object-fit: cover`, radius `0`
- Title: 26px capitalize, transition `0.2s linear`
- Price: 14px
- Card gap: **20px**
- Card border: `0` / optional `0px solid #ddccbd`
- Text alignment setting: center in theme vars; live headings often left

### Quantity
- Height **50px**, width ≈ **162px**, flex control

### Transitions
- Buttons / titles: `0.2s linear`
- Image hover: `transform 0.3s ease`
- Inputs: `0.1s`
- Nav link underline: `text-decoration-color 0.3s ease`

---

## 7. Primary CSS breakpoints (from theme)

Prioritize: **750px**, **990px**, **1200px**, **1440px** (also dense cluster around 480 / 575 / 768 / 1280).

Audit viewports captured: 1440×1000, 1280×800, 768×1024, 390×844, 360×800.

---

## 8. Shell summary

1. **Announcement bar** — olive `#729855`, white 16px rotating messages, height 46px; social icons left; currency/language utility present in header group.
2. **Header** — logo left, inline nav (Home / Shop mega / Best Sellers / About / Journal / Contact), search + cart + account right; `sticky-header` custom element present.
3. **Footer** — dark inverse; Categories / Quick links / Services / Subscribe; brand blurb; payment icons; copyright.

---

## 9. Locked for next prompt

When final Royal Being content arrives:

- Replace Whiff text, products, imagery, and brand marks only
- Keep tokens, section families, spacing rhythm, and interaction patterns
- Do not introduce a second visual language
