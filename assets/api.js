// assets/api.js (полностью)

// ВАЖНО: сюда вставь URL именно текущего Web App (Deploy -> Manage deployments -> Web app URL)
const API_URL = "https://script.google.com/macros/s/AKfycbyUkZ6zaAf-1cd4M8QfBIKshbPevBTe0IW8lfupWsC49vYWllo5g_vkm9fuYgRmYvCY0Q/exec";

async function api(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await res.json().catch(() => ({ ok: false, error: "Bad JSON" }));

  if (!data.ok) throw new Error(data.error || "API error");
  return data;
}
