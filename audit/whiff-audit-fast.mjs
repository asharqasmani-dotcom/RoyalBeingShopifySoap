/**
 * Fast missing-page audit — capture + extract only, interactions deferred.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'audit', 'screenshots');
const DATA = path.join(ROOT, 'audit', 'data');
const PASSWORD = '1';
const BASE = 'https://dt-whiff.myshopify.com';

const ONLY = process.argv.slice(2); // optional page ids

const PAGES = [
  { id: 'homepage', url: `${BASE}/`, name: 'Homepage' },
  { id: 'collections', url: `${BASE}/collections`, name: 'Collections index' },
  {
    id: 'product',
    url: `${BASE}/collections/gentle-cleansers/products/lemon-white-snow`,
    name: 'Product',
  },
  { id: 'about', url: `${BASE}/pages/about`, name: 'About' },
  { id: 'contact', url: `${BASE}/pages/contact`, name: 'Contact' },
];

const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 1000 },
  { id: 'laptop', width: 1280, height: 800 },
  { id: 'tablet', width: 768, height: 1024 },
  { id: 'mobile', width: 390, height: 844 },
  { id: 'narrow', width: 360, height: 800 },
];

function hasData(pageId, vpId) {
  const f = path.join(DATA, `${pageId}-${vpId}.json`);
  if (!fs.existsSync(f)) return false;
  try {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    return Array.isArray(j.sections) && j.sections.length > 0;
  } catch {
    return false;
  }
}

async function unlock(page) {
  await page.goto(`${BASE}/password`, { waitUntil: 'commit', timeout: 45000 });
  await page.waitForSelector('input[type="password"], input[name="password"]', { timeout: 15000 }).catch(() => {});
  const field = page.locator('input[type="password"], input[name="password"]');
  if (await field.count()) {
    await field.first().fill(PASSWORD);
    await Promise.race([
      page.waitForURL((u) => !u.pathname.includes('/password'), { timeout: 20000 }).catch(() => {}),
      page.locator('button[type="submit"], button:has-text("Enter")').first().click(),
    ]);
    await page.waitForTimeout(1500);
  }
}

async function safeGoto(page, url) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await page.goto(url, { waitUntil: 'commit', timeout: 45000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
      if (page.url().includes('/password')) {
        await unlock(page);
        continue;
      }
      // wait briefly for sections
      await page.waitForSelector('.shopify-section, main, footer', { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(700);
      return res;
    } catch (e) {
      console.log(`    goto retry ${i + 1}: ${e.message.split('\n')[0]}`);
      await unlock(page).catch(() => {});
    }
  }
  throw new Error(`Failed to load ${url}`);
}

const EXTRACT_FN = ({ pageMeta, viewport }) => {
  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return rgb;
    const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!m) return rgb;
    const hex = '#' + [m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, '0')).join('');
    if (m[4] !== undefined && Number(m[4]) < 1) return `${hex} / ${m[4]}`;
    return hex;
  };
  const STYLE_KEYS = [
    'fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textTransform','color',
    'backgroundColor','backgroundImage','paddingTop','paddingRight','paddingBottom','paddingLeft',
    'marginTop','marginBottom','borderTopWidth','borderTopColor','borderRadius','boxShadow','maxWidth',
    'width','height','display','gap','gridTemplateColumns','objectFit','objectPosition','opacity',
    'transition','textAlign','position','top','zIndex',
  ];
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const out = {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      classes: (el.className && String(el.className).slice?.(0, 200)) || null,
      text: (el.innerText || '').trim().slice(0, 120),
      rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
    };
    for (const k of STYLE_KEYS) {
      let v = cs[k];
      if (k === 'color' || k === 'backgroundColor' || k === 'borderTopColor') v = rgbToHex(v);
      out[k] = v;
    }
    return out;
  };
  const first = (sel) => document.querySelector(sel);
  const all = (sel) => [...document.querySelectorAll(sel)];

  const rootVars = {};
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules || []) {
        if (rule.selectorText === ':root' || rule.selectorText === 'html' || rule.selectorText === 'body') {
          const txt = rule.cssText || '';
          const re = /(--[\w-]+)\s*:\s*([^;]+)/g;
          let m;
          while ((m = re.exec(txt))) rootVars[m[1]] = m[2].trim();
        }
      }
    } catch (_) {}
  }
  const htmlCs = getComputedStyle(document.documentElement);
  const knownProps = [];
  for (let i = 0; i < htmlCs.length; i++) {
    const n = htmlCs[i];
    if (n.startsWith('--')) knownProps.push([n, htmlCs.getPropertyValue(n).trim()]);
  }

  const fonts = [...document.fonts].map((f) => ({ family: f.family, style: f.style, weight: f.weight, status: f.status }));
  const fontUsage = {};
  for (const el of all('h1,h2,h3,h4,h5,h6,p,a,button,span,li,label,nav')) {
    const ff = getComputedStyle(el).fontFamily;
    fontUsage[ff] = (fontUsage[ff] || 0) + 1;
  }

  const colors = { bg: {}, fg: {}, border: {} };
  const bump = (map, v) => {
    const h = rgbToHex(v);
    if (!h || h === 'transparent' || h === 'rgba(0, 0, 0, 0)') return;
    map[h] = (map[h] || 0) + 1;
  };
  for (const el of all('body, section, header, footer, div, h1,h2,h3,p,a,button,input,span')) {
    const cs = getComputedStyle(el);
    bump(colors.bg, cs.backgroundColor);
    bump(colors.fg, cs.color);
    bump(colors.border, cs.borderTopColor);
  }
  const topN = (map, n = 20) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);

  const sections = all('.shopify-section').map((sec, i) => {
    const heading = sec.querySelector('h1,h2,h3,.section-title,.title');
    const container = sec.querySelector('.page-width, .container, .wrapper') || sec.firstElementChild;
    const imgs = [...sec.querySelectorAll('img')].slice(0, 4).map((img) => {
      const r = img.getBoundingClientRect();
      return {
        displayW: Math.round(r.width),
        displayH: Math.round(r.height),
        ratio: r.height > 0 ? +(r.width / r.height).toFixed(3) : null,
        objectFit: getComputedStyle(img).objectFit,
        objectPosition: getComputedStyle(img).objectPosition,
        borderRadius: getComputedStyle(img).borderRadius,
      };
    });
    const secCs = getComputedStyle(sec);
    const contCs = container ? getComputedStyle(container) : null;
    const pageWidthEl = sec.querySelector('.page-width');
    return {
      index: i,
      id: sec.id || null,
      classes: String(sec.className || '').slice(0, 250),
      heading: heading ? heading.innerText.trim().slice(0, 100) : null,
      headingStyles: pick(heading),
      sectionStyles: {
        paddingTop: secCs.paddingTop,
        paddingBottom: secCs.paddingBottom,
        backgroundColor: rgbToHex(secCs.backgroundColor),
        width: `${Math.round(sec.getBoundingClientRect().width)}px`,
        height: `${Math.round(sec.getBoundingClientRect().height)}px`,
      },
      pageWidth: pageWidthEl
        ? {
            maxWidth: getComputedStyle(pageWidthEl).maxWidth,
            width: `${Math.round(pageWidthEl.getBoundingClientRect().width)}px`,
            paddingLeft: getComputedStyle(pageWidthEl).paddingLeft,
            paddingRight: getComputedStyle(pageWidthEl).paddingRight,
          }
        : null,
      containerStyles: contCs
        ? {
            maxWidth: contCs.maxWidth,
            width: `${Math.round(container.getBoundingClientRect().width)}px`,
            paddingLeft: contCs.paddingLeft,
            paddingRight: contCs.paddingRight,
            display: contCs.display,
            gap: contCs.gap,
            gridTemplateColumns: contCs.gridTemplateColumns,
          }
        : null,
      images: imgs,
      buttons: [...sec.querySelectorAll('a.button, button.button')].slice(0, 4).map(pick),
    };
  });

  const typeSamples = {};
  for (const sel of ['h1','h2','h3','h4','h5','h6','p','a','button.button','label','small','nav a','.price','.card__heading','.product__title']) {
    const el = first(sel);
    if (el) typeSamples[sel] = pick(el);
  }

  const productCards = all('.card-wrapper').slice(0, 6).map((card) => {
    const img = card.querySelector('img');
    const title = card.querySelector('.card__heading, h2, h3');
    const price = card.querySelector('.price');
    const r = img?.getBoundingClientRect();
    return {
      title: title?.innerText?.trim()?.slice(0, 80) || null,
      titleStyles: pick(title),
      priceStyles: pick(price),
      imageRatio: r && r.height > 0 ? +(r.width / r.height).toFixed(3) : null,
      imageFit: img ? getComputedStyle(img).objectFit : null,
      cardGap: getComputedStyle(card).gap,
    };
  });

  const collectionCards = all('.collection-list .card-wrapper, .collection-list-wrapper .card-wrapper, .card-wrapper')
    .slice(0, 10)
    .map((card) => {
      const img = card.querySelector('img');
      const title = card.querySelector('.card__heading, h2, h3, a');
      const r = img?.getBoundingClientRect();
      return {
        title: title?.innerText?.trim()?.slice(0, 80) || null,
        titleStyles: pick(title),
        imageRatio: r && r.height > 0 ? +(r.width / r.height).toFixed(3) : null,
      };
    });

  const breakpoints = new Set();
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules || []) {
        if (rule.media?.mediaText) {
          const m = rule.media.mediaText.match(/(\d+)px/g);
          if (m) m.forEach((x) => breakpoints.add(x));
        }
      }
    } catch (_) {}
  }

  const header = first('sticky-header, header, .header');
  const footer = first('footer, .footer');
  const announcement = first('.announcement-bar-section, .announcement-bar, [class*="announcement"]');
  const banner = first('.breadcrumb, .breadcrumbs, .main-page-title, .page-title, .banner__box, .page-header');

  return {
    page: pageMeta,
    viewport,
    title: document.title,
    url: location.href,
    rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
    body: pick(document.body),
    rootCssVars: rootVars,
    computedCustomProps: Object.fromEntries(knownProps.slice(0, 250)),
    fonts,
    fontUsage: Object.entries(fontUsage).sort((a, b) => b[1] - a[1]).slice(0, 15),
    colorFrequency: { backgrounds: topN(colors.bg), foregrounds: topN(colors.fg), borders: topN(colors.border) },
    sections,
    shell: {
      announcement: pick(announcement),
      header: pick(header),
      footer: pick(footer),
      banner: pick(banner),
      stickyTag: header?.tagName || null,
    },
    typeSamples,
    buttonSamples: all('a.button, button.button').slice(0, 8).map(pick),
    inputSamples: all('form input:not([type=hidden]), form textarea, form select').slice(0, 12).map(pick),
    productCards,
    collectionCards,
    breakpoints: [...breakpoints].sort((a, b) => parseInt(a) - parseInt(b)),
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  };
};

async function captureRegions(page, outDir) {
  const regions = await page.evaluate(() => {
    const list = [];
    const add = (name, el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.height < 2) return;
      list.push({ name, y: Math.max(0, Math.round(window.scrollY + r.top)), h: Math.round(r.height) });
    };
    add('header', document.querySelector('sticky-header, header'));
    add('footer', document.querySelector('footer'));
    [...document.querySelectorAll('.shopify-section')].slice(0, 18).forEach((s, i) => {
      const h = s.querySelector('h1,h2,h3');
      const name = `section-${String(i).padStart(2, '0')}-${(h?.innerText || s.id || 'block')
        .trim().slice(0, 36).replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase()}`;
      add(name, s);
    });
    return list;
  });
  for (const region of regions) {
    try {
      await page.screenshot({
        path: path.join(outDir, `${region.name}.png`),
        clip: { x: 0, y: region.y, width: page.viewportSize().width, height: Math.min(region.h, 3500) },
      });
    } catch (_) {}
  }
}

async function main() {
  fs.mkdirSync(DATA, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(40000);

  console.log('Unlock...');
  await unlock(page);

  const targets = PAGES.filter((p) => !ONLY.length || ONLY.includes(p.id));
  const summary = { auditedAt: new Date().toISOString(), done: [], errors: [] };

  for (const p of targets) {
    console.log(`\n=== ${p.name} ===`);
    for (const vp of VIEWPORTS) {
      if (hasData(p.id, vp.id)) {
        console.log(`  skip ${vp.id} (exists)`);
        continue;
      }
      console.log(`  ${vp.id} ${vp.width}x${vp.height}`);
      try {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await safeGoto(page, p.url);
        await page.evaluate(() => document.fonts.ready).catch(() => {});
        const outDir = path.join(SHOTS, p.id, vp.id);
        fs.mkdirSync(outDir, { recursive: true });
        await page.screenshot({ path: path.join(outDir, 'full-page.png'), fullPage: true });
        await page.screenshot({ path: path.join(outDir, 'above-fold.png'), fullPage: false });
        if (vp.id === 'desktop' || vp.id === 'mobile') await captureRegions(page, outDir);

        const audit = await page.evaluate(EXTRACT_FN, { pageMeta: p, viewport: vp });
        fs.writeFileSync(path.join(DATA, `${p.id}-${vp.id}.json`), JSON.stringify(audit, null, 2));
        console.log(`    OK sections=${audit.sections.length} overflowX=${audit.overflowX}`);
        summary.done.push(`${p.id}/${vp.id}`);
      } catch (e) {
        console.error(`    FAIL: ${e.message.split('\n')[0]}`);
        summary.errors.push({ page: p.id, vp: vp.id, error: String(e.message || e) });
      }
    }
  }

  // Deep dives once at desktop
  console.log('\n=== Deep dives ===');
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await safeGoto(page, `${BASE}/collections/gentle-cleansers/products/lemon-white-snow`);
    const productDeep = await page.evaluate(() => {
      const pick = (el) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          text: (el.innerText || '').trim().slice(0, 100),
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily,
          fontWeight: cs.fontWeight,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
          borderRadius: cs.borderRadius,
          height: `${Math.round(r.height)}px`,
          width: `${Math.round(r.width)}px`,
        };
      };
      const gallery = document.querySelector('media-gallery, .product__media-wrapper, .product__media, .product-gallery');
      const info = document.querySelector('.product__info-wrapper, .product__info-container, .product__info, .product-info');
      const atc = document.querySelector('button[name="add"], .product-form__submit');
      const qty = document.querySelector('quantity-input, [name="quantity"]');
      const price = document.querySelector('.price');
      const title = document.querySelector('.product__title, h1');
      const breadcrumb = document.querySelector('.breadcrumb, nav[aria-label*="breadcrumb" i], .breadcrumbs');
      const variants = [...document.querySelectorAll('variant-radios, variant-selects, .product-form__input')].map(pick);
      const tabs = [...document.querySelectorAll('details, .product-accordion, .tabs, accordion-tab')].slice(0, 8).map(pick);
      return {
        title: pick(title),
        price: pick(price),
        gallery: pick(gallery),
        info: pick(info),
        mediaInfoRatio:
          gallery && info
            ? {
                galleryW: Math.round(gallery.getBoundingClientRect().width),
                infoW: Math.round(info.getBoundingClientRect().width),
              }
            : null,
        addToCart: pick(atc),
        quantity: pick(qty),
        variants,
        tabs,
        breadcrumb: pick(breadcrumb),
      };
    });
    fs.writeFileSync(path.join(DATA, 'product-deep.json'), JSON.stringify(productDeep, null, 2));
    console.log('  product-deep OK', productDeep.mediaInfoRatio);
  } catch (e) {
    summary.errors.push({ phase: 'productDeep', error: String(e.message || e) });
  }

  try {
    await safeGoto(page, `${BASE}/pages/contact`);
    const contactDeep = await page.evaluate(() => {
      const fields = [...document.querySelectorAll('form input:not([type=hidden]), form textarea, form select')].map((el) => {
        const cs = getComputedStyle(el);
        return {
          tag: el.tagName,
          type: el.type,
          name: el.name,
          label: el.labels?.[0]?.innerText || el.getAttribute('aria-label') || el.placeholder || el.name,
          fontSize: cs.fontSize,
          height: cs.height,
          padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
          border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
          borderRadius: cs.borderRadius,
          backgroundColor: cs.backgroundColor,
          width: `${Math.round(el.getBoundingClientRect().width)}px`,
        };
      });
      const submit = document.querySelector('form button[type="submit"], form input[type="submit"]');
      const cs = submit ? getComputedStyle(submit) : null;
      return {
        fields,
        submit: submit
          ? {
              text: submit.innerText || submit.value,
              fontSize: cs.fontSize,
              fontFamily: cs.fontFamily,
              color: cs.color,
              backgroundColor: cs.backgroundColor,
              padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
              borderRadius: cs.borderRadius,
              height: cs.height,
            }
          : null,
        formAction: document.querySelector('form')?.getAttribute('action'),
      };
    });
    fs.writeFileSync(path.join(DATA, 'contact-deep.json'), JSON.stringify(contactDeep, null, 2));
    console.log('  contact-deep OK fields=', contactDeep.fields.length);
  } catch (e) {
    summary.errors.push({ phase: 'contactDeep', error: String(e.message || e) });
  }

  // Interaction probe on homepage desktop + mobile only
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await safeGoto(page, `${BASE}/`);
    const interactions = { desktop: {}, mobile: {} };
    const probe = async () => {
      const out = {};
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(300);
      out.sticky = await page.evaluate(() => {
        const h = document.querySelector('sticky-header, header');
        if (!h) return null;
        const cs = getComputedStyle(h);
        return { tag: h.tagName, position: cs.position, top: cs.top, y: h.getBoundingClientRect().top, h: Math.round(h.getBoundingClientRect().height) };
      });
      await page.evaluate(() => window.scrollTo(0, 0));

      const search = page.locator('button[aria-label*="Search" i], summary[aria-label*="Search" i], details-modal summary').first();
      if (await search.count()) {
        await search.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(300);
        out.searchOpened = await page.evaluate(() => !!document.querySelector('details[open], .search-modal, input[type="search"]'));
        await page.keyboard.press('Escape').catch(() => {});
      }

      const cart = page.locator('#cart-icon-bubble, a[href="/cart"], button[aria-label*="Cart" i]').first();
      if (await cart.count()) {
        await cart.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(400);
        out.cart = await page.evaluate(() => {
          const el = document.querySelector('cart-drawer, #CartDrawer, .cart-drawer');
          if (!el) return { found: false };
          const cs = getComputedStyle(el);
          return { found: true, display: cs.display, visibility: cs.visibility, transform: cs.transform };
        });
        await page.keyboard.press('Escape').catch(() => {});
      }

      const menu = page.locator('header-drawer summary, button.menu-drawer-button, button[aria-label*="Menu" i]').first();
      if (await menu.count()) {
        await menu.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(400);
        out.menu = await page.evaluate(() => {
          const el = document.querySelector('.menu-drawer, #menu-drawer, header-drawer');
          if (!el) return { found: false };
          const cs = getComputedStyle(el);
          return { found: true, display: cs.display, visibility: cs.visibility, classes: String(el.className).slice(0, 100) };
        });
        await page.keyboard.press('Escape').catch(() => {});
      }

      const card = page.locator('.card-wrapper').first();
      if (await card.count()) {
        await card.hover().catch(() => {});
        await page.waitForTimeout(250);
        out.cardHover = true;
      }
      return out;
    };
    interactions.desktop = await probe();
    await page.setViewportSize({ width: 390, height: 844 });
    await safeGoto(page, `${BASE}/`);
    interactions.mobile = await probe();
    fs.writeFileSync(path.join(DATA, 'interactions.json'), JSON.stringify(interactions, null, 2));
    console.log('  interactions OK');
  } catch (e) {
    summary.errors.push({ phase: 'interactions', error: String(e.message || e) });
  }

  fs.writeFileSync(path.join(DATA, 'run-summary.json'), JSON.stringify(summary, null, 2));
  console.log('\nDONE', JSON.stringify(summary, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
