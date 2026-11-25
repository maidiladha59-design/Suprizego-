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

async function open(vp) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (vp.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:3000/#harga` });
  await sleep(3000);
  return cdp;
}

// anchor offset check desktop + mobile
for (const vp of [{ w: 1440, h: 1000, mobile: false, label: "desktop" }, { w: 390, h: 844, mobile: true, label: "mobile" }]) {
  const cdp = await open(vp);
  const geo = await cdp.eval(`(() => {
    const header = document.querySelector('header');
    const h2 = document.querySelector('#harga h2');
    const badge = document.querySelector('#harga .sticker');
    const card = document.querySelector('#harga article');
    return {
      headerBottom: Math.round(header.getBoundingClientRect().bottom),
      h2Top: Math.round(h2.getBoundingClientRect().top),
      badgeTop: badge ? Math.round(badge.getBoundingClientRect().top) : null,
      badgeRight: badge ? Math.round(badge.getBoundingClientRect().right) : null,
      cardRight: card ? Math.round(card.getBoundingClientRect().right) : null,
      scrollW: document.documentElement.scrollWidth,
      innerW: innerWidth,
    };
  })()`);
  console.log(vp.label, "anchor:", JSON.stringify(geo));
  await shot(cdp, `final-price-${vp.label}-anchor`);
  cdp.close();
}

// reduced motion hover check
const cdp = await open({ w: 1440, h: 1000, mobile: false });
await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
const pos = await cdp.eval(`(() => {
  document.querySelector('#harga')?.scrollIntoView({block:'center',behavior:'instant'});
  const a = document.querySelectorAll('#harga article')[1];
  const r = a.getBoundingClientRect();
  return { x: Math.round(r.x + r.width/2), y: Math.round(Math.min(innerHeight-100, Math.max(100, r.y + 120))) };
})()`);
await sleep(400);
await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pos.x, y: pos.y });
await sleep(400);
const reduceHover = await cdp.eval(`(() => {
  const a = document.querySelectorAll('#harga article')[1];
  const s = getComputedStyle(a);
  return { shadow: s.boxShadow, transform: s.transform, translate: s.translate };
})()`);
console.log("reduced-motion hover:", JSON.stringify(reduceHover));
await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await sleep(400);
const normalHover = await cdp.eval(`(() => {
  const a = document.querySelectorAll('#harga article')[1];
  const s = getComputedStyle(a);
  return { shadow: s.boxShadow, translate: s.translate };
})()`);
console.log("normal hover:", JSON.stringify(normalHover));
cdp.close();
console.log("final-done");
