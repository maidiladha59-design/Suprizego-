import { writeFileSync } from "node:fs";

const t = await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" }).then((r) => r.json());
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
await new Promise((res) => (ws.onopen = res));
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression, attempt = 0) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.error || !r.result) {
    if (attempt < 3) { await new Promise((res) => setTimeout(res, 400)); return evaluate(expression, attempt + 1); }
    throw new Error(JSON.stringify(r).slice(0, 400));
  }
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 800));
  return r.result.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitUntil = async (expression, timeout = 25000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return true;
    await sleep(250);
  }
  return false;
};
const shot = async (name) => {
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/${name}.png`, Buffer.from(s.result.data, "base64"));
};

await send("Page.enable");
await send("Runtime.enable");
const tabs = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
for (const p of tabs) {
  if (p.type === "page" && (p.url.includes("proposigo.app") || p.url.includes("127.0.0.1:3100"))) {
    await fetch(`http://127.0.0.1:9222/json/close/${p.id}`);
  }
}
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await waitUntil(`!![...document.querySelectorAll("h2")].find(x => x.textContent.includes("MAIN BERDUA"))`, 30000);
await sleep(800);

const measureSection = (label) => `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const s = [...document.querySelectorAll("section")].find(x => (x.querySelector("h2")?.textContent ?? "").toUpperCase().includes(${JSON.stringify(label)}));
  if (!s) return null;
  return {
    heading: s.querySelector("h2")?.textContent,
    headingHtml: s.querySelector("h2")?.outerHTML,
    box: box(s),
    text: s.innerText,
    buttons: [...s.querySelectorAll("button")].map(b => ({ text: b.innerText.replace(/\\s+/g, " ").trim().slice(0, 90), box: box(b), pressed: b.getAttribute("aria-pressed"), disabled: b.disabled, cls: b.className.slice(0, 240), bg: getComputedStyle(b).backgroundColor, border: getComputedStyle(b).borderTopWidth, radius: getComputedStyle(b).borderRadius, shadow: getComputedStyle(b).boxShadow })),
    links: [...s.querySelectorAll("a")].map(a => ({ text: a.innerText.trim(), href: a.getAttribute("href"), box: box(a) })),
    inputs: [...s.querySelectorAll("input, textarea, select")].map(i => ({ tag: i.tagName, type: i.type, accept: i.accept, placeholder: i.placeholder, maxlength: i.maxLength, value: (i.value ?? "").slice(0, 80), box: box(i), cls: i.className.slice(0, 160) })),
    html: s.outerHTML.slice(0, 14000),
  };
})()`;

const scrollTo = (label) => `(() => {
  const s = [...document.querySelectorAll("section")].find(x => (x.querySelector("h2")?.textContent ?? "").toUpperCase().includes(${JSON.stringify(label)}));
  if (!s) return null;
  window.scrollTo({ top: Math.max(0, s.getBoundingClientRect().top + window.scrollY - 90) });
  return Math.round(s.getBoundingClientRect().top);
})()`;

const out = {};

out.mainInitial = await evaluate(measureSection("MAIN BERDUA"));
await evaluate(scrollTo("MAIN BERDUA"));
await sleep(500);
await shot("ref-mainberdua-initial");

out.quizClick = await evaluate(`(() => {
  const s = [...document.querySelectorAll("section")].find(x => (x.querySelector("h2")?.textContent ?? "").toUpperCase().includes("MAIN BERDUA"));
  const b = [...s.querySelectorAll("button")].find(x => x.innerText.toUpperCase().includes("KUIS"));
  if (!b) return "no-quiz-button";
  b.click();
  return "clicked:" + b.innerText.replace(/\\s+/g, " ").trim().slice(0, 60);
})()`);
await sleep(1000);
out.mainAfterQuiz = await evaluate(measureSection("MAIN BERDUA"));
await evaluate(scrollTo("MAIN BERDUA"));
await sleep(400);
await shot("ref-mainberdua-quiz");

out.addGame = await evaluate(`(() => {
  const s = [...document.querySelectorAll("section")].find(x => (x.querySelector("h2")?.textContent ?? "").toUpperCase().includes("MAIN BERDUA"));
  const b = [...s.querySelectorAll("button")].find(x => x.innerText.toUpperCase().includes("TAMBAH PERMAINAN"));
  if (!b) return "no-add-button";
  b.click();
  return "clicked";
})()`);
await sleep(900);
out.mainAfterAdd = await evaluate(measureSection("MAIN BERDUA"));
await evaluate(scrollTo("MAIN BERDUA"));
await sleep(400);
await shot("ref-mainberdua-add");

out.letterInitial = await evaluate(measureSection("SURAT PENUTUP"));
await evaluate(scrollTo("SURAT PENUTUP"));
await sleep(500);
await shot("ref-voice-section");

out.plan = await evaluate(measureSection("PILIH PAKET"));
await evaluate(scrollTo("PILIH PAKET"));
await sleep(500);
await shot("ref-plan-section");

console.log(JSON.stringify(out, null, 2));
ws.close();
