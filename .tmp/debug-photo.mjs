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
  if (r.result.exceptionDetails) return { error: r.result.exceptionDetails.text };
  return r.result.result.value;
};
await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await new Promise((r) => setTimeout(r, 3000));
console.log("url:", await evaluate("location.href"));
console.log("title:", await evaluate("document.title"));
console.log("section:", await evaluate(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto")`));
console.log("input:", await evaluate(`!!document.querySelector('input[type=file][aria-label="Tambah foto"]')`));
console.log("figures:", await evaluate(`document.querySelectorAll("main section figure").length`));
console.log("hint:", await evaluate(`[...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto")?.querySelector("p")?.textContent`));
console.log("dbCount:", await evaluate(`new Promise((resolve) => {
  const req = indexedDB.open("suprizego");
  req.onsuccess = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains("photos")) return resolve("no-store");
    const count = db.transaction("photos", "readonly").objectStore("photos").count();
    count.onsuccess = () => resolve(count.result);
    count.onerror = () => resolve(-1);
  };
  req.onerror = () => resolve(-1);
})`));
console.log("localStorage:", await evaluate("Object.keys(localStorage).map(k => k + '=' + localStorage.getItem(k).slice(0, 120))"));
ws.close();
