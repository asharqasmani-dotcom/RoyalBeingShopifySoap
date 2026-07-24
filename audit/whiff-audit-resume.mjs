/**
 * Resume-capable Whiff audit — skips completed viewports, retries navigation,
 * re-unlocks password between pages.
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SHOTS = path.join(ROOT, 'audit', 'screenshots');
const DATA = path.join(ROOT, 'audit', 'data');

const PASSWORD = '1';
const BASE = 'https://dt-whiff.myshopify.com';

const PAGES = [
  { id: 'homepage', url: `${BASE}/`, name: 'Homepage' },
  { id: 'collections', url: `${BASE}/collections`, name: 'Collections index' },
  {
    id: 'product',
    url: `${BASE}/collections/gentle-cleansers/products/lemon-white-snow`,
    name: 'Product — Lemon White Snow',
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

function ensureDirs() {
  for (const d of [SHOTS, DATA]) fs.mkdirSync(d, { recursive: true });
  for (const p of PAGES) {
    for (const v of VIEWPORTS) {
      fs.mkdirSync(path.join(SHOTS, p.id, v.id), { recursive: true });
    }
  }
}

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

async function unlockStore(page) {
  await page.goto(`${BASE}/password`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const field = page.locator('input[type="password"], input[name="password"]');
  if (await field.count()) {
    await field.first().fill(PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Enter"), input[type="submit"]').first().click();
    await page.waitForTimeout(2500);
  }
}

async function gotoWithRetry(page, url, attempts = 4) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      // If bounced to password, unlock and retry once
      if (page.url().includes('/password')) {
        await unlockStore(page);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      }
      await page.waitForTimeout(800);
      return;
    } catch (e) {
      lastErr = e;
      console.log(`    retry ${i + 1}/${attempts}: ${e.message.split('\n')[0]}`);
      await page.waitForTimeout(1500 * (i + 1));
      try {
        await unlockStore(page);
      } catch (_) {}
    }
  }
  throw lastErr;
}

const STYLE_KEYS = [
  'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform',
  'color', 'backgroundColor', 'backgroundImage', 'paddingTop', 'paddingRight', 'paddingBottom',
  'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'borderTopWidth',
  'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopColor', 'borderRadius',
  'boxShadow', 'maxWidth', 'width', 'height', 'display', 'gap', 'rowGap', 'columnGap',
  'gridTemplateColumns', 'objectFit', 'objectPosition', 'opacity', 'transition', 'textAlign',
  'position', 'top', 'zIndex',
];

async function extractPageAudit(page, pageMeta, viewport) {
  return page.evaluate(
    ({ STYLE_KEYS, pageMeta, viewport }) => {
      const rgbToHex = (rgb) => {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return rgb;
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (!m) return rgb;
        const hex = '#' + [m[1], m[2], m[3]].map((x) => Number(x).toString(16).padStart(2, '0')).join('');
        if (m[4] !== undefined && Number(m[4]) < 1) return `${hex} / ${m[4]}`;
        return hex;
      };

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

      const fonts = [...document.fonts].map((f) => ({
        family: f.family, style: f.style, weight: f.weight, status: f.status,
      }));

      const fontUsage = {};
      for (const el of all('h1,h2,h3,h4,h5,h6,p,a,button,span,li,label,input,nav')) {
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
      const topN = (map, n = 25) =>
        Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);

      const sections = all('.shopify-section, main > section, #MainContent > *, [id^="shopify-section"]').map((sec, i) => {
        const heading = sec.querySelector('h1,h2,h3,.section-title,.title');
        const container =
          sec.querySelector('.container, .page-width, .wrapper, .row, .dt-sc-section-wrapper, .shopify-section > div') ||
          sec.firstElementChild;
        const imgs = [...sec.querySelectorAll('img')].slice(0, 4).map((img) => ({
          src: img.currentSrc || img.src,
          w: img.naturalWidth,
          h: img.naturalHeight,
          displayW: Math.round(img.getBoundingClientRect().width),
          displayH: Math.round(img.getBoundingClientRect().height),
          objectFit: getComputedStyle(img).objectFit,
          objectPosition: getComputedStyle(img).objectPosition,
          borderRadius: getComputedStyle(img).borderRadius,
        }));
        const buttons = [...sec.querySelectorAll('a.button, button, .btn, .dt-sc-btn, [class*="button"]')]
          .slice(0, 6)
          .map(pick);
        const secCs = getComputedStyle(sec);
        const contCs = container ? getComputedStyle(container) : null;
        return {
          index: i,
          id: sec.id || null,
          classes: String(sec.className || '').slice(0, 250),
          heading: heading ? heading.innerText.trim().slice(0, 100) : null,
          headingStyles: pick(heading),
          sectionStyles: {
            paddingTop: secCs.paddingTop,
            paddingBottom: secCs.paddingBottom,
            paddingLeft: secCs.paddingLeft,
            paddingRight: secCs.paddingRight,
            backgroundColor: rgbToHex(secCs.backgroundColor),
            backgroundImage: secCs.backgroundImage,
            maxWidth: secCs.maxWidth,
            width: `${Math.round(sec.getBoundingClientRect().width)}px`,
            height: `${Math.round(sec.getBoundingClientRect().height)}px`,
          },
          containerStyles: contCs
            ? {
                maxWidth: contCs.maxWidth,
                width: `${Math.round(container.getBoundingClientRect().width)}px`,
                paddingLeft: contCs.paddingLeft,
                paddingRight: contCs.paddingRight,
                marginLeft: contCs.marginLeft,
                marginRight: contCs.marginRight,
                display: contCs.display,
                gap: contCs.gap,
                gridTemplateColumns: contCs.gridTemplateColumns,
              }
            : null,
          images: imgs,
          buttons,
          childCount: sec.children.length,
        };
      });

      const announcement = first('.announcement-bar, .announcement, [class*="announcement"], .utility-bar, .top-bar, .dt-sc-top-bar');
      const header = first('header, .header, .site-header, #shopify-section-header, [id*="header"]');
      const nav = first('nav, .main-nav, .header__inline-menu, .menu, .dt-nav');
      const footer = first('footer, .footer, #shopify-section-footer, [id*="footer"]');
      const logo = first('header img, .header__heading-logo, .logo img, a.logo img');
      const cart = first('[href*="/cart"], .cart-icon, [class*="cart"]');
      const search = first('[class*="search"], [href*="/search"], button[aria-label*="Search" i]');

      const typeSamples = {};
      for (const sel of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'label', 'small', 'nav a', '.price', '.product-title', '.card__heading']) {
        const el = first(sel);
        if (el) typeSamples[sel] = pick(el);
      }

      const buttonSamples = all('a.button, button.button, .btn, .dt-sc-btn, .button').slice(0, 12).map(pick);
      const inputSamples = all('input:not([type=hidden]), textarea, select').slice(0, 10).map(pick);

      const productCards = all('.card-wrapper, .product-card, .card-product, [class*="product-card"], .product-item, .dt-sc-product')
        .slice(0, 8)
        .map((card) => {
          const img = card.querySelector('img');
          const title = card.querySelector('h2,h3,h4,.card__heading,a');
          const price = card.querySelector('.price, [class*="price"]');
          const r = img ? img.getBoundingClientRect() : null;
          return {
            card: pick(card),
            image: img
              ? {
                  ...pick(img),
                  naturalW: img.naturalWidth,
                  naturalH: img.naturalHeight,
                  ratio: r && r.height > 0 ? (r.width / r.height).toFixed(3) : null,
                }
              : null,
            title: pick(title),
            price: pick(price),
          };
        });

      const collectionCards = all('.collection-list .card, .collection-card, [class*="collection"] .card, .card-wrapper')
        .slice(0, 12)
        .map((card) => {
          const img = card.querySelector('img');
          const title = card.querySelector('h2,h3,h4,.card__heading,a');
          const r = img ? img.getBoundingClientRect() : null;
          return {
            title: title?.innerText?.trim()?.slice(0, 80) || null,
            titleStyles: pick(title),
            imageRatio: r && r.height > 0 ? (r.width / r.height).toFixed(3) : null,
            card: pick(card),
          };
        });

      const breakpoints = new Set();
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.media && rule.media.mediaText) {
              const m = rule.media.mediaText.match(/(\d+)px/g);
              if (m) m.forEach((x) => breakpoints.add(x));
            }
          }
        } catch (_) {}
      }

      const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2;

      let stickyHeader = null;
      if (header) {
        const cs = getComputedStyle(header);
        stickyHeader = {
          position: cs.position,
          top: cs.top,
          zIndex: cs.zIndex,
          height: `${Math.round(header.getBoundingClientRect().height)}px`,
        };
      }

      // Page banner / breadcrumb
      const banner = first('.page-banner, .breadcrumb, .breadcrumbs, .main-page-title, .page-header, .banner, [class*="page-title"]');

      return {
        page: pageMeta,
        viewport,
        title: document.title,
        url: location.href,
        body: pick(document.body),
        htmlBg: rgbToHex(getComputedStyle(document.documentElement).backgroundColor),
        rootCssVars: rootVars,
        computedCustomProps: Object.fromEntries(knownProps.slice(0, 250)),
        fonts,
        fontUsage: Object.entries(fontUsage).sort((a, b) => b[1] - a[1]).slice(0, 20),
        colorFrequency: {
          backgrounds: topN(colors.bg),
          foregrounds: topN(colors.fg),
          borders: topN(colors.border),
        },
        sections,
        shell: {
          announcement: pick(announcement),
          header: pick(header),
          nav: pick(nav),
          footer: pick(footer),
          logo: logo
            ? { ...pick(logo), naturalW: logo.naturalWidth, naturalH: logo.naturalHeight, src: logo.currentSrc || logo.src }
            : null,
          cart: pick(cart),
          search: pick(search),
          stickyHeader,
          banner: pick(banner),
        },
        typeSamples,
        buttonSamples,
        inputSamples,
        productCards,
        collectionCards,
        breakpoints: [...breakpoints].sort((a, b) => parseInt(a) - parseInt(b)),
        overflowX,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
      };
    },
    { STYLE_KEYS, pageMeta, viewport }
  );
}

async function captureRegions(page, outDir) {
  const regions = await page.evaluate(() => {
    const q = (sel) => document.querySelector(sel);
    const list = [];
    const add = (name, el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.height < 2 || r.width < 2) return;
      list.push({
        name,
        y: Math.max(0, Math.round(window.scrollY + r.top)),
        h: Math.round(r.height),
      });
    };
    add('header', q('header, .header, .site-header, [id*="header"]'));
    add('footer', q('footer, .footer, [id*="footer"]'));
    const sections = [...document.querySelectorAll('.shopify-section')];
    sections.slice(0, 20).forEach((s, i) => {
      const h = s.querySelector('h1,h2,h3');
      const name = `section-${String(i).padStart(2, '0')}-${(h?.innerText || s.id || 'block')
        .trim()
        .slice(0, 40)
        .replace(/[^\w]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()}`;
      add(name, s);
    });
    return list;
  });

  for (const region of regions) {
    try {
      await page.screenshot({
        path: path.join(outDir, `${region.name}.png`),
        clip: {
          x: 0,
          y: region.y,
          width: page.viewportSize().width,
          height: Math.min(region.h, 4000),
        },
        fullPage: false,
      });
    } catch (_) {}
  }
}

async function probeInteractions(page) {
  const report = { states: [] };
  const note = async (name, fn) => {
    try {
      const detail = await fn();
      report.states.push({ name, ok: true, detail });
    } catch (e) {
      report.states.push({ name, ok: false, error: String(e.message || e) });
    }
  };

  await note('header-default', async () => {
    const h = await page.locator('header, .header, .site-header, sticky-header').first().boundingBox();
    return { height: h?.height };
  });

  await note('scroll-sticky', async () => {
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(400);
    const sticky = await page.evaluate(() => {
      const h = document.querySelector('sticky-header, header, .header, .site-header');
      if (!h) return null;
      const cs = getComputedStyle(h);
      return { position: cs.position, top: cs.top, y: h.getBoundingClientRect().top, tag: h.tagName };
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    return sticky;
  });

  await note('mobile-menu-or-hamburger', async () => {
    const btn = page.locator(
      'button.menu-drawer-button, header-drawer summary, button[aria-label*="Menu" i], .menu-toggle, .navbar-toggle, [class*="hamburger"], .mobile-nav-toggle, button[aria-controls*="menu"]'
    );
    const count = await btn.count();
    if (!count) return { present: false };
    await btn.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(500);
    const open = await page.evaluate(() => {
      const drawer = document.querySelector('.menu-drawer, .mobile-nav, .drawer, [class*="menu-drawer"], nav.open, .is-open, #menu-drawer');
      return drawer
        ? {
            visible: getComputedStyle(drawer).display !== 'none' && getComputedStyle(drawer).visibility !== 'hidden',
            classes: String(drawer.className).slice(0, 120),
          }
        : { visible: false };
    });
    await page.keyboard.press('Escape').catch(() => {});
    return { present: true, ...open };
  });

  await note('search-control', async () => {
    const btn = page.locator(
      'button[aria-label*="Search" i], a[href*="/search"], .search-toggle, summary[aria-label*="Search" i], details-modal summary'
    );
    const count = await btn.count();
    if (!count) return { present: false };
    await btn.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => {
      const el = document.querySelector('.search-modal, details[open], .predictive-search, [class*="search-drawer"], input[type="search"]');
      return !!el;
    });
    await page.keyboard.press('Escape').catch(() => {});
    return { present: true, opened: open };
  });

  await note('cart-drawer', async () => {
    const btn = page.locator(
      'a[href="/cart"], button[aria-label*="Cart" i], .cart-drawer-button, [id*="cart-icon"], .header__icon--cart, #cart-icon-bubble'
    );
    const count = await btn.count();
    if (!count) return { present: false };
    await btn.first().click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(600);
    const open = await page.evaluate(() => {
      const el = document.querySelector('cart-drawer, .cart-drawer, #CartDrawer, [id*="CartDrawer"], .drawer--cart, .mini-cart');
      if (!el) return { drawerFound: false };
      const cs = getComputedStyle(el);
      return {
        drawerFound: true,
        visibility: cs.visibility,
        display: cs.display,
        transform: cs.transform,
        classes: String(el.className).slice(0, 150),
      };
    });
    await page.keyboard.press('Escape').catch(() => {});
    const close = page.locator('button[aria-label*="Close" i], .drawer__close, cart-drawer .close');
    if (await close.count()) await close.first().click().catch(() => {});
    return open;
  });

  await note('product-card-hover', async () => {
    const card = page.locator('.card-wrapper, .product-card, .grid__item .card, [class*="product-card"], .product-item');
    if (!(await card.count())) return { present: false };
    await card.first().hover().catch(() => {});
    await page.waitForTimeout(300);
    return { present: true };
  });

  return report;
}

async function main() {
  ensureDirs();
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  console.log('Unlocking storefront...');
  await unlockStore(page);

  const master = {
    auditedAt: new Date().toISOString(),
    base: BASE,
    pages: {},
    interactions: {},
    breakpointsObserved: new Set(),
    errors: [],
  };

  // Load existing homepage into master if present
  for (const p of PAGES) {
    master.pages[p.id] = { name: p.name, url: p.url, viewports: {} };
    for (const vp of VIEWPORTS) {
      if (hasData(p.id, vp.id)) {
        try {
          master.pages[p.id].viewports[vp.id] = JSON.parse(
            fs.readFileSync(path.join(DATA, `${p.id}-${vp.id}.json`), 'utf8')
          );
        } catch (_) {}
      }
    }
  }

  for (const p of PAGES) {
    console.log(`\n=== ${p.name} ===`);
    const missing = VIEWPORTS.filter((vp) => !hasData(p.id, vp.id));
    if (missing.length === 0) {
      console.log('  all viewports already audited — skipping capture');
    } else {
      await unlockStore(page);
      for (const vp of missing) {
        console.log(`  viewport ${vp.id} ${vp.width}x${vp.height}`);
        try {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await gotoWithRetry(page, p.url);
          await page.evaluate(() => {
            document.querySelectorAll('.popup, .modal, [class*="newsletter-popup"]').forEach((el) => {
              const close = el.querySelector('[aria-label*="Close" i], .close, button');
              if (close) close.click();
            });
          }).catch(() => {});
          await page.waitForTimeout(1000);
          await page.evaluate(() => document.fonts.ready).catch(() => {});

          const outDir = path.join(SHOTS, p.id, vp.id);
          await page.screenshot({ path: path.join(outDir, 'full-page.png'), fullPage: true });
          await page.screenshot({ path: path.join(outDir, 'above-fold.png'), fullPage: false });
          if (vp.id === 'desktop' || vp.id === 'mobile') {
            await captureRegions(page, outDir);
          }

          const audit = await extractPageAudit(page, p, vp);
          master.pages[p.id].viewports[vp.id] = audit;
          audit.breakpoints?.forEach((b) => master.breakpointsObserved.add(b));
          fs.writeFileSync(path.join(DATA, `${p.id}-${vp.id}.json`), JSON.stringify(audit, null, 2));
          console.log(`    OK — ${audit.sections.length} sections`);
        } catch (e) {
          console.error(`    FAIL ${p.id}/${vp.id}:`, e.message.split('\n')[0]);
          master.errors.push({ page: p.id, viewport: vp.id, error: String(e.message || e) });
        }
      }
    }

    // Interactions (desktop)
    try {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await gotoWithRetry(page, p.url, 3);
      master.interactions[p.id] = await probeInteractions(page);
    } catch (e) {
      master.errors.push({ page: p.id, phase: 'interactions', error: String(e.message || e) });
    }

    if (p.id === 'homepage') {
      try {
        await page.setViewportSize({ width: 390, height: 844 });
        await gotoWithRetry(page, p.url, 3);
        master.interactions[`${p.id}-mobile`] = await probeInteractions(page);
      } catch (e) {
        master.errors.push({ page: 'homepage-mobile', phase: 'interactions', error: String(e.message || e) });
      }
    }
  }

  // Product deep dive
  console.log('\n=== Product interaction deep dive ===');
  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await gotoWithRetry(page, PAGES.find((x) => x.id === 'product').url);
    master.productDeep = await page.evaluate(() => {
      const pick = (el) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        return {
          text: (el.innerText || '').trim().slice(0, 80),
          fontSize: cs.fontSize,
          fontFamily: cs.fontFamily,
          fontWeight: cs.fontWeight,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
          borderRadius: cs.borderRadius,
          height: cs.height,
          width: `${Math.round(el.getBoundingClientRect().width)}px`,
        };
      };
      const gallery = document.querySelector(
        '.product__media, .product-gallery, .product-images, [class*="product__media"], .product-single__media, .product__media-wrapper, media-gallery'
      );
      const info = document.querySelector(
        '.product__info, .product-info, .product__info-wrapper, [class*="product__info"], .product-single__meta, .product__info-container'
      );
      const atc = document.querySelector(
        'button[name="add"], .product-form__submit, [type="submit"].product-form__submit, form[action*="/cart/add"] button'
      );
      const qty = document.querySelector('quantity-input, .quantity, [name="quantity"]');
      const variants = [...document.querySelectorAll('.product-form__input, variant-radios, variant-selects, [class*="variant"]')].slice(0, 5);
      const tabs = [...document.querySelectorAll('.product-tabs, .tabs, accordion-tab, details, [class*="accordion"]')].slice(0, 8);
      const price = document.querySelector('.price, .product__price, [class*="price"]');
      const breadcrumb = document.querySelector('.breadcrumb, nav[aria-label*="Breadcrumb" i], .breadcrumbs');
      let ratio = null;
      if (gallery && info) {
        ratio = {
          galleryW: Math.round(gallery.getBoundingClientRect().width),
          infoW: Math.round(info.getBoundingClientRect().width),
          total: Math.round(gallery.getBoundingClientRect().width + info.getBoundingClientRect().width),
        };
      }
      return {
        gallery: pick(gallery),
        info: pick(info),
        mediaInfoRatio: ratio,
        addToCart: pick(atc),
        quantity: pick(qty),
        variantCount: variants.length,
        variants: variants.map(pick),
        tabs: tabs.map(pick),
        price: pick(price),
        breadcrumb: pick(breadcrumb),
        title: pick(document.querySelector('.product__title, h1.product-title, .product h1')),
      };
    });
  } catch (e) {
    master.errors.push({ phase: 'productDeep', error: String(e.message || e) });
  }

  // Contact form deep dive
  try {
    await gotoWithRetry(page, PAGES.find((x) => x.id === 'contact').url);
    master.contactDeep = await page.evaluate(() => {
      const fields = [...document.querySelectorAll('form input, form textarea, form select')].map((el) => {
        const cs = getComputedStyle(el);
        const label = el.labels?.[0]?.innerText || el.getAttribute('aria-label') || el.name || el.id;
        return {
          tag: el.tagName,
          type: el.type,
          name: el.name,
          label,
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
      return {
        fields,
        submit: submit
          ? {
              text: submit.innerText || submit.value,
              fontSize: getComputedStyle(submit).fontSize,
              fontFamily: getComputedStyle(submit).fontFamily,
              fontWeight: getComputedStyle(submit).fontWeight,
              color: getComputedStyle(submit).color,
              backgroundColor: getComputedStyle(submit).backgroundColor,
              padding: `${getComputedStyle(submit).paddingTop} ${getComputedStyle(submit).paddingRight} ${getComputedStyle(submit).paddingBottom} ${getComputedStyle(submit).paddingLeft}`,
              borderRadius: getComputedStyle(submit).borderRadius,
              height: getComputedStyle(submit).height,
            }
          : null,
        formAction: document.querySelector('form')?.getAttribute('action'),
      };
    });
  } catch (e) {
    master.errors.push({ phase: 'contactDeep', error: String(e.message || e) });
  }

  // About section map verification at desktop
  try {
    await gotoWithRetry(page, PAGES.find((x) => x.id === 'about').url);
    master.aboutHeadings = await page.evaluate(() =>
      [...document.querySelectorAll('.shopify-section')].map((s, i) => ({
        i,
        id: s.id,
        heading: s.querySelector('h1,h2,h3')?.innerText?.trim()?.slice(0, 100) || null,
        h: Math.round(s.getBoundingClientRect().height),
      }))
    );
  } catch (e) {
    master.errors.push({ phase: 'aboutHeadings', error: String(e.message || e) });
  }

  master.breakpointsObserved = [...master.breakpointsObserved];
  // Shrink master for write (drop huge viewport payloads already on disk)
  const slim = {
    auditedAt: master.auditedAt,
    base: master.base,
    errors: master.errors,
    interactions: master.interactions,
    productDeep: master.productDeep,
    contactDeep: master.contactDeep,
    aboutHeadings: master.aboutHeadings,
    breakpointsObserved: master.breakpointsObserved,
    pageSummary: Object.fromEntries(
      Object.entries(master.pages).map(([id, p]) => [
        id,
        {
          name: p.name,
          url: p.url,
          viewports: Object.fromEntries(
            Object.entries(p.viewports || {}).map(([vid, a]) => [
              vid,
              {
                sectionCount: a.sections?.length || 0,
                headings: (a.sections || []).map((s) => s.heading).filter(Boolean),
                overflowX: a.overflowX,
                rem: a.rem,
              },
            ])
          ),
        },
      ])
    ),
  };

  fs.writeFileSync(path.join(DATA, 'master-audit.json'), JSON.stringify(slim, null, 2));
  console.log('\nWrote audit/data/master-audit.json');
  console.log('Errors:', master.errors.length);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
