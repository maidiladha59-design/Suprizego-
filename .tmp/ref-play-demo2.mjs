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

const STATE = `(() => {
  const cands = [...document.querySelectorAll('div,section,article')].filter((el) => {
    const s = getComputedStyle(el); const r = el.getBoundingClientRect();
    return parseFloat(s.borderTopWidth) >= 4 && r.width > 250 && r.width < 460 && r.height > 420 && r.top > 40;
  }).map((el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return { el, x: r.x, y: r.y, w: r.width, h: r.height, bg: s.backgroundColor }; });
  const p = cands.sort((a,b) => b.w*b.h - a.w*a.h)[0] || null;
  const logCard = [...document.querySelectorAll('div,aside')].find((el) => /YANG MASUK KE/i.test(el.innerText || '') && (el.innerText||'').length < 500);
  const inPhone = (el) => { if (!p) return false; const r = el.getBoundingClientRect(); return r.x >= p.x - 10 && r.x + r.width <= p.x + p.w + 10 && r.y >= p.y - 10 && r.y + r.height <= p.y + p.h + 10; };
  const btns = [...document.querySelectorAll('button,a,[role=button]')].filter(inPhone).map((b) => { const r = b.getBoundingClientRect(); return { text: (b.innerText||'').trim().replace(/\\s+/g,' ').slice(0,80), x: r.x, y: r.y, w: r.width, h: r.height, disabled: b.disabled === true || b.getAttribute('aria-disabled') === 'true' }; });
  return {
    url: location.href,
    phone: p ? { x: p.x, y: p.y, w: p.w, h: p.h, bg: p.bg, text: (p.el.innerText||'').trim(), html: p.el.outerHTML } : null,
    log: logCard ? (logCard.innerText||'').trim() : null,
    logHTML: logCard ? logCard.outerHTML : null,
    buttons: btns,
    dots: p ? [...p.el.querySelectorAll('span,div')].filter((d) => { const s = getComputedStyle(d); return s.borderRadius === '9999px' && d.getBoundingClientRect().width < 12 && d.getBoundingClientRect().width > 2; }).map((d) => getComputedStyle(d).backgroundColor) : [],
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
    fs.writeFileSync(`${OUT}/ref-play2-${label}-${name}.html`, s.phone ? s.phone.html : "");
    delete s.phone.html;
    delete s.logHTML;
    await shot(cdp, `ref-play2-${label}-${name}`);
    steps.push({ name, ...s });
    console.log(label, name, "|", s.phone ? s.phone.text.replace(/\\n/g, " ⏎ ").slice(0, 300) : null);
    console.log("   log:", s.log ? s.log.replace(/\\n+/g, " ⏎ ").slice(0, 220) : null);
    console.log("   btns:", s.buttons.map((b) => b.text).join(" · "));
    return s;
  };

  const clickBtn = async (rx, opts = {}) => {
    const st = await cdp.eval(STATE);
    const norm = (t) => t.replace(/[→←✓✗]/g, "").trim().toLowerCase();
    const b = st.buttons.find((x) => !opts.includeDisabled && !x.disabled && rx.test(norm(x.text))) || st.buttons.find((x) => rx.test(norm(x.text)));
    if (!b) { console.log(label, "!! button not found:", rx); return false; }
    await clickAt(cdp, b.x + b.w / 2, b.y + b.h / 2);
    return true;
  };

  // progress bar of phone dots changes per step; also first capture
  let st = await capture("00");
  const phone = st.phone;
  await clickAt(cdp, phone.x + phone.w / 2, phone.y + phone.h * 0.55);
  await sleep(1100);
  st = await capture("01-greeting");

  await clickBtn(/^buka/); await sleep(900); st = await capture("02-story1");
  await clickBtn(/^lanjut baca/); await sleep(800); await capture("03-story2");
  await clickBtn(/^lanjut baca/); await sleep(800); await capture("04-story3");
  await clickBtn(/^lanjut baca/); await sleep(800); await capture("05-story4");
  await clickBtn(/^selesai baca/); await sleep(900); await capture("06-photo");
  // try photo swipe + next photo
  const fotoLain = (await cdp.eval(STATE)).buttons.find((b) => /foto lain/i.test(b.text));
  if (fotoLain) { await clickAt(cdp, fotoLain.x + fotoLain.w / 2, fotoLain.y + fotoLain.h / 2); await sleep(700); await capture("06b-photo2"); }
  // drag photo to simulate swipe
  const dragTarget = (await cdp.eval(STATE)).phone;
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: dragTarget.x + dragTarget.w * 0.62, y: dragTarget.y + dragTarget.h * 0.42 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: dragTarget.x + dragTarget.w * 0.62, y: dragTarget.y + dragTarget.h * 0.42, button: "left", clickCount: 1 });
  for (let i = 1; i <= 8; i++) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: dragTarget.x + dragTarget.w * (0.62 - i * 0.05), y: dragTarget.y + dragTarget.h * 0.42, button: "left", buttons: 1 });
    await sleep(30);
  }
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: dragTarget.x + dragTarget.w * 0.22, y: dragTarget.y + dragTarget.h * 0.42, button: "left", clickCount: 1 });
  await sleep(900);
  await capture("06c-after-drag");
  await clickBtn(/^lanjut/); await sleep(900); st = await capture("07-quiz1");

  // Q1: choose wrong then right? choose correct Kopi susu
  await clickBtn(/^kopi susu/); await sleep(900); await capture("07b-quiz1-answered");
  await clickBtn(/^(soal berikutnya|berikutnya)/); await sleep(900); await capture("08-quiz2");
  await clickBtn(/^grup kelas/); await sleep(900); await capture("08b-quiz2-answered");
  await clickBtn(/^(lihat skor|skor)/); await sleep(900); await capture("09-score");

  // continue with a generic loop, excluding answered/disabled elements
  let n = 10;
  while (n <= 22) {
    const s = await cdp.eval(STATE);
    const usable = s.buttons.filter((b) => !b.disabled && !/[✓✗]/.test(b.text) && !/lewati/i.test(b.text));
    const priority = (b) => {
      const t = b.text.toLowerCase();
      if (/ya|iya/.test(t)) return 1;
      if (/lanjut|selesai|tutup|selanjutnya|next|lihat/.test(t)) return 0;
      if (/simpan|unduh|bagikan/.test(t)) return 3;
      if (/nggak|tidak/.test(t)) return 2;
      return 4;
    };
    const next = usable.sort((a, b) => priority(a) - priority(b) || b.w * b.h - a.w * a.h)[0];
    if (!next) { console.log(label, "no usable buttons at", n); break; }

    // escaping Nggak test before clicking Ya
    const nggak = s.buttons.find((b) => /nggak/i.test(b.text));
    if (nggak) {
      const moves = [];
      let current = nggak;
      for (let i = 0; i < 8; i++) {
        await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: current.x + current.w / 2, y: current.y + current.h / 2 });
        await sleep(240);
        const now = (await cdp.eval(STATE)).buttons.find((b) => /nggak/i.test(b.text));
        const r = now ? { x: Math.round(now.x), y: Math.round(now.y) } : null;
        moves.push({ attempt: i, moved: !!(r && (Math.abs(r.x - Math.round(current.x)) > 2 || Math.abs(r.y - Math.round(current.y)) > 2)), to: r });
        if (now) current = now;
      }
      steps.push({ name: "nggak-escape", moves });
      console.log(label, "Nggak escape:", JSON.stringify(moves));
      await shot(cdp, `ref-play2-${label}-nggak-escape`);
    }

    console.log(label, `click[${n}]`, JSON.stringify(next.text));
    await clickAt(cdp, next.x + next.w / 2, next.y + next.h / 2);
    await sleep(1100);
    await capture(String(n));
    n++;
    if (steps.some((s) => /final|closing/i.test(s.name))) break;
  }

  fs.writeFileSync(`${OUT}/ref-play2-${label}.json`, JSON.stringify(steps, null, 2));
  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
console.log("done-play2");
