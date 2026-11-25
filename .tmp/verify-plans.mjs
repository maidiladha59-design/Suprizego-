import fs from "node:fs";
import { spawn } from "node:child_process";

const CDP = "http://127.0.0.1:9222";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";
const BASE = "http://127.0.0.1:3100";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const report = { checks: [], screenshots: [], errors: [] };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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
      if (message.method === "Runtime.exceptionThrown") {
        const text = message.params.exceptionDetails.text;
        report.errors.push(text);
      }
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        const text = message.params.args.map((arg) => arg.value || arg.description).join(" ");
        report.errors.push(text);
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
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails).slice(0, 1800));
    return response.result.value;
  }

  close() {
    this.ws.close();
  }
}

async function ensureChrome() {
  try {
    await fetch(`${CDP}/json/version`);
    return;
  } catch {
    const exe = [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      "C:/Users/User/AppData/Local/Google/Chrome/Application/chrome.exe",
    ].find((path) => fs.existsSync(path));
    if (!exe) throw new Error("Chrome not found");
    spawn(exe, ["--headless=new", "--remote-debugging-port=9222", `--user-data-dir=${OUT}/chrome-plan-verify`, "--no-first-run", "--disable-gpu", "about:blank"], { detached: true, stdio: "ignore" }).unref();
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await sleep(250);
      try {
        if ((await fetch(`${CDP}/json/version`)).ok) return;
      } catch {}
    }
    throw new Error("Chrome did not start");
  }
}

async function openPage(viewport) {
  const target = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" }).then((response) => response.json());
  const client = new Client(target.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Page.bringToFront");
  await client.send("Emulation.setDeviceMetricsOverride", { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.mobile });
  await client.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  return { client, target };
}

async function navigate(client, url) {
  await client.send("Page.navigate", { url });
  await sleep(1800);
}

async function click(client, selector) {
  const found = await client.evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    el.scrollIntoView({ block: "center", inline: "nearest" });
    return true;
  })()`);
  assert(found, `Control not found: ${selector}`);
  await client.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  await sleep(250);
}

async function editorState(client) {
  return client.evaluate(`(() => {
    const summary = document.querySelector("[data-plan-summary]");
    const spotify = document.querySelector("[data-spotify-locked]");
    const spotifyInput = document.querySelector("#lagu-pilihan");
    return {
      plan: summary?.getAttribute("data-plan-summary") || null,
      summary: summary?.innerText.replace(/\\s+/g, " ").trim() || null,
      options: [...document.querySelectorAll("[data-plan-option]")].map((el) => ({ id: el.getAttribute("data-plan-option"), pressed: el.getAttribute("aria-pressed") })),
      spotifyLocked: spotify?.getAttribute("data-spotify-locked") === "true",
      spotifyDisabled: spotifyInput?.disabled ?? null,
      voiceLocked: Boolean(document.querySelector("[data-voice-locked]")),
      voiceButtons: [...document.querySelectorAll("button")].map((el) => el.innerText.trim().toLowerCase()).filter((text) => /^(rekam|unggah audio)$/.test(text)),
      photoLimit: document.querySelector("[data-photo-limit]")?.getAttribute("data-photo-limit") || null,
      gameCards: document.querySelectorAll("[data-game-card]").length,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  })()`);
}

async function readerState(client) {
  return client.evaluate(`(() => {
    const root = document.querySelector("aside [data-reader-screen]");
    if (!root) return null;
    return {
      step: root.getAttribute("data-reader-step"),
      text: root.innerText.replace(/\\s+/g, " ").trim(),
      buttons: [...root.querySelectorAll("button")].map((el) => ({ text: el.innerText.trim(), aria: el.getAttribute("aria-label") })),
    };
  })()`);
}

async function shot(client, name) {
  const result = await client.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(result.data, "base64"));
  report.screenshots.push(`${name}.png`);
}

async function seedDraft(client) {
  await client.evaluate(`(() => {
    const games = [
      { id: "g1", type: "kuis", questions: [{ id: "q1", text: "Minuman favorit?", choices: [{ id: "c1", text: "Kopi", correct: true }, { id: "c2", text: "Teh", correct: false }] }] },
      { id: "g2", type: "jujur", prompt: "Mana bohong?", statements: ["Satu", "Dua", "Tiga"], lieIndex: 2 },
      { id: "g3", type: "rencana", prompt: "Mau ke mana?", choices: ["Kafe", "Taman", "Bioskop"] },
      { id: "g4", type: "susun" }
    ];
    localStorage.setItem("suprizego:draft:anniversary", JSON.stringify({ planId: "dasar", games, story: [], letter: "", sp: "" }));
  })()`);
}

await ensureChrome();
const { client } = await openPage({ width: 1440, height: 1000, mobile: false });

await navigate(client, `${BASE}/`);
const pricingLinks = await client.evaluate(`(() => [...document.querySelectorAll("#harga a")].map((el) => ({ text: el.innerText.trim(), href: el.getAttribute("href") })))()`);
assert(pricingLinks.some((item) => item.text.toLowerCase() === "pilih dasar" && item.href === "/buat?paket=dasar"), "Dasar pricing link does not carry plan");
assert(pricingLinks.some((item) => item.text.toLowerCase() === "pilih plus" && item.href === "/buat?paket=plus"), "Plus pricing link does not carry plan");
assert(pricingLinks.some((item) => item.text.toLowerCase() === "pilih abadi" && item.href === "/buat?paket=abadi"), "Abadi pricing link does not carry plan");
report.checks.push("Tiga CTA harga meneruskan PlanId");

await navigate(client, `${BASE}/buat?paket=abadi`);
const createState = await client.evaluate(`(() => ({ selected: document.querySelector("[data-selected-plan]")?.getAttribute("data-selected-plan"), links: [...document.querySelectorAll('a[href^="/buat/"]')].map((el) => el.getAttribute("href")) }))()`);
assert(createState.selected === "abadi", "Create page did not select Abadi");
assert(createState.links.length === 5 && createState.links.every((href) => href.endsWith("?paket=abadi")), "Moment links dropped selected plan");
report.checks.push("Halaman pilih momen mempertahankan paket Abadi");

await navigate(client, `${BASE}/buat/anniversary?paket=abadi`);
let state = await editorState(client);
assert(state.plan === "abadi" && state.summary.includes("Rp15.000") && state.summary.includes("aktif selamanya"), "Abadi summary is incorrect");
assert(!state.spotifyLocked && state.spotifyDisabled === false && !state.voiceLocked, "Abadi entitlements are locked");
assert(state.photoLimit === "8", "Photo limit is not read from plan");
report.checks.push("Paket Abadi memuat harga, durasi, dan akses Plus+");

await click(client, '[data-plan-option="dasar"]');
state = await editorState(client);
assert(state.plan === "dasar" && state.summary.includes("Rp5.000") && state.summary.includes("aktif 3 hari"), "Dasar summary is incorrect");
assert(state.spotifyLocked && state.spotifyDisabled === true && state.voiceLocked, "Dasar did not lock Spotify and voice note");
assert(state.voiceButtons.length === 0, "Dasar still shows voice recording actions");
report.checks.push("Paket Dasar mengunci Spotify dan pesan suara");
await client.evaluate(`document.querySelector("[data-spotify-locked]").scrollIntoView({ block: "center" })`);
await sleep(200);
await shot(client, "plans-desktop-dasar-spotify");
await client.evaluate(`document.querySelector("[data-voice-locked]").scrollIntoView({ block: "center" })`);
await sleep(200);
await shot(client, "plans-desktop-dasar-voice");

await click(client, '[data-plan-option="plus"]');
state = await editorState(client);
assert(state.plan === "plus" && state.summary.includes("Rp10.000") && state.summary.includes("aktif 14 hari"), "Plus summary is incorrect");
assert(!state.spotifyLocked && state.spotifyDisabled === false && !state.voiceLocked, "Plus entitlements are locked");
assert(state.voiceButtons.includes("rekam") && state.voiceButtons.includes("unggah audio"), "Plus voice actions are missing");
report.checks.push("Paket Plus membuka Spotify dan pesan suara");

await click(client, '[data-plan-option="abadi"]');
await sleep(500);
await navigate(client, `${BASE}/buat/anniversary`);
state = await editorState(client);
assert(state.plan === "abadi", "Selected plan was not persisted in localStorage");
report.checks.push("Pilihan paket tersimpan di draf lokal");

await seedDraft(client);
await navigate(client, `${BASE}/buat/anniversary?paket=plus`);
state = await editorState(client);
assert(state.plan === "plus", "Explicit pricing plan did not override stored plan");
report.checks.push("Paket dari URL mengesampingkan draf lama");

await seedDraft(client);
await navigate(client, `${BASE}/buat/anniversary`);
state = await editorState(client);
assert(state.plan === "dasar", "Seeded Dasar plan did not hydrate");
assert(state.gameCards === 1, `Dasar should clamp 4 restored games to 1, got ${state.gameCards}`);
report.checks.push("Draf tersimpan dipotong ke batas 1 permainan Dasar");

await click(client, 'aside button[aria-label="Ketuk amplop untuk membuka"]');
await click(client, 'aside [data-reader-step="greeting"] button');
let reader = await readerState(client);
assert(reader?.step === "games", `Preview did not reach games: ${JSON.stringify(reader)}`);
assert(/main berdua · 1\/1/i.test(reader.text), `Preview game limit is wrong: ${reader.text}`);
report.checks.push("Pratinjau pembaca hanya memainkan 1 game Dasar");
await shot(client, "plans-desktop");

await client.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await navigate(client, `${BASE}/buat/anniversary?paket=dasar`);
state = await editorState(client);
assert(state.plan === "dasar" && state.options.length === 3, "Mobile plan selector is incomplete");
assert(!state.horizontalOverflow, "Mobile editor has horizontal overflow");
assert(state.spotifyLocked && state.voiceLocked, "Mobile Dasar entitlements are incorrect");
report.checks.push("Editor mobile 390px tetap sesuai dan tanpa overflow horizontal");
await shot(client, "plans-mobile");
await click(client, '[data-plan-option="dasar"]');
await shot(client, "plans-mobile-package");

client.close();
assert(report.errors.length === 0, `Browser errors: ${report.errors.join(" | ")}`);
report.checks.push("Tidak ada error runtime browser");
fs.writeFileSync(`${OUT}/plans-verification.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
