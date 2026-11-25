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

async function shot(cdp, name, full) {
  const params = { format: "png", captureBeyondViewport: !!full };
  if (full) {
    const m = await cdp.send("Page.getLayoutMetrics");
    params.clip = { x: 0, y: 0, width: m.cssContentSize.width, height: Math.min(Math.ceil(m.cssContentSize.height), 6000), scale: 0.5 };
  }
  const r = await cdp.send("Page.captureScreenshot", params);
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

async function clickAt(cdp, x, y) {
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await sleep(50);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

async function clickText(cdp, rx, sel = "button") {
  const pos = await cdp.eval(`(() => { const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ').toLowerCase(); const b = [...document.querySelectorAll('${sel}')].find((x) => ${rx}.test(t(x))); if (!b) return null; b.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, text: t(b).slice(0, 50) }; })()`);
  if (!pos) { console.log("!! no target", rx); return null; }
  await sleep(300);
  await clickAt(cdp, pos.x, pos.y);
  return pos;
}

async function typeInto(cdp, selector, text, clear = true) {
  const ok = await cdp.eval(`(() => { const el = document.querySelector('${selector}'); if (!el) return false; el.scrollIntoView({block:'center', behavior:'instant'}); el.focus(); return true; })()`);
  if (!ok) { console.log("!! no input", selector); return; }
  await sleep(250);
  if (clear) {
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace" });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace" });
    await sleep(120);
  }
  await cdp.send("Input.insertText", { text });
  await sleep(450);
}

const READ = `(() => {
  const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
  const cta = [...document.querySelectorAll('button')].find((b) => /LANJUT BAYAR/.test(t(b)));
  const section8 = cta ? cta.closest('section') : null;
  const anon = document.querySelector('input[type=checkbox]');
  const previewAside = document.querySelector('aside');
  return {
    url: location.href,
    features: section8 ? [...section8.querySelectorAll('li')].map(t) : [],
    cta: cta ? t(cta) : null,
    customLink: !!document.querySelector('#slug'),
    anon: anon ? anon.checked : null,
    snVisible: (() => { const el = document.querySelector('#sn'); return el ? !!el.offsetParent : null; })(),
    preview: previewAside ? t(previewAside).slice(0, 200) : null,
    errors: [...document.querySelectorAll('[role=alert],[aria-invalid=true]')].map(t).filter(Boolean),
    redTexts: [...document.querySelectorAll('p,span,div')].filter((el) => { const s = getComputedStyle(el); return /^rgb\\((2[0-9]{2}|1[89][0-9]),\\s*(3[0-9]|[0-9]?[0-9]),\\s*(3[0-9]|[0-9]?[0-9])\\)$/.test(s.color) && t(el).length > 0 && t(el).length < 100; }).slice(0, 6).map((el) => ({ text: t(el), color: getComputedStyle(el).color })),
    scrollY, consent: (() => { try { return localStorage.getItem('proposigo-consent-v2'); } catch { return null; } })(),
  };
})()`;

async function run() {
  const t = await newTarget();
  const cdp = new CDP(t.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
  await sleep(5500);

  // cookie banner
  const banner = await cdp.eval(`(() => {
    const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
    const card = [...document.querySelectorAll('div,aside')].find((el) => /BOLEH PAKAI COOKIE/.test(t(el)) && t(el).length < 500);
    if (!card) return null;
    const s = getComputedStyle(card); const r = card.getBoundingClientRect();
    const btn = [...card.querySelectorAll('button')].map((b) => { const br = b.getBoundingClientRect(); return { text: t(b), x: br.x + br.width/2, y: br.y + br.height/2 }; });
    return { html: card.outerHTML.slice(0, 1200), style: { bg: s.backgroundColor, radius: s.borderRadius, border: s.borderWidth + ' ' + s.borderColor, shadow: s.boxShadow, position: s.position, bottom: s.bottom, z: s.zIndex }, rect: { x: r.x, y: r.y, w: r.width, h: r.height }, btn };
  })()`);
  console.log("cookie banner:", JSON.stringify(banner, null, 2).slice(0, 2000));
  if (banner) { const boleh = banner.btn.find((b) => /BOLEH/i.test(b.text)); if (boleh) { await clickAt(cdp, boleh.x, boleh.y); await sleep(800); } }
  console.log("after consent:", JSON.stringify(await cdp.eval(READ)));

  // anonymous checkbox
  const cb = await cdp.eval(`(() => { const el = document.querySelector('input[type=checkbox]'); if (!el) return null; el.scrollIntoView({block:'center', behavior:'instant'}); const r = el.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
  if (cb) { await sleep(300); await clickAt(cdp, cb.x, cb.y); await sleep(900); }
  let r = await cdp.eval(READ);
  console.log("anon on:", JSON.stringify({ anon: r.anon, snVisible: r.snVisible, preview: r.preview }));
  await shot(cdp, "ref-wiz3-01-anon-on");
  if (cb) { const cb2 = await cdp.eval(`(() => { const el = document.querySelector('input[type=checkbox]'); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`); if (cb2) { await clickAt(cdp, cb2.x, cb2.y); await sleep(800); } }

  // plans features
  for (const p of ["DASAR", "ABADI", "PLUS"]) {
    await clickText(cdp, new RegExp("^" + p.toLowerCase()));
    await sleep(700);
    r = await cdp.eval(READ);
    console.log(`plan ${p}:`, r.cta, "| custom:", r.customLink, "| features:", JSON.stringify(r.features));
  }

  // validation
  await typeInto(cdp, "#rn", "");
  await clickText(cdp, /^lanjut bayar/);
  await sleep(1600);
  r = await cdp.eval(READ);
  console.log("validation read:", JSON.stringify({ url: r.url, errors: r.errors, redTexts: r.redTexts, scrollY: r.scrollY, rn: await cdp.eval("document.querySelector('#rn')?.value") }));
  await shot(cdp, "ref-wiz3-02-validation");
  const native = await cdp.eval(`(() => { const el = document.querySelector('#rn'); return el ? { valid: el.validity.valid, message: el.validationMessage, required: el.required } : null; })()`);
  console.log("native rn:", JSON.stringify(native));

  // restore and go checkout
  await typeInto(cdp, "#rn", "Dinda");
  await sleep(400);
  const ctaPos = await clickText(cdp, /^lanjut bayar/);
  await sleep(3500);
  const url = await cdp.eval("location.href");
  const title = await cdp.eval("document.title");
  console.log("after cta:", url, "|", title);
  await shot(cdp, "ref-wiz3-03-checkout");
  await shot(cdp, "ref-wiz3-03b-checkout-full", true);
  if (/checkout|bayar|selesai/i.test(url)) {
    const pageInfo = await cdp.eval(`(() => {
      const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
      const inputs = [...document.querySelectorAll('input')].map((i) => ({ type: i.type, id: i.id, ph: i.placeholder, value: i.value, required: i.required }));
      const buttons = [...document.querySelectorAll('button')].map((b) => t(b)).filter(Boolean);
      const methods = [...document.querySelectorAll('button,label,div')].filter((el) => /QRIS|DOKU|GoPay|OVO|DANA|ShopeePay|Virtual Account|VA|Kartu/i.test(t(el)) && t(el).length < 160).slice(0, 20).map(t);
      return { title: document.title, h1: [...document.querySelectorAll('h1')].map(t), h2: [...document.querySelectorAll('h2')].map(t), inputs, buttons: [...new Set(buttons)].slice(0, 30), methods: [...new Set(methods)], text: (document.querySelector('main')||document.body).innerText.slice(0, 3500), robots: document.querySelector('meta[name=robots]')?.content || null };
    })()`);
    fs.writeFileSync(`${OUT}/ref-checkout.json`, JSON.stringify(pageInfo, null, 2));
    console.log(JSON.stringify(pageInfo, null, 2).slice(0, 6000));
  }
  cdp.close();
}
await run();
console.log("done-wizard3");
