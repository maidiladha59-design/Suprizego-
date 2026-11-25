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

const FIND = `(() => {
  const h = [...document.querySelectorAll('h2')].find((x) => /SIAP BILANG/i.test(x.innerText || ''));
  if (!h) return { found: false };
  let card = null;
  let el = h.parentElement;
  while (el && el !== document.body) {
    const s = getComputedStyle(el);
    if (parseFloat(s.borderTopWidth) >= 3 && s.backgroundColor !== 'rgba(0, 0, 0, 0)') { card = el; break; }
    el = el.parentElement;
  }
  const section = h.closest('section') || (card && card.parentElement);
  const walk = (n, depth = 0) => {
    if (!n || depth > 5) return [];
    return [...n.children].flatMap((c) => [{ tag: c.tagName.toLowerCase(), cls: (c.className || '').toString().slice(0, 100), text: (c.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 60) }, ...walk(c, depth + 1)]);
  };
  return { found: true, tree: section ? walk(section) : [] };
})()`;

const MEASURE = `(() => {
  const h = [...document.querySelectorAll('h2')].find((x) => /SIAP BILANG/i.test(x.innerText || ''));
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
      transformText: s.textTransform, letterSpacing: s.letterSpacing,
      radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      shadow: s.boxShadow, transform: s.transform, padding: s.padding, margin: s.margin,
      display: s.display, position: s.position, gap: s.gap, justify: s.justifyContent, align: s.alignItems,
    };
  };
  const sub = [...card.querySelectorAll('p')].find((p) => /gratis|bayar|puas/i.test(p.innerText || ''));
  const link = card.querySelector('a');
  const svg = card.querySelector('svg');
  const svgWrap = svg ? svg.parentElement : null;
  const inner = h.parentElement;
  return {
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
    section: info(section),
    card: info(card),
    inner: info(inner),
    h2: info(h),
    sub: info(sub),
    button: info(link),
    svgWrap: info(svgWrap),
    svg: svg ? { html: svg.outerHTML.slice(0, 600), rect: (() => { const r = svg.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; })() } : null,
    cardHtml: card.outerHTML.slice(0, 4000),
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
  await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
  await sleep(6500);
  await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/^(boleh|terima|setuju|oke|ok|accept|got it)$/i.test((x.innerText||'').trim())); if(b) b.click(); })()`);
  const struct = await cdp.eval(FIND);
  console.log(label, "struct:", JSON.stringify(struct, null, 2).slice(0, 3000));
  await cdp.eval(`(() => { const h=[...document.querySelectorAll('h2')].find(x=>/SIAP BILANG/i.test(x.innerText||'')); h?.scrollIntoView({block:'center',behavior:'instant'}); })()`);
  await sleep(600);
  await shot(cdp, `ref-cta-${label}-01`);
  const data = await cdp.eval(MEASURE);
  fs.writeFileSync(`${OUT}/ref-cta-${label}.json`, JSON.stringify(data, null, 2));
  console.log(label, "data:", JSON.stringify({
    viewport: data.viewport,
    section: data.section && { rect: data.section.rect, padding: data.section.padding },
    card: data.card && { rect: data.card.rect, radius: data.card.radius, border: data.card.border, shadow: data.card.shadow, padding: data.card.padding, display: data.card.display, gap: data.card.gap, align: data.card.align, justify: data.card.justify, bgImage: data.card.bgImage },
    inner: data.inner && { rect: data.inner.rect, display: data.inner.display, gap: data.inner.gap, align: data.inner.align },
    h2: data.h2 && { text: data.h2.text, size: data.h2.size, lineHeight: data.h2.lineHeight, family: data.h2.family, rect: data.h2.rect },
    sub: data.sub && { text: data.sub.text, size: data.sub.size, family: data.sub.family, weight: data.sub.weight, rect: data.sub.rect },
    button: data.button && { text: data.button.text, rect: data.button.rect, size: data.button.size, family: data.button.family, radius: data.button.radius, border: data.button.border, shadow: data.button.shadow, padding: data.button.padding, bg: data.button.bg, color: data.button.color },
    svgWrap: data.svgWrap && { rect: data.svgWrap.rect },
    svg: data.svg && { rect: data.svg.rect },
  }, null, 2));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
await run("mobile", { w: 390, h: 844, mobile: true });
console.log("done-cta");
