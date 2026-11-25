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

async function shot(cdp, name, full) {
  const params = { format: "png", captureBeyondViewport: !!full };
  if (full) {
    const m = await cdp.send("Page.getLayoutMetrics");
    params.clip = { x: 0, y: 0, width: m.cssContentSize.width, height: Math.min(Math.ceil(m.cssContentSize.height), 6000), scale: 0.5 };
  }
  const r = await cdp.send("Page.captureScreenshot", params);
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

async function clickAt(cdp, x, y) {
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await sleep(50);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

async function clickText(cdp, rx, sel = "button") {
  const pos = await cdp.eval(`(() => { const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ').toLowerCase(); const b = [...document.querySelectorAll('${sel}')].find((x) => ${rx}.test(t(x)) && x.offsetParent !== null); if (!b) return null; b.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, text: t(b).slice(0, 50) }; })()`);
  if (!pos) { console.log("!! no target", rx); return null; }
  await sleep(300);
  await clickAt(cdp, pos.x, pos.y);
  return pos;
}

async function dismissCookie(cdp) {
  const b = await cdp.eval(`(() => { const t = (el) => (el.innerText || '').trim(); const btn = [...document.querySelectorAll('button')].find((x) => /^Boleh$/i.test(t(x)) && x.offsetParent !== null); if (!btn) return null; const r = btn.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
  if (b) { await clickAt(cdp, b.x, b.y); await sleep(700); }
  return !!b;
}

async function run() {
  const t = await newTarget();
  const cdp = new CDP(t.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
  await sleep(5500);
  await dismissCookie(cdp);

  // anonymous mode ON
  const cb = await cdp.eval(`(() => { const el = document.querySelector('input[type=checkbox]'); if (!el) return null; el.scrollIntoView({block:'center', behavior:'instant'}); const r = el.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
  await sleep(300); await clickAt(cdp, cb.x, cb.y); await sleep(1000);
  const anonInfo = await cdp.eval(`(() => {
    const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
    const sec = [...document.querySelectorAll('section')].find((s) => /SIAPA KE SIAPA/.test(t(s)));
    const inputs = [...sec.querySelectorAll('input')].map((i) => ({ type: i.type, id: i.id, ph: i.placeholder, maxlength: i.maxLength > 0 ? i.maxLength : null, value: i.value }));
    const aside = document.querySelector('aside');
    return { sectionText: t(sec).slice(0, 700), inputs, preview: aside ? t(aside).slice(0, 250) : null };
  })()`);
  console.log("ANON:", JSON.stringify(anonInfo, null, 2).slice(0, 3000));
  await cdp.eval(`(() => { const s = [...document.querySelectorAll('section')].find((x) => /SIAPA KE SIAPA/.test((x.innerText||''))); s.scrollIntoView({block:'start', behavior:'instant'}); scrollBy(0,-100); })()`);
  await sleep(400);
  await shot(cdp, "ref-wiz4-01-anon");

  // anon OFF
  const cb2 = await cdp.eval(`(() => { const el = document.querySelector('input[type=checkbox]'); if (!el) return null; el.scrollIntoView({block:'center', behavior:'instant'}); const r = el.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
  await sleep(300); await clickAt(cdp, cb2.x, cb2.y); await sleep(700);

  // click CTA
  await clickText(cdp, /^lanjut bayar/);
  await sleep(3500);
  let url = await cdp.eval("location.href");
  console.log("after CTA:", url, "|", await cdp.eval("document.title"));
  await shot(cdp, "ref-wiz4-02-after-cta");
  if (url.includes("/buat/confess")) {
    const errs = await cdp.eval(`(() => { const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' '); return { alerts: [...document.querySelectorAll('[role=alert]')].map(t), scrollY, rn: document.querySelector('#rn')?.value, anon: document.querySelector('input[type=checkbox]')?.checked }; })()`);
    console.log("errors:", JSON.stringify(errs));
    // try again after blur
    await cdp.eval(`document.body.focus()`);
    await sleep(300);
    await clickText(cdp, /^lanjut bayar/);
    await sleep(3500);
    url = await cdp.eval("location.href");
    console.log("after CTA retry:", url);
  }

  if (!url.includes("/buat/confess")) {
    const info = await cdp.eval(`(() => {
      const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
      const inputs = [...document.querySelectorAll('input')].map((i) => ({ type: i.type, id: i.id, ph: i.placeholder, value: i.value, required: i.required }));
      const buttons = [...new Set([...document.querySelectorAll('button')].map(t).filter(Boolean))];
      return { title: document.title, h1: [...document.querySelectorAll('h1')].map(t), h2: [...document.querySelectorAll('h2')].map(t), inputs, buttons, text: (document.querySelector('main')||document.body).innerText.slice(0, 5000), robots: document.querySelector('meta[name=robots]')?.content || null, url: location.href };
    })()`);
    fs.writeFileSync(`${OUT}/ref-checkout.json`, JSON.stringify(info, null, 2));
    console.log("CHECKOUT:", JSON.stringify(info, null, 2).slice(0, 5000));
    await shot(cdp, "ref-wiz4-03-checkout");
    await shot(cdp, "ref-wiz4-03b-checkout-full", true);
  }
  cdp.close();
}
await run();
console.log("done-wizard4");
