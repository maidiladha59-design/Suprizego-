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
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true });
  return r.result.result?.value ?? r.result.exceptionDetails?.text;
};
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await new Promise((r) => setTimeout(r, 3500));

const fill = `(() => {
  const set = (el, v) => {
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const inputs = [...document.querySelectorAll("main input, body input")].filter(i => i.type === "text");
  if (inputs[0]) set(inputs[0], "Raka");
  if (inputs[1]) set(inputs[1], "Dinda");
  const tas = [...document.querySelectorAll("textarea")].filter(t => t.maxLength === 180);
  const story = [
    "Aku suka kamu. Bukan cuma karena kamu lucu, tapi karena kamu bikin hari biasa jadi nggak biasa.",
    "Udah lama aku nyimpen ini. Tiap mau bilang, ujungnya cuma senyum-senyum sendiri.",
    "Kalau kamu mau, aku siap jalan pelan-pelan bareng kamu.",
    "Aku nggak minta jawaban sekarang. Aku cuma pengin kamu tahu.",
  ];
  tas.forEach((t, i) => { if (story[i]) set(t, story[i]); });
  return tas.map(t => t.value);
})()`;
const filled = await evaluate(fill);
await new Promise((r) => setTimeout(r, 800));

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const info = (el) => { if (!el) return null; const s = getComputedStyle(el); return { box: box(el), bg: s.backgroundColor, radius: s.borderTopLeftRadius, border: s.borderTopWidth, shadow: s.boxShadow, font: s.fontSize + "/" + s.lineHeight + " " + s.fontWeight, pad: s.padding, cls: (el.className || "").toString().slice(0, 120) }; };
  const sec = [...document.querySelectorAll("h2")].find(h => h.textContent.trim().toUpperCase().startsWith("CERITAMU"));
  let card = sec; while (card && !(card.className || "").toString().includes("border")) card = card.parentElement;
  const next = sec?.nextElementSibling;
  const tas = [...document.querySelectorAll("textarea")].filter(t => t.maxLength === 180);
  const del = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "×");
  const add = [...document.querySelectorAll("button")].find(b => b.textContent.trim().toUpperCase().includes("TAMBAH KARTU"));
  const contoh = [...document.querySelectorAll("button")].find(b => b.textContent.trim().toUpperCase().includes("CONTOH ISI"));
  const preview = document.querySelector('.sticky.top-24');
  const phone = preview?.querySelector("div");
  return {
    sectionTitle: info(sec),
    card: info(card),
    subtitles: next ? [...next.children].map(c => ({ tag: c.tagName, text: c.textContent.trim().slice(0, 90), info: info(c) })) : [],
    textareas: tas.map(t => ({ max: t.maxLength, value: t.value.slice(0, 40), ...info(t) })),
    del: info(del),
    add: info(add),
    contoh: info(contoh),
    previewText: preview ? preview.innerText.slice(0, 600) : null,
    previewBox: box(preview),
    scrollY: window.scrollY,
  };
})()`;
const desk = await evaluate(`document.querySelectorAll("textarea")[1]?.scrollIntoView({ block: "center" }), true`).then(async () => {
  await new Promise((r) => setTimeout(r, 500));
  return evaluate(measure);
});
const s = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/ref-story-desktop.png", Buffer.from(s.result.data, "base64"));

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await new Promise((r) => setTimeout(r, 3000));
const mob = await evaluate(`(() => {
  const sec = [...document.querySelectorAll("h2")].find(h => h.textContent.trim().toUpperCase().startsWith("CERITAMU"));
  sec?.scrollIntoView({ block: "start" });
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const tas = [...document.querySelectorAll("textarea")].filter(t => t.maxLength === 180);
  const del = [...document.querySelectorAll("button")].find(b => b.textContent.trim() === "×");
  return { title: box(sec), textareas: tas.map(t => box(t)), del: box(del), docH: document.documentElement.scrollHeight };
})()`);
await new Promise((r) => setTimeout(r, 500));
const s2 = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/ref-story-mobile.png", Buffer.from(s2.result.data, "base64"));

console.log(JSON.stringify({ filledCount: filled.length, desktop: desk, mobile: mob }, null, 2));
ws.close();
