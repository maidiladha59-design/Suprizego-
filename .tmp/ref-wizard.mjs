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

const SNAP = `(() => {
  const txt = (el) => (el?.innerText || '').trim().replace(/\\s+/g, ' ');
  const byText = (rx, sel = 'button') => [...document.querySelectorAll(sel)].find((b) => rx.test(txt(b)));
  const phone = [...document.querySelectorAll('div,aside')].filter((el) => {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return parseFloat(s.borderTopWidth) >= 4 && r.width > 280 && r.width < 430 && r.height > 480;
  }).sort((a,b) => b.getBoundingClientRect().width*b.getBoundingClientRect().height - a.getBoundingClientRect().width*a.getBoundingClientRect().height)[0];
  const planCards = [...document.querySelectorAll('button,label,div')].filter((el) => /^DASAR|^PLUS|^ABADI/.test(txt(el)) && txt(el).length < 600 && el.querySelector('input[type=radio]'));
  const cta = [...document.querySelectorAll('button')].find((b) => /LANJUT BAYAR/.test(txt(b)));
  const features = [...document.querySelectorAll('ul,div')].find((el) => /Semua isi Dasar/.test(txt(el)) && txt(el).length < 700);
  const custom = [...document.querySelectorAll('input')].find((i) => i.placeholder && /dinda-dan-raka/.test(i.placeholder));
  const anon = [...document.querySelectorAll('input[type=checkbox]')][0];
  const toast = [...document.querySelectorAll('[role=alert],[class*=toast],[class*=error]')].map(txt).filter(Boolean).slice(0, 6);
  const errors = [...document.querySelectorAll('[aria-invalid=true], .text-red-500, [class*=error]')].map(txt).filter(Boolean).slice(0, 10);
  const draft = (() => { try { return localStorage.getItem('proposigo:draft:confess'); } catch { return null; } })();
  return {
    url: location.href,
    phone: phone ? { text: txt(phone).slice(0, 300), bg: getComputedStyle(phone).backgroundColor, w: Math.round(phone.getBoundingClientRect().width), h: Math.round(phone.getBoundingClientRect().height) } : null,
    planSelected: planCards.map((p) => ({ text: txt(p).slice(0, 40), checked: !!p.querySelector('input[type=radio]')?.checked })),
    cta: cta ? { text: txt(cta), bg: getComputedStyle(cta).backgroundColor } : null,
    features: features ? txt(features).slice(0, 300) : null,
    customLinkVisible: !!custom,
    anonChecked: anon ? anon.checked : null,
    sn: document.querySelector('input[name=sn]')?.value,
    rn: document.querySelector('input[name=rn]')?.value,
    q: document.querySelector('input[name=q]')?.value,
    stories: [...document.querySelectorAll('textarea')].map((t) => t.value.slice(0, 40)),
    toast, errors,
    draftLen: draft ? draft.length : 0,
    draftSnippet: draft ? draft.slice(0, 300) : null,
    scrollY,
  };
})()`;

function rectOfSelectorText(rx, sel = "button") {
  return `(() => { const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' '); const b = [...document.querySelectorAll('${sel}')].find((x) => ${rx}.test(t(x))); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: t(b).slice(0, 60), w: r.width, h: r.height }; })()`;
}

async function clickText(cdp, rx, sel = "button") {
  const pos = await cdp.eval(rectOfSelectorText(rx, sel));
  if (!pos) { console.log("!! no target", rx); return false; }
  await cdp.eval(`scrollBy(0, ${Math.round(pos.y - 500)})`);
  await sleep(350);
  const pos2 = await cdp.eval(rectOfSelectorText(rx, sel));
  if (!pos2) return false;
  await clickAt(cdp, pos2.x, pos2.y);
  return pos2;
}

async function typeInto(cdp, selector, text, clear = true) {
  await cdp.eval(`(() => { const el = document.querySelector('${selector}'); el.scrollIntoView({block:'center'}); el.focus(); })()`);
  await sleep(250);
  if (clear) {
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace" });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace" });
    await sleep(150);
  }
  await cdp.send("Input.insertText", { text });
  await sleep(400);
}

async function run() {
  const t = await newTarget();
  const cdp = new CDP(t.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
  await sleep(5000);

  const log = [];
  const snap = async (name) => {
    const s = await cdp.eval(SNAP);
    log.push({ name, ...s });
    await shot(cdp, `ref-wiz-${name}`);
    console.log(name, "| phone:", s.phone ? s.phone.text.slice(0, 80).replace(/\n/g, " ") + " | bg " + s.phone.bg : null);
    console.log("   plans:", s.planSelected.map((p) => `${p.text.slice(0, 8)}:${p.checked}`).join(" "), "| cta:", s.cta?.text, "| custom:", s.customLinkVisible, "| anon:", s.anonChecked);
    console.log("   toast/errors:", JSON.stringify(s.toast), JSON.stringify(s.errors));
    return s;
  };

  await snap("00-initial");

  // design switch
  const chat = await clickText(cdp, /^CHAT MALAM/);
  await sleep(1200);
  await snap("01-chatmalam");
  const pink = await clickText(cdp, /^PERMEN PINK/);
  await sleep(1000);
  await snap("02-permenpink");

  // type recipient name, verify preview & autosave
  await typeInto(cdp, 'input[name=rn]', "Testerr");
  await sleep(600);
  await snap("03-typed");
  await cdp.eval("scrollTo(0,0)");
  await cdp.send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
  await sleep(4500);
  const afterReload = await snap("04-reloaded");
  console.log("   persisted rn:", afterReload.rn);

  // anonymous toggle
  await clickText(cdp, /ANONIM|Si Malu/i, "label,div,button");
  await sleep(900);
  await snap("05-anonim");

  // locked chip
  const chip = await cdp.eval(`(() => { const t = (el) => (el.innerText || '').trim(); const b = [...document.querySelectorAll('button')].find((x) => /Valentine/.test(t(x))); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, disabled: b.disabled, text: t(b) }; })()`);
  console.log("valentine chip:", JSON.stringify(chip));
  if (chip) { await cdp.eval(`scrollTo(0,0)`); await sleep(300); await clickAt(cdp, chip.x, chip.y); await sleep(800); await snap("06-lockedchip"); }

  // plan switch: ABADI
  await clickText(cdp, /^ABADI/);
  await sleep(900);
  await snap("07-abadi");
  await clickText(cdp, /^DASAR/);
  await sleep(900);
  await snap("08-dasar");

  // preview button
  const prev = await clickText(cdp, /^LIHAT PRATINJAU/);
  await sleep(1800);
  await snap("09-preview");
  const cur = await cdp.eval(`({ url: location.href, title: document.title })`);
  console.log("after preview:", JSON.stringify(cur));
  await shot(cdp, "ref-wiz-09b-preview");
  // close preview if modal
  const closed = await cdp.eval(`(() => { const b = [...document.querySelectorAll('button')].find((x) => /^(tutup|×|close|x)$/i.test((x.innerText||'').trim())); if (b) { b.click(); return true; } return false; })()`);
  console.log("closed preview:", closed);
  await sleep(800);

  // validation: clear required fields then CTA
  await typeInto(cdp, 'input[name=sn]', "", true);
  await typeInto(cdp, 'input[name=rn]', "", true);
  await cdp.eval(`(() => { [...document.querySelectorAll('textarea')].forEach((t) => { const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; setter.call(t, ''); t.dispatchEvent(new Event('input', { bubbles: true })); }); })()`);
  await sleep(500);
  const ctaPos = await clickText(cdp, /LANJUT BAYAR/);
  await sleep(1600);
  const invalid = await snap("10-validation");
  await shot(cdp, "ref-wiz-10b-validation", true);
  console.log("after invalid cta url:", invalid.url);
  const invalidDetails = await cdp.eval(`(() => {
    const t = (el) => (el.innerText || '').trim().replace(/\\s+/g, ' ');
    const alerts = [...document.querySelectorAll('[role=alert]')].map(t);
    const red = [...document.querySelectorAll('*')].filter((el) => { const s = getComputedStyle(el); return /rgb\\(2[0-9]{2}, 5?[0-9], 5?[0-9]\\)/.test(s.color) && t(el) && t(el).length < 120; }).slice(0, 10).map((el) => ({ text: t(el), color: getComputedStyle(el).color }));
    const invalidEls = [...document.querySelectorAll('[aria-invalid=true],:invalid')].slice(0, 10).map((el) => ({ tag: el.tagName, name: el.name, cls: (el.className||'').toString().slice(0, 80) }));
    return { alerts, red, invalidEls, scrollY };
  })()`);
  console.log("validation details:", JSON.stringify(invalidDetails, null, 2));

  // restore names & letter, click CTA to reach checkout
  await typeInto(cdp, 'input[name=sn]', "Raka");
  await typeInto(cdp, 'input[name=rn]', "Dinda");
  await cdp.eval(`(() => { const ts = [...document.querySelectorAll('textarea')]; const t = ts[ts.length - 1]; const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; setter.call(t, 'Halo Dinda, ini surat coba dari SuprizeGo.'); t.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await sleep(500);
  const cta = await clickText(cdp, /LANJUT BAYAR/);
  await sleep(2500);
  const checkout = await cdp.eval(`({ url: location.href, title: document.title, mainText: (document.querySelector('main')||document.body).innerText.slice(0, 3000) })`);
  console.log("CHECKOUT:", JSON.stringify(checkout, null, 2).slice(0, 3500));
  await shot(cdp, "ref-wiz-11-checkout");
  await shot(cdp, "ref-wiz-11b-checkout-full", true);

  fs.writeFileSync(`${OUT}/ref-wizard-interact.json`, JSON.stringify({ log, invalidDetails, checkout }, null, 2));
  cdp.close();
}
await run();
console.log("done-wizard");
