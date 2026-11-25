import { writeFileSync } from "node:fs";

const list = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
const target = list.find((p) => p.type === "page" && p.url.startsWith("http://127.0.0.1:3100"));
if (!target) throw new Error("no app tab");
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
await new Promise((res) => (ws.onopen = res));
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.error || !r.result) throw new Error(JSON.stringify(r).slice(0, 300));
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
  return r.result.result.value;
};
await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await new Promise((r) => setTimeout(r, 500));

const data = await evaluate(`(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const section = [...document.querySelectorAll("main section")].find(s => (s.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik");
  const wrappers = [...(section?.querySelector("[role=group]")?.children ?? [])];
  const input = section?.querySelector("#lagu-pilihan");
  const tempel = [...(section?.querySelectorAll("button") ?? [])].find(b => b.textContent.trim() === "Tempel");
  return {
    viewport: [window.innerWidth, window.innerHeight],
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    section: box(section),
    options: wrappers.map(w => {
      const select = w.querySelector("button[aria-pressed]");
      const play = w.querySelector("button[aria-label^='Dengar'], button[aria-label^='Hentikan']");
      return { name: select?.querySelector("span")?.textContent, selected: select?.getAttribute("aria-pressed"), box: box(w), bg: getComputedStyle(w).backgroundColor, play: play ? { label: play.getAttribute("aria-label"), box: box(play) } : null };
    }),
    spotify: { value: input?.value, box: box(input) },
    tempel: box(tempel),
    draft: localStorage.getItem("suprizego:draft:pengakuan"),
  };
})()`);
console.log(JSON.stringify(data, null, 2));
const m = await evaluate(`(() => {
  const s = [...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik");
  window.scrollTo({ top: Math.max(0, s.getBoundingClientRect().top + window.scrollY - 80) });
  return Math.round(s.getBoundingClientRect().top);
})()`);
await new Promise((r) => setTimeout(r, 400));
const s = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/local-music-mobile.png", Buffer.from(s.result.data, "base64"));
console.log("scrolled", m);
ws.close();
