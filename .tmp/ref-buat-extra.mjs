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

const target = await newTarget();
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Page.navigate", { url: "https://proposigo.app/buat" });
await sleep(6500);

const data = await cdp.eval(`(() => {
  const s = (el) => getComputedStyle(el);
  const rec = (el) => {
    if (!el) return null;
    const c = s(el); const r = el.getBoundingClientRect();
    return {
      bg: c.backgroundColor, color: c.color, border: c.borderTopWidth + ' ' + c.borderTopColor,
      radius: c.borderRadius, shadow: c.boxShadow, rotate: c.rotate, transform: c.transform,
      padding: c.padding, font: c.fontSize + '/' + c.lineHeight, weight: c.fontWeight,
      family: c.fontFamily.slice(0, 20), rect: { w: Math.round(r.width), h: Math.round(r.height) },
    };
  };
  const cards = [...document.querySelectorAll('a[href^="/buat/confess"], a[href^="/buat/"]')]
    .filter((a) => a.querySelector('h2'))
    .map((a) => ({ href: a.getAttribute('href'), text: a.querySelector('h2')?.innerText, box: rec(a.querySelector('div')), content: rec(a.querySelector('div > div:last-child')), chip: rec([...a.querySelectorAll('span')].find((x) => (x.innerText || '').includes('✦'))) }));
  const sticker = [...document.querySelectorAll('span')].find((x) => /paling dicari/i.test(x.innerText || '') && x.children.length === 0);
  const footer = document.querySelector('footer');
  const footerBars = [...footer.querySelectorAll('div')].filter((d) => /©/.test(d.innerText || '') && d.getBoundingClientRect().height < 120);
  const bar = footerBars[0];
  const header = document.querySelector('header');
  const headerInner = header.firstElementChild;
  return {
    bg: s(document.body).backgroundColor,
    cards,
    sticker: sticker ? { ...rec(sticker), text: sticker.innerText } : null,
    header: { ...rec(header), backdrop: s(header).backdropFilter, inner: rec(headerInner) },
    footerBar: bar ? { ...rec(bar), borderTop: s(bar).borderTopWidth + ' ' + s(bar).borderTopColor } : null,
    subLink: rec([...document.querySelectorAll('footer a')].find((a) => /Bikin halaman/.test(a.innerText || ''))),
  };
})()`);
fs.writeFileSync(`${OUT}/ref-buat-extra.json`, JSON.stringify(data, null, 2));
console.log(JSON.stringify(data, null, 2));
cdp.close();
