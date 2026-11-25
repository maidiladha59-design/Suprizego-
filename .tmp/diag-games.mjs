const CDP = "http://127.0.0.1:9224";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const list = await fetch(`${CDP}/json/list`).then((r) => r.json());
const target = list.find((item) => item.type === "page") ?? list[0];
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  } else if (message.method === "Runtime.exceptionThrown") {
    events.push(message.params.exceptionDetails);
  } else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    events.push(message.params.args.map((arg) => arg.value ?? arg.description));
  }
};
await new Promise((resolve) => (ws.onopen = resolve));
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const nextId = ++id;
    pending.set(nextId, resolve);
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });
const evaluate = async (expression) => {
  const response = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.result.exceptionDetails) {
    throw new Error(JSON.stringify(response.result.exceptionDetails).slice(0, 800));
  }
  return response.result.result.value;
};
await send("Runtime.enable");
await send("Page.enable");
await send("Page.navigate", { url: "http://127.0.0.1:3100/contoh/pengakuan" });
await sleep(2000);
const before = await evaluate(`({
  buttons: [...document.querySelectorAll("button")].map(b => b.innerText.trim()),
  hasGame: !!document.getElementById("main-berdua"),
  body: document.body.innerText.slice(-1200),
})`);
await evaluate(`[...document.querySelectorAll("button")].find(b => b.innerText.includes("Buka kejutan"))?.click()`);
await sleep(2000);
const after = await evaluate(`({
  hasGame: !!document.getElementById("main-berdua"),
  headings: [...document.querySelectorAll("h1,h2,h3")].map(h => h.textContent.trim()),
  body: document.body.innerText.slice(-3000),
})`);
console.log(JSON.stringify({ before, after, events }, null, 2));
ws.close();
