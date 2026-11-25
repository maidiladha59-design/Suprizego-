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
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });

await send("Page.navigate", { url: "https://proposigo.app/buat" });
await new Promise((r) => setTimeout(r, 4000));
const res = await send("Runtime.evaluate", {
  expression: `(() => ({
    url: location.href,
    title: document.title,
    h1: document.querySelector("h1")?.textContent,
    links: [...document.querySelectorAll("main a[href], main button")].map(el => ({
      tag: el.tagName,
      text: el.textContent.trim().replace(/\\s+/g, " ").slice(0, 40),
      href: el.getAttribute("href"),
    })).filter(l => l.href || l.tag === "BUTTON"),
  }))()`,
  returnByValue: true,
});
const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/ref-wizard-buat.png", Buffer.from(shot.result.data, "base64"));
console.log(JSON.stringify(res.result.result.value, null, 2));
ws.close();
