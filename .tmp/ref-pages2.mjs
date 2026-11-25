import fs from "node:fs";
const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function newTarget() { const res = await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" }); return res.json(); }
class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.ready = new Promise((r, j) => { this.ws.addEventListener("open", r); this.ws.addEventListener("error", j); }); this.ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); } }); }
  async send(method, params = {}) { await this.ready; const id = ++this.id; const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); this.ws.send(JSON.stringify({ id, method, params })); return p; }
  async eval(expression) { const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result?.value; }
  close() { this.ws.close(); }
}
async function shot(cdp, name) {
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}
const FACTS = `(() => {
  const txt = (el) => (el?.innerText || '').trim().replace(/\\s+/g, ' ');
  const main = document.querySelector('main') || document.body;
  const info = (el) => { const r = el.getBoundingClientRect(); return { tag: el.tagName.toLowerCase(), id: el.id || null, cls: (el.className || '').toString().slice(0, 90), h: Math.round(r.height), text: txt(el).slice(0, 90) }; };
  return {
    url: location.href, title: document.title,
    desc: document.querySelector('meta[name=description]')?.content || null,
    robots: document.querySelector('meta[name=robots]')?.content || null,
    canonical: document.querySelector('link[rel=canonical]')?.href || null,
    og: { image: document.querySelector('meta[property="og:image"]')?.content || null, title: document.querySelector('meta[property="og:title"]')?.content || null, desc: document.querySelector('meta[property="og:description"]')?.content || null, type: document.querySelector('meta[property="og:type"]')?.content || null },
    theme: document.querySelector('meta[name=theme-color]')?.content || null,
    lang: document.documentElement.lang,
    body: { bg: getComputedStyle(document.body).backgroundColor, color: getComputedStyle(document.body).color, font: getComputedStyle(document.body).fontFamily.split(',')[0] },
    h1: [...document.querySelectorAll('h1')].map((h) => ({ text: txt(h), size: getComputedStyle(h).fontSize, lh: getComputedStyle(h).lineHeight })),
    h2: [...document.querySelectorAll('h2')].map(txt),
    h3: [...document.querySelectorAll('h3')].map(txt),
    sections: [...main.children].map(info).filter((s) => s.h > 20),
    text: txt(main).slice(0, 12000),
    buttons: [...new Set([...document.querySelectorAll('button,[role=button]')].map(txt).filter(Boolean))].slice(0, 80),
    links: [...document.querySelectorAll('a')].map((a) => ({ t: txt(a).slice(0, 60), h: a.getAttribute('href') })).filter((l) => l.h).slice(0, 140),
    jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent.slice(0, 1500)),
    scrollH: document.documentElement.scrollHeight,
  };
})()`;
const PAGES = [
  // retry blanks
  ["home", "https://proposigo.app/", "m"],
  ["buat", "https://proposigo.app/buat", "m"],
  ["en-home", "https://proposigo.app/en", "d"],
  ["hari-guru", "https://proposigo.app/hari/hari-guru", "m"],
  ["ide", "https://proposigo.app/ide", "m"],
  ["ide-confess", "https://proposigo.app/ide/kata-kata-confess", "d"],
  ["ide-confess", "https://proposigo.app/ide/kata-kata-confess", "m"],
  ["papan", "https://proposigo.app/papan", "d"],
  ["papan", "https://proposigo.app/papan", "m"],
  ["terms", "https://proposigo.app/terms", "d"],
  ["terms", "https://proposigo.app/terms", "m"],
  ["privacy", "https://proposigo.app/privacy", "d"],
  ["privacy", "https://proposigo.app/privacy", "m"],
  ["dasbor", "https://proposigo.app/dasbor", "d"],
  ["dasbor", "https://proposigo.app/dasbor", "m"],
  // extras
  ["momen-ultah-pacar", "https://proposigo.app/momen/ultah/pacar", "d"],
  ["momen-ultah-pacar", "https://proposigo.app/momen/ultah/pacar", "m"],
  ["momen-confess-gebetan", "https://proposigo.app/momen/confess/gebetan", "d"],
  ["hari-ibu", "https://proposigo.app/hari/hari-ibu", "m"],
  ["ide-cara-nembak", "https://proposigo.app/ide/cara-nembak-cewek-lewat-chat", "d"],
  ["ide-kado-natal", "https://proposigo.app/ide/ide-kado-natal-untuk-pacar", "m"],
  ["en-momen-confess", "https://proposigo.app/en/momen/confess", "d"],
  ["en-hari", "https://proposigo.app/en/hari", "d"],
  ["en-buat", "https://proposigo.app/en/buat", "d"],
  ["buat-ultah", "https://proposigo.app/buat/ultah", "d"],
  ["buat-ultah", "https://proposigo.app/buat/ultah", "m"],
  ["buat-anniv", "https://proposigo.app/buat/anniv", "d"],
  ["buat-maaf", "https://proposigo.app/buat/maaf", "d"],
  ["buat-wisuda", "https://proposigo.app/buat/wisuda", "d"],
  ["buat-rayakan", "https://proposigo.app/buat/rayakan", "d"],
  ["notfound", "https://proposigo.app/halaman-yang-tidak-ada-xyz", "d"],
  ["notfound", "https://proposigo.app/halaman-yang-tidak-ada-xyz", "m"],
];
async function waitContent(cdp, ms = 15000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const len = await cdp.eval(`(() => { const m=document.querySelector('main')||document.body; return (m.innerText||'').trim().length; })()`).catch(() => 0);
    if (len > 350) return len;
    await sleep(500);
  }
  return 0;
}
async function run() {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
  for (const [slug, url, vp] of PAGES) {
    const isM = vp === "m";
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: isM ? 390 : 1440, height: isM ? 844 : 1000, deviceScaleFactor: 1, mobile: isM });
    if (isM) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    try {
      await cdp.send("Page.navigate", { url });
      let len = await waitContent(cdp, 15000);
      if (len < 350) { await cdp.send("Page.reload", {}); len = await waitContent(cdp, 15000); }
      await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/^(boleh|terima|setuju|oke|ok|accept|got it)$/i.test((x.innerText||'').trim())); if(b) b.click(); })()`);
      await sleep(300);
      const facts = await cdp.eval(FACTS);
      fs.writeFileSync(`${OUT}/ref-page2-${slug}-${vp}.json`, JSON.stringify(facts, null, 2));
      await shot(cdp, `ref2-${slug}-${vp}-0`);
      if (facts.scrollH > (isM ? 844 : 1000) + 200) {
        await cdp.eval(`scrollTo(0, ${Math.round(facts.scrollH * 0.45)})`); await sleep(300); await shot(cdp, `ref2-${slug}-${vp}-1`);
        await cdp.eval(`scrollTo(0, ${facts.scrollH})`); await sleep(300); await shot(cdp, `ref2-${slug}-${vp}-2`);
        await cdp.eval(`scrollTo(0,0)`);
      }
      console.log(vp, slug, "| len:", (facts.text || "").length, "| title:", facts.title.slice(0, 60), "| h1:", (facts.h1[0]?.text || "").slice(0, 60));
    } catch (e) {
      console.log(vp, slug, "ERR", String(e).slice(0, 160));
    }
  }
  cdp.close();
}
await run();
console.log("done-pages2");
