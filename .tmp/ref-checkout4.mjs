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
await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const b=[...document.querySelectorAll('button')].find(x=>/^BOLEH$/i.test(t(x))); if(b){b.click();return true;} return false; })()`);
// ensure anon off
const st = await cdp.eval(`(() => { const c=[...document.querySelectorAll('input[type=checkbox]')].find(x=>/anonim|Si Malu/i.test(x.closest('label')?.innerText||(x.parentElement?.innerText||'').slice(0,60))); if(c&&c.checked)c.click(); return {anon:c?c.checked:null}; })()`);
console.log("anon:", JSON.stringify(st));
// click sticky CTA to open data form
const sticky = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const bs=[...document.querySelectorAll('button')].filter(x=>/^LANJUT BAYAR · RP/i.test(t(x)) && x.offsetParent!==null); const b=bs[bs.length-1]; if(!b) return null; b.scrollIntoView({block:'center',behavior:'instant'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,text:t(b),count:bs.length}; })()`);
console.log("sticky:", JSON.stringify(sticky));
if (sticky) await clickAt(cdp, sticky.x, sticky.y);
await sleep(1500);
const drawer = await cdp.eval(`(() => {
  const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' ');
  const card = [...document.querySelectorAll('div,section')].find(d=>/TINGGAL ISI DATAMU/.test(t(d)) && t(d).length<800);
  const boxes=[...document.querySelectorAll('input[type=checkbox]')].map((c,i)=>({i, checked:c.checked, label:(c.closest('label')?.innerText||c.parentElement?.innerText||'').trim().replace(/\\s+/g,' ').slice(0,90)}));
  const btns=[...new Set([...document.querySelectorAll('button')].map(t).filter(Boolean))];
  return { hasCard: !!card, card: card?card.outerHTML.slice(0,3000):null, boxes, btns };
})()`);
console.log("drawer:", JSON.stringify({hasCard: drawer.hasCard, boxes: drawer.boxes, btns: drawer.btns.slice(-8)}, null, 1));
fs.writeFileSync(`${OUT}/ref-checkout-drawer.json`, JSON.stringify(drawer, null, 2));
if (drawer.hasCard) {
  await shot(cdp, "ref-pay-form");
  // fill email + name
  const fill = await cdp.eval(`(() => { const i=document.querySelector('input[placeholder="kamu@email.com"]'); if(!i) return null; i.scrollIntoView({block:'center',behavior:'instant'}); const r=i.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2, name:(i.closest('form')?.querySelector('input')||{}).value}; })()`);
  console.log("fill:", JSON.stringify(fill));
  if (fill) { await clickAt(cdp, fill.x, fill.y); await sleep(150); await cdp.send("Input.insertText", { text: "riset.suprizego@gmail.com" }); }
  await sleep(200);
  // tick terms
  const tick = await cdp.eval(`(() => { const cs=[...document.querySelectorAll('input[type=checkbox]')]; const terms=cs.find(c=>/13 tahun/.test(c.closest('label')?.innerText||c.parentElement?.innerText||'')); if(!terms) return {ok:false, n:cs.length}; if(!terms.checked) terms.click(); return {ok:true, checked:terms.checked}; })()`);
  console.log("terms:", JSON.stringify(tick));
  await sleep(300);
  const pay = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const b=[...document.querySelectorAll('button')].find(x=>t(x)==='LANJUT BAYAR' && x.offsetParent!==null); if(!b) return null; b.scrollIntoView({block:'center',behavior:'instant'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  console.log("pay:", JSON.stringify(pay));
  if (pay) await clickAt(cdp, pay.x, pay.y);
  await sleep(9000);
  const after = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); return { url: location.href, title: document.title, text: document.body.innerText.slice(0,2000), alerts:[...document.querySelectorAll('[role=alert]')].map(t), iframes:[...document.querySelectorAll('iframe')].map(i=>i.src) }; })()`);
  fs.writeFileSync(`${OUT}/ref-pay4.json`, JSON.stringify(after, null, 2));
  console.log("after pay:", JSON.stringify(after).slice(0, 3500));
  await shot(cdp, "ref-pay-05", true);
}
cdp.ws.close();
console.log("done-pay4");
