# Royal Being — Launch Handoff

## Delivered
1. **Complete OS 2.0 theme** at repo root (Shopify GitHub-ready) — header/footer groups, homepage section stack, 15 primary page templates, shared product template, collection + landing templates, cart drawer, search, 404/password, customer account templates.
2. **Catalog architecture** — 33 products across 5 collections with prices, descriptions, ingredients, SKUs, shapes/colors, launch statuses in `content/catalog/products.json` and import CSVs.
3. **Brand media staged** — logo, cropped ambassador panels (Ambassador 2 labels removed), schematics, ritual flap (internal), both videos.
4. **Commerce hooks** — waitlist/preorder/coming-soon states, sticky mobile ATC, dynamic checkout button, newsletter forms, contact form, recommendation section ready for Search & Discovery / apps.
5. **Docs** — style lock, content inventory, conflicts, asset map, QA checklist, unresolved owner checklist.

## Shopify Admin setup (owner / implementer)
### A. Theme
1. Connect this repo’s `main` branch in Shopify Admin (Themes → Add theme → Connect from GitHub), or push with Shopify CLI from repo root (`shopify theme push --unpublished`).
2. In Theme Editor: upload logo (`media/theme/logo/logo.png`), set favicon, assign hero/story/video images & MP4s.
3. Confirm announcement bar message (do not enable ROYAL 20 messaging until discount exists).

### B. Catalog
1. Create product metafield definitions from `data/metafield-definitions.json` (namespace `custom`).
2. Import products CSV — all draft / unpublished.
3. Import or create 5 collections; paste intros from `data/collection-descriptions.json`.
4. Assign `collection.landing` template to each branded collection; use default collection for Shop All.
5. Apply tags `coming-soon` to the 11 test-mode products (also in metafields JSON).
6. Upload product photos when approved; until then use schematics/ambassador lifestyle carefully and disclose AI lifestyle imagery if used.

### C. Pages (15 primary)
Create pages with these handles and assign templates:

| Handle | Template |
|--------|----------|
| (Home) | `index` |
| all / shop | `list-collections` or collection `all` |
| the-royal-collection | `collection.landing` |
| the-signature-collection | `collection.landing` |
| the-common-collection | `collection.landing` |
| the-royal-duke-collection | `collection.landing` |
| the-royal-kid-herbal-collection | `collection.landing` |
| customize-your-soap | `page.customize-your-soap` |
| subscriptions | `page.subscriptions` |
| about | `page.about` |
| our-promise | `page.our-promise` |
| reviews | `page.reviews` |
| faq | `page.faq` |
| shipping-returns | `page.shipping-returns` |
| contact | `page.contact` |

Paste body HTML from `data/page-content/`.

### D. Apps & Markets
- **Reviews:** Judge.me / Loox / Okendo (must support text + photo + moderated video). Place `@app` blocks on product + Reviews page.
- **Subscriptions:** Shopify Subscriptions (or compatible). Add selling plans per eligible product.
- **Markets:** USA, Netherlands, Belgium. Languages: English + Dutch + French (Belgium market). Validate TikTok URL `@royaliik0ju`.
- **Discount:** Create `ROYAL 20` (preserve space if Shopify allows; otherwise ask owner before normalizing) — only after eligibility rules approved.
- **DNS / GoDaddy:** Point royalbeing.shop when theme + checkout ready (`docs/UNRESOLVED_OWNER_CHECKLIST.md`).

## Watermelon Fusion gate
Ritual editorial copy ships in Liquid but is **hidden** until Theme settings → `Publish Watermelon ritual copy` is enabled **and** owner confirms formula supports white tea, aging, cold-pressed seed oil wording. See `docs/CONFLICTS_AND_AUDIT.md`.

## Preview & QA
- Laptop (≥1280) and iPhone (390) pass against `docs/QA_CHECKLIST.md`
- Password storefront until launch
- Do not publish draft products as in-stock

## After-care for owner
Routine edits: Theme Editor sections, pages, products, navigation, announcement bar, colors. No code required for copy/image swaps.
