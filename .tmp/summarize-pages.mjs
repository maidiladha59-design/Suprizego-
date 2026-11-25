import fs from "node:fs";
const dir = "C:/Users/User/Documents/SuprizeGo/.tmp";
const files = fs.readdirSync(dir).filter((f) => f.startsWith("ref-page2-") && f.endsWith(".json"));
for (const f of files.sort()) {
  try {
    const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
    const text = (j.text || "").replace(/\s+/g, " ");
    console.log(`${f} | ${j.title || "(no title)"} | ${j.url} | h:${j.scrollH} | text:${text.length} | h1:${(j.h1 || []).map((x) => x.text).join(" / ").slice(0, 90)}`);
  } catch (e) {
    console.log(f, "ERR", String(e).slice(0, 120));
  }
}
