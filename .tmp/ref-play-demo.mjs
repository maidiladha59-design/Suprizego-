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

async function clickAt(cdp, x, y) {
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await sleep(50);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

const PHONE = `(() => {
  const cands = [...document.querySelectorAll('div,section,article')].filter((el) => {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return parseFloat(s.borderTopWidth) >= 4 && r.width > 250 && r.width < 460 && r.height > 420 && r.top > 40;
  }).map((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { el, x: r.x, y: r.y, w: r.width, h: r.height, bg: s.backgroundColor, cls: (el.className||'').toString() }; });
  const p = cands.sort((a,b) => b.w*b.h - a.w*a.h)[0] || null;
  if (!p) return null;
  return { x: p.x, y: p.y, w: p.w, h: p.h, bg: p.bg, cls: p.cls, text: (p.el.innerText||'').trim() };
})()`;

const STATE = `(() => {
  const cands = [...document.querySelectorAll('div,section,article')].filter((el) => {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return parseFloat(s.borderTopWidth) >= 4 && r.width > 250 && r.width < 460 && r.height > 420 && r.top > 40;
  }).map((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { el, x: r.x, y: r.y, w: r.width, h: r.height, bg: s.backgroundColor }; });
  const p = cands.sort((a,b) => b.w*b.h - a.w*a.h)[0] || null;
  const logCard = [...document.querySelectorAll('div,aside')].find((el) => /YANG MASUK KE/i.test(el.innerText || '') && (el.innerText||'').length < 500);
  const inPhone = (el) => { if (!p) return false; const r = el.getBoundingClientRect(); return r.x >= p.x - 6 && r.x + r.width <= p.x + p.w + 6 && r.y >= p.y - 6 && r.y + r.height <= p.y + p.h + 6; };
  const btns = [...document.querySelectorAll('button,a,[role=button]')].filter(inPhone).map((b) => { const r = b.getBoundingClientRect(); return { el: b, text: (b.innerText||'').trim().replace(/\\s+/g,' ').slice(0,80), x: r.x, y: r.y, w: r.width, h: r.height }; });
  return {
    url: location.href,
    phone: p ? { x: p.x, y: p.y, w: p.w, h: p.h, bg: p.bg, text: (p.el.innerText||'').trim() } : null,
    log: logCard ? (logCard.innerText||'').trim() : null,
    buttons: btns.map((b) => ({ text: b.text, x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) })),
    logHTML: logCard ? logCard.outerHTML.slice(0, 2500) : null,
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
  await sleep(6000);

  const steps = [];
  const capture = async (name) => {
    const s = await cdp.eval(STATE);
    await shot(cdp, `ref-play-${label}-${name}`);
    steps.push({ name, ...s });
    console.log(label, name, "phone:", s.phone ? s.phone.text.slice(0, 260).replace(/\\n/g, " | ") : null);
    console.log(label, name, "buttons:", s.buttons.map((b) => b.text).join(" · "));
    return s;
  };

  let st = await capture("00");
  const phone = st.phone;
  // click the envelope: horizontal center, 55% height (demo resets to top of phone)
  await clickAt(cdp, phone.x + phone.w / 2, phone.y + phone.h * 0.55);
  await sleep(1200);
  st = await capture("01");

  let n = 1;
  let nggakTested = false;
  while (n < 26) {
    // does the phone contain a question with Ya / Nggak?
    const options = st.buttons;
    const nggak = options.find((b) => /^(nggak|tidak|no)$/i.test(b.text.trim()));
    const ya = options.find((b) => /^(ya|iya|mau|yes)$/i.test(b.text.trim()));
    if (nggak && ya && !nggakTested) {
      nggakTested = true;
      const nkRect = (await cdp.eval(STATE)).buttons.find((b) => /^(nggak|tidak|no)$/i.test(b.text.trim()));
      const moves = [];
      for (let i = 0; i < 6; i++) {
        const now = (await cdp.eval(STATE)).buttons.find((b) => /^(nggak|tidak|no)$/i.test(b.text.trim()));
        if (!now) break;
        const cx = now.x + now.w / 2;
        const cy = now.y + now.h / 2;
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: cx, y: cy });
        await sleep(260);
        const after = (await cdp.eval(STATE)).buttons.find((b) => /^(nggak|tidak|no)$/i.test(b.text.trim()));
        moves.push({ attempt: i, before: { x: now.x, y: now.y }, after: after ? { x: after.x, y: after.y } : null });
      }
      steps.push({ name: "nggak-escape", moves });
      console.log(label, "nggak escape moves:", JSON.stringify(moves));
      await shot(cdp, `ref-play-${label}-nggak-escape`);
    }

    // primary button: prefer explicit action words inside phone, else the biggest visible button
    const priority = (b) => {
      const t = b.text.toLowerCase();
      if (/^(buka|buka →|mulai|lanjut|lanjut →|next|baca|lihat cerita|masuk)$/.test(t)) return 0;
      if (/^(ya|iya|mau)$/.test(t) || /nggak|tidak/.test(t)) return 1;
      if (/simpan|unduh|ulang|lagi|coba/.test(t)) return 2;
      return 3;
    };
    const candidates = options.slice().sort((a, b) => priority(a) - priority(b) || b.w * b.h - a.w * a.h);
    const next = candidates[0];
    if (!next) {
      console.log(label, "no more phone buttons");
      break;
    }
    console.log(label, `click[${n}]`, JSON.stringify(next.text));
    const beforeText = st.phone.text;
    await clickAt(cdp, next.x + next.w / 2, next.y + next.h / 2);
    // wait for content change
    let changed = false;
    for (let w = 0; w < 30; w++) {
      await sleep(120);
      const now = (await cdp.eval(STATE)).phone;
      if (now && now.text !== beforeText) { changed = true; break; }
    }
    if (!changed) { console.log(label, "no change after click", JSON.stringify(next.text)); }
    await sleep(500);
    st = await capture(String(n + 1).padStart(2, "0"));
    n++;
  }

  fs.writeFileSync(`${OUT}/ref-play-${label}.json`, JSON.stringify(steps, null, 2));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
console.log("done-play");
