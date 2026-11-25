import { writeFileSync } from "node:fs";

const base = "http://127.0.0.1:9222";
const outDir = "C:/Users/User/Documents/SuprizeGo/.tmp";

async function newTarget() {
  const t = await fetch(`${base}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
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
  return { ws, send };
}

const measure = () => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  };
  const cs = (el) => (el ? getComputedStyle(el) : null);
  const font = (el) => {
    const s = cs(el);
    return s ? `${s.fontSize}/${s.lineHeight} ${s.fontWeight} ${s.fontFamily.split(",")[0]}` : null;
  };
  const header = document.querySelector("header");
  const headerCta = header?.querySelector("a[href]");
  const main = document.querySelector("main");
  const h1 = main?.querySelector("h1");
  const sub = h1?.nextElementSibling;
  const grid = main?.querySelector("div");
  const cards = [...(grid?.children ?? [])].map((link) => {
    const article = link.querySelector("article");
    const band = article?.children[0];
    const svg = band?.querySelector("svg");
    const body = article?.children[1];
    const h2 = body?.querySelector("h2");
    const desc = body?.querySelector("p");
    const chip = body?.querySelector("span");
    const sticker = link.querySelector(":scope > span");
    const a = cs(article);
    return {
      href: link.getAttribute("href"),
      link: r(link),
      card: r(article),
      border: a?.borderTopWidth,
      radius: a?.borderTopLeftRadius,
      shadow: a?.boxShadow,
      band: r(band),
      bandClass: band?.className,
      svg: r(svg),
      title: h2?.textContent,
      titleFont: font(h2),
      titleBox: r(h2),
      desc: desc?.textContent,
      descFont: font(desc),
      chip: chip?.textContent?.trim(),
      chipFont: font(chip),
      chipBox: r(chip),
      chipBorder: cs(chip)?.borderTopWidth,
      sticker: sticker?.textContent?.trim() ?? null,
      stickerBox: r(sticker),
      stickerFont: font(sticker),
    };
  });
  return {
    viewport: { w: innerWidth, h: innerHeight },
    header: { h: r(header)?.h, ctaText: headerCta?.textContent?.trim(), ctaHref: headerCta?.getAttribute("href") },
    main: { rect: r(main), pad: cs(main) && `${cs(main).paddingTop} ${cs(main).paddingRight}`, maxW: cs(main)?.maxWidth },
    h1: { text: h1?.textContent, rect: r(h1), font: font(h1) },
    sub: { text: sub?.textContent, rect: r(sub), font: font(sub) },
    grid: {
      rect: r(grid),
      cols: cs(grid)?.gridTemplateColumns,
      rows: cs(grid)?.gridTemplateRows,
      gap: cs(grid)?.gap,
    },
    cards,
    footerTop: Math.round(document.querySelector("footer")?.getBoundingClientRect().top ?? -1),
  };
};

const { ws, send } = await newTarget();
await send("Page.enable");
await send("Runtime.enable");

async function shoot(name) {
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(`${outDir}/${name}.png`, Buffer.from(shot.result.data, "base64"));
}

async function run(width, height, mobile, slug) {
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile,
    screenWidth: width, screenHeight: height,
  });
  await send("Emulation.setTouchEmulationEnabled", mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await send("Page.navigate", { url: "http://127.0.0.1:3100/buat" });
  await new Promise((r) => setTimeout(r, 1800));
  await send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => true)", awaitPromise: true });
  await new Promise((r) => setTimeout(r, 500));
  const res = await send("Runtime.evaluate", {
    expression: `(${measure.toString()})()`,
    returnByValue: true,
    awaitPromise: false,
  });
  await shoot(`local-buat-${slug}-01`);
  return res.result.result.value;
}

const desktop = await run(1440, 1000, false, "desktop");
const mobile = await run(390, 844, true, "mobile");
console.log(JSON.stringify({ desktop, mobile }, null, 2));
ws.close();
