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

async function shot(cdp, name) {
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

const MEASURE = `(() => {
  const rec = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return {
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      bg: s.backgroundColor, color: s.color, family: s.fontFamily.slice(0, 40), size: s.fontSize, weight: s.fontWeight,
      lineHeight: s.lineHeight, radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopColor,
      borderTop: s.borderTopWidth + ' ' + s.borderTopColor, shadow: s.boxShadow, padding: s.padding,
      text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 100),
    };
  };
  const footer = document.querySelector('footer');
  const bar = footer.querySelector('.border-t-2') || [...footer.querySelectorAll('div')].find((d) => /©/.test(d.innerText || ''));
  const group = footer.querySelector('[role="group"]');
  const buttons = [...group.querySelectorAll('button')];
  return {
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
    footer: rec(footer),
    inner: rec(footer.querySelector('div')),
    headings: [...footer.querySelectorAll('h2')].map((h) => rec(h)),
    links: [...footer.querySelectorAll('nav a')].map((a) => rec(a)),
    brand: rec(footer.querySelector('a[href="/"]')),
    tagline: rec(footer.querySelector('p')),
    bar: rec(bar),
    group: rec(group),
    buttons: buttons.map((b) => ({ ...rec(b), pressed: b.getAttribute('aria-pressed') })),
    copyright: rec([...footer.querySelectorAll('p')].find((p) => /©/.test(p.innerText || ''))),
    headerCta: document.querySelector('header a[href="#momen"]')?.innerText.trim() ?? null,
    htmlLang: document.documentElement.lang,
    storage: localStorage.getItem('suprizego-language'),
  };
})()`;

async function run(viewport, label) {
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
  await sleep(3200);
  await cdp.eval("localStorage.removeItem('suprizego-language')");
  await cdp.send("Page.reload", { ignoreCache: true });
  await sleep(3000);
  await cdp.eval(`document.querySelector('footer').scrollIntoView({ block: 'end', behavior: 'instant' })`);
  await sleep(400);
  const before = await cdp.eval(MEASURE);
  await shot(cdp, `verify-footer-${label}-id`);
  const clicked = await cdp.eval(`(() => { const g = document.querySelector('footer [role="group"]'); const b = g?.querySelectorAll('button')[1]; if (!b) return false; b.click(); return true; })()`);
  await sleep(500);
  const after = await cdp.eval(MEASURE);
  await shot(cdp, `verify-footer-${label}-en`);
  const errors = cdp.events.filter((e) => e.method === "Runtime.exceptionThrown" || (e.method === "Log.entryAdded" && e.params.entry.level === "error"));
  console.log(label, JSON.stringify({
    clicked,
    before,
    after: { headerCta: after.headerCta, htmlLang: after.htmlLang, storage: after.storage, headings: after.headings.map((h) => h.text), copyright: after.copyright?.text, buttons: after.buttons },
    consoleErrors: errors.map((e) => (e.params.entry?.text || e.params.exceptionDetails?.text || '').slice(0, 200)),
  }, null, 2));
  cdp.close();
}

await run({ w: 1440, h: 1000, mobile: false }, "desktop");
await run({ w: 390, h: 844, mobile: true }, "mobile");
console.log("done");
