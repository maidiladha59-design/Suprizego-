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

const probe = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const info = (el) => { if (!el) return null; const s = getComputedStyle(el); return { box: box(el), bg: s.backgroundColor, radius: s.borderTopLeftRadius, border: s.borderTopWidth, shadow: s.boxShadow, pad: s.padding, font: s.fontSize + "/" + s.lineHeight + " " + s.fontWeight, cls: (el.className || "").toString().slice(0, 140) }; };
  const byText = (sel, text) => [...document.querySelectorAll(sel)].find(e => e.textContent.trim().toUpperCase().startsWith(text));
  const h1 = document.querySelector("h1");
  const h1wrap = h1?.parentElement;
  const secTitle = byText("h2", "PILIH DESAIN");
  let card = secTitle; while (card && !(card.className || "").toString().includes("border")) card = card.parentElement;
  const secTitle2 = byText("h2", "SIAPA KE SIAPA");
  let card2 = secTitle2; while (card2 && !(card2.className || "").toString().includes("border")) card2 = card2.parentElement;
  const previewLabel = byText("p, div, span, h2, h3", "PRATINJAU LANGSUNG");
  const previewWrap = previewLabel?.parentElement;
  const phone = previewWrap?.querySelector("div:nth-child(2)") || previewWrap?.children?.[1];
  const design = byText("button", "PERMEN PINK");
  const design2 = byText("button", "CHAT MALAM");
  const reset = byText("button", "ULANGI DARI AWAL");
  const ganti = byText("a", "GANTI MOMEN");
  const inputs = [...document.querySelectorAll("input[type=text], input[type=date]")].slice(0, 4).map(i => ({ ph: i.placeholder, max: i.maxLength, info: info(i) }));
  const labels = [...document.querySelectorAll("label")].slice(0, 4).map(l => ({ t: l.textContent.trim().slice(0, 60), info: info(l) }));
  return {
    url: location.href,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    header: info(document.querySelector("header")),
    headerInner: info(document.querySelector("header > div")),
    ganti: info(ganti),
    main: info(document.querySelector("main")),
    leftCol: info(h1wrap),
    h1: info(h1),
    h1Text: h1?.textContent,
    sub: info(h1wrap?.querySelector("p")),
    previewLabel: info(previewLabel),
    previewWrap: info(previewWrap),
    phone: info(phone),
    reset: info(reset),
    card1: info(card),
    secTitle: info(secTitle),
    design1: info(design),
    design2: info(design2),
    card2: info(card2),
    secTitle2: info(secTitle2),
    inputs, labels,
    footer: info(document.querySelector("footer")),
    docH: document.documentElement.scrollHeight,
  };
})()`;

async function run(width, height, mobile, slug) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile, screenWidth: width, screenHeight: height });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  await send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
  await new Promise((r) => setTimeout(r, 3500));
  await send("Runtime.evaluate", { expression: "window.scrollTo(0,0)" });
  const res = await send("Runtime.evaluate", { expression: probe, returnByValue: true });
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/ref-wizard-${slug}-shell.png`, Buffer.from(shot.result.data, "base64"));
  if (mobile) {
    await send("Runtime.evaluate", { expression: "window.scrollTo(0, 700)" });
    await new Promise((r) => setTimeout(r, 400));
    const s2 = await send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/ref-wizard-${slug}-scroll.png`, Buffer.from(s2.result.data, "base64"));
  }
  return res.result.result.value;
}

const desktop = await run(1440, 1000, false, "desktop");
const mobile = await run(390, 844, true, "mobile");
console.log(JSON.stringify({ desktop, mobile }, null, 2));
ws.close();
