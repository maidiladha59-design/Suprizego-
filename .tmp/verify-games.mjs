import { writeFileSync } from "node:fs";

const CDP = "http://127.0.0.1:9224";
const BASE = "http://127.0.0.1:3100";
const OUT = "C:/Users/User/Documents/SuprizeGo/.tmp";

const target = await fetch(`${CDP}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
};
await new Promise((resolve) => (ws.onopen = resolve));

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const nextId = ++id;
    pending.set(nextId, resolve);
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const evaluate = async (expression, attempt = 0) => {
  const response = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.error || !response.result) {
    if (attempt < 3) {
      await sleep(300);
      return evaluate(expression, attempt + 1);
    }
    throw new Error(`evaluate failed: ${JSON.stringify(response).slice(0, 500)}`);
  }
  if (response.result.exceptionDetails) {
    throw new Error(JSON.stringify(response.result.exceptionDetails).slice(0, 700));
  }
  return response.result.result.value;
};
const waitUntil = async (expression, timeout = 15000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await evaluate(expression)) return true;
    await sleep(180);
  }
  return false;
};
const shot = async (name) => {
  const response = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(response.result.data, "base64"));
};
const clickButton = (script) => `(() => {
  const button = [...document.querySelectorAll("button")].find(
    (x) => x.offsetParent !== null && (${script}),
  );
  if (!button) return null;
  button.click();
  return button.innerText.replace(/\\s+/g, " ").trim();
})()`;

await send("Page.enable");
await send("Runtime.enable");
await send("DOM.enable");

const editorMeasure = `(() => {
  const section = [...document.querySelectorAll("section")].find(
    (item) => (item.querySelector("h2")?.textContent ?? "").toUpperCase().includes("MAIN BERDUA"),
  );
  if (!section) return null;
  const cards = [...section.querySelectorAll("article")].map((card) => ({
    title: card.querySelector("h3")?.textContent.replace(/\\s+/g, " ").trim(),
    text: card.innerText.replace(/\\s+/g, " ").trim().slice(0, 500),
  }));
  const music = [...document.querySelectorAll("section")].find(
    (item) => (item.querySelector("h2")?.textContent ?? "").toUpperCase().includes("MUSIK"),
  );
  const letter = [...document.querySelectorAll("section")].find(
    (item) => (item.querySelector("h2")?.textContent ?? "").toUpperCase().includes("SURAT PENUTUP"),
  );
  return {
    number: section.querySelector("span")?.textContent.trim(),
    subtitle: section.querySelector("h2")?.nextElementSibling?.textContent.replace(/\\s+/g, " ").trim(),
    cards,
    tiles: [...section.querySelectorAll("button")]
      .filter((button) => !button.closest("article"))
      .map((button) => ({
        text: button.innerText.replace(/\\s+/g, " ").trim(),
        disabled: button.disabled,
      })),
    questionFields: section.querySelectorAll("fieldset").length,
    firstQuestion: section.querySelector("fieldset input[type=text]")?.value ?? null,
    choicesInFirstQuestion: section.querySelectorAll("fieldset input[type=text]")[1]?.value ?? null,
    radioCount: section.querySelectorAll("fieldset input[type=radio]").length,
    musicNumber: music?.querySelector("span")?.textContent.trim() ?? null,
    letterNumber: letter?.querySelector("span")?.textContent.trim() ?? null,
    notice: section.querySelector('[role="alert"]')?.textContent.replace(/\\s+/g, " ").trim() ?? null,
    overflow: document.documentElement.scrollWidth - window.innerWidth,
  };
})()`;

const playerMeasure = `(() => {
  const player = document.getElementById("main-berdua");
  if (!player) return null;
  const badge = [...player.querySelectorAll("span")].find((item) => /MAIN BERDUA/i.test(item.textContent));
  return {
    badge: badge?.textContent.replace(/\\s+/g, " ").trim() ?? null,
    title: player.querySelector("h2")?.textContent.replace(/\\s+/g, " ").trim() ?? null,
    subtitle: player.querySelector("h2")?.nextElementSibling?.textContent.replace(/\\s+/g, " ").trim() ?? null,
    text: player.innerText.replace(/\\s+/g, " ").trim(),
    buttons: [...player.querySelectorAll("button")].map((button) => ({
      text: button.innerText.replace(/\\s+/g, " ").trim(),
      disabled: button.disabled,
      bg: getComputedStyle(button).backgroundColor,
    })),
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    box: (() => {
      const rect = player.getBoundingClientRect();
      return [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)];
    })(),
  };
})()`;

const setInput = (selector, value) => `(() => {
  const input = document.querySelector(${JSON.stringify(selector)});
  if (!input) return false;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, ${JSON.stringify(value)});
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
})()`;

const setPlan = (planId) => `(() => {
  const key = "suprizego:draft:pengakuan";
  const draft = JSON.parse(localStorage.getItem(key) ?? "{}");
  draft.planId = ${JSON.stringify(planId)};
  draft.games = [];
  localStorage.setItem(key, JSON.stringify(draft));
  return draft.planId;
})()`;

const results = {};
const requireWait = async (expression, label, timeout) => {
  const ok = await waitUntil(expression, timeout);
  if (!ok) throw new Error(`Timed out: ${label}`);
  return ok;
};

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
  screenWidth: 1440,
  screenHeight: 1000,
});
await send("Emulation.setTouchEmulationEnabled", { enabled: false });
await send("Page.navigate", { url: `${BASE}/buat/pengakuan` });
await requireWait(`!![...document.querySelectorAll("h2")].some((item) => item.textContent.includes("Main Berdua"))`, "editor section");
await evaluate("localStorage.removeItem('suprizego:draft:pengakuan')");
await send("Page.reload");
await requireWait(`!![...document.querySelectorAll("h2")].some((item) => item.textContent.includes("Main Berdua"))`, "fresh editor");
await sleep(500);
results.editorInitial = await evaluate(editorMeasure);
await evaluate(`[...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.scrollIntoView({ block: "start" })`);
await sleep(350);
await shot("verify-games-editor-initial");

results.addQuiz = await evaluate(clickButton(`x.innerText.toUpperCase().includes("KUIS KENAL AKU")`));
await requireWait(`!![...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.querySelector("article")`, "quiz card");
await evaluate(setInput('section input[aria-label="Pertanyaan soal 1"]', "Apa lagu yang paling sering aku nyanyi?"));
await evaluate(setInput('section input[aria-label="Pilihan 1 soal 1"]', "Lagu favoritku"));
await evaluate(setInput('section input[aria-label="Pilihan 2 soal 1"]', "Lagu iklan"));
await evaluate(setInput('section input[aria-label="Pilihan 3 soal 1"]', "Lagu tidur"));
await sleep(350);
results.quizFilled = await evaluate(editorMeasure);

results.addQuestion = await evaluate(clickButton(`x.innerText.toUpperCase().includes("TAMBAH SOAL")`));
await requireWait(`[...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.querySelectorAll("fieldset").length === 2`, "second question");
results.addChoice = await evaluate(clickButton(`x.innerText.trim().toLowerCase() === "+ pilihan"`));
await requireWait(`[...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.querySelectorAll("fieldset")[0]?.querySelectorAll("input[type=text]").length === 5`, "fourth choice");
await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "HAPUS SOAL"`));
await requireWait(`[...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.querySelectorAll("fieldset").length === 1`, "remove question");
await sleep(400);
results.afterQuestionEdits = await evaluate(editorMeasure);

results.addTruth = await evaluate(clickButton(`x.innerText.toUpperCase().includes("DUA JUJUR SATU BOHONG")`));
await requireWait(`[...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.querySelectorAll("article").length === 2`, "truth card");
await sleep(350);
results.plusLimit = await evaluate(editorMeasure);
await shot("verify-games-editor-limit");

await send("Page.reload");
await requireWait(`!![...document.querySelectorAll("h2")].some((item) => item.textContent.includes("Main Berdua"))`, "persist reload");
await sleep(500);
results.persistedEditor = await evaluate(editorMeasure);

await evaluate(setPlan("dasar"));
await send("Page.reload");
await requireWait(`!![...document.querySelectorAll("h2")].some((item) => item.textContent.includes("Main Berdua"))`, "dasar reload");
await sleep(400);
await evaluate(clickButton(`x.innerText.toUpperCase().includes("KUIS KENAL AKU")`));
await requireWait(`!![...document.querySelectorAll('[role="alert"]')].length || !!document.body.innerText.includes("Batas paket Dasar")`, "dasar limit");
await sleep(250);
results.dasarLimit = await evaluate(editorMeasure);

await evaluate(setPlan("abadi"));
await send("Page.reload");
await requireWait(`!![...document.querySelectorAll("h2")].some((item) => item.textContent.includes("Main Berdua"))`, "abadi reload");
await sleep(400);
await evaluate(clickButton(`x.innerText.toUpperCase().includes("KUIS KENAL AKU")`));
await sleep(200);
await evaluate(clickButton(`x.innerText.toUpperCase().includes("DUA JUJUR SATU BOHONG")`));
await sleep(200);
await evaluate(clickButton(`x.innerText.toUpperCase().includes("RENCANA BARENG")`));
await requireWait(`[...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.querySelectorAll("article").length === 3`, "abadi third game");
await sleep(350);
results.abadiLimit = await evaluate(editorMeasure);
await shot("verify-games-editor-abadi");

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: 390,
  screenHeight: 844,
});
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await evaluate("localStorage.removeItem('suprizego:draft:pengakuan')");
await send("Page.navigate", { url: `${BASE}/buat/pengakuan` });
await requireWait(`!![...document.querySelectorAll("h2")].some((item) => item.textContent.includes("Main Berdua"))`, "mobile editor");
await sleep(500);
results.editorMobile = await evaluate(editorMeasure);
await evaluate(`[...document.querySelectorAll("section")].find((item) => /MAIN BERDUA/i.test(item.querySelector("h2")?.textContent ?? ""))?.scrollIntoView({ block: "start" })`);
await sleep(350);
await shot("verify-games-editor-mobile");

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
  screenWidth: 1440,
  screenHeight: 1000,
});
await send("Emulation.setTouchEmulationEnabled", { enabled: false });
await send("Page.navigate", { url: `${BASE}/contoh/pengakuan` });
await requireWait(`!![...document.querySelectorAll("button")].some((item) => item.innerText.includes("Buka kejutan"))`, "example cover");
await sleep(900);
await evaluate(clickButton(`x.innerText.includes("Buka kejutan")`));
await requireWait(`!!document.getElementById("main-berdua")`, "example player");
await evaluate(`document.getElementById("main-berdua").scrollIntoView({ block: "center" })`);
await sleep(500);
results.playerInitial = await evaluate(playerMeasure);
await shot("verify-games-player-question");

results.correctAnswer = await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "ES TEH MANIS"`));
await requireWait(`document.getElementById("main-berdua")?.innerText.includes("Tepat! Kamu jago.")`, "correct feedback");
await sleep(250);
results.playerCorrect = await evaluate(playerMeasure);
await shot("verify-games-player-correct");

await evaluate(clickButton(`x.innerText.toUpperCase().includes("SOAL BERIKUTNYA")`));
await requireWait(`document.getElementById("main-berdua")?.innerText.includes("2/2") && document.getElementById("main-berdua")?.innerText.includes("Pertama kali")`, "second question");
results.playerSecondQuestion = await evaluate(playerMeasure);
await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "DI KANTIN"`));
await requireWait(`document.getElementById("main-berdua")?.innerText.includes("Belum tepat")`, "wrong feedback");
await sleep(250);
results.playerWrong = await evaluate(playerMeasure);
await shot("verify-games-player-wrong");

await evaluate(clickButton(`x.innerText.toUpperCase().includes("LIHAT SKOR")`));
await requireWait(`document.getElementById("main-berdua")?.innerText.includes("1/2")`, "score");
await sleep(300);
results.playerScore = await evaluate(playerMeasure);
await shot("verify-games-player-score");

await evaluate(clickButton(`x.innerText.toUpperCase().includes("GAME BERIKUTNYA")`));
await requireWait(`document.getElementById("main-berdua")?.innerText.includes("RENCANA BARENG")`, "plan game");
await sleep(250);
results.playerPlan = await evaluate(playerMeasure);
await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "NONTON FILM PILIHANMU"`));
await requireWait(`document.getElementById("main-berdua")?.innerText.includes("TIKET JANJI")`, "ticket");
await sleep(250);
results.playerTicket = await evaluate(playerMeasure);
await shot("verify-games-player-ticket");

await evaluate(clickButton(`x.innerText.trim().toUpperCase() === "LANJUT →"`));
await requireWait(`/permainan selesai/i.test(document.getElementById("main-berdua")?.innerText ?? "")`, "finished player");
await sleep(400);
results.playerFinished = await evaluate(playerMeasure);
await shot("verify-games-player-finished");

await send("Page.reload");
await requireWait(`!![...document.querySelectorAll("button")].some((item) => item.innerText.includes("Buka kejutan"))`, "example cover reload");
await sleep(900);
await evaluate(clickButton(`x.innerText.includes("Buka kejutan")`));
await requireWait(`!!document.getElementById("main-berdua")`, "skip player");
await evaluate(`document.getElementById("main-berdua").scrollIntoView({ block: "center" })`);
await sleep(250);
await evaluate(clickButton(`x.innerText.trim() === "lewati permainan ini"`));
await requireWait(`document.getElementById("main-berdua")?.innerText.includes("RENCANA BARENG")`, "skip to plan");
results.playerSkipped = await evaluate(playerMeasure);

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
  screenWidth: 390,
  screenHeight: 844,
});
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.reload");
await requireWait(`!![...document.querySelectorAll("button")].some((item) => item.innerText.includes("Buka kejutan"))`, "mobile cover");
await sleep(900);
await evaluate(clickButton(`x.innerText.includes("Buka kejutan")`));
await requireWait(`!!document.getElementById("main-berdua")`, "mobile player");
await evaluate(`document.getElementById("main-berdua").scrollIntoView({ block: "center" })`);
await sleep(400);
results.playerMobile = await evaluate(playerMeasure);
await shot("verify-games-player-mobile");

writeFileSync(`${OUT}/verify-games.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
ws.close();
