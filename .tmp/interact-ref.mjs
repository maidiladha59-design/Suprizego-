import fs from "node:fs";
const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const target = await (await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" })).json();
class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.ready = new Promise((res, rej) => { this.ws.addEventListener("open", res); this.ws.addEventListener("error", rej); }); this.ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } }); }
  async send(method, params = {}) { await this.ready; const id = ++this.id; const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); this.ws.send(JSON.stringify({ id, method, params })); return p; }
  async eval(expression) { const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result?.value; }
}
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
await sleep(5000);
async function shot(name) { const r = await cdp.send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64")); }
await shot("ref-demo-before");
const clickables = await cdp.eval(`[...document.querySelectorAll('button,a,[role=button],svg')].map(el=>{const r=el.getBoundingClientRect();return {tag:el.tagName, cls:(typeof el.className==='string'?el.className:el.className.baseVal||'').slice(0,80), x:Math.round(r.x+r.width/2), y:Math.round(r.y+r.height/2), w:Math.round(r.width), h:Math.round(r.height), text:(el.innerText||'').replace(/\\s+/g,' ').slice(0,40), aria:el.getAttribute('aria-label')}}).filter(x=>x.w>5&&x.h>5)`);
console.log(clickables.filter(c => c.y > 200 && c.y < 900).slice(0, 30));
// hover primary button
await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 270, y: 809 });
await sleep(500);
await shot("ref-hover-primary");
const hoverStyle = await cdp.eval(`(() => { const a=[...document.querySelectorAll('a')].find(x=>x.innerText.includes('BIKIN HALAMAN')); const s=getComputedStyle(a); return {transform:s.transform, shadow:s.boxShadow, bg:s.backgroundColor}; })()`);
console.log("hover", hoverStyle);
// click envelope
await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 1031, y: 600, button: "left", clickCount: 1 });
await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 1031, y: 600, button: "left", clickCount: 1 });
await sleep(1800);
await shot("ref-demo-after1");
const after1 = await cdp.eval(`(() => { const ph=[...document.querySelectorAll('div')].find(d=>(d.innerText||'').includes('DINDA')&&d.getBoundingClientRect().width===340); return ph ? ph.innerText : document.body.innerText.slice(0,1000); })()`);
console.log("AFTER1 PHONE TEXT:\\n", after1);
const panel = await cdp.eval(`(() => { const el=[...document.querySelectorAll('div')].find(d=>(d.innerText||'').startsWith('YANG MASUK KE')); return el ? el.innerText : ''; })()`);
console.log("PANEL:\\n", panel);
// click phone again / cards
await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: 1031, y: 600, button: "left", clickCount: 1 });
await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 1031, y: 600, button: "left", clickCount: 1 });
await sleep(1000);
await shot("ref-demo-after2");
const after2 = await cdp.eval(`(() => { const ph=[...document.querySelectorAll('div')].find(d=>(d.innerText||'').includes('DINDA')&&d.getBoundingClientRect().width===340); return ph ? ph.innerText : ''; })()`);
console.log("AFTER2 PHONE TEXT:\\n", after2);
const panel2 = await cdp.eval(`(() => { const el=[...document.querySelectorAll('div')].find(d=>(d.innerText||'').startsWith('YANG MASUK KE')); return el ? el.innerText : ''; })()`);
console.log("PANEL2:\\n", panel2);
const innerTree = await cdp.eval(`(() => { const ph=[...document.querySelectorAll('div')].find(d=>(d.innerText||'').includes('DINDA')&&d.getBoundingClientRect().width===340); const cs=getComputedStyle; const info=el=>{const r=el.getBoundingClientRect();const s=cs(el);return {tag:el.tagName.toLowerCase(),cls:(typeof el.className==='string'?el.className:'').slice(0,180),rect:{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)},bg:s.backgroundColor,color:s.color,size:s.fontSize,weight:s.fontWeight,radius:s.borderRadius,border:s.borderTopWidth+' '+s.borderTopColor,shadow:s.boxShadow,transform:s.transform,display:s.display,gap:s.gap,text:(el.innerText||'').replace(/\\s+/g,' ').slice(0,70)};const walk=(el,d=0)=>{if(!el||d>6)return null;return {...info(el),children:[...el.children].map(c=>walk(c,d+1)).filter(Boolean)}}; return ph?walk(ph):null;})()`);
fs.writeFileSync(`${OUT}/ref-demo-after-tree.json`, JSON.stringify(innerTree, null, 2));
console.log("done");
process.exit(0);
