# AUDIT EVIDENCE INDEX

- Master prompt: `/Users/bstar/Downloads/Whiff_Shopify_Style_Master_Prompt.md`
- Computed JSON: `audit/data/{page}-{viewport}.json` (5 pages × 5 viewports)
- Deep dives: `audit/data/product-deep.json`, `contact-deep.json`, `interactions.json`, `homepage-shell-deep.json`
- Screenshots: `audit/screenshots/{page}/{viewport}/` — 25 full-page + 25 above-fold captures
- Scripts: `audit/whiff-audit.mjs`, `audit/whiff-audit-fast.mjs`

## Ambiguities / blockers noted

1. **Typography pair:** Prompt hypothesized serif + sans; live theme uses **Asul for both** heading and body — locked to live.
2. **Collection/product card image ratios:** Some card bounding boxes were 0 when off-screen during extract; image treatment still confirmed as `object-fit: cover`, radius 0. Re-measure on-screen during build QA.
3. **Cart drawer populated/qty/remove:** Drawer element confirmed; empty vs populated line-item chrome needs re-check when cart has items during build.
4. **Sticky header internals:** Custom element present; computed height sometimes 0 on wrapper — treat visible header row as 96px / 64px.
5. **Instagram/social block height:** Varied widely between loads (embed) — flexible media section.
6. **Contact `formAction`:** Page has multiple forms; implement contact via Shopify `{% form 'contact' %}` using field names observed (`contact[Name]`, `contact[email]`, etc.).
7. **Newsletter popup / cookie banner:** Present but hidden; design documented as shell overlays only.

No page or required viewport left unaudited.
