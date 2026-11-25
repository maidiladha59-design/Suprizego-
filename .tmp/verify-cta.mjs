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
  const h = [...document.querySelectorAll('h2')].find((x) => /SIAP BIKIN KEJUTAN/i.test(x.innerText || ''));
  if (!h) return { found: false };
  let card = null;
  let el = h.parentElement;
  while (el && el !== document.body) {
    const s = getComputedStyle(el);
    if (parseFloat(s.borderTopWidth) >= 3 && s.backgroundColor !== 'rgba(0, 0, 0, 0)') { card = el; break; }
    el = el.parentElement;
  }
  const section = h.closest('section') || card.parentElement;
  const info = (node) => {
    if (!node) return null;
    const r = node.getBoundingClientRect();
    const s = getComputedStyle(node);
    return {
      tag: node.tagName.toLowerCase(),
      cls: (node.className || '').toString().slice(0, 180),
      text: (node.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 120),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      bg: s.backgroundColor, bgImage: s.backgroundImage.slice(0, 160), color: s.color,
      family: s.fontFamily.split(',')[0], size: s.fontSize, weight: s.fontWeight, lineHeight: s.lineHeight,
      radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      shadow: s.boxShadow, transform: s.transform, padding: s.padding, margin: s.margin,
      display: s.display, gap: s.gap, align: s.alignItems,
    };
  };
  const sub = [...card.querySelectorAll('p')].find((p) => /coba dulu/i.test(p.innerText || ''));
  const link = card.querySelector('a');
  const svg = card.querySelector('svg');
  return {
    found: true,
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
    section: info(section),
    card: info(card),
    heading: info(h),
    sub: info(sub),
    button: info(link),
    svg: svg ? { rect: (() => { const r = svg.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; })() } : null,
    footerTop: (() => { const f = document.querySelector('footer'); return f ? Math.round(f.getBoundingClientRect().y + scrollY) : null; })(),
    cardHtml: card.outerHTML.slice(0, 2500),
  };
})()`;

async function run(label, vp) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (vp.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:3100/" });
  await sleep(3000);
  await cdp.eval(`(() => { const h=[...document.querySelectorAll('h2')].find(x=>/SIAP BIKIN KEJUTAN/i.test(x.innerText||'')); h?.scrollIntoView({block:'center',behavior:'instant'}); })()`);
  await sleep(500);
  await shot(cdp, `local-cta-${label}-01`);
  const data = await cdp.eval(MEASURE);
  console.log(label, JSON.stringify(data, null, 2));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
await run("mobile", { w: 390, h: 844, mobile: true });
console.log("done-cta-local");
