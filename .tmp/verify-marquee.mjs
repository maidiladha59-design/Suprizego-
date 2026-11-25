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
    const r = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
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

async function openPage(viewport) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.w,
    height: viewport.h,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  if (viewport.mobile) {
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  }
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/" });
  await sleep(3500);
  return cdp;
}

async function measure(cdp) {
  return cdp.eval(`(() => {
    const track = document.querySelector('.animate-marquee');
    const section = track ? track.parentElement : null;
    const first = track ? track.querySelector('span') : null;
    const r = section ? section.getBoundingClientRect() : null;
    const s = section ? getComputedStyle(section) : null;
    const f = first ? getComputedStyle(first) : null;
    return {
      viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
      section: r ? { top: Math.round(r.top + scrollY), h: Math.round(r.height), w: Math.round(r.width) } : null,
      bg: s ? s.backgroundColor : null,
      font: f ? { family: f.fontFamily, size: f.fontSize, weight: f.fontWeight, color: f.color } : null,
      transform: track ? getComputedStyle(track).transform : null,
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      labels: track ? [...track.querySelectorAll('span')].slice(0, 6).map(x => x.textContent.trim()) : [],
      errors: window.__errs || [],
    };
  })()`);
}

async function run(viewport, name) {
  const cdp = await openPage(viewport);
  await cdp.eval(`(() => { const t = document.querySelector('.animate-marquee'); const s = t ? t.parentElement : null; if (s) window.scrollTo({ top: s.offsetTop - 180, behavior: 'instant' }); })()`);
  await sleep(700);
  const before = await measure(cdp);
  await shot(cdp, `local-${name}-marquee`);
  await sleep(1200);
  const after = await measure(cdp);
  await shot(cdp, `local-${name}-marquee-move`);
  const errors = cdp.events.filter((e) => e.method === "Runtime.exceptionThrown" || e.method === "Log.entryAdded");
  console.log(name, JSON.stringify({ before, afterTransform: after.transform, consoleErrors: errors.length }));
  cdp.close();
}

await run({ w: 1440, h: 1000, mobile: false }, "desktop");
await run({ w: 390, h: 844, mobile: true }, "mobile");
console.log("done");
