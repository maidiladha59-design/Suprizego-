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
      } else if (msg.method) this.events.push(msg);
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

async function check(viewport, label) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: viewport.w, height: viewport.h, deviceScaleFactor: 1, mobile: viewport.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (viewport.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/" });
  await sleep(3000);
  const data = await cdp.eval(`(() => {
    const rec = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return {
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        bg: s.backgroundColor, color: s.color, family: s.fontFamily.slice(0, 60),
        size: s.fontSize, weight: s.fontWeight, lineHeight: s.lineHeight, tracking: s.letterSpacing,
        radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopColor,
        borderBottom: s.borderBottomWidth + ' ' + s.borderBottomColor,
        shadow: s.boxShadow, padding: s.padding, backdrop: s.backdropFilter, text: (el.innerText || '').trim().slice(0, 60),
      };
    };
    const header = document.querySelector('header');
    const cta = header.querySelector('a[href="#momen"]');
    const brand = header.querySelector('a[href="/"]');
    const hero = document.querySelector('section');
    return {
      viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth, pageH: document.documentElement.scrollHeight },
      themeColor: document.querySelector('meta[name="theme-color"]')?.content ?? null,
      body: { family: getComputedStyle(document.body).fontFamily.slice(0, 60), size: getComputedStyle(document.body).fontSize, bg: getComputedStyle(document.body).backgroundColor },
      header: rec(header),
      cta: rec(cta),
      brand: rec(brand),
      navCount: header.querySelectorAll('nav').length,
      menuButtons: header.querySelectorAll('button').length,
      h1: rec(hero?.querySelector('h1')),
      h1Overflow: (() => { const h = hero?.querySelector('h1'); return h ? h.scrollWidth > h.clientWidth : null; })(),
      heroRect: rec(hero),
    };
  })()`);
  const errors = cdp.events.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Log.entryAdded" && e.params.entry.level === "error"));
  data.consoleErrors = errors.map((e) => (e.params.entry?.text || e.params.exceptionDetails?.text || '').slice(0, 160));
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/local-foundation-${label}.png`, Buffer.from(r.data, "base64"));
  console.log(label, JSON.stringify(data, null, 2));
  cdp.close();
}

await check({ w: 1440, h: 1000, mobile: false }, "desktop");
await check({ w: 390, h: 844, mobile: true }, "mobile");
console.log("done");
