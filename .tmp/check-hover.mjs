const target = await (await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  }
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: "http://127.0.0.1:3000/" });
await new Promise((resolve) => setTimeout(resolve, 3000));
const result = await send("Runtime.evaluate", {
  expression:
    "({ hover: matchMedia('(hover: hover)').matches, anyHover: matchMedia('(any-hover: hover)').matches, fine: matchMedia('(pointer: fine)').matches })",
  returnByValue: true,
});
console.log(JSON.stringify(result.result.value));
ws.close();
await fetch("http://127.0.0.1:9222/json/close/" + target.id);
