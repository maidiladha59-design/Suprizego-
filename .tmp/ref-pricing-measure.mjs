import fs from "node:fs";
import { spawn } from "node:child_process";

const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureChrome() {
  try {
    const r = await fetch(`${BASE}/json/version`);
    if (r.ok) return;
  } catch {}
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Users/User/AppData/Local/Google/Chrome/Application/chrome.exe",
  ];
  const exe = candidates.find((p) => fs.existsSync(p));
  if (!exe) throw new Error("chrome not found");
  spawn(exe, [
    "--headless=new",
    "--remote-debugging-port=9222",
    `--user-data-dir=${OUT}/chrome-profile-ref`,
    "--no-first-run",
    "--disable-gpu",
    "about:blank",
  ], { detached: true, stdio: "ignore" }).unref();
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      const r = await fetch(`${BASE}/json/version`);
      if (r.ok) return;
    } catch {}
  }
  throw new Error("chrome did not start");
}

async function newTarget() {
  const res = await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" });
  return res.json();
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve);
      this.ws.addEventListener("error", reject);
    });
    this.ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
  }
  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return p;
  }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  }
  close() { this.ws.close(); }
}

async function shot(cdp, name) {
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

const FIND = `(() => {
  const heads = [...document.querySelectorAll('h1,h2,h3')].map((h) => ({
    tag: h.tagName, text: (h.innerText || '').trim().slice(0, 80),
    id: h.id, cls: (h.className || '').toString().slice(0, 120),
    y: Math.round(h.getBoundingClientRect().top + scrollY),
  }));
  return heads.filter((h) => /price|harga|paket|friendly|plan/i.test(h.text + ' ' + h.cls + ' ' + h.id));
})()`;

const MEASURE = `(() => {
  const info = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 160),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      bg: s.backgroundColor, color: s.color, family: s.fontFamily, size: s.fontSize, weight: s.fontWeight,
      lineHeight: s.lineHeight, tracking: s.letterSpacing, transformText: s.textTransform,
      radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      shadow: s.boxShadow, transform: s.transform, padding: s.padding, margin: s.margin,
      gap: s.gap, display: s.display, position: s.position, zIndex: s.zIndex,
      gridCols: s.gridTemplateColumns, alignItems: s.alignItems,
    };
  };
  const priceEls = [...document.querySelectorAll('h2,h3,h4,p,div,span')].filter((el) => /Rp\\s?\\d/.test(el.innerText || '') && el.children.length === 0);
  const card = priceEls.map((p) => p.closest('article,li,div[class*="card"],div')).find((c) => c && c.querySelectorAll('h3,h4').length >= 1 && c.querySelectorAll('button,a').length >= 1);
  const section = card ? card.closest('section') || card.parentElement.parentElement.parentElement : null;
  const cards = card && section ? [...section.querySelectorAll('article,li')].filter((c) => /Rp\\s?\\d/.test(c.innerText || '')) : [];
  const heading = section ? [...section.querySelectorAll('h1,h2')][0] : null;
  const eyebrow = section && heading ? [...section.querySelectorAll('p,span,div')].find((el) => el !== heading && el.getBoundingClientRect().bottom <= heading.getBoundingClientRect().top && el.getBoundingClientRect().bottom > heading.getBoundingClientRect().top - 60 && el.children.length === 0) : null;
  const sub = heading ? [...heading.parentElement.querySelectorAll('p')].find((p) => p !== heading) : null;
  const cardInfo = cards.map((c) => {
    const h = c.querySelector('h3,h4');
    const price = [...c.querySelectorAll('p,div,span,h3,h4')].find((el) => /Rp\\s?\\d/.test(el.innerText || '') && el.children.length === 0);
    const badge = [...c.querySelectorAll('span,div,p')].find((el) => el.children.length === 0 && /populer|popul|best|favorit|recommended/i.test(el.innerText || ''));
    const chip = [...c.querySelectorAll('span,div')].find((el) => el !== badge && el.children.length === 0 && /hari|selamanya|aktif|day|forever|month/i.test(el.innerText || '') && getComputedStyle(el).borderRadius !== '0px');
    const cta = c.querySelector('button,a[class*="button"],a');
    const bullets = [...c.querySelectorAll('li,div')].filter((el) => /[✦✓✔★]/.test(el.innerText || '') && el.children.length <= 2).slice(0, 6);
    const icon = bullets.map((b) => b.querySelector('svg'))[0];
    return {
      card: info(c),
      name: info(h),
      price: info(price),
      badge: info(badge),
      chip: info(chip),
      cta: info(cta),
      bullets: bullets.map((b) => ({ info: info(b), html: b.outerHTML.slice(0, 300) })),
      iconSVG: icon ? icon.outerHTML.slice(0, 300) : null,
    };
  });
  return {
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
    heads: [...document.querySelectorAll('h1,h2,h3')].map((h) => (h.innerText || '').trim().slice(0, 80)),
    section: info(section),
    sectionId: section ? section.id : null,
    heading: info(heading),
    eyebrow: info(eyebrow),
    sub: info(sub),
    sectionChildren: section ? [...section.children].map((c) => info(c)) : [],
    cards: cardInfo,
  };
})()`;

async function measure(viewport, label) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: viewport.w, height: viewport.h, deviceScaleFactor: 1, mobile: viewport.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (viewport.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
  await sleep(7000);
  await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/^(boleh|terima|setuju|oke|ok|accept|got it)$/i.test((x.innerText||'').trim())); if(b){b.click(); return true;} return false; })()`);
  await sleep(600);
  const found = await cdp.eval(FIND);
  console.log(label, "heads:", JSON.stringify(found));
  const scrolled = await cdp.eval(`(() => {
    const el = [...document.querySelectorAll('h1,h2,h3')].find((h) => /friendly|price|harga|paket|plan/i.test(h.innerText || ''));
    if (!el) return false;
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
    scrollBy(0, -80);
    return true;
  })()`);
  await sleep(800);
  await shot(cdp, `ref-price-${label}-01`);
  if (found && found.length) {
    await cdp.eval(`(() => { const h=[...document.querySelectorAll('h1,h2,h3')].find(x=>/friendly|price|harga|paket|plan/i.test(x.innerText||'')); h?.scrollIntoView({block:'center',behavior:'instant'}); })()`);
    await sleep(500);
    await shot(cdp, `ref-price-${label}-02`);
  }
  const data = await cdp.eval(MEASURE);
  fs.writeFileSync(`${OUT}/ref-price-${label}.json`, JSON.stringify(data, null, 2));
  console.log(label, "section:", JSON.stringify({
    viewport: data.viewport,
    sectionId: data.sectionId,
    heads: data.heads,
    section: data.section && { rect: data.section.rect, bg: data.section.bg, padding: data.section.padding, border: data.section.border },
    heading: data.heading && { text: data.heading.text, size: data.heading.size, weight: data.heading.weight, family: data.heading.family, transformText: data.heading.transformText, lineHeight: data.heading.lineHeight, tracking: data.heading.tracking, color: data.heading.color, rect: data.heading.rect },
    eyebrow: data.eyebrow && { text: data.eyebrow.text, size: data.eyebrow.size, family: data.eyebrow.family, weight: data.eyebrow.weight, color: data.eyebrow.color, transformText: data.eyebrow.transformText, tracking: data.eyebrow.tracking },
    sub: data.sub && { text: data.sub.text, size: data.sub.size, family: data.sub.family, color: data.sub.color, lineHeight: data.sub.lineHeight, rect: data.sub.rect },
    sectionChildren: data.sectionChildren,
    cards: data.cards.map((c) => ({
      card: c.card && { rect: c.card.rect, bg: c.card.bg, radius: c.card.radius, border: c.card.border, shadow: c.card.shadow, transform: c.card.transform, padding: c.card.padding, display: c.card.display },
      name: c.name && { text: c.name.text, size: c.name.size, family: c.name.family, weight: c.name.weight, transformText: c.name.transformText },
      price: c.price && { text: c.price.text, size: c.price.size, family: c.price.family, weight: c.price.weight, color: c.price.color },
      badge: c.badge && { text: c.badge.text, rect: c.badge.rect, bg: c.badge.bg, radius: c.badge.radius, border: c.badge.border, shadow: c.badge.shadow, transform: c.badge.transform, size: c.badge.size, family: c.badge.family, weight: c.badge.weight, transformText: c.badge.transformText, padding: c.badge.padding },
      chip: c.chip && { text: c.chip.text, rect: c.chip.rect, bg: c.chip.bg, radius: c.chip.radius, border: c.chip.border, size: c.chip.size, weight: c.chip.weight },
      cta: c.cta && { text: c.cta.text, rect: c.cta.rect, bg: c.cta.bg, radius: c.cta.radius, border: c.cta.border, shadow: c.cta.shadow, size: c.cta.size, family: c.cta.family, weight: c.cta.weight, transformText: c.cta.transformText },
      bullets: c.bullets.map((b) => ({ text: b.info.text, size: b.info.size, family: b.info.family, color: b.info.color })),
      iconSVG: c.iconSVG,
    })),
  }, null, 2));
  cdp.close();
}

await ensureChrome();
await measure({ w: 1440, h: 1100, mobile: false }, "desktop");
await measure({ w: 390, h: 844, mobile: true }, "mobile");
console.log("done");
