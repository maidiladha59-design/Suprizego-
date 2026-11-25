import fs from "node:fs";

const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newTarget() {
  const res = await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" });
  return res.json();
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
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
      } else if (msg.method) {
        this.events.push(msg);
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
  close() {
    this.ws.close();
  }
}

async function shot(cdp, name) {
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

async function openPage(viewport, url = "http://127.0.0.1:3000/") {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: viewport.w, height: viewport.h, deviceScaleFactor: 1, mobile: viewport.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (viewport.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url });
  await sleep(3500);
  return cdp;
}

async function auditHome(viewport, name) {
  const cdp = await openPage(viewport);
  const data = await cdp.eval(`(() => {
    const info = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }, bg: s.backgroundColor, color: s.color, border: s.borderTopWidth + ' ' + s.borderTopColor, bottomBorder: s.borderBottomWidth + ' ' + s.borderBottomColor, radius: s.borderRadius, shadow: s.boxShadow, font: s.fontSize + ' / ' + s.fontWeight };
    };
    const header = document.querySelector('header');
    const pricing = document.querySelector('#harga');
    const faq = document.querySelector('#faq');
    const cta = [...document.querySelectorAll('main section')].find((s) => s.innerText.includes('Momennya sudah dekat'));
    const footer = document.querySelector('body footer');
    const planCards = [...pricing.querySelectorAll('article')];
    const faqRows = [...faq.querySelectorAll('details')];
    const ctaCard = cta?.querySelector('div');
    return {
      viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
      themeColor: document.querySelector('meta[name="theme-color"]')?.content ?? null,
      header: { ...info(header), nav: [...header.querySelectorAll('nav a')].map((a) => a.innerText.trim()).filter(Boolean) },
      headerButtons: [...header.querySelectorAll('a,button')].map((el) => { const r = el.getBoundingClientRect(); return { text: el.innerText.trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((x) => x.h > 0),
      pricing: { section: info(pricing), heading: info(pricing.querySelector('h2')), cards: planCards.map((c) => ({ ...info(c), text: c.innerText.split('\\n').slice(0, 3).join(' | ') })), badge: info(pricing.querySelector('article span')) },
      faq: { section: info(faq), heading: info(faq.querySelector('h2')), rows: faqRows.slice(0, 3).map((r) => ({ summary: info(r.querySelector('summary')), text: r.querySelector('summary')?.innerText })) },
      cta: { section: info(cta), card: info(ctaCard), heading: info(cta?.querySelector('h2')), buttons: [...(cta?.querySelectorAll('a') ?? [])].map((a) => { const r = a.getBoundingClientRect(); return { text: a.innerText.trim(), w: Math.round(r.width), h: Math.round(r.height), bg: getComputedStyle(a).backgroundColor }; }) },
      footer: { info: info(footer), headings: [...footer.querySelectorAll('h2')].map((h) => h.innerText), hasLanguage: /English|Bahasa/i.test(footer.innerText), text: footer.innerText.slice(0, 300) },
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  })()`);

  const sectionSelector = viewport.mobile ? "#harga" : "#harga";
  await cdp.eval(`document.querySelector('${sectionSelector}').scrollIntoView({block:'start',behavior:'instant'})`);
  await sleep(500);
  await shot(cdp, `audit-${name}-harga`);
  await cdp.eval(`document.querySelector('#faq').scrollIntoView({block:'start',behavior:'instant'})`);
  await sleep(500);
  await shot(cdp, `audit-${name}-faq`);
  await cdp.eval(`(() => { const s = [...document.querySelectorAll('main section')].find((x) => x.innerText.includes('Momennya sudah dekat')); if (s) s.scrollIntoView({block:'center',behavior:'instant'}); })()`);
  await sleep(500);
  await shot(cdp, `audit-${name}-cta`);
  await cdp.eval(`document.querySelector('body footer').scrollIntoView({block:'start',behavior:'instant'})`);
  await sleep(500);
  await shot(cdp, `audit-${name}-footer`);

  const errors = cdp.events.filter((e) => e.method === "Runtime.exceptionThrown" || e.method === "Log.entryAdded");
  console.log(name, JSON.stringify({ ...data, consoleErrors: errors.length }));
  cdp.close();
}

async function auditExample(name) {
  const cdp = await openPage({ w: 390, h: 844, mobile: true }, "http://127.0.0.1:3000/contoh/pengakuan");
  await sleep(1000);
  await shot(cdp, `audit-${name}-example-cover`);
  const data = await cdp.eval(`(() => {
    const main = document.querySelector('main');
    const root = main?.parentElement;
    const r = root?.getBoundingClientRect();
    const s = root ? getComputedStyle(root) : null;
    return {
      viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
      bg: s?.backgroundColor ?? null,
      color: s?.color ?? null,
      text: main?.innerText.slice(0, 220) ?? null,
      button: (() => { const b = main?.querySelector('button'); if (!b) return null; const br = b.getBoundingClientRect(); const bs = getComputedStyle(b); return { w: Math.round(br.width), h: Math.round(br.height), radius: bs.borderRadius, bg: bs.backgroundColor }; })(),
    };
  })()`);
  console.log(name, JSON.stringify(data));
  cdp.close();
}

await auditHome({ w: 1440, h: 1000, mobile: false }, "desktop");
await auditHome({ w: 390, h: 844, mobile: true }, "mobile");
await auditExample("mobile");
console.log("done");
