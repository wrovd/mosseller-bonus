const tokenKey = "mosseller_token";
const getToken = () => localStorage.getItem(tokenKey);
const clearToken = () => localStorage.removeItem(tokenKey);

function fmtRub(n) {
  const x = Math.round(Number(n || 0));
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
}

function fmtCard(num) {
  const s = String(num || "");
  return s.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function calcToNext(totalSpent, nextThreshold) {
  if (!nextThreshold) return 0;
  return Math.max(0, nextThreshold - Number(totalSpent || 0));
}

function renderHistory(items) {
  const el = document.getElementById("historyList");
  if (!items || !items.length) {
    el.innerHTML = `<div class="history-row"><div class="muted">Пока нет операций</div></div>`;
    return;
  }

  el.innerHTML = items
    .slice()
    .reverse()
    .map(it => {
      const d = new Date(it.date || Date.now());
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yy = d.getFullYear();
      return `
      <div class="history-row">
        <div class="icon">👜</div>
        <div class="htext">
          <div class="htitle">${it.type || "Покупка"}</div>
          <div class="hamount">${fmtRub(it.amount || 0)}</div>
        </div>
        <div class="hdate">${dd}.${mm}.${yy}</div>
      </div>`;
    })
    .join("");
}

function highlightLevel(discount) {
  const map = { 2: 0, 5: 10001, 7: 20001, 10: 30001 };
  const activeTh = map[Number(discount)] ?? 0;
  document.querySelectorAll(".lvl").forEach(l => {
    const th = Number(l.dataset.th);
    l.classList.toggle("active", th === activeTh);
    const pill = l.querySelector(".pill");
    pill.classList.toggle("dark", th === activeTh);
  });
}

async function boot() {
  const t = getToken();
  if (!t) { window.location.href = "index.html"; return; }

  try {
    const data = await api("me", { token: t });
    const u = data.user;

    document.getElementById("userName").textContent = `${u.lastName} ${u.firstName}`;
    document.getElementById("cardNumber").textContent = fmtCard(u.cardNumber);
    document.getElementById("discountVal").textContent = `${u.discount}%`;

    const toNext = calcToNext(u.totalSpent, u.nextThreshold);
    document.getElementById("nextText").textContent =
      u.nextThreshold
        ? `До нового уровня нужно купить товаров на сумму на ${fmtRub(toNext)}`
        : `У вас максимальный уровень.`;

    renderHistory(u.history || []);
    highlightLevel(u.discount);

    // Barcode modal
    const modal = document.getElementById("modal");
    const closeModal = document.getElementById("closeModal");
    const barcodeBtn = document.getElementById("barcodeBtn");
    const barcodeText = document.getElementById("barcodeText");

    function openModal() {
      modal.classList.remove("hidden");
      barcodeText.textContent = String(u.cardNumber);
      JsBarcode("#barcode", String(u.cardNumber), {
        format: "CODE128",
        displayValue: false,
        margin: 12,
        height: 90,
      });
    }
    function hideModal() { modal.classList.add("hidden"); }

    barcodeBtn.addEventListener("click", openModal);
    closeModal.addEventListener("click", hideModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) hideModal(); });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      clearToken();
      window.location.href = "index.html";
    });

  } catch (err) {
    clearToken();
    window.location.href = "index.html";
  }
}

boot();
