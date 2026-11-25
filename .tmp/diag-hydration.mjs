const BASE = "http://127.0.0.1:9222";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const target = await (await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" })).json();
class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.events=[]; this.ready = new Promise((res, rej) => { this.ws.addEventListener("open", res); this.ws.addEventListener("error", rej); }); this.ws.addEventListener("message", e => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const p = this.pending.get(m.id); this.pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } else if (m.method) { this.events.push(m); } }); }
  async send(method, params = {}) { await this.ready; const id = ++this.id; const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); this.ws.send(JSON.stringify({ id, method, params })); return p; }
  async eval(expression) { const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result?.value; }
}
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Log.enable");
await cdp.send("Network.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/" });
await sleep(7000);
const scripts = await cdp.eval(`(async () => {
  const list = [...document.scripts].map(s=>({src:s.src, type:s.type, async:s.async, defer:s.defer, inline:(s.textContent||'').slice(0,60)}));
  const results = [];
  for (const s of list) {
    if (s.src) {
      try {
        const r = await fetch(s.src, {cache:'no-store'});
        const t = await r.text();
        results.push({src:s.src, status:r.status, len:t.length, head:t.slice(0,50)});
      } catch(e) { results.push({src:s.src, err:String(e)}); }
    }
  }
  return {readyState:document.readyState, scripts:list, results, reactRoots:[...document.querySelectorAll('next-route-announcer')].length};
})()`);
console.log(JSON.stringify(scripts, null, 2));
const responses = cdp.events.filter(e=>e.method==='Network.responseReceived').map(e=>({url:e.params.response.url, status:e.params.response.status, mime:e.params.response.mimeType})).filter(r=>r.url.includes('_next'));
console.log('NETWORK', JSON.stringify(responses.slice(0,60), null, 2));
const ex = cdp.events.filter(e=>e.method==='Runtime.exceptionThrown');
console.log('EXCEPTIONS', ex.length);
for (const e of ex) console.log(JSON.stringify(e.params.exceptionDetails).slice(0,1000));
process.exit(0);
