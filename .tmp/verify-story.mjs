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

const fill = (selector, value) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return el.value.length;
})()`;

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const sections = [...document.querySelectorAll("main section")];
  const story = sections[2];
  const textareas = [...document.querySelectorAll("main textarea")];
  const deletes = [...document.querySelectorAll("button[aria-label^='Hapus kartu']")];
  const add = [...document.querySelectorAll("main button")].find(b => b.textContent.includes("Tambah kartu"));
  const example = [...document.querySelectorAll("main button")].find(b => b.textContent.includes("Pakai contoh"));
  const bubbles = [...document.querySelectorAll("aside p")].filter(p => p.className.includes("border-ink"));
  const empties = [...document.querySelectorAll("aside p")].filter(p => p.className.includes("border-dashed"));
  return {
    h2: story?.querySelector("h2")?.textContent,
    badge: box(story?.querySelector("span")),
    subtitle: box(story?.querySelector("p")),
    section: box(story),
    textareas: textareas.map(t => ({ box: box(t), max: t.maxLength, value: t.value.slice(0, 24) })),
    deletes: deletes.map(d => ({ box: box(d), disabled: d.disabled, bg: getComputedStyle(d).backgroundColor, radius: getComputedStyle(d).borderRadius, border: getComputedStyle(d).borderTopWidth, shadow: getComputedStyle(d).boxShadow })),
    add: add ? { box: box(add), disabled: add.disabled, bg: getComputedStyle(add).backgroundColor } : null,
    example: example ? { box: box(example), disabled: example.disabled, bg: getComputedStyle(example).backgroundColor } : null,
    bubbles: bubbles.map(p => p.textContent.slice(0, 30)),
    empties: empties.map(p => p.textContent),
    previewName: document.querySelector("aside p.font-display")?.textContent,
    phone: box(document.querySelector("aside div.mx-auto")),
  };
})()`;

const out = {};

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Emulation.setTouchEmulationEnabled", { enabled: false });
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await sleep(1500);
await evaluate("localStorage.clear()");
await send("Page.reload");
await sleep(1600);
await evaluate("document.fonts.ready.then(() => true)");
await sleep(300);

out.initial = await evaluate(measure);

await evaluate("window.scrollTo({ top: 1180 })");
await sleep(400);
const s1 = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/local-story-desktop-empty.png", Buffer.from(s1.result.data, "base64"));

await evaluate(fill("main textarea[aria-label='Kartu cerita 1']", "Halo kamu. Aku suka cara kamu cerita hal-hal kecil."));
await sleep(400);
out.afterType = await evaluate(measure);
const s2 = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/local-story-desktop-typed.png", Buffer.from(s2.result.data, "base64"));

await evaluate("document.querySelectorAll('button[aria-label^=\"Hapus kartu\"]').length");
await evaluate("[...document.querySelectorAll('main button')].find(b => b.textContent.includes('Tambah kartu')).click()");
await sleep(350);
out.afterAdd = await evaluate(measure);

await evaluate("[...document.querySelectorAll('main button')].find(b => b.textContent.includes('Pakai contoh')).click()");
await sleep(450);
out.afterExample = await evaluate(measure);
const s3 = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/local-story-desktop-filled.png", Buffer.from(s3.result.data, "base64"));

for (let i = 0; i < 2; i++) {
  await evaluate("[...document.querySelectorAll('button[aria-label^=\"Hapus kartu\"]')].at(-1).click()");
  await sleep(250);
}
out.afterDelete = await evaluate(measure);

await evaluate("window.scrollTo({ top: 0 })");
await sleep(200);
await send("Page.reload");
await sleep(1800);
out.afterReload = await evaluate(measure);

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await sleep(1600);
await evaluate("document.fonts.ready.then(() => true)");
await sleep(300);
out.mobile = await evaluate(measure);
out.mobileLayout = await evaluate(`(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const story = [...document.querySelectorAll("main section")][2];
  const add = [...document.querySelectorAll("main button")].find(b => b.textContent.includes("Tambah kartu"));
  const example = [...document.querySelectorAll("main button")].find(b => b.textContent.includes("Pakai contoh"));
  return { story: box(story), textarea: box(document.querySelector("main textarea")), del: box(document.querySelector("button[aria-label^='Hapus kartu']")), add: box(add), example: box(example) };
})()`);
const storyTop = await evaluate("document.querySelectorAll('main section')[2].offsetTop");
await evaluate(`window.scrollTo({ top: ${Math.max(0, storyTop - 90)} })`);
await sleep(400);
const s4 = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/local-story-mobile-form.png", Buffer.from(s4.result.data, "base64"));

await evaluate("document.querySelector('main details summary').click()");
await sleep(300);
const detailsTop = await evaluate("document.querySelector('main details').offsetTop");
await evaluate(`window.scrollTo({ top: ${Math.max(0, detailsTop - 20)} })`);
await sleep(400);
const s5 = await send("Page.captureScreenshot", { format: "png" });
writeFileSync("C:/Users/User/Documents/SuprizeGo/.tmp/local-story-mobile-preview.png", Buffer.from(s5.result.data, "base64"));

console.log(JSON.stringify(out, null, 2));
ws.close();
