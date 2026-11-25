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
      text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 110),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      bg: s.backgroundColor, color: s.color, family: s.fontFamily.split(',')[0], size: s.fontSize,
      weight: s.fontWeight, lineHeight: s.lineHeight, transformText: s.textTransform,
      radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      shadow: s.boxShadow, padding: s.padding, display: s.display, cursor: s.cursor,
    };
  };
  const section = document.querySelector('#faq');
  const h2 = section.querySelector('h2');
  const items = [...section.querySelectorAll('details')];
  return {
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
    section: info(section),
    inner: info(section.firstElementChild),
    eyebrow: info(section.querySelector('p')),
    h2: info(h2),
    desc: info(h2.nextElementSibling),
    link: info(section.querySelector('a')),
    wrap: info(items[0].parentElement),
    items: items.map((d) => ({
      details: info(d),
      summary: info(d.querySelector('summary')),
      answer: info(d.querySelector('p')),
      open: d.open,
    })),
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
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/#faq" });
  await sleep(3000);
  await shot(cdp, `local-faq-${label}-01`);
  const closed = await cdp.eval(MEASURE);

  await cdp.eval(`document.querySelector('#faq details summary')?.click()`);
  await sleep(400);
  await shot(cdp, `local-faq-${label}-02`);
  const open = await cdp.eval(MEASURE);

  // hover first item
  const pos = await cdp.eval(`(() => { const d = document.querySelector('#faq details'); const r = d.getBoundingClientRect(); return { x: Math.round(Math.min(innerWidth - 40, r.x + r.width / 2)), y: Math.round(Math.min(innerHeight - 60, Math.max(100, r.y + 30))) }; })()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pos.x, y: pos.y });
  await sleep(300);
  const hover = await cdp.eval(`(() => { const d = document.querySelector('#faq details'); return { shadow: getComputedStyle(d).boxShadow }; })()`);

  console.log(label, JSON.stringify({
    viewport: closed.viewport,
    errors,
    section: { rect: closed.section.rect, bg: closed.section.bg, padding: closed.section.padding },
    inner: { rect: closed.inner.rect, padding: closed.inner.padding },
    eyebrow: { text: closed.eyebrow.text, size: closed.eyebrow.size, weight: closed.eyebrow.weight, family: closed.eyebrow.family },
    h2: { text: closed.h2.text, size: closed.h2.size, lineHeight: closed.h2.lineHeight, family: closed.h2.family, transformText: closed.h2.transformText, rect: closed.h2.rect },
    desc: { text: closed.desc.text, size: closed.desc.size, family: closed.desc.family },
    link: { text: closed.link.text, size: closed.link.size, family: closed.link.family },
    wrap: { rect: closed.wrap.rect, gap: closed.wrap.gap },
    itemsClosed: closed.items.map((i) => ({ details: { rect: i.details.rect, bg: i.details.bg, radius: i.details.radius, border: i.details.border, shadow: i.details.shadow, padding: i.details.padding }, summary: { text: i.summary.text, size: i.summary.size, family: i.summary.family, weight: i.summary.weight }, open: i.open })),
    firstOpen: { open: open.items[0].open, details: open.items[0].details.rect, answer: { text: open.items[0].answer.text.slice(0, 70), size: open.items[0].answer.size, weight: open.items[0].answer.weight, family: open.items[0].answer.family } },
    hover,
    qaUnchanged: open.items.map((i) => i.summary.text.slice(0, 30)),
  }, null, 2));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
await run("mobile", { w: 390, h: 844, mobile: true });
console.log("done-faq-verify");
