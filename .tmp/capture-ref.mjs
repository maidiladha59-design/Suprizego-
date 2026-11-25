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
    const r = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  }
  close() { this.ws.close(); }
}

async function shot(cdp, name) {
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

const TREE = `(() => {
  const hero = document.querySelector('section');
  const demo = [...document.querySelectorAll('div')].find(d => (d.innerText||'').includes('YANG MASUK KE'));
  const phone = [...document.querySelectorAll('div')].find(d => (d.innerText||'').includes('DINDA') && d.getBoundingClientRect().width < 500 && d.getBoundingClientRect().width > 250 && d.getBoundingClientRect().height > 300);
  const cs = el => getComputedStyle(el);
  const info = el => {
    const r = el.getBoundingClientRect(); const s = cs(el);
    return {tag:el.tagName.toLowerCase(), cls:(typeof el.className==='string'?el.className:'').slice(0,260), rect:{x:Math.round(r.x),y:Math.round(r.y+scrollY),w:Math.round(r.width),h:Math.round(r.height)}, bg:s.backgroundColor, color:s.color, family:s.fontFamily.slice(0,50), size:s.fontSize, weight:s.fontWeight, lineHeight:s.lineHeight, tracking:s.letterSpacing, transform:s.transform, radius:s.borderRadius, border:s.borderTopWidth+' '+s.borderTopStyle+' '+s.borderTopColor, shadow:s.boxShadow, pad:s.padding, gap:s.gap, grid:s.gridTemplateColumns, anim:s.animation, text:(el.innerText||'').trim().replace(/\\s+/g,' ').slice(0,90)};
  };
  const tree = (el, depth=0) => {
    if (!el || depth>3) return null;
    return {...info(el), children:[...el.children].slice(0,14).map(c=>tree(c, depth+1)).filter(Boolean)};
  };
  const find = (txt, tags='div,section,p,h1,a,span') => [...document.querySelectorAll(tags)].filter(el => (el.innerText||'').trim().startsWith(txt)).slice(0,6).map(info);
  const hoverRules = [];
  const keyframes = [];
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule.type === 1 && rule.selectorText && rule.selectorText.includes(':hover')) {
        const t = rule.cssText.replace(/\\s+/g,' ');
        if (t.includes('translate') || t.includes('box-shadow') || t.includes('background')) hoverRules.push(t.slice(0,300));
      }
      if (rule.type === 7 && /rise|marquee|float|flame|shake|pulse/.test(rule.name)) {
        keyframes.push({name:rule.name, css:rule.cssText.replace(/\\s+/g,' ').slice(0,500)});
      }
    }
  }
  return {
    hero: tree(hero, 0),
    demo: demo ? tree(demo.closest('div'), 0) : null,
    phone: phone ? info(phone) : null,
    eyebrow: find('HALAMAN UCAPAN INTERAKTIF'),
    h1: find('BERANI', 'h1'),
    heroBtns: [...document.querySelectorAll('a')].filter(a=>/BIKIN HALAMAN|LIHAT MOMEN/.test(a.innerText||'')).map(info),
    startBadge: find('MULAI 5 RIBU'),
    demoPanelTitle: find('YANG MASUK KE'),
    hoverRules: [...new Set(hoverRules)].slice(0, 30),
    keyframes,
  };
})()`;

async function capture(viewport, label) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: viewport.w, height: viewport.h, deviceScaleFactor: 1, mobile: viewport.mobile });
  if (viewport.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
  await sleep(6000);
  const clicked = await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').trim()==='BOLEH'); if(b){b.click(); return true;} return false; })()`);
  console.log(label, "consent clicked:", clicked);
  await sleep(1200);
  await cdp.eval("window.scrollTo({top:0,behavior:'instant'})");
  await sleep(600);
  await shot(cdp, `ref-${label}-clean-00`);
  if (viewport.mobile) {
    for (const [i, y] of [560, 900, 1300, 1700].entries()) {
      await cdp.eval(`window.scrollTo({top:${y},behavior:'instant'})`);
      await sleep(500);
      await shot(cdp, `ref-${label}-clean-${String(i + 1).padStart(2, "0")}`);
    }
  } else {
    for (const [i, y] of [420, 900].entries()) {
      await cdp.eval(`window.scrollTo({top:${y},behavior:'instant'})`);
      await sleep(500);
      await shot(cdp, `ref-${label}-clean-${String(i + 1).padStart(2, "0")}`);
    }
  }
  await cdp.eval("window.scrollTo({top:0,behavior:'instant'})");
  const data = await cdp.eval(TREE);
  fs.writeFileSync(`${OUT}/ref-${label}-tree.json`, JSON.stringify(data, null, 2));
  console.log(label, "tree saved", !!data.hero, !!data.demo, !!data.phone);
  cdp.close();
}

await capture({ w: 1440, h: 1000, mobile: false }, "desktop");
await capture({ w: 390, h: 844, mobile: true }, "mobile");
console.log("done");
