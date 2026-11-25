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
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send("Page.enable");
await send("Runtime.enable");

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const cs = (el, props) => { if (!el) return null; const s = getComputedStyle(el); return Object.fromEntries(props.map(p => [p, s[p]])); };
  const sections = [...document.querySelectorAll("section")];
  const sec = sections.find(s => (s.querySelector("h2")?.textContent ?? "").toLowerCase().includes("musik"));
  const buttons = [...(sec?.querySelectorAll("button") ?? [])];
  const tiles = [...(sec?.querySelectorAll("button") ?? [])].filter(b => /DEG-DEGAN|MALU-MALU|TANPA MUSIK/i.test(b.textContent));
  return {
    index: sections.indexOf(sec),
    box: box(sec),
    heading: sec?.querySelector("h2")?.textContent,
    subtitle: sec?.querySelector("p")?.textContent,
    html: sec?.outerHTML.slice(0, 9000),
    tiles: tiles.map(b => ({
      text: b.innerText.replace(/\\n/g, " | "),
      box: box(b),
      bg: getComputedStyle(b).backgroundColor,
      border: getComputedStyle(b).borderTopWidth,
      shadow: getComputedStyle(b).boxShadow,
      radius: getComputedStyle(b).borderRadius,
      pressed: b.getAttribute("aria-pressed"),
      cls: b.className,
    })),
    allButtons: buttons.map(b => ({ text: b.textContent.trim().slice(0, 50), box: box(b), cls: b.className.slice(0, 100) })),
    inputs: [...(sec?.querySelectorAll("input") ?? [])].map(i => ({ type: i.type, placeholder: i.placeholder, value: i.value, box: box(i), cls: i.className })),
    audio: [...document.querySelectorAll("audio")].map(a => ({ src: a.currentSrc || a.src, paused: a.paused, loop: a.loop, volume: a.volume, duration: a.duration })),
    sources: [...document.querySelectorAll("audio source")].map(s => s.src),
    texts: [...(sec?.querySelectorAll("p,span,div") ?? [])].map(e => e.children.length === 0 ? e.textContent.trim() : "").filter(Boolean).slice(0, 50),
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

  if (slug === "desktop") {
    const clickTile = (name) => `(() => {
      const sec = [...document.querySelectorAll("section")].find(s => (s.querySelector("h2")?.textContent ?? "").toLowerCase().includes("musik"));
      const tile = [...(sec?.querySelectorAll("button") ?? [])].find(b => b.textContent.includes(${JSON.stringify(name)}));
      if (!tile) return "no-tile";
      const play = tile.querySelector("button") ?? [...tile.querySelectorAll("svg")].length;
      tile.click();
      return tile.tagName;
    })()`;
    out.clickSecond = await evaluate(clickTile("MALU-MALU"));
    await sleep(400);
    out.afterSecond = await evaluate(measure);
    out.clickSilent = await evaluate(clickTile("TANPA MUSIK"));
    await sleep(400);
    out.afterSilent = await evaluate(measure);
    out.clickFirst = await evaluate(clickTile("DEG-DEGAN"));
    await sleep(400);
    out.afterFirst = await evaluate(measure);

    const playClick = `(() => {
      const sec = [...document.querySelectorAll("section")].find(s => (s.querySelector("h2")?.textContent ?? "").toLowerCase().includes("musik"));
      const tile = [...(sec?.querySelectorAll("button") ?? [])].find(b => b.textContent.includes("DEG-DEGAN"));
      const btn = tile?.querySelector("button");
      if (!btn) return "no-inner-button";
      btn.click();
      return "clicked";
    })()`;
    out.playClick = await evaluate(playClick);
    await sleep(900);
    out.afterPlay = await evaluate(measure);
  }

  const top = await evaluate(`(() => { const s = [...document.querySelectorAll("section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase().includes("musik")); return s ? s.getBoundingClientRect().top + window.scrollY : 0; })()`);
  await evaluate(`window.scrollTo({ top: ${Math.max(0, top - 90)} })`);
  await sleep(400);
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/ref-music-${slug}.png`, Buffer.from(s.result.data, "base64"));
}
console.log(JSON.stringify(out, null, 2));
ws.close();
