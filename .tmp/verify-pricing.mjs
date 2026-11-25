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

const MEASURE = `(() => {
  const info = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 90),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      bg: s.backgroundColor, bgImage: s.backgroundImage.slice(0, 90), color: s.color,
      family: s.fontFamily.split(',')[0], size: s.fontSize, weight: s.fontWeight,
      lineHeight: s.lineHeight, transformText: s.textTransform,
      radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      shadow: s.boxShadow, transform: s.transform, padding: s.padding, gap: s.gap,
      display: s.display, position: s.position, zIndex: s.zIndex,
    };
  };
  const section = document.querySelector('section#harga');
  const h2 = section.querySelector('h2');
  const articles = [...section.querySelectorAll('article')];
  return {
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
    section: info(section),
    inner: info(section.firstElementChild),
    eyebrow: info(section.querySelector('p')),
    h2: info(h2),
    sub: info(h2.nextElementSibling),
    grid: info(section.querySelector('article').parentElement),
    cards: articles.map((a) => ({
      card: info(a),
      name: info(a.querySelector('h3')),
      desc: info(a.querySelector('h3').nextElementSibling),
      price: info(a.querySelectorAll('p')[1]),
      chip: info(a.querySelector('span.rounded-full')),
      badge: info(a.querySelector('.sticker')),
      bullets: [...a.querySelectorAll('li')].map((li) => info(li)),
      cta: info(a.querySelector('a')),
    })),
    note: info([...section.querySelectorAll('p')].find((p) => /QRIS/i.test(p.innerText || ''))),
  };
})()`;

async function run(label, vp) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  const errors = [];
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  cdp.ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params?.exceptionDetails?.text);
  });
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (vp.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/" });
  await sleep(3500);
  await cdp.eval(`document.querySelector('#harga')?.scrollIntoView({block:'start',behavior:'instant'})`);
  await cdp.eval(`scrollBy(0,-76)`);
  await sleep(500);
  await shot(cdp, `local-price-${label}-01`);
  await cdp.eval(`scrollBy(0, 480)`);
  await sleep(400);
  await shot(cdp, `local-price-${label}-02`);
  await cdp.eval(`scrollBy(0, 520)`);
  await sleep(400);
  await shot(cdp, `local-price-${label}-03`);
  const data = await cdp.eval(MEASURE);
  fs.writeFileSync(`${OUT}/local-price-${label}.json`, JSON.stringify(data, null, 2));

  // hover test (non-highlight + highlight)
  await cdp.eval(`document.querySelector('#harga')?.scrollIntoView({block:'center',behavior:'instant'})`);
  await sleep(400);
  const pos = await cdp.eval(`(() => { const a = document.querySelectorAll('#harga article'); const r = a[1].getBoundingClientRect(); return { x: Math.round(r.x + r.width/2), y: Math.round(Math.max(80, Math.min(innerHeight-80, r.y + 120))) }; })()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pos.x, y: pos.y });
  await sleep(400);
  const hover = await cdp.eval(`(() => { const a = document.querySelectorAll('#harga article')[1]; const s = getComputedStyle(a); return { shadow: s.boxShadow, transform: s.transform }; })()`);
  await shot(cdp, `local-price-${label}-hover`);

  console.log(label, JSON.stringify({
    viewport: data.viewport,
    errors,
    section: { rect: data.section.rect, bg: data.section.bg, bgImage: data.section.bgImage, padding: data.section.padding, border: data.section.border },
    inner: { rect: data.inner.rect, padding: data.inner.padding },
    eyebrow: { text: data.eyebrow.text, size: data.eyebrow.size, weight: data.eyebrow.weight, family: data.eyebrow.family, color: data.eyebrow.color },
    h2: { text: data.h2.text, size: data.h2.size, lineHeight: data.h2.lineHeight, family: data.h2.family, weight: data.h2.weight, transformText: data.h2.transformText, rect: data.h2.rect },
    sub: { text: data.sub.text, size: data.sub.size, family: data.sub.family, lineHeight: data.sub.lineHeight, rect: data.sub.rect },
    grid: { cols: data.grid.display, gap: data.grid.gap, rect: data.grid.rect },
    cards: data.cards.map((c) => ({
      card: { rect: c.card.rect, bg: c.card.bg, radius: c.card.radius, border: c.card.border, shadow: c.card.shadow, transform: c.card.transform, padding: c.card.padding },
      name: { text: c.name.text, size: c.name.size, family: c.name.family, transformText: c.name.transformText },
      desc: { text: c.desc.text, size: c.desc.size, weight: c.desc.weight },
      price: { text: c.price.text, size: c.price.size, family: c.price.family },
      chip: c.chip && { text: c.chip.text, rect: c.chip.rect, bg: c.chip.bg, radius: c.chip.radius, border: c.chip.border, size: c.chip.size },
      badge: c.badge && { text: c.badge.text, rect: c.badge.rect, bg: c.badge.bg, radius: c.badge.radius, border: c.badge.border, shadow: c.badge.shadow, transform: c.badge.transform, zIndex: c.badge.zIndex },
      bullets: c.bullets.slice(0, 2).map((b) => ({ text: b.text, size: b.size, family: b.family })),
      cta: { text: c.cta.text, rect: c.cta.rect, bg: c.cta.bg, radius: c.cta.radius, border: c.cta.border, shadow: c.cta.shadow, size: c.cta.size, family: c.cta.family },
    })),
    hover,
    note: data.note && { text: data.note.text, size: data.note.size, rect: data.note.rect },
  }, null, 2));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
await run("mobile", { w: 390, h: 844, mobile: true });
console.log("done-verify");
