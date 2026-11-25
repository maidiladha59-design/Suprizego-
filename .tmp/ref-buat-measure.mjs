import fs from "node:fs";
import { spawn } from "node:child_process";

const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureChrome() {
  try {
    const r = await fetch(`${BASE}/json/version`);
    if (r.ok) return;
  } catch {}
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Users/User/AppData/Local/Google/Chrome/Application/chrome.exe",
  ];
  const exe = candidates.find((p) => fs.existsSync(p));
  if (!exe) throw new Error("chrome not found");
  spawn(exe, [
    "--headless=new",
    "--remote-debugging-port=9222",
    `--user-data-dir=${OUT}/chrome-profile-ref`,
    "--no-first-run",
    "--disable-gpu",
    "about:blank",
  ], { detached: true, stdio: "ignore" }).unref();
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      const r = await fetch(`${BASE}/json/version`);
      if (r.ok) return;
    } catch {}
  }
  throw new Error("chrome did not start");
}

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

const MEASURE = `(() => {
  const info = (el, extra = {}) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      bg: s.backgroundColor,
      color: s.color,
      family: s.fontFamily,
      size: s.fontSize,
      weight: s.fontWeight,
      lineHeight: s.lineHeight,
      tracking: s.letterSpacing,
      transformText: s.textTransform,
      radius: s.borderRadius,
      border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      borderBottom: s.borderBottomWidth + ' ' + s.borderBottomStyle + ' ' + s.borderBottomColor,
      shadow: s.boxShadow,
      transform: s.transform,
      padding: s.padding,
      gap: s.gap,
      display: s.display,
      position: s.position,
      zIndex: s.zIndex,
      top: s.top, right: s.right, bottom: s.bottom, left: s.left,
      text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 120),
      ...extra,
    };
  };
  const textEl = (txt, tags = 'a,button,div,span,section,h1,h2,h3,p,footer,header') =>
    [...document.querySelectorAll(tags)].filter((el) => (el.innerText || '').trim().startsWith(txt)).slice(0, 10);
  const header = document.querySelector('header') || textEl('Momen', 'header')[0] || document.querySelector('body > div');
  const h1 = [...document.querySelectorAll('h1')].find((x) => /MOMEN APA/i.test(x.innerText)) || document.querySelector('h1');
  const sub = h1 ? h1.parentElement.querySelector('p') : null;
  const grid = h1 ? [...h1.parentElement.querySelectorAll('div')].find((d) => getComputedStyle(d).display === 'grid' && d.querySelectorAll('a[href^="/buat/"]').length >= 3) : null;
  const card = document.querySelector('a[href="/buat/confess"]') || document.querySelector('a[href^="/buat/"]');
  const cardBox = card ? card.querySelector('div') : null;
  const cardTitle = card ? card.querySelector('h2') : null;
  const cardDesc = card ? [...card.querySelectorAll('p')][0] : null;
  const chip = card ? [...card.querySelectorAll('span')].find((s) => (s.innerText || '').includes('✦') && getComputedStyle(s).borderRadius !== '0px') : null;
  const sticker = card ? [...card.querySelectorAll('span,div')].find((s) => /paling dicari/i.test(s.innerText || '') && s.children.length === 0) : null;
  const footer = document.querySelector('footer');
  const langWrap = footer ? [...footer.querySelectorAll('div,span')].find((d) => /Bahasa Indonesia/.test(d.innerText || '') && /English/.test(d.innerText || '') && d.children.length >= 2 && d.getBoundingClientRect().height < 90) : null;
  const chat = [...document.querySelectorAll('button,a')].find((el) => {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return (s.position === 'fixed' || s.position === 'sticky') && r.bottom > innerHeight - 140 && r.right > innerWidth - 140 && r.width < 120 && r.width > 30;
  });
  const fontFaces = [...document.fonts].map((f) => f.family + ' ' + f.weight + ' ' + f.style).filter((v, i, a) => a.indexOf(v) === i);
  const rootVars = {};
  const rs = getComputedStyle(document.documentElement);
  for (const name of ['--font-display', '--font-sans', '--font-mono', '--color-cream', '--color-ink', '--color-lime', '--color-pink']) {
    const v = rs.getPropertyValue(name).trim();
    if (v) rootVars[name] = v;
  }
  return {
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth, h: innerHeight, pageH: document.documentElement.scrollHeight },
    themeColor: document.querySelector('meta[name="theme-color"]')?.content ?? null,
    body: info(document.body),
    htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    fontFaces,
    rootVars,
    header: header ? { ...info(header), children: [...header.querySelectorAll('a,button,img')].slice(0, 10).map((el) => info(el)) } : null,
    h1: info(h1),
    sub: info(sub),
    main: info(document.querySelector('main')),
    grid: info(grid, grid ? { cols: getComputedStyle(grid).gridTemplateColumns, rows: getComputedStyle(grid).gridTemplateRows } : {}),
    card: card ? {
      wrap: info(card),
      box: info(cardBox),
      title: info(cardTitle),
      desc: info(cardDesc),
      chip: info(chip),
      sticker: info(sticker),
      illustration: info(card.querySelector('svg')?.parentElement),
      svg: info(card.querySelector('svg')),
    } : null,
    footer: footer ? {
      info: info(footer),
      inner: info(footer.querySelector('div')),
      logo: info(footer.querySelector('img')),
      headings: [...footer.querySelectorAll('h3')].map((h) => info(h)),
      links: [...footer.querySelectorAll('a')].slice(0, 16).map((a) => info(a)),
      lang: info(langWrap),
      langChildren: langWrap ? [...langWrap.querySelectorAll('button,a,span')].map((el) => info(el)) : [],
      copyright: info([...footer.querySelectorAll('p')].find((p) => /©/.test(p.innerText || ''))),
    } : null,
    chat: chat ? { info: info(chat), html: chat.outerHTML.slice(0, 700) } : null,
    chatCandidates: [...document.querySelectorAll('button,a')].filter((el) => getComputedStyle(el).position === 'fixed').slice(0, 6).map((el) => info(el)),
  };
})()`;

async function measure(viewport, label) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: viewport.w, height: viewport.h, deviceScaleFactor: 1, mobile: viewport.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (viewport.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url: "https://proposigo.app/buat" });
  await sleep(6500);
  await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/^(boleh|terima|setuju|oke|ok)$/i.test((x.innerText||'').trim())); if(b){b.click(); return true;} return false; })()`);
  await sleep(800);
  await cdp.eval("window.scrollTo({top:0,behavior:'instant'})");
  await sleep(400);
  await shot(cdp, `ref-buat-${label}-00`);
  await cdp.eval(`(() => { const h=[...document.querySelectorAll('h1')].find(x=>/MOMEN APA/i.test(x.innerText)); if(h) h.scrollIntoView({block:'start',behavior:'instant'}); })()`);
  await sleep(500);
  await shot(cdp, `ref-buat-${label}-01`);
  await cdp.eval(`(() => { const c=document.querySelector('a[href="/buat/confess"]'); if(c) c.scrollIntoView({block:'center',behavior:'instant'}); })()`);
  await sleep(500);
  await shot(cdp, `ref-buat-${label}-02`);
  await cdp.eval(`document.querySelector('footer')?.scrollIntoView({block:'end',behavior:'instant'})`);
  await sleep(500);
  await shot(cdp, `ref-buat-${label}-03`);
  const data = await cdp.eval(MEASURE);
  fs.writeFileSync(`${OUT}/ref-buat-${label}.json`, JSON.stringify(data, null, 2));
  console.log(label, JSON.stringify({
    viewport: data.viewport,
    themeColor: data.themeColor,
    fontFaces: data.fontFaces,
    rootVars: data.rootVars,
    body: data.body && { family: data.body.family, size: data.body.size, color: data.body.color, bg: data.body.bg },
    header: data.header && { h: data.header.rect.h, bg: data.header.bg, borderBottom: data.header.borderBottom, position: data.header.position, family: data.header.children?.[0]?.family },
    h1: data.h1 && { size: data.h1.size, weight: data.h1.weight, family: data.h1.family, lineHeight: data.h1.lineHeight, tracking: data.h1.tracking, transformText: data.h1.transformText, rect: data.h1.rect },
    sub: data.sub && { size: data.sub.size, weight: data.sub.weight, family: data.sub.family, rect: data.sub.rect },
    main: data.main && { rect: data.main.rect, padding: data.main.padding },
    grid: data.grid && { cols: data.grid.cols, gap: data.grid.gap, rect: data.grid.rect },
    card: data.card && {
      box: { rect: data.card.box.rect, radius: data.card.box.radius, border: data.card.box.border, shadow: data.card.box.shadow, transform: data.card.box.transform, bg: data.card.box.bg },
      title: { size: data.card.title.size, family: data.card.title.family, weight: data.card.title.weight, rect: data.card.title.rect },
      desc: { size: data.card.desc.size, family: data.card.desc.family, weight: data.card.desc.weight },
      chip: data.card.chip && { rect: data.card.chip.rect, radius: data.card.chip.radius, border: data.card.chip.border, size: data.card.chip.size },
      sticker: data.card.sticker && { rect: data.card.sticker.rect, radius: data.card.sticker.radius, bg: data.card.sticker.bg, transform: data.card.sticker.transform, shadow: data.card.sticker.shadow },
      illustration: data.card.illustration && { rect: data.card.illustration.rect, bg: data.card.illustration.bg, borderBottom: data.card.illustration.borderBottom },
      svg: data.card.svg && { rect: data.card.svg.rect },
    },
    footer: data.footer && {
      info: { rect: data.footer.info.rect, bg: data.footer.info.bg, color: data.footer.info.color, border: data.footer.info.border, padding: data.footer.info.padding },
      headings: data.footer.headings.map((h) => ({ text: h.text, size: h.size, family: h.family, color: h.color, tracking: h.tracking })),
      lang: data.footer.lang && { rect: data.footer.lang.rect, bg: data.footer.lang.bg, radius: data.footer.lang.radius, border: data.footer.lang.border },
      copyright: data.footer.copyright && { size: data.footer.copyright.size, family: data.footer.copyright.family, color: data.footer.copyright.color },
    },
    chat: data.chat && { rect: data.chat.info.rect, bg: data.chat.info.bg, radius: data.chat.info.radius, border: data.chat.info.border, shadow: data.chat.info.shadow, position: data.chat.info.position, html: data.chat.html.slice(0, 300) },
  }, null, 2));
  cdp.close();
}

await ensureChrome();
await measure({ w: 1440, h: 1000, mobile: false }, "desktop");
await measure({ w: 390, h: 844, mobile: true }, "mobile");
console.log("done");
