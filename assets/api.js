// Вставь сюда Web App URL из Apps Script:
const API_URL = "https://script.google.com/macros/s/AKfycbz2FQUWQd7sT0MFY3Dr01gfmN6Kclv12MocO4ekusUBOhgnUOYvpn3PyEnDwWD_F5tdlA/exec";

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
