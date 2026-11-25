import fs from "node:fs";

const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newTarget() {
  const res = await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" });
  return res.json();
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve);
      this.ws.addEventListener("error", reject);
    });
    this.ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return p;
  }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  }
  close() { this.ws.close(); }
}

async function shot(cdp, name) {
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

async function openPage(viewport) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.w,
    height: viewport.h,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });
  if (viewport.mobile) {
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  }
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/" });
  await sleep(4500);
  return cdp;
}

async function desktop() {
  const cdp = await openPage({ w: 1440, h: 1000, mobile: false });
  await shot(cdp, "local-desktop-00");
  await cdp.eval("window.scrollTo({top:520,behavior:'instant'})");
  await sleep(600);
  await shot(cdp, "local-desktop-01");

  const audit = await cdp.eval(`(() => {
    const info = (el) => { if (!el) return null; const r=el.getBoundingClientRect(); const s=getComputedStyle(el); return {text:(el.innerText||'').slice(0,80), rect:{x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height)}, bg:s.backgroundColor, family:s.fontFamily, size:s.fontSize, weight:s.fontWeight, lineHeight:s.lineHeight, radius:s.borderRadius, border:s.borderTopWidth+' '+s.borderTopColor, shadow:s.boxShadow}; };
    const h1 = document.querySelector('h1');
    const header = document.querySelector('header');
    const banner = document.querySelector('main > div');
    const btns = [...document.querySelectorAll('a')].filter(a=>/BUAT HALAMAN|LIHAT MOMEN/i.test(a.innerText||'')).map(info);
    const phone = [...document.querySelectorAll('div')].find(d=>(d.innerText||'').includes('Nadia')&&Math.round(d.getBoundingClientRect().width)===344);
    const panel = [...document.querySelectorAll('div')].find(d=>(d.innerText||'').startsWith('YANG RAKA TERIMA'));
    const eyebrow = [...document.querySelectorAll('span')].find(s=>(s.innerText||'').trim()==='HALAMAN KEJUTAN INTERAKTIF');
    return {
      viewport:{w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight},
      header: info(header), banner: info(banner), h1: info(h1), eyebrow: info(eyebrow), buttons: btns, phone: info(phone), panel: info(panel),
      fonts: [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),
      errors: window.__errs || [],
      bodyFont: getComputedStyle(document.body).fontFamily,
    };
  })()`);
  fs.writeFileSync(`${OUT}/local-desktop-audit.json`, JSON.stringify(audit, null, 2));
  console.log("desktop audit", JSON.stringify(audit.viewport), audit.h1?.size, audit.h1?.family, audit.bodyFont);

  const env = await cdp.eval(`(() => { const b=document.querySelector('button[aria-label="Buka amplop untuk memulai demo"]'); if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  console.log("envelope", env);
  if (env) {
    await cdp.eval("window.scrollTo({top:0,behavior:'instant'})");
    await sleep(300);
    await cdp.eval(`(() => { const b=document.querySelector('button[aria-label="Buka amplop untuk memulai demo"]'); b && b.click(); })()`);
    await sleep(350);
    await shot(cdp, "local-desktop-demo-1");
    await sleep(2200);
    await shot(cdp, "local-desktop-demo-3");
    const demo = await cdp.eval(`(() => {
      const panel = [...document.querySelectorAll('div')].find(d=>(d.innerText||'').startsWith('YANG RAKA TERIMA'));
      const phone = [...document.querySelectorAll('div')].find(d=>(d.innerText||'').includes('Hai, Nadia!'));
      return {panel: panel ? panel.innerText : null, phone: phone ? phone.innerText : null};
    })()`);
    console.log("demo panel:", demo.panel);
    console.log("demo phone:", demo.phone?.slice(0, 400));
    await cdp.eval("window.scrollTo({top:520,behavior:'instant'})");
    await sleep(500);
    await shot(cdp, "local-desktop-demo-scrolled");
  }

  const hoverBtn = await cdp.eval(`(() => { const a=[...document.querySelectorAll('a')].find(x=>/BUAT HALAMAN/i.test(x.innerText)); const r=a.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hoverBtn.x, y: hoverBtn.y });
  await sleep(400);
  await shot(cdp, "local-desktop-hover");
  const errors = cdp.events.filter(e => e.method === "Runtime.exceptionThrown" || e.method === "Log.entryAdded");
  console.log("console errors:", errors.length);
  cdp.close();
}

async function mobile() {
  const cdp = await openPage({ w: 390, h: 844, mobile: true });
  await shot(cdp, "local-mobile-00");
  await cdp.eval("window.scrollTo({top:430,behavior:'instant'})");
  await sleep(500);
  await shot(cdp, "local-mobile-01");
  await cdp.eval("window.scrollTo({top:900,behavior:'instant'})");
  await sleep(500);
  await shot(cdp, "local-mobile-02");
  await cdp.eval("window.scrollTo({top:1350,behavior:'instant'})");
  await sleep(500);
  await shot(cdp, "local-mobile-03");
  const metrics = await cdp.eval(`(() => ({w:innerWidth,scrollW:document.documentElement.scrollWidth,h:innerHeight,scrollH:document.documentElement.scrollHeight,header:document.querySelector('header')?.getBoundingClientRect().height,h1:getComputedStyle(document.querySelector('h1')).fontSize}))()`);
  console.log("mobile metrics", metrics);
  await cdp.eval("window.scrollTo({top:0,behavior:'instant'})");
  await sleep(300);
  const menu = await cdp.eval(`(() => { const b=document.querySelector('button[aria-controls="menu-mobile"]'); if(!b) return null; b.click(); return true; })()`);
  await sleep(400);
  await shot(cdp, "local-mobile-menu");
  console.log("menu clicked", menu);
  const errors = cdp.events.filter(e => e.method === "Runtime.exceptionThrown" || e.method === "Log.entryAdded");
  console.log("console errors mobile:", errors.length);
  cdp.close();
}

await desktop();
await mobile();
console.log("done");
