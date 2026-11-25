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
async function clickAt(cdp, x, y) { await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 }); await sleep(50); await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 }); }
const t = await newTarget();
const cdp = new CDP(t.webSocketDebuggerUrl);
await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
await sleep(6000);
const styles = await cdp.eval(`(() => {
  const rules = [];
  const walk = (list, media) => { for (const r of list) { try { if (r.cssRules) walk(r.cssRules, r.conditionText || media); else if (r.selectorText && /nb-btn|nb-card|sticker|marquee|bg-stripes|bg-dots|keyframes|@keyframes/i.test(r.cssText)) rules.push({ media, sel: r.selectorText || r.name, css: r.cssText.slice(0, 600) }); } catch(e){} } };
  for (const s of document.styleSheets) { try { walk(s.cssRules, ''); } catch(e){} }
  const el = document.querySelector('a.nb-btn');
  const cs = el ? getComputedStyle(el) : null;
  const marquee = [...document.querySelectorAll('div,section')].find(d=>/CONFESS/.test(d.innerText||'') && getComputedStyle(d).overflow==='hidden' && d.scrollWidth>d.clientWidth+50);
  const mcs = marquee ? getComputedStyle(marquee) : null;
  return {
    rules: rules.slice(0, 60),
    btn: cs ? { transition: cs.transition, transform: cs.transform, shadow: cs.boxShadow, radius: cs.borderRadius, border: cs.border, padding: cs.padding, font: cs.fontFamily, size: cs.fontSize, letter: cs.letterSpacing } : null,
    marquee: mcs ? { cls: marquee.className, overflow: mcs.overflow, animation: mcs.animation, w: marquee.clientWidth, sw: marquee.scrollWidth } : null,
    anims: document.getAnimations ? document.getAnimations().map(a=>({name: a.animationName||a.id||null, dur: a.effect?.getTiming?.().duration, easing: a.effect?.getTiming?.().easing, target: a.effect?.target?.className?.toString?.().slice(0,60)})).slice(0,20) : [],
    themeVars: (() => { const s=getComputedStyle(document.documentElement); const out={}; for (const v of ['--color-cream','--color-ink','--color-lime','--color-pink','--color-coral','--font-display','--font-mono','--radius-card','--shadow-hard']) out[v]=s.getPropertyValue(v); return out; })(),
  };
})()`);
fs.writeFileSync(`${OUT}/ref-styles.json`, JSON.stringify(styles, null, 2));
console.log(JSON.stringify(styles, null, 1).slice(0, 7000));
// chat widget
const pos = await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='💬'); if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
if (pos) {
  await clickAt(cdp, pos.x, pos.y);
  await sleep(2500);
  const chat = await cdp.eval(`(() => { const t=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' '); const dlg=[...document.querySelectorAll('[role=dialog]')].map(t); const fixed=[...document.querySelectorAll('div,section')].filter(d=>getComputedStyle(d).position==='fixed' && /chat|tanya|admin|bantu|halo/i.test(t(d)) && t(d).length<1000).map(t).slice(0,3); return { dialogs: dlg, fixed, text: (document.body.innerText||'').slice(-1200) }; })()`);
  fs.writeFileSync(`${OUT}/ref-chat.json`, JSON.stringify(chat, null, 2));
  console.log("CHAT:", JSON.stringify(chat, null, 1).slice(0, 2500));
} else console.log("chat button not found");
cdp.close();
// robots retry
await sleep(3000);
for (const u of ["/robots.txt", "/llms.txt"]) {
  const r = await fetch("https://proposigo.app" + u);
  console.log(u, r.status, (await r.text()).slice(0, 1200));
}
console.log("done-style");
