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
  return { phone: p ? { x: p.x, y: p.y, w: p.w, h: p.h, bg: p.bg, text: (p.el.innerText||'').trim() } : null,
    all: [...document.querySelectorAll('button,a')].map((b) => { const r = b.getBoundingClientRect(); return { tag: b.tagName, text: (b.innerText||'').trim().replace(/\\s+/g,' ').slice(0,60), href: b.getAttribute('href'), x: r.x, y: r.y, w: r.width, h: r.height }; }).filter((b) => b.w > 0),
    scrollY, scrollH: document.documentElement.scrollHeight };
})()`;

async function flow(cdp) {
  const clickInPhone = async (rx) => {
    const st = await cdp.eval(STATE);
    const b = st.all.find((x) => { const r = x; return r.x >= st.phone.x - 10 && r.x + r.w <= st.phone.x + st.phone.w + 10 && r.y >= st.phone.y - 10 && r.y + r.h <= st.phone.y + st.phone.h + 10; });
    const candidates = st.all.filter((x) => x.x >= st.phone.x - 10 && x.x + x.w <= st.phone.x + st.phone.w + 10 && x.y >= st.phone.y - 10 && x.y + x.h <= st.phone.y + st.phone.h + 10);
    const t = candidates.find((x) => rx.test(x.text.replace(/[→←✓✗]/g, "").trim().toLowerCase()));
    if (!t) { console.log("  !!missing", rx, "have:", candidates.map((c) => c.text).join("|")); return false; }
    await clickAt(cdp, t.x + t.w / 2, t.y + t.h / 2);
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
  await clickInPhone(/^lanjut$/); await sleep(1200);
  await clickInPhone(/^lanjut$/); await sleep(1600);
}

async function run() {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); await cdp.send("Page.bringToFront");
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  try { await cdp.send("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: DL.replace(/\//g, "\\") }); } catch {}
  await cdp.send("Page.navigate", { url: "https://proposigo.app/" });
  await sleep(6000);
  await cdp.eval(`scrollTo(0,0)`);
  await flow(cdp);
  await cdp.eval(`scrollTo(0, 420)`);
  await sleep(600);
  let st = await cdp.eval(STATE);
  await shot(cdp, "ref-share-01-scrolled");
  console.log("share-ish buttons:", JSON.stringify(st.all.filter((b) => /bagikan|simpan|bikin juga|ulang/i.test(b.text)).map((b) => ({ text: b.text, href: b.href, rect: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) } })), null, 2));

  const save = st.all.find((b) => /simpan jadi gambar/i.test(b.text));
  if (save) {
    console.log("clicking save", JSON.stringify({ x: save.x, y: save.y }));
    await clickAt(cdp, save.x + save.w / 2, save.y + save.h / 2);
    await sleep(4000);
    await shot(cdp, "ref-share-02-after-save");
  }
  console.log("downloads:", fs.readdirSync(DL).map((f) => `${f} (${fs.statSync(`${DL}/${f}`).size}b)`).join(", ") || "none");

  const build = (await cdp.eval(STATE)).all.find((b) => /bikin juga|bikin halaman/i.test(b.text) && b.href);
  if (build) console.log("build-link:", build.text, build.href);

  // demo variant buttons: PERMEN PINK / CHAT MALAM / ULANG and compare first story lines
  for (const t of ["ULANG", "PERMEN PINK", "CHAT MALAM"]) {
    const now = await cdp.eval(STATE);
    const b = now.all.find((x) => x.text.toUpperCase() === t);
    if (!b) { console.log("missing toggle", t); continue; }
    console.log("toggle", t, "at", Math.round(b.x), Math.round(b.y));
    await clickAt(cdp, b.x + b.w / 2, b.y + b.h / 2);
    await sleep(1200);
    const s1 = await cdp.eval(STATE);
    // open envelope then greeting + first story for this variant
    if (s1.phone) {
      await clickAt(cdp, s1.phone.x + s1.phone.w / 2, s1.phone.y + s1.phone.h * 0.55);
      await sleep(900);
      const greet = (await cdp.eval(STATE)).phone;
      console.log(t, "greeting:", greet ? greet.text.replace(/\n/g, " ⏎ ").slice(0, 200) : null);
      await shot(cdp, `ref-share-03-${t.toLowerCase().replace(/\s+/g, "-")}-greeting`);
    }
  }
  cdp.close();
}

await run();
console.log("done-share");
