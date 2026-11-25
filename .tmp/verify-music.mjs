import { writeFileSync } from "node:fs";

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
const evaluate = async (expression, attempt = 0) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.error || !r.result) {
    if (attempt < 3) {
      await sleep(350);
      return evaluate(expression, attempt + 1);
    }
    throw new Error(`evaluate failed: ${JSON.stringify(r).slice(0, 400)}`);
  }
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
  return r.result.result.value;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitUntil = async (expression, timeout = 20000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(expression)) return true;
    await sleep(200);
  }
  return false;
};
const shot = async (name) => {
  const s = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`C:/Users/User/Documents/SuprizeGo/.tmp/${name}.png`, Buffer.from(s.result.data, "base64"));
};

await send("Page.enable");
await send("Runtime.enable");

const openTabs = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
for (const p of openTabs) {
  if (p.type === "page" && p.url.startsWith("http://127.0.0.1:3100")) {
    await fetch(`http://127.0.0.1:9222/json/close/${p.id}`);
  }
}

const measure = `(() => {
  const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  const section = [...document.querySelectorAll("main section")].find(s => (s.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik");
  const group = section?.querySelector("[role=group]");
  const wrappers = [...(group?.children ?? [])];
  const options = wrappers.map((w) => {
    const select = w.querySelector("button[aria-pressed]");
    const play = w.querySelector("button[aria-label^='Dengar'], button[aria-label^='Hentikan']");
    return {
      name: select?.querySelector("span")?.textContent,
      tagline: select?.querySelectorAll("span")[1]?.textContent,
      selected: select?.getAttribute("aria-pressed"),
      box: box(w),
      bg: getComputedStyle(w).backgroundColor,
      border: getComputedStyle(w).borderTopWidth,
      radius: getComputedStyle(w).borderRadius,
      play: play ? { label: play.getAttribute("aria-label"), box: box(play), bg: getComputedStyle(play).backgroundColor, shadow: getComputedStyle(play).boxShadow } : null,
    };
  });
  const input = section?.querySelector("#lagu-pilihan");
  const tempel = [...(section?.querySelectorAll("button") ?? [])].find(b => b.textContent.trim() === "Tempel");
  return {
    heading: section?.querySelector("h2")?.textContent,
    hint: section?.querySelector("p")?.textContent,
    section: box(section),
    options,
    spotify: { value: input?.value, placeholder: input?.placeholder, maxlength: input?.maxLength, box: box(input) },
    tempel: tempel ? { box: box(tempel), text: tempel.textContent } : null,
    status: section?.querySelector("[role=status]")?.textContent ?? null,
    labels: [...(section?.querySelectorAll("label") ?? [])].map(l => l.textContent.trim()),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
})()`;

const fill = (selector, value) => `(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event("input", { bubbles: true }));
  return el.value;
})()`;

const clickText = (text) => `(() => {
  const el = [...document.querySelectorAll("button")].find(b => b.textContent.includes(${JSON.stringify(text)}));
  if (!el) return false;
  el.click();
  return true;
})()`;

const scrollToSection = `(() => {
  const s = [...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik");
  if (!s) return 0;
  window.scrollTo({ top: Math.max(0, s.getBoundingClientRect().top + window.scrollY - 90) });
  return Math.round(s.getBoundingClientRect().top);
})()`;

const clickPlay = async (label) => {
  const box = await evaluate(`(() => {
    const b = [...document.querySelectorAll("button")].find(x => x.getAttribute("aria-label") === ${JSON.stringify(label)});
    if (!b) return null;
    b.scrollIntoView({ block: "center" });
    const r = b.getBoundingClientRect();
    return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)];
  })()`);
  if (!box) throw new Error(`play button not found: ${label}`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: box[0], y: box[1], button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: box[0], y: box[1], button: "left", clickCount: 1 });
};

const patchAudio = `(() => {
  window.__music = { renders: [], sources: [] };
  const origRender = OfflineAudioContext.prototype.startRendering;
  OfflineAudioContext.prototype.startRendering = function () {
    return origRender.call(this).then((buffer) => {
      const data = buffer.getChannelData(0);
      let peak = 0;
      let sum = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 97) {
        const v = data[i];
        peak = Math.max(peak, Math.abs(v));
        sum += v * v;
        count += 1;
      }
      window.__music.renders.push({ duration: buffer.duration, sampleRate: buffer.sampleRate, peak, rms: Math.sqrt(sum / Math.max(1, count)) });
      return buffer;
    });
  };
  const origStart = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...args) {
    window.__music.sources.push({ loop: this.loop, duration: this.buffer?.duration ?? null });
    return origStart.apply(this, args);
  };
  return true;
})()`;

const out = {};

await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 1000 });
await send("Emulation.setTouchEmulationEnabled", { enabled: false });
await send("Page.bringToFront");
await send("Browser.grantPermissions", { origin: "http://127.0.0.1:3100", permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] }).catch(() => {});
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await waitUntil(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik")`, 20000);
await evaluate("localStorage.clear()");
await send("Page.reload");
await waitUntil(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik")`, 20000);
await sleep(400);

await evaluate(scrollToSection);
await sleep(300);
out.initial = await evaluate(measure);
await shot("local-music-desktop-initial");

out.selectKotak = await evaluate(clickText("Kotak Musik"));
await sleep(250);
out.selected = await evaluate(measure);
await evaluate(fill("#lagu-pilihan", "https://open.spotify.com/track/contoh"));
await sleep(350);
await shot("local-music-desktop-selected");

out.clipboardWrite = await evaluate(`navigator.clipboard.writeText("https://open.spotify.com/track/dari-clipboard").then(() => true).catch(() => false)`);
await sleep(200);
out.pasteClick = await evaluate(clickText("Tempel"));
await sleep(500);
out.afterPaste = await evaluate(measure);

await evaluate("window.scrollTo({ top: 0 })");
await send("Page.reload");
await waitUntil(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik")`, 20000);
await sleep(500);
out.afterReload = await evaluate(measure);
console.log("reload selected:", out.afterReload.options.map(o => `${o.name}:${o.selected}`).join(", "), "| spotify:", out.afterReload.spotify.value);

await evaluate(patchAudio);
await evaluate(scrollToSection);
await sleep(250);
await clickPlay("Dengar Kotak Musik");
const kotakPlayed = await waitUntil(`window.__music.sources.length === 1 && !!document.querySelector('button[aria-label="Hentikan Kotak Musik"]')`, 20000);
await sleep(600);
out.kotak = {
  played: kotakPlayed,
  renders: await evaluate("window.__music.renders"),
  sources: await evaluate("window.__music.sources"),
  ui: await evaluate(measure),
};
await shot("local-music-desktop-playing");

await clickPlay("Hentikan Kotak Musik");
await waitUntil(`!!document.querySelector('button[aria-label="Dengar Kotak Musik"]')`, 5000);
await sleep(300);
out.kotakStop = {
  stopped: await evaluate(`!!document.querySelector('button[aria-label="Dengar Kotak Musik"]')`),
  renders: await evaluate("window.__music.renders"),
};

await clickPlay("Dengar Manis Manja");
const manisPlayed = await waitUntil(`window.__music.sources.length === 2 && !!document.querySelector('button[aria-label="Hentikan Manis Manja"]')`, 20000);
await sleep(500);
out.manis = {
  played: manisPlayed,
  renders: await evaluate("window.__music.renders"),
  sources: await evaluate("window.__music.sources"),
};

out.chooseSilent = await evaluate(clickText("Tanpa Musik"));
await waitUntil(`!!document.querySelector('button[aria-label="Dengar Manis Manja"]')`, 5000);
await sleep(350);
out.silent = await evaluate(measure);

out.selectKotak2 = await evaluate(clickText("Kotak Musik"));
await sleep(250);
await evaluate(`(() => {
  try {
    Object.defineProperty(navigator.clipboard, "readText", { value: () => Promise.reject(new Error("blocked")) });
    return "patched";
  } catch {
    return "patch-failed";
  }
})()`);
await sleep(100);
out.pasteFailClick = await evaluate(clickText("Tempel"));
await sleep(350);
out.pasteFail = await evaluate(measure);

await evaluate("window.confirm = () => true");
out.resetClick = await evaluate(`(() => {
  const el = [...document.querySelectorAll("button")].find(b => b.textContent.includes("Ulangi dari awal") && b.offsetParent);
  if (!el) return "no-button";
  el.click();
  return "clicked";
})()`);
await sleep(1000);
out.afterReset = await evaluate(measure);

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true, screenWidth: 390, screenHeight: 844 });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: "http://127.0.0.1:3100/buat/pengakuan" });
await waitUntil(`!![...document.querySelectorAll("main section")].find(x => (x.querySelector("h2")?.textContent ?? "").toLowerCase() === "musik")`, 20000);
await sleep(400);
await evaluate(clickText("Kotak Musik"));
await sleep(250);
await evaluate(scrollToSection);
await sleep(400);
out.mobile = await evaluate(measure);
await shot("local-music-mobile");

console.log(JSON.stringify(out, null, 2));
ws.close();
