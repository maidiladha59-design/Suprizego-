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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await sleep(2500);
console.log("figures before:", await evaluate(`document.querySelectorAll("main section figure").length`));
console.log("reset buttons:", await evaluate(`[...document.querySelectorAll("button")].filter(b => b.textContent.includes("Ulangi dari awal")).map(b => ({ text: b.textContent, hidden: !b.offsetParent }))`));
console.log("confirm override:", await evaluate(`(() => { window.confirm = () => true; return window.confirm("x"); })()`));
const clicked = await evaluate(`(() => {
  const el = [...document.querySelectorAll("button")].find(b => b.textContent.includes("Ulangi dari awal"));
  if (!el) return "no-button";
  el.click();
  return "clicked";
})()`);
console.log("click:", clicked);
for (const ms of [300, 1000, 3000, 8000]) {
  await sleep(ms);
  const state = await evaluate(`({
    figures: document.querySelectorAll("main section figure").length,
    hint: [...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "foto")?.querySelector("p")?.textContent,
    ls: localStorage.getItem("suprizego:draft:pengakuan")?.slice(0, 80),
  })`);
  const dbCount = await evaluate(`new Promise((resolve) => {
    const req = indexedDB.open("suprizego");
    req.onsuccess = () => {
      const db = req.result;
      const count = db.transaction("photos", "readonly").objectStore("photos").count();
      count.onsuccess = () => resolve(count.result);
      count.onerror = () => resolve(-1);
    };
    req.onerror = () => resolve(-1);
  })`);
  console.log(`after +${ms}ms:`, JSON.stringify(state), "db:", dbCount);
}
ws.close();
