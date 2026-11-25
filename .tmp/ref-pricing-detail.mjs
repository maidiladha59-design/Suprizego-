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

const MEASURE = `(() => {
  const info = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().slice(0, 200),
      text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 120),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      bg: s.backgroundColor, bgImage: s.backgroundImage.slice(0, 120), color: s.color,
      family: s.fontFamily.split(',')[0], size: s.fontSize, weight: s.fontWeight,
      lineHeight: s.lineHeight, tracking: s.letterSpacing, transformText: s.textTransform,
      radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      shadow: s.boxShadow, transform: s.transform, padding: s.padding, margin: s.margin,
      display: s.display, position: s.position, zIndex: s.zIndex,
      gridCols: s.gridTemplateColumns, gap: s.gap, overflow: s.overflow,
    };
  };
  const section = document.querySelector('section#harga');
  const container = section && [...section.querySelectorAll('div')].find((d) => getComputedStyle(d).maxWidth !== 'none');
  const h2 = section && section.querySelector('h2');
  const sub = h2 && h2.nextElementSibling;
  const cardName = [...section.querySelectorAll('h3')].map((el) => el);
  const cards = cardName.map((h) => {
    let c = h;
    for (let i = 0; i < 6; i++) {
      if (parseFloat(getComputedStyle(c).borderTopWidth) >= 3 && c.getBoundingClientRect().width > 200) break;
      c = c.parentElement;
    }
    return c;
  });
  const badge = [...section.querySelectorAll('span,div')].find((el) => /PALING LARIS/i.test(el.innerText || '') && el.children.length === 0);
  const discount = [...section.querySelectorAll('span,div')].find((el) => /HEMAT/i.test(el.innerText || '') && el.children.length === 0);
  const priceEls = [...section.querySelectorAll('*')].filter((el) => el.children.length === 0 && /^Rp/.test((el.innerText || '').trim()));
  const bullets = [...section.querySelectorAll('li')].slice(0, 12).map((li) => ({ li: info(li), first: info(li.firstElementChild) }));
  const buttons = [...section.querySelectorAll('a,button')].map(info);
  const note = [...section.querySelectorAll('p,span')].find((el) => /QRIS|bayar|pembayaran/i.test(el.innerText || '') && el.children.length === 0 && el.getBoundingClientRect().top > section.getBoundingClientRect().top + 300);
  return {
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
    section: info(section),
    innerHTMLs: section ? [...section.children].map((c) => ({ info: info(c), html: c.outerHTML.slice(0, 900) })) : [],
    container: info(container),
    h2: info(h2),
    sub: info(sub),
    badge: badge ? { ...info(badge), parent: info(badge.parentElement) } : null,
    discount: info(discount),
    prices: priceEls.map(info),
    cards: cards.map((c, i) => ({
      idx: i,
      card: info(c),
      name: info(c.querySelector('h3')),
      tagline: c.querySelector('h3') ? info(c.querySelector('h3').nextElementSibling) : null,
      price: info(priceEls.find((p) => c.contains(p) && !/aktif/i.test(p.innerText))),
      active: info([...c.querySelectorAll('*')].find((p) => p.children.length === 0 && /aktif|selamanya/i.test(p.innerText || ''))),
      bullets: [...c.querySelectorAll('li')].map((li) => ({ info: info(li), html: li.outerHTML.slice(0, 260) })),
      cta: info(c.querySelector('a,button')),
      children: [...c.children].map((ch) => info(ch)),
      html: c.outerHTML.slice(0, 1500),
    })),
    buttons,
    note: info(note),
    allBordered: [...section.querySelectorAll('*')].filter((el) => parseFloat(getComputedStyle(el).borderTopWidth) >= 3).map(info).slice(0, 20),
  };
})()`;

async function run(label, vp) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (vp.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
  await sleep(6500);
  await cdp.eval(`(() => { const b=[...document.querySelectorAll('button')].find(x=>/^(boleh|terima|setuju|oke|ok|accept|got it)$/i.test((x.innerText||'').trim())); if(b) b.click(); })()`);
  await cdp.eval(`document.querySelector('#harga')?.scrollIntoView({block:'start',behavior:'instant'})`);
  await sleep(600);
  await shot(cdp, `ref-price2-${label}-01`);
  await cdp.eval(`scrollBy(0, 480)`);
  await sleep(400);
  await shot(cdp, `ref-price2-${label}-02`);
  await cdp.eval(`scrollBy(0, 520)`);
  await sleep(400);
  await shot(cdp, `ref-price2-${label}-03`);
  const data = await cdp.eval(MEASURE);
  fs.writeFileSync(`${OUT}/ref-price2-${label}.json`, JSON.stringify(data, null, 2));
  console.log(label, JSON.stringify({
    viewport: data.viewport,
    section: data.section && { rect: data.section.rect, bg: data.section.bg, bgImage: data.section.bgImage, padding: data.section.padding, border: data.section.border },
    container: data.container && { rect: data.container.rect, padding: data.container.padding, maxW: data.container.cls },
    h2: data.h2 && { text: data.h2.text, size: data.h2.size, lineHeight: data.h2.lineHeight, family: data.h2.family, weight: data.h2.weight, rect: data.h2.rect },
    sub: data.sub && { text: data.sub.text, size: data.sub.size, family: data.sub.family },
    badge: data.badge && { text: data.badge.text, rect: data.badge.rect, bg: data.badge.bg, radius: data.badge.radius, border: data.badge.border, shadow: data.badge.shadow, transform: data.badge.transform, size: data.badge.size, family: data.badge.family, weight: data.badge.weight, transformText: data.badge.transformText, padding: data.badge.padding },
    discount: data.discount && { text: data.discount.text, rect: data.discount.rect, bg: data.discount.bg, radius: data.discount.radius, border: data.discount.border, size: data.discount.size },
    cards: data.cards.map((c) => ({
      card: { rect: c.card.rect, bg: c.card.bg, bgImage: c.card.bgImage, radius: c.card.radius, border: c.card.border, shadow: c.card.shadow, transform: c.card.transform, padding: c.card.padding, display: c.card.display },
      name: { text: c.name.text, size: c.name.size, family: c.name.family, weight: c.name.weight, transformText: c.name.transformText },
      tagline: c.tagline && { text: c.tagline.text, size: c.tagline.size, weight: c.tagline.weight },
      price: c.price && { text: c.price.text, size: c.price.size, family: c.price.family, weight: c.price.weight },
      active: c.active && { text: c.active.text, size: c.active.size, weight: c.active.weight },
      bullets: c.bullets.slice(0, 4).map((b) => ({ text: b.info.text, size: b.info.size, family: b.info.family })),
      cta: c.cta && { text: c.cta.text, rect: c.cta.rect, bg: c.cta.bg, radius: c.cta.radius, border: c.cta.border, shadow: c.cta.shadow, size: c.cta.size, family: c.cta.family, weight: c.cta.weight, transformText: c.cta.transformText, padding: c.cta.padding },
      children: c.children.map((ch) => ({ tag: ch.tag, rect: ch.rect, bg: ch.bg, size: ch.size })),
    })),
    buttons: data.buttons.map((b) => ({ text: b.text, rect: b.rect, bg: b.bg, radius: b.radius, border: b.border, shadow: b.shadow, size: b.size, family: b.family })),
    note: data.note && { text: data.note.text, size: data.note.size, color: data.note.color },
    allBordered: data.allBordered.map((b) => ({ tag: b.tag, text: b.text.slice(0, 40), rect: b.rect, radius: b.radius, border: b.border, shadow: b.shadow })),
  }, null, 2));

  // hover test on the middle card
  const hoverInfo = await cdp.eval(`(async () => {
    const section = document.querySelector('#harga');
    const h = [...section.querySelectorAll('h3')].find((x) => /PLUS/i.test(x.innerText));
    let c = h; for (let i=0;i<6;i++){ if (parseFloat(getComputedStyle(c).borderTopWidth)>=3 && c.getBoundingClientRect().width>200) break; c=c.parentElement; }
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), shadow: getComputedStyle(c).boxShadow, transform: getComputedStyle(c).transform };
  })()`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: hoverInfo.x, y: Math.min(hoverInfo.y, vp.h - 40) });
  await sleep(500);
  const after = await cdp.eval(`(() => {
    const section = document.querySelector('#harga');
    const h = [...section.querySelectorAll('h3')].find((x) => /PLUS/i.test(x.innerText));
    let c = h; for (let i=0;i<6;i++){ if (parseFloat(getComputedStyle(c).borderTopWidth)>=3 && c.getBoundingClientRect().width>200) break; c=c.parentElement; }
    return { shadow: getComputedStyle(c).boxShadow, transform: getComputedStyle(c).transform };
  })()`);
  console.log(label, "hover before/after:", JSON.stringify({ hoverInfo, after }));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
await run("mobile", { w: 390, h: 844, mobile: true });
console.log("done2");
