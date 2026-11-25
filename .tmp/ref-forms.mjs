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
    const h = Math.min(Math.ceil(m.cssContentSize.height), 9000);
    params.clip = { x: 0, y: 0, width: m.cssContentSize.width, height: h, scale: 0.5 };
  }
  const r = await cdp.send("Page.captureScreenshot", params);
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

const FORM = `(() => {
  const txt = (el) => (el?.innerText || '').trim().replace(/\\s+/g, ' ');
  const val = (el) => el.value;
  const inputs = [...document.querySelectorAll('input')].map((el) => ({
    type: el.type, name: el.name || null, id: el.id || null, placeholder: el.placeholder || null,
    maxlength: el.maxLength > 0 ? el.maxLength : null, required: el.required, value: el.type === 'file' ? null : el.value,
    checked: el.checked, accept: el.accept || null, label: el.closest('label') ? txt(el.closest('label')).slice(0, 80) : null,
    cls: (el.className || '').toString().slice(0, 90),
  }));
  const textareas = [...document.querySelectorAll('textarea')].map((el) => ({ name: el.name || null, placeholder: el.placeholder || null, maxlength: el.maxLength > 0 ? el.maxLength : null, required: el.required, value: el.value, rows: el.rows, cls: (el.className || '').toString().slice(0, 90) }));
  const selects = [...document.querySelectorAll('select')].map((el) => ({ name: el.name, options: [...el.options].map((o) => o.text), value: el.value }));
  const h2 = [...document.querySelectorAll('h2')].map((h) => ({ text: txt(h), id: h.id || null, top: Math.round(h.getBoundingClientRect().top + scrollY) }));
  const badges = [...document.querySelectorAll('h2')].map((h) => { const b = h.querySelector('span'); return b ? txt(b) : null; });
  const sections = [...document.querySelectorAll('section')].map((s) => ({ id: s.id || null, cls: (s.className||'').toString().slice(0,80), h: Math.round(s.getBoundingClientRect().height), text: txt(s).slice(0, 120) }));
  const sticky = [...document.querySelectorAll('div,aside')].filter((el) => getComputedStyle(el).position === 'sticky').map((el) => ({ cls: (el.className||'').toString().slice(0,90), top: getComputedStyle(el).top, w: Math.round(el.getBoundingClientRect().width) }));
  const preview = [...document.querySelectorAll('div')].filter((el) => /ADA TITIPAN|PRATINJAU/i.test(txt(el)) && txt(el).length < 400).slice(0, 3).map((el) => { const r = el.getBoundingClientRect(); return { cls: (el.className||'').toString().slice(0,100), w: Math.round(r.width), h: Math.round(r.height), text: txt(el).slice(0, 200) }; });
  const ls = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = String(localStorage.getItem(k)).slice(0, 160); } } catch {}
  return { url: location.href, title: document.title, h2, badges, inputs, textareas, selects, sections, sticky, preview, ls, bodyH: document.documentElement.scrollHeight };
})()`;

const PAGES = [
  ["confess", "https://proposigo.app/buat/confess"],
  ["ultah", "https://proposigo.app/buat/ultah"],
  ["anniv", "https://proposigo.app/buat/anniv"],
  ["maaf", "https://proposigo.app/buat/maaf"],
  ["wisuda", "https://proposigo.app/buat/wisuda"],
  ["rayakan", "https://proposigo.app/buat/rayakan"],
];

async function run() {
  const t = await newTarget();
  const cdp = new CDP(t.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  for (const vp of [{ n: "d", w: 1440, h: 1000, m: false }, { n: "m", w: 390, h: 844, m: true }]) {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.m });
    if (vp.m) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    for (const [slug, url] of PAGES) {
      try {
        await cdp.send("Page.navigate", { url });
        await sleep(4500);
        const f = await cdp.eval(FORM);
        fs.writeFileSync(`${OUT}/ref-form-${slug}-${vp.n}.json`, JSON.stringify(f, null, 2));
        await shot(cdp, `ref-form-${slug}-${vp.n}-top`);
        await shot(cdp, `ref-form-${slug}-${vp.n}-full`, true);
        console.log(vp.n, slug, "| h2:", f.h2.map((h) => h.text).join(" | "));
        console.log("   inputs:", f.inputs.map((i) => `${i.type}:${i.name || i.id || "?"}=${String(i.value).slice(0, 25)}${i.placeholder ? "(" + i.placeholder + ")" : ""}`).join(" · ").slice(0, 700));
        console.log("   areas:", f.textareas.map((i) => `${i.name || "?"}(max ${i.maxlength})=${String(i.value).slice(0, 30)}`).join(" · "));
        console.log("   ls:", Object.keys(f.ls).join(","));
      } catch (e) { console.log(vp.n, slug, "ERR", String(e).slice(0, 160)); }
    }
  }
  cdp.close();
}
await run();
console.log("done-forms");
