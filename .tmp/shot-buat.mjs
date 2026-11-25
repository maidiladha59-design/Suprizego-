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

for (const [width, height, mobile, slug] of [
  [1440, 1000, false, "local-buat-desktop-03"],
  [390, 844, true, "local-buat-mobile-03"],
]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  await send("Page.navigate", { url: "http://127.0.0.1:3100/buat" });
  await new Promise((r) => setTimeout(r, 1500));
  await send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => true)", awaitPromise: true });
  await new Promise((r) => setTimeout(r, 400));
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/${slug}.png`, Buffer.from(s.result.data, "base64"));
}
console.log("ok");
ws.close();
