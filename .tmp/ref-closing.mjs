import fs from "node:fs";

const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const DL = `${OUT}/ref-downloads`;
fs.mkdirSync(DL, { recursive: true });
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
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: !!full });
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
  const inPhone = (el) => { if (!p) return false; const r = el.getBoundingClientRect(); return r.x >= p.x - 10 && r.x + r.width <= p.x + p.w + 10 && r.y >= p.y - 10 && r.y + r.height <= p.y + p.h + 10; };
  const btns = [...document.querySelectorAll('button,a,[role=button]')].filter(inPhone).map((b) => { const r = b.getBoundingClientRect(); return { text: (b.innerText||'').trim().replace(/\\s+/g,' ').slice(0,80), x: r.x, y: r.y, w: r.width, h: r.height, disabled: b.disabled === true }; });
  const logCard = [...document.querySelectorAll('div,aside')].find((el) => /YANG MASUK KE/i.test(el.innerText || '') && (el.innerText||'').length < 700);
  const items = logCard ? [...logCard.querySelectorAll('li,div')].filter((el) => /👀|🎮|💌|💬|✅|🎉/.test(el.innerText || '') && (el.innerText||'').trim().length < 120) : [];
  return {
    url: location.href,
    phone: p ? { x: p.x, y: p.y, w: p.w, h: p.h, bg: p.bg, text: (p.el.innerText||'').trim(), html: p.el.outerHTML.slice(0, 6000) } : null,
    log: logCard ? (logCard.innerText||'').trim() : null,
    logItems: items.map((el) => ({ text: (el.innerText||'').trim().replace(/\\s+/g,' '), html: el.outerHTML.slice(0, 700) })),
    buttons: btns,
  };
})()`;

async function nextStep(cdp, steps, label, name, wait = 900) {
  await sleep(wait);
  const s = await cdp.eval(STATE);
  await shot(cdp, `ref-close-${label}-${name}`);
  steps.push({ name, ...s });
  console.log(label, name, "|", s.phone ? s.phone.text.replace(/\\n/g, " ⏎ ").slice(0, 280) : null);
  console.log("   btns:", s.buttons.map((b) => b.text).join(" · "));
  return s;
}

async function run(label, vp) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.mobile });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (vp.mobile) await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  try { await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: DL.replace(/\//g, "\\") }); } catch {}
  try { await cdp.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: DL.replace(/\//g, "\\") }); } catch {}
  await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
  await sleep(6000);

  const steps = [];
  const clickBtn = async (rx) => {
    const st = await cdp.eval(STATE);
    const norm = (t) => t.replace(/[→←✓✗]/g, "").trim().toLowerCase();
    const b = st.buttons.find((x) => !x.disabled && rx.test(norm(x.text)));
    if (!b) { console.log(label, "!! not found", rx); return false; }
    await clickAt(cdp, b.x + b.w / 2, b.y + b.h / 2);
    return true;
  };

  const s0 = await nextStep(cdp, steps, label, "00", 100);
  await clickAt(cdp, s0.phone.x + s0.phone.w / 2, s0.phone.y + s0.phone.h * 0.55);
  await nextStep(cdp, steps, label, "01-greeting");
  await clickBtn(/^buka/); await nextStep(cdp, steps, label, "02-story1", 700);
  await clickBtn(/^lanjut baca/); await nextStep(cdp, steps, label, "03", 500);
  await clickBtn(/^lanjut baca/); await nextStep(cdp, steps, label, "04", 500);
  await clickBtn(/^lanjut baca/); await nextStep(cdp, steps, label, "05", 500);
  await clickBtn(/^selesai baca/); await nextStep(cdp, steps, label, "06-photo", 700);
  await clickBtn(/^lanjut/); await nextStep(cdp, steps, label, "07-quiz", 700);
  await clickBtn(/^kopi susu/); await nextStep(cdp, steps, label, "07b-quiz-answered", 600);
  await clickBtn(/^soal berikutnya/); await nextStep(cdp, steps, label, "08-quiz2", 600);
  await clickBtn(/^grup kelas/); await nextStep(cdp, steps, label, "08b-answered", 600);
  await clickBtn(/^lihat skor/); await nextStep(cdp, steps, label, "09-score", 600);
  await clickBtn(/^game berikutnya/); await nextStep(cdp, steps, label, "10-game2", 600);
  await clickBtn(/^makan bakso/); await nextStep(cdp, steps, label, "11-ticket", 600);
  await clickBtn(/^lanjut/); await nextStep(cdp, steps, label, "12-final", 600);

  // click Nggak 6 times with rect/label tracking (moving button)
  const nggakHistory = [];
  for (let i = 0; i < 6; i++) {
    const st = await cdp.eval(STATE);
    const b = st.buttons.find((x) => !/^mau$/i.test(x.text) && !/nyala|mati/i.test(x.text));
    if (!b) break;
    nggakHistory.push({ i, text: b.text, x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h), transform: await cdp.eval(`(() => { const el = document.elementFromPoint(${b.x + b.w / 2}, ${b.y + b.h / 2}); if (!el) return null; const s = getComputedStyle(el); return { transform: s.transform, left: s.left, top: s.top, position: s.position }; })()`) });
    await shot(cdp, `ref-close-${label}-nggak-${i}`);
    await clickAt(cdp, b.x + b.w / 2, b.y + b.h / 2);
    await sleep(700);
  }
  console.log(label, "nggakHistory:", JSON.stringify(nggakHistory));
  steps.push({ name: "nggak-history", nggakHistory });

  // now accept
  await clickBtn(/^mau$/);
  const closing = await nextStep(cdp, steps, label, "13-closing", 1400);
  await sleep(1200);
  await shot(cdp, `ref-close-${label}-13b-closing-late`);
  // dump closing html
  const html = await cdp.eval(`(() => {
    const cands = [...document.querySelectorAll('div,section,article')].filter((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return parseFloat(s.borderTopWidth) >= 4 && r.width > 250 && r.width < 460 && r.height > 420 && r.top > 40; });
    const p = cands.sort((a,b) => b.getBoundingClientRect().width*b.getBoundingClientRect().height - a.getBoundingClientRect().width*a.getBoundingClientRect().height)[0];
    return p ? p.outerHTML : '';
  })()`);
  fs.writeFileSync(`${OUT}/ref-close-${label}-closing.html`, html);

  // save as image
  const saveBtn = (await cdp.eval(STATE)).buttons.find((b) => /simpan|unduh|gambar|share|bagikan/i.test(b.text));
  if (saveBtn) {
    console.log(label, "save image button:", saveBtn.text);
    await shot(cdp, `ref-close-${label}-14-save-before`);
    await clickAt(cdp, saveBtn.x + saveBtn.w / 2, saveBtn.y + saveBtn.h / 2);
    await sleep(2500);
    await shot(cdp, `ref-close-${label}-14-save-after`);
    const s = await cdp.eval(STATE);
    steps.push({ name: "after-save", ...s });
    console.log(label, "after-save texts:", s.phone ? s.phone.text.replace(/\n/g, " ⏎ ").slice(0, 400) : null);
  }
  fs.writeFileSync(`${OUT}/ref-close-${label}.json`, JSON.stringify(steps, null, 2));

  // theme toggles: reset then click PERMEN PINK / CHAT MALAM
  for (const t of ["ULANG", "PERMEN PINK", "CHAT MALAM"]) {
    const st = await cdp.eval(STATE);
    const b = st.buttons.find((x) => x.text.toLowerCase() === t.toLowerCase()) || null;
    if (!b) { console.log(label, "toggle not found", t); continue; }
    await clickAt(cdp, b.x + b.w / 2, b.y + b.h / 2);
    await sleep(1200);
    const s = await nextStep(cdp, steps, label, `toggle-${t.toLowerCase().replace(/\s+/g, "-")}`, 300);
    console.log(label, "toggle", t, "-> phone:", s.phone ? s.phone.text.replace(/\n/g, " ⏎ ").slice(0, 200) : null);
  }

  cdp.close();
}

await run("desktop", { w: 1440, h: 1000, mobile: false });
const files = fs.readdirSync(DL);
console.log("downloads:", files.map((f) => `${f} (${fs.statSync(`${DL}/${f}`).size}b)`).join(", ") || "none");
console.log("done-close");
