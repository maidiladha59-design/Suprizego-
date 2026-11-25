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

const FACTS = `(() => {
  const txt = (el) => (el?.innerText || '').trim().replace(/\\s+/g, ' ');
  const main = document.querySelector('main') || document.body;
  const info = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { tag: el.tagName.toLowerCase(), id: el.id || null, cls: (el.className || '').toString().slice(0, 100), h: Math.round(r.height), text: txt(el).slice(0, 80) }; };
  const sections = [...main.children].map(info).filter((s) => s.h > 20);
  return {
    url: location.href,
    title: document.title,
    desc: document.querySelector('meta[name=description]')?.content || null,
    robots: document.querySelector('meta[name=robots]')?.content || null,
    canonical: document.querySelector('link[rel=canonical]')?.href || null,
    og: { image: document.querySelector('meta[property="og:image"]')?.content || null, title: document.querySelector('meta[property="og:title"]')?.content || null, type: document.querySelector('meta[property="og:type"]')?.content || null },
    theme: document.querySelector('meta[name=theme-color]')?.content || null,
    lang: document.documentElement.lang,
    body: { bg: getComputedStyle(document.body).backgroundColor, color: getComputedStyle(document.body).color, font: getComputedStyle(document.body).fontFamily.split(',')[0] },
    h1: [...document.querySelectorAll('h1')].map((h) => ({ text: txt(h), cls: (h.className||'').toString().slice(0,90), size: getComputedStyle(h).fontSize, lh: getComputedStyle(h).lineHeight, family: getComputedStyle(h).fontFamily.split(',')[0] })),
    h2: [...document.querySelectorAll('h2')].map(txt),
    h3: [...document.querySelectorAll('h3')].map(txt),
    sections,
    text: txt(main).slice(0, 9000),
    buttons: [...new Set([...document.querySelectorAll('button,[role=button]')].map(txt).filter(Boolean))].slice(0, 60),
    links: [...document.querySelectorAll('a')].map((a) => ({ t: txt(a).slice(0, 60), h: a.getAttribute('href') })).filter((l) => l.h).slice(0, 120),
    scrollH: document.documentElement.scrollHeight,
  };
})()`;

const PAGES = [
  ["home", "https://proposigo.app/"],
  ["buat", "https://proposigo.app/buat"],
  ["buat-confess", "https://proposigo.app/buat/confess"],
  ["momen-confess", "https://proposigo.app/momen/confess"],
  ["momen-ultah", "https://proposigo.app/momen/ultah"],
  ["momen-anniv", "https://proposigo.app/momen/anniv"],
  ["momen-maaf", "https://proposigo.app/momen/maaf"],
  ["momen-wisuda", "https://proposigo.app/momen/wisuda"],
  ["momen-rayakan", "https://proposigo.app/momen/rayakan"],
  ["hari", "https://proposigo.app/hari"],
  ["hari-guru", "https://proposigo.app/hari/hari-guru"],
  ["ide", "https://proposigo.app/ide"],
  ["ide-confess", "https://proposigo.app/ide/kata-kata-confess"],
  ["papan", "https://proposigo.app/papan"],
  ["terms", "https://proposigo.app/terms"],
  ["privacy", "https://proposigo.app/privacy"],
  ["dasbor", "https://proposigo.app/dasbor"],
  ["en-home", "https://proposigo.app/en"],
];

async function run() {
  const cdp = await (async () => {
    const t = await newTarget();
    const c = new CDP(t.webSocketDebuggerUrl);
    await c.send("Page.enable"); await c.send("Runtime.enable"); await c.send("Page.bringToFront");
    await c.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    return c;
  })();

  for (const vp of [{ n: "d", w: 1440, h: 1000, m: false }, { n: "m", w: 390, h: 844, m: true }]) {
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.m });
    if (vp.m) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    for (const [slug, url] of PAGES) {
      try {
        await cdp.send("Page.navigate", { url });
        await sleep(3200);
        await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/^(boleh|terima|setuju|oke|ok|accept|got it)$/i.test((x.innerText||'').trim())); if(b) b.click(); })()`);
        await sleep(300);
        const facts = await cdp.eval(FACTS);
        fs.writeFileSync(`${OUT}/ref-page-${slug}-${vp.n}.json`, JSON.stringify(facts, null, 2));
        await shot(cdp, `ref-page-${slug}-${vp.n}-0`);
        if (facts.scrollH > vp.h + 200) {
          await cdp.eval(`scrollTo(0, ${Math.round(facts.scrollH * 0.45)})`);
          await sleep(350);
          await shot(cdp, `ref-page-${slug}-${vp.n}-1`);
          await cdp.eval(`scrollTo(0, ${Math.round(facts.scrollH)})`);
          await sleep(350);
          await shot(cdp, `ref-page-${slug}-${vp.n}-2`);
          await cdp.eval(`scrollTo(0,0)`);
        }
        console.log(vp.n, slug, "|", facts.title, "| h:", facts.scrollH, "| h1:", facts.h1.map((x) => x.text).join(" / ").slice(0, 120));
      } catch (e) {
        console.log(vp.n, slug, "ERR", String(e).slice(0, 200));
      }
    }
  }
  cdp.close();
}

await run();
console.log("done-pages");
