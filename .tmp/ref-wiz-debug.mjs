import fs from "node:fs";
const BASE = "http://127.0.0.1:9222";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const res = await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" });
const target = await res.json();
class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); this.ready = new Promise((r, j) => { this.ws.addEventListener("open", r); this.ws.addEventListener("error", j); }); this.ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && this.pending.has(m.id)) { const { resolve, reject } = this.pending.get(m.id); this.pending.delete(m.id); m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result); } }); }
  async send(method, params = {}) { await this.ready; const id = ++this.id; const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject })); this.ws.send(JSON.stringify({ id, method, params })); return p; }
  async eval(expression) { const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result?.value; }
}
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.send("Page.enable"); await cdp.send("Runtime.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await sleep(6000);
const out = await cdp.eval(`(() => {
  const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
  const inputs = [...document.querySelectorAll('input')].map((i) => ({ type: i.type, name: i.name, id: i.id, ph: i.placeholder, value: i.value, cls: (i.className||'').toString().slice(0,80) }));
  const designBtns = [...document.querySelectorAll('button')].filter((b) => /PERMEN PINK|CHAT MALAM/.test(t(b)) && t(b).length < 100).map((b) => ({ text: t(b), cls: b.className, html: b.outerHTML.slice(0, 600) }));
  const planArea = [...document.querySelectorAll('*')].filter((el) => /PILIH PAKET/.test(t(el)) && (el.tagName === 'SECTION' || el.tagName === 'DIV')).slice(-1)[0];
  const plansHTML = planArea ? planArea.outerHTML.slice(0, 3500) : null;
  const phoneTextEl = [...document.querySelectorAll('*')].find((el) => /ketuk amplopnya/.test(t(el)) && t(el).length < 120);
  let shell = phoneTextEl;
  for (let i = 0; i < 6 && shell; i++) shell = shell.parentElement;
  const shellInfo = shell ? { cls: shell.className, w: shell.getBoundingClientRect().width, bg: getComputedStyle(shell).backgroundColor } : null;
  const screenCandidates = phoneTextEl ? [...phoneTextEl.parentElement.children].map((c) => ({ tag: c.tagName, cls: (c.className||'').toString().slice(0,100), bg: getComputedStyle(c).backgroundColor, h: Math.round(c.getBoundingClientRect().height) })) : [];
  return { inputs, designBtns, plansHTML, shellInfo, screenCandidates, bodyH: document.documentElement.scrollHeight };
})()`);
fs.writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/ref-wiz-debug.json", JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.inputs, null, 2));
console.log("design:", JSON.stringify(out.designBtns, null, 2).slice(0, 1200));
console.log("shell:", JSON.stringify(out.shellInfo), "screen:", JSON.stringify(out.screenCandidates));
console.log("plansHTML:", (out.plansHTML || "").slice(0, 3000));
cdp.ws?.close?.();
console.log("done-debug");
