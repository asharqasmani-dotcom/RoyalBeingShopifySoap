# QA CHECKLIST — WHIFF STYLE LOCK → FUTURE BUILD

Use before calling the final Royal Being theme ready. Compare against `audit/screenshots` and tokens in `docs/STYLE_REFERENCE.md`.

---

## Visual QA

- [ ] Homepage section order matches `PAGE_SECTION_MAP.md`
- [ ] Collections / Product / About / Contact section order matches map
- [ ] Screenshot compare @1440, 1280, 768, 390, 360 for each page
- [ ] Page bg `#f1eae4`; announcement `#729855`; footer `#222121`
- [ ] Fonts render as Asul (or approved equivalent) for headings + body
- [ ] H1/H2/H3 sizes match token scale (±1px fluid tolerance)
- [ ] `.page-width` ≈ 1720 max, gutters 40px desktop
- [ ] Buttons 52px / pad 0 30px / radius 0 / correct solid vs outline
- [ ] Inputs 60px / border `#ddccbd` / radius 0
- [ ] Product 50/50 media-info @1440; info pad-left 50px
- [ ] Product cards: title 26px, price 14px, cover images, no heavy shadows
- [ ] No accidental redesign (no loud gradients, glass, neon, oversized SaaS cards)
- [ ] No horizontal overflow at supported breakpoints
- [ ] Image crops match editorial reference (cover, centered)

## Functional QA

- [ ] All header/footer links work
- [ ] Mega-menu + mobile drawer open/close (Escape)
- [ ] Search opens and submits
- [ ] Cart drawer add / update / remove
- [ ] Variant change updates price, media, availability, URL, ATC state
- [ ] Quantity inc/dec
- [ ] ATC without full reload if AJAX pattern used
- [ ] Dynamic checkout remains Shopify-native
- [ ] Contact form submits via `{% form 'contact' %}`
- [ ] Newsletter submits
- [ ] Collection cards keyboard-accessible and fully clickable
- [ ] Accordions/tabs/sliders work
- [ ] Sold-out / empty / error / loading states verified

## Technical QA

- [ ] Zero Liquid syntax errors
- [ ] Theme Check passes (or documented exceptions)
- [ ] Zero console errors on key templates
- [ ] Zero broken images / dead internal links
- [ ] No duplicate IDs
- [ ] Icon buttons labeled
- [ ] No hardcoded Whiff product IDs / final business content unless required
- [ ] LCP hero not lazy-loaded; below-fold media lazy-loaded
- [ ] `font-display: swap` (or equivalent)
- [ ] Reduced-motion respected

## Accessibility QA (WCAG 2.2 AA where practical)

- [ ] Logical heading order
- [ ] Focus visible and consistent
- [ ] Contrast sufficient on olive bar, blush buttons, inverse footer
- [ ] Form labels associated; errors announced
- [ ] Drawer focus trap
- [ ] Touch targets ≥ ~44–50px

## Process gates

- [ ] Style docs unchanged unless live reference conflict is re-audited
- [ ] Content prompt applied without redesign
- [ ] Not connected to production Shopify until explicitly instructed
