import fs from "node:fs";
const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function newTarget() { const res = await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" }); return res.json(); }
class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.ready = new Promise((r, j) => { this.ws.addEventListener("open", r); this.ws.addEventListener("error", j); }); this.ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); } }); }
  async send(method, params = {}) { await this.ready; const id = ++this.id; const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); this.ws.send(JSON.stringify({ id, method, params })); return p; }
  async eval(expression) { const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result?.value; }
}
async function shot(cdp, name, full) {
  const params = { format: "png", captureBeyondViewport: !!full };
  if (full) { const m = await cdp.send("Page.getLayoutMetrics"); params.clip = { x: 0, y: 0, width: m.cssContentSize.width, height: Math.min(Math.ceil(m.cssContentSize.height), 6000), scale: 0.5 }; }
  const r = await cdp.send("Page.captureScreenshot", params);
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}
async function clickAt(cdp, x, y) {
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await sleep(50);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}
const t = await newTarget();
const cdp = new CDP(t.webSocketDebuggerUrl);
await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await sleep(5000);
// clear draft and consent-reset? keep consent
await cdp.eval(`(() => { localStorage.removeItem('proposigo:draft:confess'); return true; })()`);
await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await sleep(5000);
const state0 = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); return { rn: document.querySelector('#rn')?.value, anon: document.querySelector('input[type=checkbox]')?.checked, cta: [...document.querySelectorAll('button')].find((b)=>/LANJUT BAYAR/.test(t(b)))?.innerText, banner: [...document.querySelectorAll('div')].some((d)=>/BOLEH PAKAI COOKIE/.test(t(d)) && t(d).length<500) }; })()`);
console.log("fresh state:", JSON.stringify(state0));
// click CTA
const pos = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const b=[...document.querySelectorAll('button')].find((x)=>/^LANJUT BAYAR/i.test(t(x)) && x.offsetParent!==null); if(!b) return null; b.scrollIntoView({block:'center',behavior:'instant'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,text:t(b)}; })()`);
console.log("cta pos:", JSON.stringify(pos));
await sleep(400);
await clickAt(cdp, pos.x, pos.y);
await sleep(4000);
console.log("after CTA:", await cdp.eval("location.href"), "|", await cdp.eval("document.title"));
await shot(cdp, "ref-checkout-01");
const errs = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); return { alerts:[...document.querySelectorAll('[role=alert]')].map(t), url: location.href, scrollY }; })()`);
console.log("errors:", JSON.stringify(errs));
if (!(await cdp.eval("location.href")).includes("/buat/confess")) {
  const info = await cdp.eval(`(() => {
    const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' ');
    const inputs=[...document.querySelectorAll('input')].map((i)=>({type:i.type,id:i.id,ph:i.placeholder,value:i.value,required:i.required}));
    const buttons=[...new Set([...document.querySelectorAll('button')].map(t).filter(Boolean))];
    return { url: location.href, title: document.title, robots: document.querySelector('meta[name=robots]')?.content||null, h1:[...document.querySelectorAll('h1')].map(t), h2:[...document.querySelectorAll('h2')].map(t), inputs, buttons, text:(document.querySelector('main')||document.body).innerText.slice(0,5000) };
  })()`);
  fs.writeFileSync(`${OUT}/ref-checkout.json`, JSON.stringify(info, null, 2));
  console.log(JSON.stringify(info, null, 2).slice(0, 6000));
  await shot(cdp, "ref-checkout-02", true);
}
cdp.ws.close();
console.log("done-checkout");
