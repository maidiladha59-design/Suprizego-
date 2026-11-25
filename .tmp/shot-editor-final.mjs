import { writeFileSync } from "node:fs";

const t = await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" }).then((r) => r.json());
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

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const designs = [...document.querySelectorAll("[role=group] button")].map(b => box(b));
  const aside = document.querySelector("aside");
  return {
    h1: box(document.querySelector("h1")),
    card1: box(document.querySelector("main section")),
    designs,
    inputs: [...document.querySelectorAll("main input")].slice(0, 2).map(i => box(i)),
    aside: box(aside),
    phone: box(aside?.querySelector("div.mx-auto")),
    details: box(document.querySelector("main details")),
    footer: document.querySelector("footer") ? box(document.querySelector("footer")) : null,
  };
})()`;

const out = {};
for (const [w, h, mobile, slug] of [
  [1440, 1000, false, "desktop"],
  [390, 844, true, "mobile"],
]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile, screenWidth: w, screenHeight: h });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
  await new Promise((r) => setTimeout(r, 1500));
  await send("Runtime.evaluate", { expression: "localStorage.clear()" });
  await send("Page.reload");
  await new Promise((r) => setTimeout(r, 1500));
  await send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => true)", awaitPromise: true });
  await new Promise((r) => setTimeout(r, 300));
  const m = await send("Runtime.evaluate", { expression: measure, returnByValue: true });
  out[slug] = m.result.result.value;
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/local-editor-final-${slug}.png`, Buffer.from(s.result.data, "base64"));
}
console.log(JSON.stringify(out, null, 2));
ws.close();
