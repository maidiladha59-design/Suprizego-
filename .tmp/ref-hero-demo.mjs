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
  await sleep(60);
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

const HERO_STATE = `(() => {
  const h1 = [...document.querySelectorAll('h1')].find((h) => /BERANI/i.test(h.innerText || ''));
  const hero = h1 ? h1.closest('section') : document.body;
  const phoneCandidates = [...hero.querySelectorAll('*')].filter((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return parseFloat(s.borderTopWidth) >= 4 && r.width > 200 && r.width < 460 && r.height > 300;
  }).map((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 140), bg: s.backgroundColor, rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 300) };
  });
  const buttons = [...hero.querySelectorAll('button,a')].map((el) => {
    const r = el.getBoundingClientRect();
    return { tag: el.tagName.toLowerCase(), text: (el.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 60), href: el.getAttribute('href'), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, cls: (el.className || '').toString().slice(0, 120) };
  }).filter((b) => b.rect.w > 0);
  return { heroText: (hero.innerText || '').trim(), phoneCandidates, buttons };
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
  const snap = async (name) => {
    const st = await cdp.eval(HERO_STATE);
    await shot(cdp, `ref-demo-${label}-${name}`);
    steps.push({ name, ...st });
    console.log(label, name, JSON.stringify({ phone: st.phoneCandidates.map((p) => ({ bg: p.bg, rect: p.rect, text: p.text.slice(0, 200) })), buttons: st.buttons.map((b) => b.text) }, null, 2));
  };

  await snap("00");

  // locate envelope: click center of the largest phone-like element that is pink/colored
  const phone = await cdp.eval(`(() => {
    const t = document.querySelector('.font-display');
    const cands = [...document.querySelectorAll('div,section,article')].filter((el) => {
      const s = getComputedStyle(el); const r = el.getBoundingClientRect();
      return parseFloat(s.borderTopWidth) >= 4 && r.width > 240 && r.width < 460 && r.height > 380 && r.top >= 0;
    }).map((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { x: r.x, y: r.y, w: r.width, h: r.height, bg: s.backgroundColor, cls: (el.className||'').toString() }; });
    return cands.sort((a,b) => b.w*b.h - a.w*a.h)[0] || null;
  })()`);
  console.log(label, "phone:", JSON.stringify(phone));

  // Click into the phone (envelope area ~62% height)
  if (phone) {
    const ex = phone.x + phone.w * 0.5;
    const ey = Math.min(vp.h - 10, phone.y + phone.h * 0.58);
    const hit = await cdp.eval(`(() => { const el = document.elementFromPoint(${ex}, ${ey}); return el ? { tag: el.tagName, text: (el.innerText||'').trim().slice(0,60), cls: (el.className||'').toString().slice(0,100) } : null; })()`);
    console.log(label, "envelope hit:", JSON.stringify(hit));
    await clickAt(cdp, ex, ey);
    await sleep(1400);
    await snap("01-envelope");
    await clickAt(cdp, ex, ey);
    await sleep(1400);
    await snap("02");
    // try center clicks / next
    for (let i = 3; i <= 9; i++) {
      const btn = await cdp.eval(`(() => {
        const vis = [...document.querySelectorAll('button,a')].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.top > 0 && r.top < innerHeight; });
        const next = vis.find((b) => /lanjut|next|buka|bukti|lihat|klik|tap|amplop|mulai|ok|oke|ya|mau/i.test((b.innerText||'')) && !/BIKIN|MULAI 5|MASUK/i.test(b.innerText||''));
        if (next) { const r = next.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, text: (next.innerText||'').trim().slice(0,50) }; }
        return null;
      })()`);
      if (btn) {
        console.log(label, `step${i} clicking`, btn.text);
        await clickAt(cdp, btn.x, btn.y);
      } else {
        await clickAt(cdp, ex, ey);
      }
      await sleep(1300);
      await snap(`0${i}`);
    }
  }

  // pink perm / chat malam buttons from hero
  for (const labelText of ["PERMEN PINK", "CHAT MALAM", "ULANG"]) {
    const pos = await cdp.eval(`(() => { const b = [...document.querySelectorAll('button')].find((x) => (x.innerText||'').trim().toUpperCase() === ${JSON.stringify(labelText)}); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
    if (pos) {
      console.log(label, "clicking", labelText, JSON.stringify(pos));
      await clickAt(cdp, pos.x, pos.y);
      await sleep(1500);
      await snap(`btn-${labelText.toLowerCase().replace(/\\s+/g, "-")}`);
    }
  }

  fs.writeFileSync(`${OUT}/ref-demo-${label}.json`, JSON.stringify(steps, null, 2));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
console.log("done-demo-1");
