const list = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
for (const p of list) {
  if (p.type === "page" && p.url.startsWith("http://127.0.0.1:3100")) {
    await fetch(`http://127.0.0.1:9222/json/close/${p.id}`);
    console.log("closed", p.id);
  }
}
