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
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await new Promise((r) => setTimeout(r, 4000));
const r = await send("Runtime.evaluate", {
  expression: `(() => ({
    url: location.href,
    title: document.title,
    h2: [...document.querySelectorAll("h2")].map(h => h.textContent),
    sections: [...document.querySelectorAll("section")].map(s => s.querySelector("h2")?.textContent ?? null),
    body: document.body.innerText.slice(0, 600),
    ready: document.readyState,
  }))()`,
  returnByValue: true,
});
console.log(JSON.stringify(r.result.result.value, null, 2));
ws.close();
