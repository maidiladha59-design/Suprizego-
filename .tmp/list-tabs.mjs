const list = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
for (const p of list) {
  console.log(p.id, p.type, p.url, p.title);
}
