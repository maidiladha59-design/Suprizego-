const list = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
const target = list.find((p) => p.type === "page" && p.url.includes("proposigo.app"));
if (!target) throw new Error("no ref tab");
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
await new Promise((res) => (ws.onopen = res));
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Runtime.enable");
const raw = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (!r.result) return { cdpError: r.error };
  if (r.result.exceptionDetails) return { exception: r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text };
  return { value: r.result.result.value };
};
console.log("sections:", await raw(`[...document.querySelectorAll("section")].map(s => s.querySelector("h2")?.textContent).join(" || ")`));
console.log("probe:", await raw(`(() => {
  const ff = (label) => [...document.querySelectorAll("section")].find(s => (s.querySelector("h2")?.textContent ?? "").toUpperCase().includes(label));
  const s = ff("MAIN BERDUA");
  return { tag: s?.tagName, type: typeof s, rectType: typeof s?.getBoundingClientRect, cls: s?.className };
})()`));
console.log("boxTest:", await raw(`(() => {
  const s = [...document.querySelectorAll("section")].find(x => (x.querySelector("h2")?.textContent ?? "").toUpperCase().includes("MAIN BERDUA"));
  const b = s.getBoundingClientRect();
  return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)];
})()`));
ws.close();
