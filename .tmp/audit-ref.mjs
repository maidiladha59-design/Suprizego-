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
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
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
  close() {
    this.ws.close();
  }
}

async function shot(cdp, name) {
  const r = await cdp.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

const AUDIT = `(() => {
  const cs = (el) => el ? getComputedStyle(el) : null;
  const rect = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
  const info = (el) => {
    if (!el) return null;
    const s = cs(el);
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 180) : null,
      text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 150),
      rect: rect(el),
      bg: s.backgroundColor,
      color: s.color,
      family: s.fontFamily,
      size: s.fontSize,
      weight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      transform: s.textTransform,
      radius: s.borderRadius,
      border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      shadow: s.boxShadow,
      padding: s.padding,
      display: s.display,
      gap: s.gap,
      grid: s.gridTemplateColumns,
    };
  };
  const rootStyles = cs(document.documentElement);
  const vars = {};
  for (const name of ['--color-primary','--color-accent','--color-bg','--color-fg','--background','--foreground','--accent','--primary','--radius','--font-sans','--font-display']) {
    const v = rootStyles.getPropertyValue(name) || cs(document.body).getPropertyValue(name);
    if (v) vars[name] = v.trim();
  }
  const headings = [...document.querySelectorAll('h1,h2,h3')].map(info).filter(Boolean).slice(0, 30);
  const sections = [...document.querySelectorAll('body > * , header, main > *, footer, section')]
    .filter((el, i, arr) => arr.indexOf(el) === i)
    .map(el => ({ ...info(el), childTop: [...el.children].slice(0,6).map(c => ({tag:c.tagName.toLowerCase(), cls:(typeof c.className==='string'?c.className:'').slice(0,120), text:(c.innerText||'').trim().replace(/\\s+/g,' ').slice(0,90), rect:rect(c)})) }))
    .slice(0, 60);
  const buttons = [...document.querySelectorAll('a,button')].filter(el => {
    const t=(el.innerText||'').trim(); const r=el.getBoundingClientRect(); return t && r.width>20 && r.height>20;
  }).slice(0, 40).map(info);
  const fonts = [...document.fonts].map(f => ({family:f.family, weight:f.weight, style:f.style, status:f.status}));
  const animated = [...document.querySelectorAll('*')].filter(el => { const s=cs(el); return s.animationName && s.animationName !== 'none'; }).slice(0, 25).map(el => ({...info(el), animation: cs(el).animation}));
  const images = [...document.querySelectorAll('img')].slice(0, 30).map(el => ({alt: el.alt, src: (el.currentSrc||el.src).slice(0,140), rect: rect(el)}));
  return {
    url: location.href,
    title: document.title,
    viewport: {w: innerWidth, h: innerHeight},
    pageHeight: document.body.scrollHeight,
    body: info(document.body),
    vars,
    headings,
    sections,
    buttons,
    fonts,
    animated,
    images,
  };
})()`;

async function audit(viewport, label) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.w,
    height: viewport.h,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });
  if (viewport.mobile) {
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  }
  await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
  await sleep(7000);
  const title = await cdp.eval("document.title");
  console.log(label, "title:", title);
  const data = await cdp.eval(AUDIT);
  fs.writeFileSync(`${OUT}/ref-${label}.json`, JSON.stringify(data, null, 2));
  console.log(label, "height:", data.pageHeight, "sections:", data.sections.length, "h:", data.headings.length);
  const maxShots = Math.min(14, Math.ceil(data.pageHeight / (viewport.h - 80)) + 1);
  for (let i = 0; i < maxShots; i++) {
    const y = i * (viewport.h - 80);
    await cdp.eval(`window.scrollTo({top:${y},behavior:'instant'}); document.documentElement.style.scrollBehavior='auto';`);
    await sleep(700);
    await shot(cdp, `ref-${label}-${String(i).padStart(2, "0")}`);
    const at = await cdp.eval("Math.round(scrollY)");
    if (at + viewport.h >= data.pageHeight - 40) break;
  }
  cdp.close();
  return data;
}

await audit({ w: 1440, h: 1000, mobile: false }, "desktop");
await audit({ w: 390, h: 844, mobile: true }, "mobile");
console.log("done");
