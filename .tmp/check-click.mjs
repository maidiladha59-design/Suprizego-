import fs from "node:fs";
const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const target = await (await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" })).json();
class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.logs=[]; this.ready = new Promise((res, rej) => { this.ws.addEventListener("open", res); this.ws.addEventListener("error", rej); }); this.ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } else if (m.method) { this.logs.push(m); } }); }
  async send(method, params = {}) { await this.ready; const id = ++this.id; const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); this.ws.send(JSON.stringify({ id, method, params })); return p; }
  async eval(expression) { const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result?.value; }
}
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Log.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/" });
await sleep(8000);
async function shot(name) { const r = await cdp.send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64")); }
const state = await cdp.eval(`(() => {
  const b=document.querySelector('button[aria-label="Buka amplop untuk memulai demo"]');
  const r=b?b.getBoundingClientRect():null;
  return {hasButton:!!b, rect:r?{x:r.x,y:r.y,w:r.width,h:r.height}:null, next:!!document.querySelector('script[src*="_next"]'), bodyText:document.body.innerText.slice(0,120)};
})()`);
console.log("state", state);
const x = state.rect.x + state.rect.w / 2;
const y = state.rect.y + state.rect.h / 2;
await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
await sleep(200);
await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
await sleep(1200);
const after = await cdp.eval(`(() => {
  const panel = [...document.querySelectorAll('div')].find(d=>(d.innerText||'').startsWith('YANG RAKA TERIMA'));
  const tel = document.querySelector('button[aria-label="Buka amplop untuk memulai demo"]');
  return {panel: panel?panel.innerText:null, hasButton:!!tel};
})()`);
console.log("after", after);
await shot("local-click-test");
console.log("LOGS");
for (const l of cdp.logs) {
  if (l.method === "Runtime.exceptionThrown") console.log("EXCEPTION", JSON.stringify(l.params.exceptionDetails).slice(0,1000));
  else if (l.method === "Log.entryAdded") console.log("LOG", l.params.entry.level, l.params.entry.text.slice(0,500), l.params.entry.url || "");
  else if (l.method === "Runtime.consoleAPICalled" && l.params.type === "error") console.log("CONSOLE", JSON.stringify(l.params.args).slice(0,800));
}
process.exit(0);
