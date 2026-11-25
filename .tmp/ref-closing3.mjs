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
  const inPhone = (el) => { if (!p) return false; const r = el.getBoundingClientRect(); return r.x >= p.x - 10 && r.x + r.width <= p.x + p.w + 10 && r.y >= p.y - 10 && r.y + r.height <= p.y + p.h + 10; };
  const btns = [...document.querySelectorAll('button,a,[role=button]')].filter(inPhone).map((b) => { const r = b.getBoundingClientRect(); return { text: (b.innerText||'').trim().replace(/\\s+/g,' ').slice(0,80), x: r.x, y: r.y, w: r.width, h: r.height }; });
  const all = [...document.querySelectorAll('button')].map((b) => { const r = b.getBoundingClientRect(); return { text: (b.innerText||'').trim().replace(/\\s+/g,' ').slice(0,40), x: r.x, y: r.y, w: r.width, h: r.height }; });
  return { phone: p ? { x: p.x, y: p.y, w: p.w, h: p.h, bg: p.bg, text: (p.el.innerText||'').trim(), html: p.el.outerHTML } : null, buttons: btns, all, scrollY };
})()`;

async function flow(cdp) {
  const clickInPhone = async (rx) => {
    const st = await cdp.eval(STATE);
    const b = st.buttons.find((x) => rx.test(x.text.replace(/[→←✓✗]/g, "").trim().toLowerCase()));
    if (!b) { console.log("  !!missing", rx); return false; }
    await clickAt(cdp, b.x + b.w / 2, b.y + b.h / 2);
    return true;
  };
  let st = await cdp.eval(STATE);
  await clickAt(cdp, st.phone.x + st.phone.w / 2, st.phone.y + st.phone.h * 0.55);
  await sleep(900); await clickInPhone(/^buka$/); await sleep(800);
  for (let i = 0; i < 3; i++) { await clickInPhone(/^lanjut baca$/); await sleep(600); }
  await clickInPhone(/^selesai baca$/); await sleep(700);
  await clickInPhone(/^lanjut$/); await sleep(700);
  await clickInPhone(/^kopi susu$/); await sleep(700);
  await clickInPhone(/^soal berikutnya$/); await sleep(600);
  await clickInPhone(/^grup kelas$/); await sleep(700);
  await clickInPhone(/^lihat skor$/); await sleep(600);
  await clickInPhone(/^game berikutnya$/); await sleep(600);
  await clickInPhone(/^makan bakso$/); await sleep(700);
  await clickInPhone(/^lanjut$/); await sleep(700);
  await clickInPhone(/^mau$/); await sleep(1000);
  await clickInPhone(/^lanjut$/); await sleep(1200); // -> letter
  await clickInPhone(/^lanjut$/); await sleep(1600); // -> final closing
}

async function run() {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  try { await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: DL.replace(/\//g, "\\") }); } catch {}
  await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
  await sleep(6000);
  await cdp.eval(`scrollTo(0,0)`);
  await flow(cdp);
  await shot(cdp, "ref-final3-01-closing");
  let st = await cdp.eval(STATE);
  fs.writeFileSync(`${OUT}/ref-final3-closing.html`, st.phone ? st.phone.html : "");
  console.log("closing text:", st.phone ? st.phone.text.replace(/\n/g, " ⏎ ") : null);
  console.log("closing btns:", st.buttons.map((b) => b.text).join(" · "));

  // click through remaining screens
  for (let i = 2; i <= 6; i++) {
    const b = st.buttons.find((x) => /^(lanjut|selesai|tutup|mulai lagi|lihat lagi)$/i.test(x.text.replace(/[→←]/g, "").trim()));
    if (!b) break;
    console.log(`step${i} clicking`, b.text);
    await clickAt(cdp, b.x + b.w / 2, b.y + b.h / 2);
    await sleep(1700);
    st = await cdp.eval(STATE);
    await shot(cdp, `ref-final3-0${i}`);
    console.log(`step${i} text:`, st.phone ? st.phone.text.replace(/\n/g, " ⏎ ").slice(0, 500) : null);
    console.log(`step${i} btns:`, st.buttons.map((x) => x.text).join(" · "));
    fs.writeFileSync(`${OUT}/ref-final3-step${i}.html`, st.phone ? st.phone.html : "");
  }
  await sleep(1500);
  await shot(cdp, "ref-final3-07-late");
  st = await cdp.eval(STATE);

  // try save/share anywhere on page
  const save = st.buttons.find((b) => /simpan|unduh|gambar|share|bagikan|download|cetak/i.test(b.text)) || st.all.find((b) => /simpan|unduh|gambar|share|bagikan|download|cetak/i.test(b.text));
  if (save) {
    console.log("saving via", save.text);
    await clickAt(cdp, save.x + save.w / 2, save.y + save.h / 2);
    await sleep(3500);
    await shot(cdp, "ref-final3-08-after-save");
    st = await cdp.eval(STATE);
    console.log("after save text:", st.phone ? st.phone.text.replace(/\n/g, " ⏎ ").slice(0, 400) : null);
  } else console.log("no save button");

  // toggles, scroll enough to bring them up
  await cdp.eval(`scrollTo(0, 120)`);
  await sleep(500);
  st = await cdp.eval(STATE);
  for (const t of ["ULANG", "PERMEN PINK", "CHAT MALAM"]) {
    const now = await cdp.eval(STATE);
    const b = now.all.find((x) => x.text.toUpperCase() === t);
    if (!b) { console.log("toggle missing", t); continue; }
    console.log("toggle click", t, JSON.stringify({ x: b.x, y: b.y }));
    await clickAt(cdp, b.x + b.w / 2, b.y + b.h / 2);
    await sleep(1500);
    const s = await cdp.eval(STATE);
    await shot(cdp, `ref-final3-09-${t.toLowerCase().replace(/\s+/g, "-")}`);
    console.log("after", t, "->", s.phone ? s.phone.text.replace(/\n/g, " ⏎ ").slice(0, 220) : null, "| bg", s.phone?.bg);
  }
  console.log("downloads:", fs.readdirSync(DL).map((f) => `${f} (${fs.statSync(`${DL}/${f}`).size}b)`).join(", ") || "none");
  cdp.close();
}

await run();
console.log("done-final3");
