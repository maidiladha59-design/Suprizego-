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

const STRUCT = `(() => {
  const h2 = [...document.querySelectorAll('h2')].find((h) => /PENASARAN/i.test(h.innerText || ''));
  const section = h2 ? h2.closest('section') : null;
  const walk = (el, depth = 0) => {
    if (!el || depth > 4) return [];
    return [...el.children].flatMap((c) => [{ tag: c.tagName.toLowerCase(), cls: (c.className || '').toString().slice(0, 90), text: (c.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 60) }, ...walk(c, depth + 1)]);
  };
  return {
    found: !!section,
    sectionId: section ? section.id : null,
    sectionCls: section ? (section.className || '').toString().slice(0, 150) : null,
    h2: h2 ? { text: h2.innerText, cls: (h2.className || '').toString() } : null,
    tree: section ? walk(section) : [],
    details: section ? section.querySelectorAll('details').length : 0,
    buttons: section ? section.querySelectorAll('button').length : 0,
    links: section ? [...section.querySelectorAll('a')].map((a) => ({ text: (a.innerText || '').trim().slice(0, 50), href: a.getAttribute('href'), cls: (a.className || '').toString().slice(0, 120) })) : [],
  };
})()`;

const MEASURE = `(() => {
  const info = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().slice(0, 160),
      text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 100),
      rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      bg: s.backgroundColor, color: s.color, family: s.fontFamily.split(',')[0], size: s.fontSize,
      weight: s.fontWeight, lineHeight: s.lineHeight, transformText: s.textTransform,
      radius: s.borderRadius, border: s.borderTopWidth + ' ' + s.borderTopStyle + ' ' + s.borderTopColor,
      shadow: s.boxShadow, transform: s.transform, padding: s.padding, margin: s.margin,
      display: s.display, position: s.position, zIndex: s.zIndex, gap: s.gap,
      justify: s.justifyContent, align: s.alignItems, cols: s.gridTemplateColumns,
    };
  };
  const h2 = [...document.querySelectorAll('h2')].find((h) => /PENASARAN/i.test(h.innerText || ''));
  const section = h2.closest('section');
  const container = section.querySelector('div');
  const details = [...section.querySelectorAll('details')];
  const buttons = [...section.querySelectorAll('button')];
  const items = details.length ? details : buttons.map((b) => b.closest('div'));
  return {
    viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth },
    section: info(section),
    container: info(container),
    h2: info(h2),
    sub: info([...section.querySelectorAll('p')].find((p) => /jawab|tanya|sebelum|hal-hal|di bawah/i.test(p.innerText || ''))),
    sideLink: info(section.querySelector('a')),
    itemsWrap: info(items[0] ? items[0].parentElement : null),
    items: items.slice(0, 6).map((it) => ({
      item: info(it),
      summary: info(it.querySelector('summary')),
      question: info(it.querySelector('summary') || it.querySelector('button,span')),
      icon: info(it.querySelector('svg')?.parentElement || it.querySelector('summary span:last-child')),
      iconSVG: it.querySelector('svg') ? it.querySelector('svg').outerHTML.slice(0, 400) : null,
      answer: info(it.querySelector('p,div')),
      html: it.outerHTML.slice(0, 900),
    })),
    bordered: [...section.querySelectorAll('*')].filter((el) => parseFloat(getComputedStyle(el).borderTopWidth) >= 2).slice(0, 12).map(info),
    allTexts: { buttons: buttons.map((b) => (b.innerText || '').trim().slice(0, 80)), details: details.length },
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
  const struct = await cdp.eval(STRUCT);
  console.log(label, "struct:", JSON.stringify(struct, null, 2).slice(0, 3500));
  await cdp.eval(`(() => { const h = [...document.querySelectorAll('h2')].find((x) => /PENASARAN/i.test(x.innerText || '')); h?.scrollIntoView({block:'start',behavior:'instant'}); scrollBy(0,-72); })()`);
  await sleep(600);
  await shot(cdp, `ref-faq-${label}-01`);
  // open first item
  await cdp.eval(`(() => { const d = document.querySelector('details'); if (d && !d.open) d.open = true; else { const b = [...document.querySelectorAll('button')].find((x) => /SuprizeGo|momen|paket|link|harga/i.test(x.innerText || '') && !/BIKIN|MULAI|MASUK/i.test(x.innerText || '')); b?.click(); } })()`);
  await sleep(500);
  await shot(cdp, `ref-faq-${label}-02`);
  await cdp.eval(`scrollBy(0, 420)`);
  await sleep(400);
  await shot(cdp, `ref-faq-${label}-03`);
  const data = await cdp.eval(MEASURE);
  fs.writeFileSync(`${OUT}/ref-faq-${label}.json`, JSON.stringify(data, null, 2));
  console.log(label, "data:", JSON.stringify({
    viewport: data.viewport,
    section: data.section && { rect: data.section.rect, bg: data.section.bg, padding: data.section.padding, border: data.section.border },
    container: data.container && { rect: data.container.rect, padding: data.container.padding, display: data.container.display, cols: data.container.cols, gap: data.container.gap },
    h2: data.h2 && { text: data.h2.text, size: data.h2.size, lineHeight: data.h2.lineHeight, family: data.h2.family, transformText: data.h2.transformText, rect: data.h2.rect },
    sub: data.sub && { text: data.sub.text, size: data.sub.size, family: data.sub.family, rect: data.sub.rect },
    sideLink: data.sideLink && { text: data.sideLink.text, size: data.sideLink.size, family: data.sideLink.family, color: data.sideLink.color },
    itemsWrap: data.itemsWrap && { rect: data.itemsWrap.rect, display: data.itemsWrap.display, gap: data.itemsWrap.gap },
    items: data.items.map((it) => ({
      item: { rect: it.item.rect, bg: it.item.bg, radius: it.item.radius, border: it.item.border, shadow: it.item.shadow, padding: it.item.padding },
      summary: it.summary && { rect: it.summary.rect, padding: it.summary.padding, size: it.summary.size, family: it.summary.family, weight: it.summary.weight, display: it.summary.display, justify: it.summary.justify },
      question: it.question && { text: it.question.text, size: it.question.size },
      icon: it.icon && { rect: it.icon.rect, bg: it.icon.bg, radius: it.icon.radius, border: it.icon.border, shadow: it.icon.shadow },
      iconSVG: it.iconSVG,
      answer: it.answer && { text: it.answer.text.slice(0, 80), size: it.answer.size, color: it.answer.color, rect: it.answer.rect },
      html: it.html,
    })),
    bordered: data.bordered.map((b) => ({ tag: b.tag, text: b.text.slice(0, 40), rect: b.rect, radius: b.radius, border: b.border, shadow: b.shadow, bg: b.bg })),
    allTexts: data.allTexts,
  }, null, 2));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
await run("mobile", { w: 390, h: 844, mobile: true });
console.log("done-faq");
