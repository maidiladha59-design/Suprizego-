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
await send("Page.navigate", { url: "https://proposigo.app/buat/confess" });
await new Promise((r) => setTimeout(r, 3500));
const res = await send("Runtime.evaluate", {
  expression: `(() => {
    const out = [];
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch { continue; }
      for (const rule of rules) {
        const text = rule.cssText || '';
        if (text.includes('.nb-card') || text.includes('.nb-btn') || text.includes('.nb-input')) out.push(text);
      }
    }
    return out.slice(0, 80);
  })()`,
  returnByValue: true,
});
console.log(res.result.result.value.join("\n"));
ws.close();
