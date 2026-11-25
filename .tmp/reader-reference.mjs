import fs from "node:fs";

const CDP = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Client {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve);
      this.ws.addEventListener("error", reject);
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
      }
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    const result = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return result;
  }

  async evaluate(expression) {
    const response = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
      userGesture: true,
    });
    if (response.exceptionDetails) {
      throw new Error(JSON.stringify(response.exceptionDetails).slice(0, 1200));
    }
    return response.result.value;
  }

  async click(selector) {
    const rect = await this.evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      el.scrollIntoView({ block: "center", inline: "center" });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    })()`);
    if (!rect) throw new Error(`Selector not found: ${selector}`);
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: rect.x, y: rect.y });
    await this.send("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
    await sleep(60);
    await this.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
  }

  close() {
    this.ws.close();
  }
}

const PHONE = `(() => {
  const envelope = [...document.querySelectorAll('button')].find((el) => /amplop/i.test(el.getAttribute('aria-label') || ''));
  const action = [...document.querySelectorAll('button')].find((el) => /^(BUKA|LANJUT BACA|SELESAI BACA|LANJUT|FOTO LAIN|lewati permainan|Tahan untuk)/i.test(el.innerText.trim()));
  let phone = envelope || action;
  while (phone && phone.parentElement) {
    const s = getComputedStyle(phone);
    const r = phone.getBoundingClientRect();
    if (parseFloat(s.borderTopWidth) >= 4 && r.width > 250 && r.width < 460 && r.height > 420) break;
    phone = phone.parentElement;
  }
  if (!phone) return null;
  const p = phone.getBoundingClientRect();
  const ps = getComputedStyle(phone);
  const screen = phone.querySelector('div[class*="rounded"]') || phone.firstElementChild;
  const sr = screen?.getBoundingClientRect();
  const ss = screen ? getComputedStyle(screen) : null;
  return {
    rect: { x: Math.round(p.x), y: Math.round(p.y), width: Math.round(p.width), height: Math.round(p.height) },
    border: ps.border,
    radius: ps.borderRadius,
    shadow: ps.boxShadow,
    background: ps.backgroundColor,
    screen: sr ? { rect: { x: Math.round(sr.x), y: Math.round(sr.y), width: Math.round(sr.width), height: Math.round(sr.height) }, background: ss.backgroundColor, color: ss.color, radius: ss.borderRadius } : null,
    text: phone.innerText.replace(/\\s+/g, " ").trim().slice(0, 700),
    buttons: [...phone.querySelectorAll('button,a,[role="button"]')].filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { text: el.innerText.replace(/\\s+/g, " ").trim(), ariaLabel: el.getAttribute('aria-label'), rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }, background: s.backgroundColor, color: s.color, border: s.border, radius: s.borderRadius, shadow: s.boxShadow };
    }),
  };
})()`;

async function shot(client, name) {
  const result = await client.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(result.data, "base64"));
}

async function clickText(client, pattern) {
  const result = await client.evaluate(`(() => {
    const re = new RegExp(${JSON.stringify(pattern)}, 'i');
    const el = [...document.querySelectorAll('button,a,[role="button"]')].find((item) => { const r = item.getBoundingClientRect(); const s = getComputedStyle(item); return re.test(item.innerText.trim()) && r.width > 0 && r.height > 0 && s.visibility !== 'hidden'; });
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: el.innerText.trim() };
  })()`);
  if (!result) { const debug = await client.evaluate(`[...document.querySelectorAll('button,a,[role="button"]')].map((el) => ({ text: el.innerText, aria: el.getAttribute('aria-label'), rect: [el.getBoundingClientRect().width, el.getBoundingClientRect().height], display: getComputedStyle(el).display, visibility: getComputedStyle(el).visibility }))`); throw new Error(`Button not found: ${pattern}; ${JSON.stringify(debug)}`); }
  await client.evaluate(`(() => {
    const re = new RegExp(${JSON.stringify(pattern)}, 'i');
    const el = [...document.querySelectorAll('button,a,[role="button"]')].find((item) => re.test(item.innerText.trim()));
    if (el) el.click();
  })()`);
  await sleep(650);
  return result.text;
}

async function run(label, viewport) {
  const target = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" }).then((response) => response.json());
  const client = new Client(target.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.bringToFront");
  await client.send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.mobile });
  await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  if (viewport.mobile) await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await client.send("Page.navigate", { url: "https://proposigo.app/momen/anniv" });
  await sleep(5500);
  await client.evaluate(`(() => {
    const reject = [...document.querySelectorAll('button')].find((el) => el.innerText.trim().toUpperCase() === 'TOLAK');
    if (reject) reject.click();
    window.scrollTo(0, 0);
  })()`);
  await sleep(500);

  const steps = [];
  const capture = async (name) => {
    const state = await client.evaluate(PHONE);
    await shot(client, `reader-ref-${label}-${name}`);
    steps.push({ name, ...state });
    return state;
  };

  const initial = await capture("00-amplop");
  const envelope = initial.buttons.find((button) => /amplop/i.test(button.ariaLabel || button.text));
  if (!envelope) throw new Error("Envelope button missing");
  await client.evaluate(`(() => { const el = [...document.querySelectorAll('button')].find((item) => /amplop/i.test(item.getAttribute('aria-label') || '')); if (el) el.click(); })()`);
  await sleep(700);
  await capture("01-sapaan");
  await clickText(client, "^buka");

  for (let index = 0; index < 3; index += 1) {
    const pattern = index === 2 ? "^selesai baca" : "^lanjut baca";
    await clickText(client, pattern);
    await capture(`02-story-${index + 1}`);
  }

  await capture("03-kenangan");
  await clickText(client, "^lanjut(?:\\s*→)?$");
  await capture("04-game-1");
  await clickText(client, "^lewati permainan ini");
  await capture("05-game-2");
  await clickText(client, "^lewati permainan ini");
  await capture("06-heart");

  const hold = await client.evaluate(`(() => {
    const el = [...document.querySelectorAll('button')].find((item) => /tahan untuk mengisi hati/i.test(item.innerText));
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  if (hold) {
    await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x: hold.x, y: hold.y, button: "left", clickCount: 1 });
    await sleep(2600);
    await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: hold.x, y: hold.y, button: "left", clickCount: 1 });
    await sleep(600);
  }
  await capture("07-after-heart");

  fs.writeFileSync(`${OUT}/reader-ref-${label}.json`, JSON.stringify({ viewport, steps }, null, 2));
  client.close();
}

await run("desktop", { width: 1440, height: 1000, mobile: false });
await run("mobile", { width: 390, height: 844, mobile: true });
