import fs from "node:fs";
const dir = "C:/Users/User/Documents/SuprizeGo/.tmp";
const targets = [
  "ref-page-home-d.json",
  "ref-page2-home-m.json",
  "ref-page2-en-home-d.json",
  "ref-page2-buat-m.json",
  "ref-page2-buat-ultah-d.json",
  "ref-page2-buat-ultah-m.json",
  "ref-page2-buat-anniv-d.json",
  "ref-page2-buat-maaf-d.json",
  "ref-page2-buat-wisuda-d.json",
  "ref-page2-buat-rayakan-d.json",
  "ref-page-momen-confess-d.json",
  "ref-page-momen-ultah-d.json",
  "ref-page-momen-anniv-d.json",
  "ref-page-momen-maaf-d.json",
  "ref-page-momen-wisuda-d.json",
  "ref-page-momen-rayakan-d.json",
  "ref-page2-momen-confess-gebetan-d.json",
  "ref-page2-momen-ultah-pacar-d.json",
  "ref-page-hari-d.json",
  "ref-page2-hari-guru-m.json",
  "ref-page2-hari-ibu-m.json",
  "ref-page-ide-d.json",
  "ref-page2-ide-confess-d.json",
  "ref-page2-papan-d.json",
  "ref-page2-papan-m.json",
  "ref-page2-terms-d.json",
  "ref-page2-privacy-m.json",
  "ref-page2-en-buat-d.json",
  "ref-more-en-buat.json",
  "ref-more-en-home.json",
  "ref-more-en-momen-confess.json",
  "ref-page2-notfound-d.json",
  "ref-dasbor.json",
];
const out = [];
const clip = (s, n) => (s || "").toString().replace(/\s+/g, " ").trim().slice(0, n);
for (const f of targets) {
  const p = `${dir}/${f}`;
  if (!fs.existsSync(p)) { out.push(`\n===== ${f} MISSING =====`); continue; }
  let j;
  try { j = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { out.push(`\n===== ${f} UNREADABLE =====`); continue; }
  out.push(`\n===== ${f} =====`);
  out.push(`url: ${j.url} | title: ${clip(j.title, 120)}`);
  if (j.desc) out.push(`desc: ${clip(j.desc, 160)}`);
  if (j.robots || j.canonical || j.lang) out.push(`robots: ${j.robots} | canonical: ${j.canonical} | lang: ${j.lang}`);
  if (j.og) out.push(`og: ${JSON.stringify(j.og)}`);
  if (j.theme) out.push(`theme: ${j.theme}`);
  if (j.body) out.push(`body: ${JSON.stringify(j.body)}`);
  if (Array.isArray(j.h1)) out.push(`h1: ${j.h1.map((h) => (typeof h === "string" ? h : `${clip(h.text, 90)} [${h.size}/${h.lh}/${h.family}]`)).join(" || ")}`);
  if (Array.isArray(j.h2)) out.push(`h2: ${j.h2.map((h) => clip(typeof h === "string" ? h : h.text, 70)).join(" | ")}`);
  if (Array.isArray(j.h3)) out.push(`h3: ${j.h3.map((h) => clip(typeof h === "string" ? h : h.text, 60)).join(" | ")}`);
  if (Array.isArray(j.sections)) {
    out.push(`sections(${j.sections.length}):`);
    for (const s of j.sections.slice(0, 40)) out.push(`  - ${s.tag}${s.id ? "#" + s.id : ""} h:${s.h} cls:${clip(s.cls, 80)} | ${clip(s.text, 70)}`);
  }
  if (Array.isArray(j.buttons)) out.push(`buttons: ${j.buttons.map((b) => clip(typeof b === "string" ? b : b.text, 40)).join(" | ")}`);
  if (Array.isArray(j.links)) {
    const uniq = [...new Map(j.links.map((l) => [l.t + "|" + l.h, l])).values()];
    out.push(`links: ${uniq.map((l) => `${clip(l.t, 30)}=>${l.h}`).join(" | ")}`);
  }
  if (j.text) out.push(`text(${clip(j.text, 100000).length > 1600 ? "trunc" : "full"}): ${clip(j.text, 1600)}`);
  if (j.scrollH) out.push(`scrollH: ${j.scrollH}`);
}
fs.writeFileSync(`${dir}/digest.txt`, out.join("\n"));
console.log("digest written:", out.length, "lines");
