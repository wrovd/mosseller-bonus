// assets/api.js (полностью)

// ВАЖНО: сюда вставь URL именно текущего Web App (Deploy -> Manage deployments -> Web app URL)
const API_URL = "https://script.google.com/macros/s/AKfycbyRnmquMnsrJWmqU7SuVqhL-19UzgRi32Xmq9Jt6fmTdwNAfDh0g94jPFGvouEh8nJAkg/exec";

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
