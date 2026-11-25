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
const evaluate = async (expression, awaitPromise = false) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise });
  return r.result.result?.value ?? r.result.exceptionDetails?.text;
};
await send("Page.enable");
await send("Runtime.enable");

async function setup(width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
  await new Promise((r) => setTimeout(r, 1600));
  await send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => true)", awaitPromise: true });
  await new Promise((r) => setTimeout(r, 300));
}

async function shot(name) {
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/${name}.png`, Buffer.from(s.result.data, "base64"));
}

const metrics = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const info = (el) => { if (!el) return null; const s = getComputedStyle(el); return { box: box(el), font: s.fontSize + "/" + s.lineHeight + " " + s.fontWeight, bg: s.backgroundColor, radius: s.borderTopLeftRadius, border: s.borderTopWidth, shadow: s.boxShadow, pad: s.padding }; };
  const h1 = document.querySelector("h1");
  const cards = [...document.querySelectorAll("main section")];
  const aside = document.querySelector("aside");
  const phone = aside?.querySelector("div.mx-auto");
  const inputs = [...document.querySelectorAll("main input")];
  const details = document.querySelector("main details");
  return {
    header: info(document.querySelector("header")),
    headerInner: info(document.querySelector("header > div")),
    h1: { text: h1?.textContent, ...info(h1) },
    sub: info(h1?.parentElement?.querySelector("p")),
    cards: cards.map(c => info(c)),
    sectionTitles: [...document.querySelectorAll("main h2")].map(h => ({ t: h.textContent, f: getComputedStyle(h).fontSize + "/" + getComputedStyle(h).lineHeight })),
    designs: [...document.querySelectorAll("[role=group] button")].map(b => ({ t: b.textContent.trim().replace(/\\s+/g, " "), pressed: b.getAttribute("aria-pressed"), ...info(b) })),
    inputs: inputs.map(i => ({ type: i.type, value: i.value, max: i.maxLength, ...info(i) })),
    aside: aside ? box(aside) : null,
    previewLabel: aside ? info(aside.querySelector("p")) : null,
    phone: phone ? box(phone) : null,
    reset: aside ? info(aside.querySelector("button")) : null,
    screenBg: aside ? (() => { const el = aside.querySelector('div[style*="background-color"]'); return el ? getComputedStyle(el).backgroundColor : null; })() : null,
    details: details ? { open: details.open, box: box(details) } : null,
    docH: document.documentElement.scrollHeight,
  };
})()`;

const setInputs = `(() => {
  const set = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(el, v);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const inputs = [...document.querySelectorAll("main input")];
  set(inputs[0], "Raka");
  set(inputs[1], "Dinda");
  set(inputs[3], "Mau jadi pacarku?");
  return inputs.map(i => i.value);
})()`;

const desktopInitial = await (async () => {
  await setup(1440, 1000, false);
  await evaluate("localStorage.clear()");
  await send("Page.reload");
  await new Promise((r) => setTimeout(r, 1500));
  await shot("local-editor-desktop-01");
  return evaluate(metrics);
})();

const afterType = await evaluate(setInputs);
await new Promise((r) => setTimeout(r, 300));
await evaluate(`document.querySelectorAll("[role=group] button")[1].click()`);
await new Promise((r) => setTimeout(r, 400));
const afterDesign = await evaluate(metrics);
const previewName = await evaluate(`document.querySelector("aside p.break-words")?.textContent`);
const previewSender = await evaluate(`[...document.querySelectorAll("aside p")].find(p => p.textContent.includes("dari "))?.textContent`);
await shot("local-editor-desktop-02");

await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await new Promise((r) => setTimeout(r, 1400));
const persisted = await evaluate(`({ values: [...document.querySelectorAll("main input")].map(i => i.value), pressed: [...document.querySelectorAll("[role=group] button")].map(b => b.getAttribute("aria-pressed")) })`);

await setup(390, 844, true);
await evaluate("localStorage.clear()");
await send("Page.reload");
await new Promise((r) => setTimeout(r, 1400));
const mobileInitial = await evaluate(metrics);
await shot("local-editor-mobile-01");
await evaluate(`document.querySelector("main details summary").click()`);
await new Promise((r) => setTimeout(r, 400));
await evaluate(`document.querySelector("main details").scrollIntoView({ block: "start" })`);
await new Promise((r) => setTimeout(r, 300));
const mobileOpen = await evaluate(metrics);
await shot("local-editor-mobile-02");

const buatHrefs = await (async () => {
  await send("Page.navigate", { url: "http://127.0.0.1:3100/buat" });
  await new Promise((r) => setTimeout(r, 1200));
  return evaluate(`[...document.querySelectorAll("main a")].map(a => a.getAttribute("href"))`);
})();

console.log(JSON.stringify({
  desktop: {
    header: desktopInitial.header?.box,
    h1: { text: desktopInitial.h1.text, box: desktopInitial.h1.box, font: desktopInitial.h1.font },
    subFont: desktopInitial.sub?.font,
    cards: desktopInitial.cards,
    sectionTitles: desktopInitial.sectionTitles,
    designs: desktopInitial.designs.map(d => ({ t: d.t.slice(0, 30), pressed: d.pressed, box: d.box })),
    inputs: desktopInitial.inputs.map(i => ({ type: i.type, box: i.box, font: i.font, border: i.border, radius: i.radius })),
    aside: desktopInitial.aside,
    phone: desktopInitial.phone,
    previewLabel: desktopInitial.previewLabel?.font,
    reset: desktopInitial.reset?.box,
  },
  interactions: {
    typed: afterType,
    previewName,
    previewSender,
    designPressed: afterDesign.designs.map(d => d.pressed),
    screenBgAfterDesign: afterDesign.screenBg,
    persisted,
  },
  mobile: {
    h1: { box: mobileInitial.h1.box, font: mobileInitial.h1.font },
    subFont: mobileInitial.sub?.font,
    cards: mobileInitial.cards,
    designs: mobileInitial.designs.map(d => d.box),
    inputs: mobileInitial.inputs.slice(0, 2).map(i => i.box),
    aside: mobileInitial.aside,
    details: mobileInitial.details,
    openDetails: mobileOpen.details,
    openPhone: mobileOpen.phone,
  },
  buatHrefs,
}, null, 2));
ws.close();
