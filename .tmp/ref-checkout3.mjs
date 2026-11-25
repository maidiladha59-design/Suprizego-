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
// list all checkboxes with labels
const boxes = await cdp.eval(`(() => [...document.querySelectorAll('input[type=checkbox]')].map((c,i)=>({i, id:c.id, checked:c.checked, label:(c.closest('label')?.innerText||c.parentElement?.innerText||'').trim().replace(/\\s+/g,' ').slice(0,90)})))()`);
console.log("checkboxes:", JSON.stringify(boxes, null, 1));
// ensure anon off, tick the terms checkbox (label contains '13 tahun')
const set = await cdp.eval(`(() => {
  const cs=[...document.querySelectorAll('input[type=checkbox]')];
  const anon = cs.find(c=>/anonim|Si Malu/i.test(c.closest('label')?.innerText||'') || /anonim|Si Malu/i.test((c.parentElement?.innerText||'').slice(0,60)));
  if (anon && anon.checked) anon.click();
  const terms = cs.find(c=>/13 tahun/.test(c.closest('label')?.innerText||'') || /13 tahun/.test(c.parentElement?.innerText||''));
  if (terms && !terms.checked) terms.click();
  return { anon: anon?anon.checked:null, terms: terms?terms.checked:null };
})()`);
console.log("set:", JSON.stringify(set));
// fill email
const emailPos = await cdp.eval(`(() => { const i=document.querySelector('input[placeholder="kamu@email.com"]'); if(!i) return null; i.scrollIntoView({block:'center',behavior:'instant'}); const r=i.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
if (emailPos) { await clickAt(cdp, emailPos.x, emailPos.y); await sleep(150); await cdp.send("Input.insertText", { text: "riset.suprizego@gmail.com" }); }
await sleep(300);
const pos = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const b=[...document.querySelectorAll('button')].find(x=>t(x)==='LANJUT BAYAR' && x.offsetParent!==null); if(!b) return null; b.scrollIntoView({block:'center',behavior:'instant'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
console.log("pay pos:", JSON.stringify(pos));
await sleep(300);
if (pos) await clickAt(cdp, pos.x, pos.y);
await sleep(9000);
console.log("after pay:", await cdp.eval("location.href"), "|", await cdp.eval("document.title"));
await shot(cdp, "ref-pay-03");
const info = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); return { url: location.href, title: document.title, text: document.body.innerText.slice(0,2500), alerts:[...document.querySelectorAll('[role=alert]')].map(t), iframes:[...document.querySelectorAll('iframe')].map(i=>i.src) }; })()`);
fs.writeFileSync(`${OUT}/ref-pay3.json`, JSON.stringify(info, null, 2));
console.log(JSON.stringify(info, null, 2).slice(0, 4000));
await shot(cdp, "ref-pay-04", true);
cdp.ws.close();
console.log("done-pay3");
