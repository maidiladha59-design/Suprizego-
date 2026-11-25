import fs from "node:fs";
const dir = "C:/Users/User/Documents/SuprizeGo/.tmp";
const files = fs.readdirSync(dir).filter((f) => /^(ref-page-|ref-more-|ref-faq|ref-dasbor|ref-cookie|ref-chat|ref-checkout|ref-wizard|ref-buat|ref-form)/.test(f) && f.endsWith(".json"));
for (const f of files.sort()) {
  try {
    const j = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
    const text = (typeof j.text === "string" ? j.text : JSON.stringify(j)).replace(/\s+/g, " ");
    const h1 = (j.h1 || []).map((x) => (typeof x === "string" ? x : x.text)).join(" / ");
    console.log(`${f} | ${j.title || ""} | ${j.url || ""} | text:${text.length} | h1:${h1.slice(0, 80)}`);
  } catch (e) {
    console.log(f, "ERR", String(e).slice(0, 100));
  }
}
