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

const target = await newTarget();
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Page.bringToFront");
await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });

async function nav(url, wait = 6500) {
  await cdp.send("Page.navigate", { url });
  await sleep(wait);
  await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/^(boleh|terima|setuju|oke|ok|accept|got it|terima semua)$/i.test((x.innerText||'').trim())); if(b) b.click(); return !!b; })()`);
  await sleep(500);
}

// HOMEPAGE
await nav("https://proposigo.app/");
const home = await cdp.eval(`(() => {
  const txt = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
  const info = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { tag: el.tagName.toLowerCase(), text: txt(el).slice(0, 80), href: el.getAttribute('href'), rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }, bg: s.backgroundColor, color: s.color, radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor, shadow: s.boxShadow, family: s.fontFamily.split(',')[0], size: s.fontSize, weight: s.fontWeight, transform: s.transform, position: s.position }; };
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const meta = {};
  for (const m of document.querySelectorAll('meta[name],meta[property]')) { const k = m.getAttribute('name') || m.getAttribute('property'); if (/description|og:|twitter:|theme|robots/i.test(k)) meta[k] = m.getAttribute('content')?.slice(0, 220); }
  const links = [...document.querySelectorAll('a')].map(info);
  const buttons = [...document.querySelectorAll('button')].map(info);
  const hero = [...document.querySelectorAll('h1')].map(info);
  const demo = links.filter((a) => /play|main|demo|coba|go ahead|pratinjau/i.test(a.text));
  const demoButtons = buttons.filter((b) => /play|main|demo|coba|sound|suara|musik/i.test(b.text));
  return {
    title: document.title, lang: document.documentElement.lang, meta,
    favicons: [...document.querySelectorAll('link[rel*="icon"]')].map((l) => l.getAttribute('href')),
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    header: header ? info(header) : null,
    headerLinks: header ? [...header.querySelectorAll('a,button')].map(info) : [],
    h1: hero.map((h) => ({ ...h, html: h.tag })),
    heroSection: (() => { const h = document.querySelector('h1'); const sec = h?.closest('section'); if (!sec) return null; return { text: txt(sec).slice(0, 500), cls: sec.className, html: sec.outerHTML.slice(0, 1200) }; })(),
    demoMentions: { demo, demoButtons, iframes: [...document.querySelectorAll('iframe')].map((f) => f.src) },
    sections: [...document.querySelectorAll('section')].map((s) => ({ id: s.id, cls: String(s.className).slice(0, 140), text: txt(s).slice(0, 90), y: Math.round(s.getBoundingClientRect().top + scrollY), h: Math.round(s.getBoundingClientRect().height) })),
    links: links.slice(0, 120),
    buttons: buttons.slice(0, 40),
    footer: footer ? { text: txt(footer).slice(0, 800), links: [...footer.querySelectorAll('a,button')].map(info) } : null,
    chatCandidates: [...document.querySelectorAll('button,a')].filter((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return (s.position === 'fixed' || s.position === 'sticky') && r.width < 120 && r.width > 30; }).map(info),
  };
})()`);
fs.writeFileSync(`${OUT}/phase1-home-facts.json`, JSON.stringify(home, null, 2));
console.log("HOME keys:", JSON.stringify({ title: home.title, lang: home.lang, canonical: home.canonical, meta: home.meta, favicons: home.favicons, h1: home.h1.map((h) => h.text), sections: home.sections, demo: home.demoMentions, chat: home.chatCandidates, footerLinks: home.footer?.links.map((l) => l.text + ' -> ' + l.href).slice(0, 30) }, null, 2));

// open chat if present
const chat = home.chatCandidates.find((c) => c.position === 'fixed');
if (chat) {
  await cdp.eval(`(() => { const el=[...document.querySelectorAll('button,a')].find((x)=>{const s=getComputedStyle(x);const r=x.getBoundingClientRect();return (s.position==='fixed')&&r.width<120&&r.width>30;}); el?.click(); })()`);
  await sleep(1200);
  await shot(cdp, "phase1-chat-open");
  const chatPanel = await cdp.eval(`(() => {
    const els=[...document.querySelectorAll('div,aside,section')].filter((d)=>{const s=getComputedStyle(d);const r=d.getBoundingClientRect();return (s.position==='fixed')&&r.width>250&&r.height>200;}).slice(0,3);
    return els.map((d)=>({ text:(d.innerText||'').trim().replace(/\\s+/g,' ').slice(0,500), rect:(()=>{const r=d.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};})(), html:d.outerHTML.slice(0,800) }));
  })()`);
  console.log("CHAT PANEL:", JSON.stringify(chatPanel, null, 2));
}

// /papan
await nav("https://proposigo.app/papan");
await shot(cdp, "phase1-papan");
const papan = await cdp.eval(`(() => {
  const txt=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' ');
  const links=[...document.querySelectorAll('a[href^="/p/"],a[href*="/p/"]')].map((a)=>({ text:txt(a).slice(0,60), href:a.href }));
  const cards=[...document.querySelectorAll('article,li')].filter((c)=>/Rp|Forever|Abadi/i.test(txt(c))).slice(0,4).map((c)=>({ text:txt(c).slice(0,200), cls:String(c.className).slice(0,150) }));
  return { title:document.title, h1:[...document.querySelectorAll('h1')].map(txt), samples:links.slice(0,10), cards, body:txt(document.body).slice(0,1200) };
})()`);
fs.writeFileSync(`${OUT}/phase1-papan.json`, JSON.stringify(papan, null, 2));
console.log("PAPAN:", JSON.stringify(papan, null, 2).slice(0, 3000));

// /buat
await nav("https://proposigo.app/buat");
const buat = await cdp.eval(`(() => {
  const txt=(el)=>(el.innerText||'').trim().replace(/\\s+/g,' ');
  return { title:document.title, h1:[...document.querySelectorAll('h1')].map(txt), links:[...document.querySelectorAll('a')].map((a)=>({ text:txt(a).slice(0,60), href:a.getAttribute('href') })).slice(0,60), buttons:[...document.querySelectorAll('button')].map((b)=>txt(b).slice(0,50)).slice(0,20) };
})()`);
console.log("BUAT:", JSON.stringify(buat, null, 2).slice(0, 4000));

cdp.close();
console.log("done-phase1a");
