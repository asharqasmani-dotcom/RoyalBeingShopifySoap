# PAGE SECTION MAP — LOCKED

Exact top-to-bottom section order from live `dt-whiff.myshopify.com`.  
Heights are desktop @1440 unless noted. Duplicate DOM wrappers (nested announcement/header clones) collapsed to the visible structural family.

---

## Global shell (all pages)

1. **Announcement bar** (`section-type-announcement` / `.announcement-bar-section`) — 46px, bg `#729855`, white rotating promo text + social
2. **Header** (`section-header` / `sticky-header`) — 96px desktop / 64px mobile
3. **Main content** (page-specific)
4. **Footer** (`footer-group`, inverse `#222121`) — ~760–943px desktop
5. Cookie banner + newsletter modal (hidden until triggered)

Nav labels observed: Home, Shop (mega-menu), Best sellers, about, Journal, Contact.  
Utilities: Search, Cart, Account, Country/currency, Language.

---

## A. Homepage `/`

| # | Section family (theme class) | Purpose | Desktop H | Notes |
|---|------------------------------|---------|-----------|-------|
| 1 | Announcement | Utility promos | 46px | Olive bar |
| 2 | Header | Primary nav | 96px | |
| 3 | `slideshow` | Editorial hero slider | 900px | Full-bleed; serif headline; outline CTA “Explore Collection”; mobile ~482px |
| 4 | `section-collection-list` | Category / collection cards | ~298–380px | Horizontal/editorial tiles |
| 5 | `section-featured-collection` | Featured products grid | ~893–1052px | Centered heading “Sensational Handmade Soap Selection”; 4-col desktop product cards |
| 6 | `section-image-with-video` | Brand / manufacturer split | ~797–956px | Image+text storytelling |
| 7 | `collection-flex-hotspot` | Product showcase / hotspot | ~968–1126px | Mixed proportions |
| 8 | `section-number-counter` | Statistics strip | ~239–268px | Strong numbers + labels |
| 9 | `video-section` | Lifestyle video | ~758–1010px | |
| 10 | `section-marquee` | Promo ticker | 85px | bg `#e8d4c2` |
| 11 | `slideshow-with-tabs` | Tabbed lookbook | ~817–1089px | “The Best Of Whiff” |
| 12 | `testimonial-product` | Reviews | ~832–841px | |
| 13 | `section-hotspot` | Lifestyle hotspot | ~824–1076px | |
| 14 | `featured-blog` | Journal / blog | ~685–752px | |
| 15 | `section-deal-banner` | Offer / countdown family | ~1008–1086px | |
| 16 | Instagram / gallery block | Social gallery | ~286–1887px* | Height varies with embed |
| 17 | Service / trust icon strip | Icon row | ~338px | Near footer |
| 18 | Footer | Multi-column + newsletter | ~760–843px | |

\*Instagram embed height fluctuated between audits; treat as flexible media block with same container gutters.

---

## B. Collections index `/collections`

| # | Section family | Purpose | Desktop H |
|---|----------------|---------|-----------|
| 1 | Announcement + Header | Shell | 46 + 96 |
| 2 | `section-image-banner` | Promo banner | ~504–672px — “Unbeatable Deal…” |
| 3 | Page title / breadcrumb | “All Collections” H1 48px | ~157px |
| 4 | Main collections grid | Collection cards + “view collection” + product counts | ~1265px |
| 5 | Footer | Shell | ~860–943px |

Collections observed: Best Sellers, Gentle Cleansers, Handcrafted Bars, Moisturizing Soap, Organic Bars, Scented Blends, Vegan Soap.  
Card titles use same `.card__heading` 26px capitalize system. Image `object-fit: cover`, radius 0.

---

## C. Product `/collections/gentle-cleansers/products/lemon-white-snow`

| # | Section family | Purpose | Desktop H |
|---|----------------|---------|-----------|
| 1 | Announcement + Header | Shell | 46 + 96 |
| 2 | Breadcrumb / page chrome | Home › Gentle Cleansers › Product | ~183–236px |
| 3 | Main product (`__main`) | Gallery + info | ~1158–1238px |
| 4 | `section-image-comparison-banner` | Comparison / story media | ~798–952px |
| 5 | Service / trust icons | Free Shipping, Secure, Returns, Payments | ~254–262px |
| 6 | Product recommendations | Related products | ~48–64px collapsed / expands when loaded |
| 7 | Footer | Shell | ~860–873px |

### Main product column contract (@1440)

- Media wrapper **680px** | Info wrapper **680px** (50/50)
- Info `padding-left: 50px`
- Eyebrow: “HANDMADE”
- Title H1: Asul **40.8px** capitalize `#222121`
- Short description paragraph
- Trust badges row (Cruelty Free / 100% handmade / Paraben Free)
- Variant radios: Weight 75g / 100g / 125g / 150g
- Quantity selector 50×162
- Add to cart: outline secondary, full width, ~50px tall
- Dynamic checkout / Buy it now present
- Availability + shipping notes
- Accordions: Description, Shipping Information, Returns, Shipping (details/summary pattern)
- Gallery supports modal / thumbnail loaders

---

## D. About `/pages/about`

| # | Section family | Purpose | Desktop H |
|---|----------------|---------|-----------|
| 1 | Announcement + Header | Shell | 46 + 96 |
| 2 | Page title / breadcrumb | “About” | ~293–303px |
| 3 | `section-grid-banner` | Approach story split | ~608–811px — “Our Approach…” |
| 4 | `section-grid-banner` | Process story split | ~555–740px — “What do we do at WHIFF?” |
| 5 | `testimonial-brand` | Brand trust strip | ~402–415px |
| 6 | `section-team-section` | Team spotlight | ~902–1070px |
| 7 | `testimonial-product` | Customer testimonials | ~572–581px |
| 8 | Footer | Shell | ~860–943px |

Same serif heading treatment and 40px page gutters as homepage.

---

## E. Contact `/pages/contact`

| # | Section family | Purpose | Desktop H |
|---|----------------|---------|-----------|
| 1 | Announcement + Header | Shell | 46 + 96 |
| 2 | Page banner / title | “Contact” H1 | ~658px combined upper block |
| 3 | Contact form + info | “Get in Touch” + Address / Phone / Email | ~723px |
| 4 | Footer | Shell | ~943px |

### Form fields (native Shopify contact pattern)

- Name (`contact[Name]`) — required placeholder
- Email (`contact[email]`) — required
- Additional information (textarea) — required
- “Save my name…” checkbox
- Submit: **Send** (solid primary button)
- Side info blocks: Address, Phone (2 numbers), Email (2 addresses)

Note: audit `formAction` sometimes reports `/cart` due to multiple forms on page (newsletter/cart); contact fields use Shopify contact naming — implement with `{% form 'contact' %}`.

---

## Container consistency

All major pages share:

- `.page-width` max-width **1720px**
- Side padding **40px** (desktop @1440)
- Page bg `#f1eae4`
- Footer inverse `#222121`
