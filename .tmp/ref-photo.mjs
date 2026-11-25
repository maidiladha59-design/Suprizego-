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
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send("Page.enable");
await send("Runtime.enable");

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const sections = [...document.querySelectorAll("section")];
  const foto = sections.find(s => (s.querySelector("h2")?.textContent ?? "").toLowerCase().includes("foto"));
  const cs = (el, props) => { if (!el) return null; const s = getComputedStyle(el); return Object.fromEntries(props.map(p => [p, s[p]])); };
  return {
    sectionIndex: sections.indexOf(foto),
    box: box(foto),
    heading: foto?.querySelector("h2")?.textContent,
    subtitle: foto?.querySelector("p")?.textContent,
    html: foto?.outerHTML.slice(0, 6000),
    inputs: [...(foto?.querySelectorAll("input") ?? [])].map(i => ({ type: i.type, accept: i.accept, multiple: i.multiple, box: box(i), hidden: i.hidden || getComputedStyle(i).display === "none" })),
    buttons: [...(foto?.querySelectorAll("button") ?? [])].map(b => ({ text: b.textContent.trim().slice(0, 40), box: box(b), cls: b.className.slice(0, 120) })),
    texts: [...(foto?.querySelectorAll("p,span,div") ?? [])].map(e => e.children.length === 0 ? e.textContent.trim() : "").filter(Boolean).slice(0, 40),
    scripts: performance.getEntriesByType("resource").map(r => r.name).filter(n => n.endsWith(".js")),
  };
})()`;

const out = {};
for (const [w, h, mobile, slug] of [
  [1440, 1000, false, "desktop"],
  [390, 844, true, "mobile"],
]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile, screenWidth: w, screenHeight: h });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  await send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
  await sleep(2500);
  await evaluate("document.fonts.ready.then(() => true)");
  await sleep(300);
  const m = await evaluate(measure);
  out[slug] = m;
  if (slug === "desktop") out.scripts = m.scripts;
  const top = await evaluate(`(() => { const s = [...document.querySelectorAll("section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase().includes("foto")); return s ? s.getBoundingClientRect().top + window.scrollY : 0; })()`);
  await evaluate(`window.scrollTo({ top: ${Math.max(0, top - 90)} })`);
  await sleep(400);
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/ref-photo-${slug}.png`, Buffer.from(s.result.data, "base64"));
  delete m.scripts;
}
console.log(JSON.stringify({ out }, null, 2));
ws.close();
