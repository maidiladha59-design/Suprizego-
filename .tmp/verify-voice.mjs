import { writeFileSync } from "node:fs";

const CDP_PORT = 9223;
const BASE = "http://127.0.0.1:3100";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";

const t = await fetch(`http://127.0.0.1:${CDP_PORT}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
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
      await sleep(350);
      return evaluate(expression, attempt + 1);
    }
    throw new Error(`evaluate failed: ${JSON.stringify(r).slice(0, 400)}`);
  }
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 800));
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
await send("DOM.enable");

const waitEditor = `!![...document.querySelectorAll("h2")].find(h => h.textContent.includes("Surat penutup"))`;

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const section = [...document.querySelectorAll("main section")].find(s => (s.querySelector("h2")?.textContent ?? "").includes("Surat penutup"));
  if (!section) return null;
  const input = section.querySelector('input[aria-label="Unggah audio"]');
  const play = section.querySelector('button[aria-label="Putar pesan suara"], button[aria-label="Jeda pesan suara"]');
  const label = [...section.querySelectorAll("p")].find(p => /^Pesan suara/i.test(p.textContent.trim()));
  const sticker = label?.querySelector(".sticker");
  const durationLine = [...section.querySelectorAll("p")].find(p => /Pesan suara ·/.test(p.textContent));
  return {
    label: label?.textContent.replace(/\\s+/g, " ").trim() ?? null,
    sticker: sticker?.textContent.trim() ?? null,
    labelBox: box(label),
    buttons: [...section.querySelectorAll("button")].filter(b => b.offsetParent !== null).map(b => ({
      text: b.innerText.replace(/\\s+/g, " ").trim(),
      aria: b.getAttribute("aria-label"),
      pressed: b.getAttribute("aria-pressed"),
      disabled: b.disabled,
      box: box(b),
      bg: getComputedStyle(b).backgroundColor,
    })),
    accept: input?.accept ?? null,
    fileLabel: input?.getAttribute("aria-label") ?? null,
    statuses: [...section.querySelectorAll("[role=status]")].map(s => s.textContent.replace(/\\s+/g, " ").trim()),
    name: durationLine?.previousElementSibling?.textContent?.trim() ?? null,
    duration: durationLine?.textContent?.replace(/\\s+/g, " ").trim() ?? null,
    playBox: box(play),
    text: section.innerText.replace(/\\s+/g, " ").trim().slice(0, 700),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
})()`;

const idb = `new Promise((resolve) => {
  const req = indexedDB.open("suprizego");
  req.onsuccess = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains("audios")) { resolve({ count: -1 }); return; }
    const tx = db.transaction("audios", "readonly");
    const store = tx.objectStore("audios");
    const count = store.count();
    const all = store.getAll();
    tx.oncomplete = () => resolve({
      count: count.result,
      items: all.result.map(r => ({ id: r.id, name: r.name, mime: r.mime, duration: r.duration, size: r.blob?.size ?? null, key: r.key })),
    });
    tx.onerror = () => resolve({ count: -2 });
  };
  req.onerror = () => resolve({ count: -3 });
})`;

const clearStores = `new Promise((resolve) => {
  const req = indexedDB.open("suprizego");
  req.onsuccess = () => {
    const db = req.result;
    const names = [...db.objectStoreNames];
    if (names.length === 0) { resolve("empty"); return; }
    let left = names.length;
    for (const name of names) {
      const tx = db.transaction(name, "readwrite");
      tx.objectStore(name).clear();
      tx.oncomplete = () => { if (--left === 0) resolve("cleared"); };
      tx.onerror = () => { if (--left === 0) resolve("err"); };
    }
  };
  req.onerror = () => resolve("open-err");
})`;

const clickButton = (script) => `(() => {
  const b = [...document.querySelectorAll("button")].find(x => x.offsetParent !== null && (${script}));
  if (!b) return null;
  b.click();
  return b.innerText.replace(/\\s+/g, " ").trim();
})()`;

const setFile = async (selector, file) => {
  const doc = await send("DOM.getDocument", { depth: -1 });
  const found = await send("DOM.querySelector", { nodeId: doc.result.root.nodeId, selector });
  if (!found.result.nodeId) throw new Error(`input not found: ${selector}`);
  await send("DOM.setFileInputFiles", { nodeId: found.result.nodeId, files: [file] });
};

const out = {};

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Emulation.setTouchEmulationEnabled", { enabled: false });
await send("Page.navigate", { url: `${BASE}/buat/pengakuan` });
await waitUntil(waitEditor, 20000);
await sleep(500);
await evaluate("localStorage.clear()");
await evaluate(clearStores);
await send("Page.reload");
await waitUntil(waitEditor, 20000);
await waitUntil(`!!document.querySelector('input[aria-label="Unggah audio"]')`, 10000);
await sleep(500);

out.initial = await evaluate(measure);
await evaluate(`(() => {
  const s = [...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").includes("Surat penutup"));
  s.scrollIntoView({ block: "center" });
  return true;
})()`);
await sleep(400);
await shot("verify-voice-initial");

out.startRecord = await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "REKAM"`));
out.recordStarted = await waitUntil(`!![...document.querySelectorAll("button")].find(b => b.innerText.trim().toUpperCase() === "SELESAI" && b.offsetParent)`, 15000);
await sleep(2600);
out.recording = await evaluate(measure);
await evaluate(`(() => {
  const s = [...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").includes("Surat penutup"));
  s.scrollIntoView({ block: "center" });
  return true;
})()`);
await sleep(250);
await shot("verify-voice-recording");

out.stopRecord = await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "SELESAI"`));
out.savedAfterStop = await waitUntil(`!!document.querySelector('button[aria-label="Putar pesan suara"]')`, 15000);
await sleep(400);
out.saved = await evaluate(measure);
out.idbAfterRecord = await evaluate(idb);
await shot("verify-voice-saved");

await evaluate(clickButton(`x.getAttribute("aria-label") === "Putar pesan suara"`));
await sleep(600);
out.playing = await evaluate(measure);
await evaluate(clickButton(`x.getAttribute("aria-label") === "Jeda pesan suara"`));
await sleep(300);
out.paused = await evaluate(measure);

await send("Page.reload");
await waitUntil(waitEditor, 20000);
out.persistedReload = await waitUntil(`!!document.querySelector('button[aria-label="Putar pesan suara"]')`, 10000);
await sleep(500);
out.afterReload = await evaluate(measure);
out.idbAfterReload = await evaluate(idb);

out.deleteClick = await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "HAPUS"`));
await waitUntil(`!![...document.querySelectorAll("button")].find(b => b.innerText.trim().toUpperCase() === "REKAM" && b.offsetParent)`, 5000);
await sleep(500);
out.afterDelete = await evaluate(measure);
out.idbAfterDelete = await evaluate(idb);

await setFile('input[aria-label="Unggah audio"]', `${OUT}/test-voice.txt`);
await waitUntil(`[...document.querySelectorAll('[role=status]')].some(x => x.textContent.includes("Formatnya harus"))`, 5000);
await sleep(200);
out.invalidType = await evaluate(measure);
await shot("verify-voice-invalid-type");

await setFile('input[aria-label="Unggah audio"]', `${OUT}/test-voice-ok.wav`);
out.uploaded = await waitUntil(`!!document.querySelector('button[aria-label="Putar pesan suara"]')`, 10000);
await sleep(600);
out.afterUpload = await evaluate(measure);
out.idbAfterUpload = await evaluate(idb);
await shot("verify-voice-uploaded");

await send("Page.reload");
await waitUntil(waitEditor, 20000);
out.uploadPersisted = await waitUntil(`!!document.querySelector('button[aria-label="Putar pesan suara"]')`, 10000);
await sleep(500);
out.afterUploadReload = await evaluate(measure);
out.idbAfterUploadReload = await evaluate(idb);

await setFile('input[aria-label="Unggah audio"]', `${OUT}/test-voice-long.wav`);
await waitUntil(`[...document.querySelectorAll('[role=status]')].some(x => x.textContent.includes("lebih dari 1 menit"))`, 8000);
await sleep(300);
out.uploadTooLong = await evaluate(measure);

await setFile('input[aria-label="Unggah audio"]', `${OUT}/test-voice-big.wav`);
await waitUntil(`[...document.querySelectorAll('[role=status]')].some(x => x.textContent.includes("lebih dari 5 MB"))`, 5000);
await sleep(200);
out.uploadTooBig = await evaluate(measure);
await shot("verify-voice-upload-errors");

out.deleteUploaded = await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "HAPUS"`));
await waitUntil(`!![...document.querySelectorAll("button")].find(b => b.innerText.trim().toUpperCase() === "REKAM" && b.offsetParent)`, 5000);
await sleep(400);
out.afterDeleteUploaded = await evaluate(measure);
out.idbAfterDeleteUploaded = await evaluate(idb);

out.autoStopStart = await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "REKAM"`));
out.autoStopStarted = await waitUntil(`!![...document.querySelectorAll("button")].find(b => b.innerText.trim().toUpperCase() === "SELESAI" && b.offsetParent)`, 15000);
await sleep(1400);
out.autoStopTimer = await evaluate(measure);
out.autoStop = await waitUntil(`!!document.querySelector('button[aria-label="Putar pesan suara"]')`, 75000);
await sleep(500);
out.afterAutoStop = await evaluate(measure);
out.idbAfterAutoStop = await evaluate(idb);
await shot("verify-voice-autostop");

await evaluate("window.confirm = () => true");
out.resetClick = await evaluate(clickButton(`x.innerText.toUpperCase().includes("ULANGI DARI AWAL")`));
await waitUntil(`!![...document.querySelectorAll("button")].find(b => b.innerText.trim().toUpperCase() === "REKAM" && b.offsetParent)`, 5000);
await sleep(600);
out.afterReset = await evaluate(measure);
out.idbAfterReset = await evaluate(idb);

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: `${BASE}/buat/pengakuan` });
await waitUntil(waitEditor, 20000);
await waitUntil(`!!document.querySelector('input[aria-label="Unggah audio"]')`, 10000);
await sleep(500);
await evaluate(`(() => {
  const s = [...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").includes("Surat penutup"));
  s.scrollIntoView({ block: "center" });
  return true;
})()`);
await sleep(400);
out.mobile = await evaluate(measure);
await shot("verify-voice-mobile");

writeFileSync(`${OUT}/verify-voice.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
ws.close();
