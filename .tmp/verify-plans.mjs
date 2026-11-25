import { writeFileSync } from "node:fs";

const CDP = "http://127.0.0.1:9223";
const BASE = "http://127.0.0.1:3100";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";

const t = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
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
const evaluate = async (expression, attempt = 0) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.error || !r.result) {
    if (attempt < 3) {
      await sleep(300);
      return evaluate(expression, attempt + 1);
    }
    throw new Error(JSON.stringify(r).slice(0, 300));
  }
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500));
  return r.result.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitUntil = async (expression, timeout = 20000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return true;
    await sleep(200);
  }
  return false;
};
const shot = async (name) => {
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(s.result.data, "base64"));
};

await send("Page.enable");
await send("Runtime.enable");

const measure = `(() => {
  const hero = document.querySelector("h1")?.closest("section");
  const price = document.querySelector("#harga");
  const cards = [...(price?.querySelectorAll("article") ?? [])].map(card => ({
    name: card.querySelector("h3")?.textContent,
    tagline: card.querySelector("h3")?.nextElementSibling?.textContent,
    prices: [...card.querySelectorAll("p.font-display")].map(p => p.innerText.replace(/\\s+/g, " ").trim()),
    struck: card.querySelector("s")?.textContent ?? null,
    discount: [...card.querySelectorAll(".sticker")].map(s => s.textContent.trim()),
    active: card.querySelector("span.rounded-full")?.textContent.trim() ?? null,
    features: [...card.querySelectorAll("li")].map(li => li.textContent.trim()),
    cta: card.querySelector("a")?.textContent.trim(),
    bg: getComputedStyle(card).backgroundColor,
  }));
  const faq = [...document.querySelectorAll("section")].find(s => /pertanyaan/i.test(s.querySelector("h2")?.textContent ?? ""));
  return {
    heroBadge: [...(hero?.querySelectorAll(".sticker") ?? [])].map(s => s.textContent.trim()),
    heading: price?.querySelector("h2")?.textContent.trim(),
    sub: price?.querySelector("h2")?.nextElementSibling?.textContent.trim(),
    cards,
    faqCount: faq ? faq.querySelectorAll("details, li").length : null,
    faqText: faq?.innerText.includes("Dasar aktif 3 hari"),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
})()`;

const out = {};

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Page.navigate", { url: `${BASE}/` });
await waitUntil(`!!document.querySelector("#harga")`, 20000);
await sleep(700);
out.desktop = await evaluate(measure);
await evaluate(`document.querySelector("#harga").scrollIntoView({ block: "start" })`);
await sleep(500);
await shot("verify-plans-desktop");

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await send("Page.navigate", { url: `${BASE}/` });
await waitUntil(`!!document.querySelector("#harga")`, 20000);
await sleep(700);
out.mobile = await evaluate(measure);
await evaluate(`document.querySelector("#harga").scrollIntoView({ block: "start" })`);
await sleep(500);
await shot("verify-plans-mobile");

writeFileSync(`${OUT}/verify-plans.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
ws.close();
