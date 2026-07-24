# Royal Being — Shopify Online Store 2.0

Luxury botanical soap storefront for **royalbeing.shop** (Shopify: `royal-being-9352.myshopify.com`).

## Design authority
- **Visual layout / spacing / component geometry:** Whiff style lock in `docs/STYLE_REFERENCE.md`
- **Brand colors, copy, commerce, products:** Master prompt in `docs/MASTER_PROMPT_UPDATED.md` (+ clean DOCX text in `docs/MASTER_PROMPT_CLEAN_DOCX.txt`)
- Applied palette: botanical `#355E4D`, sage `#7F9A83`, leaf `#A8BEA8`, ivory `#FAF7F0`, gold `#D5A557`, blush `#D9AFA0`, charcoal `#2F332F`
- Typography: Cormorant Garamond (headings) + DM Sans (body)

## What’s included
| Area | Location |
|------|----------|
| Shopify OS 2.0 theme | **repo root** (`assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) |
| Product catalog (33 SKUs) | `content/catalog/products.json` |
| Shopify product CSV (draft) | `data/shopify-products-import.csv` |
| Collections CSV | `data/shopify-collections.csv` |
| Metafields | `data/product-metafields.json`, `data/metafield-definitions.json` |
| Page HTML for Admin paste | `data/page-content/` |
| Navigation plan | `data/navigation.json` |
| Optimized media staging (local) | `media/theme/` (gitignored — upload via Shopify Files) |
| Conflicts / gates | `docs/CONFLICTS_AND_AUDIT.md` |
| Owner checklist | `docs/UNRESOLVED_OWNER_CHECKLIST.md` |
| Push/preview handoff | `docs/HANDOFF.md` |

## Connect with Shopify Admin (GitHub)
Theme folders live at the **repository root** so Shopify can detect a valid Online Store 2.0 theme.

1. Online Store → Themes → Add theme → Connect from GitHub
2. Account: `asharqasmani-dotcom`
3. Repository: `RoyalBeingShopifySoap`
4. Branch: **`main`**

## Quick start (Shopify CLI)
```bash
# from this repo root
shopify theme push --unpublished --store royal-being-9352.myshopify.com
shopify theme dev --store royal-being-9352.myshopify.com
```

Then in Admin:
1. Create metafield definitions from `data/metafield-definitions.json`
2. Import `data/shopify-products-import.csv` and `data/shopify-collections.csv`
3. Create the 15 primary pages and assign matching templates (`page.about`, `page.faq`, etc.)
4. Paste HTML from `data/page-content/`
5. Upload media from `media/theme/` to Shopify Files / theme editor image pickers
6. Assign collection template `collection.landing` to the five branded collections
7. Connect review app + subscriptions app; keep Watermelon ritual unpublished until approved

## Safety gates (do not bypass)
- Watermelon “Ritual of Being” copy is **gated** (`settings.publish_watermelon_ritual` = false)
- Coming-soon products tagged / metafielded — no normal ATC
- No fabricated reviews
- Full ingredients hidden unless owner enables
- Products import with `Published=false`

## License / notes
Theme is custom for Royal Being. Do not copy Whiff brand assets — only measured layout patterns were locked as reference.

## Large assets not in git
Bulky media stays local only (see `.gitignore`):
- Product / ambassador images under `content/images/` and `media/theme/`
- Videos under `content/videos/` and `media/theme/videos/`
- Source PDF under `content/raw/`
Upload those via Shopify Files / Admin after clone. See `docs/HANDOFF.md`.
