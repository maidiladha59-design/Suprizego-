import { writeFileSync } from "node:fs";

const CDP = "http://127.0.0.1:9224";
const BASE = "http://127.0.0.1:3100";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const target = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
};
await new Promise((resolve) => (ws.onopen = resolve));
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const nextId = ++id;
    pending.set(nextId, resolve);
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const evaluate = async (expression) => {
  const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (response.result.exceptionDetails) throw new Error(JSON.stringify(response.result.exceptionDetails).slice(0, 700));
  return response.result.result.value;
};
const waitUntil = async (expression, timeout = 20000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return true;
    await sleep(200);
  }
  return false;
};
const measure = `(() => {
  const section = [...document.querySelectorAll("section")].find(
    (item) => (item.querySelector("h2")?.textContent ?? "").toUpperCase().includes("MAIN BERDUA"),
  );
  const photoSection = [...document.querySelectorAll("section")].find(
    (item) => (item.querySelector("h2")?.textContent ?? "").toUpperCase().includes("FOTO"),
  );
  return {
    photos: document.querySelectorAll('button[aria-label^="Hapus foto"]').length,
    tiles: [...(section?.querySelectorAll("button") ?? [])]
      .filter((button) => !button.closest("article"))
      .map((button) => ({ text: button.innerText.replace(/\\s+/g, " ").trim(), disabled: button.disabled })),
    cards: [...(section?.querySelectorAll("article") ?? [])].map((card) => ({
      title: card.querySelector("h3")?.textContent.trim(),
      images: card.querySelectorAll("img").length,
      text: card.innerText.replace(/\\s+/g, " ").trim().slice(0, 400),
    })),
    photoImages: photoSection?.querySelectorAll("img").length ?? 0,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
})()`;

await send("Page.enable");
await send("Runtime.enable");
await send("DOM.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `${BASE}/buat/pengakuan` });
await waitUntil(`!![...document.querySelectorAll("h2")].some((item) => item.textContent.includes("Main Berdua"))`);
await evaluate(`localStorage.removeItem('suprizego:draft:pengakuan')`);
await evaluate(`new Promise((resolve) => {
  const request = indexedDB.open("suprizego");
  request.onsuccess = () => {
    const database = request.result;
    for (const name of [...database.objectStoreNames]) database.transaction(name, "readwrite").objectStore(name).clear();
    resolve(true);
  };
  request.onerror = () => resolve(false);
})`);
await send("Page.reload");
await waitUntil(`!![...document.querySelectorAll("h2")].some((item) => item.textContent.includes("Main Berdua"))`);
await sleep(900);
const before = await evaluate(measure);
const documentNode = await send("DOM.getDocument", { depth: -1 });
const fileNode = await send("DOM.querySelector", { nodeId: documentNode.result.root.nodeId, selector: 'input[aria-label="Tambah foto"]' });
await send("DOM.setFileInputFiles", {
  nodeId: fileNode.result.nodeId,
  files: [
    `${OUT}/test-photo-1.png`,
    `${OUT}/test-photo-2.png`,
  ],
});
await waitUntil(`document.querySelectorAll('button[aria-label^="Hapus foto"]').length === 2`, 20000);
await sleep(700);
const afterUpload = await evaluate(measure);
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.innerText.toUpperCase().includes("SUSUN FOTO") && !button.disabled)?.click()`);
await waitUntil(`!![...document.querySelectorAll("article h3")].some((item) => item.textContent.includes("Susun Foto"))`);
await sleep(400);
const afterAdd = await evaluate(measure);
await evaluate(`[...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.scrollIntoView({ block: "start" })`);
await sleep(300);
const screenshot = await send("Page.captureScreenshot", { format: "png" });
writeFileSync(`${OUT}/verify-games-photo-editor.png`, Buffer.from(screenshot.result.data, "base64"));
await send("Page.reload");
await waitUntil(`!![...document.querySelectorAll("article h3")].some((item) => item.textContent.includes("Susun Foto"))`);
await waitUntil(`document.querySelectorAll('button[aria-label^="Hapus foto"]').length === 2`);
await sleep(600);
const afterReload = await evaluate(measure);
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await sleep(400);
const mobile = await evaluate(measure);
console.log(JSON.stringify({ before, afterUpload, afterAdd, afterReload, mobile }, null, 2));
ws.close();
