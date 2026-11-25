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
async function shot(cdp, name) { const r = await cdp.send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64")); }
async function clickAt(cdp, x, y) { await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 }); await sleep(50); await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 }); }
const target = await newTarget();
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");

// 1) FAQ expand (desktop)
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
await sleep(6000);
await cdp.eval(`(() => { [...document.querySelectorAll('details')].forEach(d=>{ if(!d.open) d.querySelector('summary')?.click(); }); return document.querySelectorAll('details').length; })()`);
await sleep(800);
const faq = await cdp.eval(`(() => [...document.querySelectorAll('details')].map(d=>({q:d.querySelector('summary')?.innerText.trim(), a:(d.querySelector('p')?.innerText||'').trim()})))()`);
fs.writeFileSync(`${OUT}/ref-faq-open.json`, JSON.stringify(faq, null, 2));
console.log("FAQ:", JSON.stringify(faq, null, 1));

// 2) Dasbor login
await sleep(2500);
await cdp.send("Page.navigate", { url: "https://proposigo.app/dasbor" });
await sleep(7000);
const login = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); return { url: location.href, title: document.title, text: (document.querySelector('main')||document.body).innerText.slice(0,1200), inputs: [...document.querySelectorAll('input')].map(i=>({type:i.type,name:i.name,id:i.id,ph:i.placeholder,autocomplete:i.autocomplete})), buttons: [...new Set([...document.querySelectorAll('button')].map(t).filter(Boolean))], links: [...document.querySelectorAll('a')].map(a=>({t:t(a).slice(0,50),h:a.getAttribute('href')})).filter(x=>x.h).slice(0,20) }; })()`);
fs.writeFileSync(`${OUT}/ref-dasbor.json`, JSON.stringify(login, null, 2));
console.log("DASBOR:", JSON.stringify(login, null, 1));
await shot(cdp, "ref-dasbor-login");

// 3) Cookie settings (from footer on home)
await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
await sleep(5000);
const pos = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const b=[...document.querySelectorAll('button')].find(x=>t(x)==='Pengaturan cookie'); if(!b) return null; b.scrollIntoView({block:'center',behavior:'instant'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
if (pos) { await clickAt(cdp, pos.x, pos.y); await sleep(1200); }
const cookie = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); const dlg=[...document.querySelectorAll('[role=dialog],section,div')].find(d=>/cookie/i.test(t(d)) && t(d).length<1200 && getComputedStyle(d).position==='fixed'); return { dialog: dlg?dlg.outerHTML.slice(0,5000):null, text: dlg?t(dlg):null }; })()`);
fs.writeFileSync(`${OUT}/ref-cookie-settings.json`, JSON.stringify(cookie, null, 2));
console.log("COOKIE:", (cookie.text||'none').slice(0,1500));
await shot(cdp, "ref-cookie-settings");

// 4) EN pages + audience
for (const [slug, url] of [["en-home", "https://proposigo.app/en"], ["en-buat", "https://proposigo.app/en/buat"], ["en-momen-confess", "https://proposigo.app/en/momen/confess"], ["momen-ultah-pacar", "https://proposigo.app/momen/ultah/pacar"]]) {
  await cdp.send("Page.navigate", { url });
  await sleep(5500);
  const facts = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); const main=document.querySelector('main')||document.body; return { url: location.href, title: document.title, desc: document.querySelector('meta[name=description]')?.content||null, h1:[...document.querySelectorAll('h1')].map(t), h2:[...document.querySelectorAll('h2')].map(t), text: t(main).slice(0,6500), buttons:[...new Set([...document.querySelectorAll('button')].map(t).filter(Boolean))].slice(0,40), links:[...document.querySelectorAll('a')].map(a=>({t:t(a).slice(0,50),h:a.getAttribute('href')})).filter(x=>x.h).slice(0,40), scrollH: document.documentElement.scrollHeight }; })()`);
  fs.writeFileSync(`${OUT}/ref-more-${slug}.json`, JSON.stringify(facts, null, 2));
  console.log("PAGE", slug, "|", facts.title, "|", facts.text.slice(0, 200));
  await shot(cdp, `ref-more-${slug}-top`);
  await cdp.eval(`scrollTo(0, ${Math.round(facts.scrollH * 0.55)})`); await sleep(350); await shot(cdp, `ref-more-${slug}-mid`);
}

// 5) Preview URL from mobile wizard
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/ultah" });
await sleep(6000);
await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/^BOLEH$/i.test((x.innerText||'').trim())); if(b)b.click(); return true; })()`);
const pv = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const b=[...document.querySelectorAll('button,a')].find(x=>/LIHAT PRATINJAU/i.test(t(x)) && x.offsetParent!==null); if(!b) return null; b.scrollIntoView({block:'center',behavior:'instant'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,tag:b.tagName,text:t(b)}; })()`);
console.log("PREVIEW BTN:", JSON.stringify(pv));
if (pv) {
  await clickAt(cdp, pv.x, pv.y);
  await sleep(4500);
  const after = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); return { url: location.href, title: document.title, text: (document.querySelector('main')||document.body).innerText.slice(0,1500), dialogs:[...document.querySelectorAll('[role=dialog]')].map(t) }; })()`);
  console.log("AFTER PREVIEW:", JSON.stringify(after).slice(0,1200));
  fs.writeFileSync(`${OUT}/ref-preview-open.json`, JSON.stringify(after, null, 2));
  await shot(cdp, "ref-preview-open");
}
cdp.close();

// 6) Static resources via fetch
const res = {};
for (const u of ["/robots.txt", "/llms.txt", "/sitemap.xml", "/favicon.ico", "/icon.png", "/og/home-id.png", "/manifest.webmanifest", "/404"]) {
  try {
    const r = await fetch("https://proposigo.app" + u, { redirect: "follow" });
    const ct = r.headers.get("content-type");
    let body = null;
    if (/text|json|xml/.test(ct || "")) body = (await r.text()).slice(0, 900);
    res[u] = { status: r.status, ct, final: r.url, body };
  } catch (e) { res[u] = { err: String(e) }; }
}
fs.writeFileSync(`${OUT}/ref-static.json`, JSON.stringify(res, null, 2));
console.log("STATIC:", JSON.stringify(res, null, 1).slice(0, 3000));
console.log("done-more");
