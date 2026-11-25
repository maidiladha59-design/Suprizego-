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
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
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
await send("DOM.enable");

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const section = [...document.querySelectorAll("main section")].find(s => (s.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto");
  const cards = [...(section?.querySelectorAll("figure") ?? [])];
  const add = [...(section?.querySelectorAll("label") ?? [])].find(l => l.textContent.includes("Tambah foto"));
  const asideEl = document.querySelector("aside");
  const aside = asideEl && asideEl.getBoundingClientRect().width > 0 ? asideEl : document.querySelector("main details");
  const figs = [...(aside?.querySelectorAll("figure") ?? [])];
  return {
    hint: section?.querySelector("p")?.textContent,
    section: box(section),
    cards: cards.map(c => {
      const img = c.querySelector("img");
      return {
        box: box(c),
        transform: getComputedStyle(c).transform,
        shadow: getComputedStyle(c).boxShadow,
        hasImg: !!img,
        caption: c.querySelector("input")?.value,
        captionMax: c.querySelector("input")?.maxLength,
        text: c.innerText.slice(0, 90).replace(/\\n/g, " | "),
      };
    }),
    add: add ? { box: box(add), text: add.innerText } : null,
    fullTile: [...(section?.querySelectorAll("div") ?? [])].map(d => d.innerText).find(t => t.startsWith("Penuh")),
    notices: section?.querySelector("[role=alert]")?.innerText,
    previewFigures: figs.map(f => ({
      box: box(f),
      transform: getComputedStyle(f).transform,
      caption: f.querySelector("figcaption")?.textContent,
      radius: getComputedStyle(f).borderRadius,
      border: getComputedStyle(f).borderTopWidth,
      shadow: getComputedStyle(f).boxShadow,
    })),
    previewButtons: [...(aside?.querySelectorAll("button") ?? [])].map(b => b.textContent.trim()).filter(t => t !== "Ulangi dari awal"),
    previewHint: [...(aside?.querySelectorAll("p") ?? [])].map(p => p.textContent).find(t => t.includes("ketuk foto")),
    previewTitle: [...(aside?.querySelectorAll("p") ?? [])].map(p => p.textContent).find(t => t === "Kenangan"),
    spinner: !!document.querySelector("main .animate-spin"),
  };
})()`;

async function upload(paths) {
  const ready = await waitUntil(`!!document.querySelector('input[type=file][aria-label="Tambah foto"]')`, 20000);
  if (!ready) throw new Error("file input not found (timeout)");
  for (let attempt = 0; attempt < 6; attempt++) {
    await send("DOM.enable");
    const doc = await send("DOM.getDocument", { depth: -1, pierce: true });
    const q = await send("DOM.querySelector", {
      nodeId: doc.result.root.nodeId,
      selector: 'input[type=file][aria-label="Tambah foto"]',
    });
    if (q.result.nodeId) {
      await send("DOM.setFileInputFiles", { files: paths, nodeId: q.result.nodeId });
      return;
    }
    await sleep(300);
  }
  throw new Error("file input not found after retries");
}

const dbCount = () => evaluate(`new Promise((resolve) => {
  const req = indexedDB.open("suprizego");
  req.onsuccess = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains("photos")) return resolve("no-store");
    const count = db.transaction("photos", "readonly").objectStore("photos").count();
    count.onsuccess = () => resolve(count.result);
    count.onerror = () => resolve(-1);
  };
  req.onerror = () => resolve(-1);
})`);

const clickReset = `(() => {
  const btn = [...document.querySelectorAll("button")].find(b => b.textContent.includes("Ulangi dari awal") && b.offsetParent);
  const fallback = [...document.querySelectorAll("button")].find(b => b.textContent.includes("Ulangi dari awal"));
  const el = btn ?? fallback;
  if (!el) return "no-button";
  el.click();
  return "clicked";
})()`;

const fill = (selector, value) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return el.value;
})()`;

const clickByLabel = (label) => `(() => {
  const el = [...document.querySelectorAll("button")].find(b => b.getAttribute("aria-label") === ${JSON.stringify(label)});
  if (!el) return false;
  el.click();
  return true;
})()`;

const clickByText = (text) => `(() => {
  const el = [...document.querySelectorAll("button")].find(b => b.textContent.includes(${JSON.stringify(text)}));
  if (!el) return false;
  el.click();
  return true;
})()`;

const out = {};

const openTabs = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
for (const p of openTabs) {
  if (p.type === "page" && p.url.startsWith("http://127.0.0.1:3100")) {
    await fetch(`http://127.0.0.1:9222/json/close/${p.id}`);
  }
}

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Emulation.setTouchEmulationEnabled", { enabled: false });
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await waitUntil(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto")`, 20000);
await evaluate("localStorage.clear()");
await send("Page.reload");
await waitUntil(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto")`, 20000);
await evaluate("document.fonts.ready.then(() => true)");
await sleep(300);
console.log("start: leftover figures", await evaluate(`document.querySelectorAll("main section figure").length`));

if ((await evaluate(`document.querySelectorAll("main section figure").length`)) > 0) {
  await evaluate("window.confirm = () => true");
  console.log("start reset:", await evaluate(clickReset));
  const cleared = await waitUntil(`document.querySelectorAll("main section figure").length === 0`, 20000);
  console.log("start reset cleared:", cleared, "db:", await dbCount());
}

out.initial = await evaluate(measure);
const top4 = await evaluate(`(() => { const s = [...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto"); return s.getBoundingClientRect().top + window.scrollY; })()`);
await evaluate(`window.scrollTo({ top: ${Math.max(0, top4 - 120)} })`);
await sleep(400);
await shot("local-photo-desktop-empty");

await upload(["C:/Users/User/Documents/SuprizeGo/.tmp/test-large.png", "C:/Users/User/Documents/SuprizeGo/.tmp/ref-photo-desktop.png"]);
await sleep(80);
out.loading = await evaluate(measure);
await shot("local-photo-desktop-loading");
const ready = await waitUntil("document.querySelectorAll('main section figure img').length === 2 && !document.querySelector('main .animate-spin')", 40000);
out.ready = ready;
console.log("desktop upload ready:", ready);

const sizes = await evaluate(`(async () => {
  const imgs = [...document.querySelectorAll("main section figure img")];
  const rows = [];
  for (const img of imgs) {
    const blob = await (await fetch(img.src)).blob();
    rows.push({ type: blob.type, bytes: blob.size, width: img.naturalWidth, height: img.naturalHeight });
  }
  return rows;
})()`);
out.compressed = sizes;

await evaluate(fill("main input[aria-label='Keterangan foto 1']", "Sore di taman"));
await sleep(400);
out.caption = await evaluate(measure);
await shot("local-photo-desktop-2");

out.fotoLain = await clickByText("Foto lain");
await sleep(450);
out.afterFotoLain = await evaluate(measure);
await sleep(450);
await clickByText("Foto lain");
await sleep(450);

out.gridBeforeMove = await evaluate("[...document.querySelectorAll('main section figure img')].map(i => i.src.slice(-20))");
out.move = await evaluate(clickByLabel("Geser foto 2 ke kiri"));
await sleep(400);
out.gridAfterMove = await evaluate("[...document.querySelectorAll('main section figure img')].map(i => i.src.slice(-20))");
out.afterMove = await evaluate(measure);
await shot("local-photo-desktop-moved");

await send("Page.reload");
await sleep(2000);
out.afterReload = await evaluate(measure);
console.log("after reload figures:", await evaluate(`document.querySelectorAll("main section figure").length`));

await upload([
  "C:/Users/User/Documents/SuprizeGo/.tmp/test-invalid.txt",
  "C:/Users/User/Documents/SuprizeGo/.tmp/test-big.jpg",
  "C:/Users/User/Documents/SuprizeGo/.tmp/test-fake.heic",
]);
const heicError = await waitUntil("document.querySelector('main section [role=alert]') && document.querySelectorAll('main section figure').length === 3", 15000);
out.heicError = heicError;
await sleep(300);
out.errors = await evaluate(measure);
await shot("local-photo-desktop-errors");

const removeError = await evaluate(`(() => {
  const cards = [...document.querySelectorAll("main section figure")];
  const errorCard = cards.find(c => !c.querySelector("img"));
  const btn = errorCard?.querySelector("button[aria-label^='Hapus foto']");
  if (!btn) return false;
  btn.click();
  return true;
})()`);
out.removeError = removeError;
await sleep(400);

await upload([1, 2, 3, 4, 5, 6].map((n) => `C:/Users/User/Documents/SuprizeGo/.tmp/test-photo-${n}.png`));
const eight = await waitUntil("document.querySelectorAll('main section figure img').length === 8 && !document.querySelector('main .animate-spin')", 60000);
out.eight = eight;
console.log("eight ready:", eight);
await sleep(400);
out.full = await evaluate(measure);
await shot("local-photo-desktop-full");

await evaluate("window.confirm = () => true");
console.log("reset click:", await evaluate(clickReset));
await sleep(1200);
out.dbCount = await dbCount();
if (out.dbCount !== 0) {
  console.log("reset retry, db was:", out.dbCount);
  await evaluate(clickReset);
  await sleep(1200);
  out.dbCount = await dbCount();
}
console.log("after reset figures:", await evaluate(`document.querySelectorAll("main section figure").length`), "db:", out.dbCount);
out.afterReset = await evaluate(measure);

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
const mobileReady = await waitUntil(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto")`, 20000);
console.log("mobile ready:", mobileReady);
await evaluate("window.scrollTo({ top: 0 })");
await upload(["C:/Users/User/Documents/SuprizeGo/.tmp/test-large.png", "C:/Users/User/Documents/SuprizeGo/.tmp/ref-photo-desktop.png"]);
await waitUntil("document.querySelectorAll('main section figure img').length === 2 && !document.querySelector('main .animate-spin')", 40000);
await evaluate(fill("main input[aria-label='Keterangan foto 1']", "Sore di taman"));
await sleep(300);
const mobileTop = await evaluate(`(() => { const s = [...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto"); return s.getBoundingClientRect().top + window.scrollY; })()`);
await evaluate(`window.scrollTo({ top: ${Math.max(0, mobileTop - 90)} })`);
await sleep(400);
out.mobile = await evaluate(measure);
await shot("local-photo-mobile-form");

await evaluate("document.querySelector('main details summary').click()");
await sleep(300);
const detailsTop = await evaluate("document.querySelector('main details').offsetTop");
await evaluate(`window.scrollTo({ top: ${Math.max(0, detailsTop - 20)} })`);
await sleep(500);
out.mobilePreview = await evaluate(measure);
await shot("local-photo-mobile-reader");

console.log(JSON.stringify(out, null, 2));
ws.close();
