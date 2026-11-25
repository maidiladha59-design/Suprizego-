import { writeFileSync } from "node:fs";

const base = "http://127.0.0.1:9222";
const outDir = "C:/Users/User/Documents/SuprizeGo/.tmp";
const t = await fetch(`${base}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
await new Promise((res) => (ws.onopen = res));
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
await send("Page.enable");
await send("Runtime.enable");

async function go(url, width, height, mobile, slug, shot) {
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height,
  });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  await send("Page.navigate", { url });
  await new Promise((r) => setTimeout(r, 1500));
  await send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => true)", awaitPromise: true });
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, document.body.scrollHeight)" });
  await new Promise((r) => setTimeout(r, 400));
  if (shot) {
    const s = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    writeFileSync(`${outDir}/${slug}.png`, Buffer.from(s.result.data, "base64"));
  }
  const res = await send("Runtime.evaluate", {
    expression: `(() => {
      const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
      const main = document.querySelector("main");
      const h1 = main?.querySelector("h1");
      const sub = h1?.nextElementSibling;
      const grid = main?.querySelector("div");
      const links = [...document.querySelectorAll("header a, main a, footer a")].map(a => ({ t: a.textContent.trim().replace(/\\s+/g, " ").slice(0, 32), h: a.getAttribute("href") })).filter(l => l.h);
      return {
        h1: h1?.textContent,
        h1Box: box(h1),
        sub: sub?.textContent,
        subBox: box(sub),
        grid: box(grid),
        rows: [...(grid?.children ?? [])].map(c => box(c)),
        sticker: box(document.querySelector("main a > span")),
        footerTop: Math.round(document.querySelector("footer")?.getBoundingClientRect().top ?? -1),
        links,
      };
    })()`,
    returnByValue: true,
  });
  return res.result.result.value;
}

const desktop = await go("http://127.0.0.1:3100/buat", 1440, 1000, false, "local-buat-desktop-02", true);
const mobile = await go("http://127.0.0.1:3100/buat", 390, 844, true, "local-buat-mobile-02", true);
const home = await go("http://127.0.0.1:3100/", 1440, 1000, false, "local-home-links", false);
console.log(JSON.stringify({
  desktop: { h1: desktop.h1, h1Box: desktop.h1Box, sub: desktop.sub, subBox: desktop.subBox, grid: desktop.grid, rows: desktop.rows, sticker: desktop.sticker, footerTop: desktop.footerTop },
  mobile: { h1: mobile.h1, h1Box: mobile.h1Box, sub: mobile.sub, subBox: mobile.subBox, grid: mobile.grid, rows: mobile.rows, sticker: mobile.sticker, footerTop: mobile.footerTop },
  buatLinks: desktop.links.filter(l => l.t.toLowerCase().includes("bikin") || l.t === "SuprizeGo"),
  homeLinks: home.links.filter(l => ["BIKIN SEKARANG", "Buat Halaman", "Bikin sekarang", "Bikin halaman", "Pilih Basic", "Lihat Momen", "Siapkan halaman"].includes(l.t)),
}, null, 2));
ws.close();
