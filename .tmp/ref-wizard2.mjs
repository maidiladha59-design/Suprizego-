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
    params.clip = { x: 0, y: 0, width: m.cssContentSize.width, height: Math.min(Math.ceil(m.cssContentSize.height), 7000), scale: 0.5 };
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

const PREVIEW = `(() => {
  const aside = document.querySelector('aside');
  if (!aside) return null;
  const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
  const screens = [...aside.querySelectorAll('div')].filter((el) => {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return r.width > 280 && r.width < 400 && s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== 'rgb(17, 17, 17)';
  }).map((el) => ({ bg: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color, w: Math.round(el.getBoundingClientRect().width), text: t(el).slice(0, 120) }));
  const dots = [...aside.querySelectorAll('span')].filter((d) => getComputedStyle(d).borderRadius === '9999px' && d.getBoundingClientRect().width <= 12 && d.getBoundingClientRect().width >= 3).map((d) => getComputedStyle(d).backgroundColor);
  return { text: t(aside).slice(0, 260), screens, dots, w: Math.round(aside.getBoundingClientRect().width) };
})()`;

const SNAP = `(() => {
  const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
  const plans = [...document.querySelectorAll('button[aria-pressed]')].filter((b) => /^(DASAR|PLUS|ABADI)/.test(t(b))).map((b) => ({ text: t(b).slice(0, 40), pressed: b.getAttribute('aria-pressed') === 'true', cls: b.className }));
  const cta = [...document.querySelectorAll('button')].find((b) => /LANJUT BAYAR/.test(t(b)));
  const section8 = cta ? cta.closest('section') : null;
  const features = section8 ? [...section8.querySelectorAll('li')].map(t) : [];
  const custom = document.querySelector('#slug');
  const anon = document.querySelector('input[type=checkbox]');
  const design = [...document.querySelectorAll('button[aria-pressed]')].filter((b) => /^(PERMEN PINK|CHAT MALAM)/.test(t(b))).map((b) => ({ text: t(b).slice(0, 20), pressed: b.getAttribute('aria-pressed') === 'true', style: b.getAttribute('style') }));
  const toasts = [...document.querySelectorAll('[role=status],[role=alert]')].map(t).filter(Boolean);
  return {
    url: location.href,
    design,
    plans,
    cta: cta ? t(cta) : null,
    features,
    customLink: custom ? { visible: !!custom.offsetParent, value: custom.value } : null,
    anon: anon ? anon.checked : null,
    sn: document.querySelector('#sn')?.value,
    rn: document.querySelector('#rn')?.value,
    stories: [...document.querySelectorAll('textarea')].map((x) => x.value.slice(0, 30)),
    draft: (() => { try { return localStorage.getItem('proposigo:draft:confess')?.slice(0, 400) || null; } catch { return null; } })(),
    toasts,
    scrollY,
  };
})()`;

async function clickText(cdp, rx, sel = "button") {
  const pos = await cdp.eval(`(() => { const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ').toLowerCase(); const b = [...document.querySelectorAll('${sel}')].find((x) => ${rx}.test(t(x))); if (!b) return null; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, text: t(b).slice(0, 50) }; })()`);
  if (!pos) { console.log("!! no target", rx); return null; }
  await sleep(300);
  await clickAt(cdp, pos.x, pos.y);
  return pos;
}

async function typeInto(cdp, selector, text) {
  const ok = await cdp.eval(`(() => { const el = document.querySelector('${selector}'); if (!el) return false; el.scrollIntoView({block:'center'}); el.focus(); return true; })()`);
  if (!ok) { console.log("!! no input", selector); return; }
  await sleep(250);
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers: 2 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers: 2 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace" });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace" });
  await sleep(120);
  await cdp.send("Input.insertText", { text });
  await sleep(500);
}

async function run() {
  const t = await newTarget();
  const cdp = new CDP(t.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
  await sleep(5500);

  const log = [];
  const snap = async (name) => {
    const s = await cdp.eval(SNAP);
    const p = await cdp.eval(PREVIEW);
    log.push({ name, ...s, preview: p });
    await shot(cdp, `ref-wiz2-${name}`);
    console.log(name, "| cta:", s.cta, "| plan:", s.plans.map((x) => x.text.slice(0, 6) + ":" + x.pressed).join(" "), "| custom:", s.customLink?.visible, "| anon:", s.anon);
    console.log("   preview:", p ? p.text.slice(0, 90) + " | screens:" + JSON.stringify(p.screens.slice(0, 2)) + " | dots:" + p.dots.length : null);
    console.log("   design:", s.design.map((d) => d.text + ":" + d.pressed).join(" "), "| toasts:", JSON.stringify(s.toasts));
    return s;
  };

  await snap("00-initial");
  await clickText(cdp, /^chat malam/); await sleep(1000); await snap("01-chatmalam");
  await clickText(cdp, /^permen pink/); await sleep(800); await snap("02-permenpink");

  await typeInto(cdp, "#rn", "Testerr");
  await snap("03-typed");
  console.log("   draft:", (await cdp.eval(SNAP)).draft);
  // blur + reload persistence
  await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
  await sleep(4500);
  const rel = await snap("04-reloaded");
  console.log("   persisted rn:", rel.rn);

  // anonymous toggle via clicking the checkbox row label
  const anonPos = await cdp.eval(`(() => { const t = (el) => (el.innerText || '').trim(); const el = [...document.querySelectorAll('label,button,div')].find((x) => /Kirim sebagai anonim/i.test(t(x)) && t(x).length < 120); if (!el) return null; el.scrollIntoView({block:'center'}); const r = el.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, tag: el.tagName, text: t(el).slice(0,80) }; })()`);
  console.log("anon target:", JSON.stringify(anonPos));
  if (anonPos) { await sleep(300); await clickAt(cdp, anonPos.x, anonPos.y); await sleep(900); await snap("05-anonim"); }

  // plan switches
  await clickText(cdp, /^abadi/); await sleep(800); await snap("06-abadi");
  await clickText(cdp, /^dasar/); await sleep(800); await snap("07-dasar");
  await clickText(cdp, /^plus/); await sleep(800);

  // preview modal
  const before = await cdp.eval(`({ url: location.href, pages: null })`);
  await clickText(cdp, /^lihat pratinjau/); await sleep(2000);
  const after = await cdp.eval(`({ url: location.href, title: document.title })`);
  console.log("preview urls:", JSON.stringify({ before, after }));
  await shot(cdp, "ref-wiz2-08-preview");
  const closePrev = await cdp.eval(`(() => { const b = [...document.querySelectorAll('button')].find((x) => /^(tutup|×|close)$/i.test((x.innerText||'').trim())); if (b) { b.click(); return true; } return false; })()`);
  console.log("closed preview:", closePrev);
  await sleep(600);
  if ((await cdp.eval("location.href")) !== "https://proposigo.app/buat/confess") {
    await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
    await sleep(4500);
  }

  // validation with empty required fields
  await typeInto(cdp, "#rn", "");
  await clickText(cdp, /^lanjut bayar/); await sleep(1800);
  const inv = await snap("09-validation");
  console.log("   url after invalid:", inv.url);
  await shot(cdp, "ref-wiz2-09b-validation");

  // restore recipient, click CTA to checkout
  await typeInto(cdp, "#rn", "Dinda");
  await sleep(400);
  await clickText(cdp, /^lanjut bayar/); await sleep(3000);
  const co = await cdp.eval(`({ url: location.href, title: document.title, text: (document.querySelector('main')||document.body).innerText.slice(0, 2500) })`);
  console.log("CHECKOUT URL:", co.url, "|", co.title);
  console.log(co.text);
  await shot(cdp, "ref-wiz2-10-checkout");
  await shot(cdp, "ref-wiz2-10b-checkout-full", true);

  fs.writeFileSync(`${OUT}/ref-wizard2.json`, JSON.stringify({ log, checkout: co }, null, 2));
  cdp.close();
}
await run();
console.log("done-wizard2");
