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
    if (attempt < 3) {
      await new Promise((res) => setTimeout(res, 350));
      return evaluate(expression, attempt + 1);
    }
    throw new Error(`evaluate failed: ${JSON.stringify(r).slice(0, 400)}`);
  }
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
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
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/${name}.png`, Buffer.from(s.result.data, "base64"));
};

await send("Page.enable");
await send("Runtime.enable");

const openTabs = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
for (const p of openTabs) {
  if (p.type === "page" && p.url.startsWith("http://127.0.0.1:3100")) {
    await fetch(`http://127.0.0.1:9222/json/close/${p.id}`);
  }
}

const sectionExpr = `[...document.querySelectorAll("main section")].find(s => (s.querySelector("h2")?.textContent ?? "").toLowerCase() === "surat penutup")`;

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const section = ${sectionExpr};
  const textarea = section?.querySelector("textarea");
  const counter = section?.querySelector("#surat-penutup-hitung");
  const badge = section?.querySelector("span");
  const cs = (el, props) => { if (!el) return null; const s = getComputedStyle(el); return Object.fromEntries(props.map(p => [p, s[p]])); };
  return {
    badge: badge?.textContent,
    heading: section?.querySelector("h2")?.textContent,
    section: box(section),
    labels: [...(section?.querySelectorAll("label") ?? [])].map(l => l.textContent.trim()).filter(Boolean),
    textarea: textarea ? {
      box: box(textarea),
      valueLength: textarea.value.length,
      preview: textarea.value.slice(0, 40).replace(/\\n/g, "\\u23ce"),
      placeholder: textarea.placeholder,
      maxlength: textarea.maxLength,
      rows: textarea.rows,
      style: cs(textarea, ["minHeight", "borderTopWidth", "borderTopLeftRadius", "fontSize", "lineHeight", "paddingLeft", "backgroundColor"]),
    } : null,
    counter: counter ? { text: counter.textContent, box: box(counter), style: cs(counter, ["textAlign", "fontSize", "color"]) } : null,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
})()`;

const fill = (selector, value) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return el.value.length;
})()`;

const scrollToSection = `(() => {
  const s = ${sectionExpr};
  if (!s) return 0;
  window.scrollTo({ top: Math.max(0, s.getBoundingClientRect().top + window.scrollY - 90) });
  return Math.round(s.getBoundingClientRect().top);
})()`;

const out = {};

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Emulation.setTouchEmulationEnabled", { enabled: false });
await send("Page.bringToFront");
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await waitUntil(`!!${sectionExpr}`, 20000);
await evaluate("localStorage.clear()");
await send("Page.reload");
await waitUntil(`!!${sectionExpr}`, 20000);
await sleep(500);

await evaluate(scrollToSection);
await sleep(300);
out.initial = await evaluate(measure);
await shot("local-letter-desktop-empty");

out.overLimitSet = await evaluate(fill("textarea[aria-describedby='surat-penutup-hitung']", "a".repeat(1510)));
await sleep(300);
out.overLimit = await evaluate(measure);

const letter = "Halo kamu,\n\nAku bukan orang yang jago ngomong langsung, jadi aku tulis di sini. Semua yang tadi kamu baca itu beneran, nggak ada yang dilebih-lebihin.\n\nPeluk erat dari aku. Terima kasih sudah baca sampai akhir, ya.";
out.fillSet = await evaluate(fill("textarea[aria-describedby='surat-penutup-hitung']", letter));
await sleep(500);
out.filled = await evaluate(measure);
await evaluate(scrollToSection);
await sleep(300);
await shot("local-letter-desktop-filled");
out.stored = await evaluate(`(() => { const raw = localStorage.getItem("suprizego:draft:pengakuan"); return raw ? JSON.parse(raw).letter : null; })()`);

await send("Page.reload");
await waitUntil(`!!${sectionExpr}`, 20000);
await sleep(500);
out.afterReload = await evaluate(measure);

await evaluate("window.confirm = () => true");
out.resetClick = await evaluate(`(() => {
  const el = [...document.querySelectorAll("button")].find(b => b.textContent.includes("Ulangi dari awal") && b.offsetParent);
  if (!el) return "no-button";
  el.click();
  return "clicked";
})()`);
await sleep(1000);
out.afterReset = await evaluate(measure);
out.resetDraft = await evaluate(`(() => { const raw = localStorage.getItem("suprizego:draft:pengakuan"); return raw ? JSON.parse(raw) : null; })()`);

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await waitUntil(`!!${sectionExpr}`, 20000);
await sleep(500);
await evaluate(fill("textarea[aria-describedby='surat-penutup-hitung']", letter));
await sleep(400);
await evaluate(scrollToSection);
await sleep(500);
out.mobile = await evaluate(measure);
await shot("local-letter-mobile");

console.log(JSON.stringify(out, null, 2));
ws.close();
