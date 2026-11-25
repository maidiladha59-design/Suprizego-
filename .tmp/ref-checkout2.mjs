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
// dismiss cookie banner if any
await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const b=[...document.querySelectorAll('button')].find(x=>/^BOLEH$/i.test(t(x))); if(b){b.click();return true;} return false; })()`);
await sleep(800);
// checkout form facts
const formFacts = await cdp.eval(`(() => {
  const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' ');
  const card = [...document.querySelectorAll('div')].find(d=>/TINGGAL ISI DATAMU/.test(t(d)) && t(d).length<900);
  const inputs = [...document.querySelectorAll('input')].map(i=>({type:i.type,id:i.id,name:i.name,ph:i.placeholder,value:i.value,required:i.required,checked:i.checked,maxLength:i.maxLength}));
  const buttons = [...new Set([...document.querySelectorAll('button')].map(t).filter(Boolean))];
  return { cardHtml: card?card.outerHTML.slice(0,4000):null, inputs, buttons };
})()`);
fs.writeFileSync(`${OUT}/ref-checkout-form.json`, JSON.stringify(formFacts, null, 2));
// fill email
const emailPos = await cdp.eval(`(() => { const i=document.querySelector('input[placeholder="kamu@email.com"]'); if(!i) return null; i.scrollIntoView({block:'center',behavior:'instant'}); const r=i.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
if (emailPos) { await clickAt(cdp, emailPos.x, emailPos.y); await sleep(150); await cdp.send("Input.insertText", { text: "riset.suprizego@gmail.com" }); }
await sleep(300);
// tick terms checkbox via JS click
const ticked = await cdp.eval(`(() => { const cbs=[...document.querySelectorAll('input[type=checkbox]')]; const c=cbs.find(x=>/setuju|13 tahun/i.test(x.closest('label')?.innerText||'') || (x.closest('div')?.innerText||'').includes('13 tahun')) || cbs[cbs.length-1]; if(!c) return {ok:false,count:cbs.length}; if(!c.checked) c.click(); return {ok:true,checked:c.checked,label:(c.closest('label')?.innerText||'').slice(0,120)}; })()`);
console.log("checkbox:", JSON.stringify(ticked));
await sleep(400);
// click first LANJUT BAYAR (in form)
const pos = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim(); const bs=[...document.querySelectorAll('button')].filter(x=>/^LANJUT BAYAR/i.test(t(x)) && x.offsetParent!==null); const b=bs.find(x=>x.innerText.trim()==='LANJUT BAYAR') || bs[0]; if(!b) return null; b.scrollIntoView({block:'center',behavior:'instant'}); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,text:t(b),count:bs.length}; })()`);
console.log("pay pos:", JSON.stringify(pos));
await sleep(300);
await clickAt(cdp, pos.x, pos.y);
await sleep(7000);
console.log("after pay:", await cdp.eval("location.href"), "|", await cdp.eval("document.title"));
await shot(cdp, "ref-pay-01");
const newInfo = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); return { url: location.href, title: document.title, text: document.body.innerText.slice(0,3000), alerts:[...document.querySelectorAll('[role=alert]')].map(t), iframes:[...document.querySelectorAll('iframe')].map(i=>i.src), dialogs:[...document.querySelectorAll('[role=dialog]')].map(t) }; })()`);
fs.writeFileSync(`${OUT}/ref-pay.json`, JSON.stringify(newInfo, null, 2));
console.log(JSON.stringify(newInfo, null, 2).slice(0, 5000));
await shot(cdp, "ref-pay-02", true);
cdp.ws.close();
console.log("done-pay");
