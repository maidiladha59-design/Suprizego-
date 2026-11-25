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
await send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await new Promise((r) => setTimeout(r, 4000));

const res = await send("Runtime.evaluate", {
  expression: `(() => {
    const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); const s = getComputedStyle(el); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bg: s.backgroundColor, radius: s.borderTopLeftRadius, border: s.borderTopWidth + " " + s.borderTopColor, shadow: s.boxShadow, font: s.fontSize + "/" + s.lineHeight + " " + s.fontWeight, pad: s.padding }; };
    const main = document.querySelector("main");
    const h1 = document.querySelector("h1");
    const h2 = document.querySelector("h2");
    const inputs = [...document.querySelectorAll("input, textarea, select")].map(i => ({ tag: i.tagName, type: i.type, name: i.name, ph: i.placeholder, max: i.maxLength, box: box(i) }));
    const buttons = [...document.querySelectorAll("button, a[role=button]")].map(b => ({ text: b.textContent.trim().replace(/\\s+/g, " ").slice(0, 40), box: box(b) }));
    const labels = [...document.querySelectorAll("label")].map(l => l.textContent.trim().replace(/\\s+/g, " ").slice(0, 80));
    const steps = [...document.querySelectorAll("[class*=step], [class*=progress]")].map(e => ({ cls: e.className.slice(0, 100), text: e.textContent.trim().replace(/\\s+/g, " ").slice(0, 60) })).slice(0, 12);
    return {
      url: location.href, title: document.title,
      main: box(main), h1: { text: h1?.textContent, box: box(h1) }, h2: { text: h2?.textContent, box: box(h2) },
      inputs, buttons, labels, steps,
      bodyText: document.body.innerText.slice(0, 1500),
    };
  })()`,
  returnByValue: true,
});
const shot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/ref-wizard-confess.png", Buffer.from(shot.result.data, "base64"));
console.log(JSON.stringify(res.result.result.value, null, 2));
ws.close();
