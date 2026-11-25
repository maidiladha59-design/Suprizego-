import fs from "node:fs";

const BASE = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newTarget() {
  const res = await fetch(`${BASE}/json/new?about:blank`, { method: "PUT" });
  return res.json();
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve);
      this.ws.addEventListener("error", reject);
    });
    this.ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    const p = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.ws.send(JSON.stringify({ id, method, params }));
    return p;
  }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  }
  close() {
    this.ws.close();
  }
}

async function shot(cdp, name) {
  const r = await cdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
}

async function openPage(viewport) {
  const target = await newTarget();
  const cdp = new CDP(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.w,
    height: viewport.h,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });
  await cdp.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  if (viewport.mobile) {
    await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  }
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:3000/" });
  await sleep(3500);
  return cdp;
}

async function audit(cdp) {
  return cdp.eval(`(() => {
    const section = document.querySelector('#momen');
    const heading = document.querySelector('#momen-title');
    const cards = [...section.querySelectorAll('a[href^="/contoh/"]')];
    const first = cards[0];
    const art = first ? first.firstElementChild : null;
    const footer = first ? first.lastElementChild : null;
    const info = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        rect: { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
        bg: s.backgroundColor,
        border: s.borderTopWidth + ' ' + s.borderTopColor,
        radius: s.borderRadius,
        shadow: s.boxShadow,
        font: s.fontSize + ' / ' + s.fontWeight,
        transform: s.transform,
      };
    };
    return {
      viewport: { w: innerWidth, scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight },
      sectionTop: section ? Math.round(section.getBoundingClientRect().top + scrollY) : null,
      sectionHeight: section ? Math.round(section.getBoundingClientRect().height) : null,
      sectionBg: section ? getComputedStyle(section).backgroundColor : null,
      heading: heading ? { text: heading.innerText, ...info(heading) } : null,
      cardCount: cards.length,
      hrefs: cards.map((a) => a.getAttribute('href')),
      firstCard: info(first),
      firstArt: info(art),
      firstFooter: info(footer),
      badgeText: first ? (first.innerText.split('\\n').at(-1) || '').trim() : null,
      gridColumns: section ? getComputedStyle(section.querySelector('.grid')).gridTemplateColumns : null,
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  })()`);
}

async function run(viewport, name) {
  const cdp = await openPage(viewport);
  await cdp.eval(`(() => { const s = document.querySelector('#momen'); if (s) window.scrollTo({ top: s.offsetTop - 90, behavior: 'instant' }); })()`);
  await sleep(700);
  await shot(cdp, `local-${name}-moments-top`);
  const data = await audit(cdp);

  const center = await cdp.eval(`(() => { const a = document.querySelector('#momen a[href^="/contoh/"]'); if (!a) return null; a.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = a.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  await sleep(500);
  await shot(cdp, `local-${name}-moments-cards`);

  let hover = null;
  if (center && !viewport.mobile) {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: center.x, y: center.y });
    await sleep(350);
    hover = await cdp.eval(`(() => { const a = document.querySelector('#momen a[href^="/contoh/"]'); return a ? getComputedStyle(a).transform : null; })()`);
    await shot(cdp, `local-${name}-moments-hover`);
  }

  const errors = cdp.events.filter((e) => e.method === "Runtime.exceptionThrown" || e.method === "Log.entryAdded");
  console.log(name, JSON.stringify({ ...data, hoverTransform: hover, consoleErrors: errors.length }));
  cdp.close();
}

await run({ w: 1440, h: 1000, mobile: false }, "desktop");
await run({ w: 390, h: 844, mobile: true }, "mobile");
console.log("done");
