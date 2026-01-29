const adminTokenKey = "mosseller_admin_token";

function setAdminToken(t){ localStorage.setItem(adminTokenKey, t); }
function getAdminToken(){ return localStorage.getItem(adminTokenKey); }
function clearAdminToken(){ localStorage.removeItem(adminTokenKey); }

const loginPanel = document.getElementById("adminLoginPanel");
const appPanel = document.getElementById("adminAppPanel");

const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginError = document.getElementById("adminLoginError");

const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");

const usersList = document.getElementById("usersList");
const usersCount = document.getElementById("usersCount");

const selectedHint = document.getElementById("selectedHint");
const detailCard = document.getElementById("detailCard");

const dName = document.getElementById("dName");
const dEmail = document.getElementById("dEmail");
const dCard = document.getElementById("dCard");
const dSpent = document.getElementById("dSpent");
const dDiscount = document.getElementById("dDiscount");

const vipToggle = document.getElementById("vipToggle");
const vipDiscount = document.getElementById("vipDiscount");
const vipNote = document.getElementById("vipNote");

const saveUserBtn = document.getElementById("saveUserBtn");
const saveStatus = document.getElementById("saveStatus");

const purchaseAmount = document.getElementById("purchaseAmount");
const purchaseType = document.getElementById("purchaseType");
const addPurchaseBtn = document.getElementById("addPurchaseBtn");
const purchaseError = document.getElementById("purchaseError");

let allUsers = [];
let selected = null;

function fmtRub(n){
  const x = Math.round(Number(n || 0));
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
}
function fmtCard(num){
  const s = String(num || "");
  return s.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function showLogin(){
  loginPanel.classList.remove("hidden");
  appPanel.classList.add("hidden");
}
function showApp(){
  loginPanel.classList.add("hidden");
  appPanel.classList.remove("hidden");
}

adminLogoutBtn.addEventListener("click", () => {
  clearAdminToken();
  showLogin();
});

adminLoginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  adminLoginError.textContent = "";

  const fd = new FormData(adminLoginForm);
  const password = String(fd.get("password") || "");

  try{
    const res = await api("adminLogin", { password });
    setAdminToken(res.adminToken);
    showApp();
    await loadUsers();
  }catch(err){
    adminLoginError.textContent = err.message || "Ошибка входа";
  }
});

refreshBtn.addEventListener("click", loadUsers);
searchInput.addEventListener("input", () => renderUsers(filterUsers(searchInput.value)));

function filterUsers(q){
  const s = String(q||"").trim().toLowerCase();
  if (!s) return allUsers;
  return allUsers.filter(u => {
    const hay = `${u.firstName} ${u.lastName} ${u.email} ${u.cardNumber}`.toLowerCase();
    return hay.includes(s);
  });
}

function renderUsers(list){
  usersCount.textContent = `Всего: ${allUsers.length} • Показано: ${list.length}`;
  usersList.innerHTML = "";

  if (!list.length){
    usersList.innerHTML = `<div class="admin-row muted">Ничего не найдено</div>`;
    return;
  }

  list.forEach(u => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "admin-user-row" + (selected && selected.cardNumber === u.cardNumber ? " active" : "");
    row.innerHTML = `
      <div class="u-top">
        <div class="u-name">${u.lastName} ${u.firstName}</div>
        <div class="u-badge">${u.discount}%</div>
      </div>
      <div class="u-sub muted">
        <span class="mono">${fmtCard(u.cardNumber)}</span>
        <span>•</span>
        <span>${u.email}</span>
        ${u.isVIP ? `<span class="vip">VIP</span>` : ``}
      </div>
    `;
    row.addEventListener("click", () => selectUser(u.cardNumber));
    usersList.appendChild(row);
  });
}

function selectUser(cardNumber){
  selected = allUsers.find(u => u.cardNumber === cardNumber) || null;

  if (!selected){
    detailCard.classList.add("hidden");
    selectedHint.classList.remove("hidden");
    return;
  }

  selectedHint.classList.add("hidden");
  detailCard.classList.remove("hidden");

  dName.textContent = `${selected.lastName} ${selected.firstName}`;
  dEmail.textContent = selected.email;
  dCard.textContent = fmtCard(selected.cardNumber);
  dSpent.textContent = fmtRub(selected.totalSpent);
  dDiscount.textContent = `${selected.discount}% (${selected.level})`;

  vipToggle.checked = !!selected.isVIP;
  vipDiscount.value = selected.vipDiscount ?? "";
  vipNote.value = selected.vipNote ?? "";

  saveStatus.textContent = "";
  purchaseError.textContent = "";
  purchaseAmount.value = "";
  purchaseType.value = "Покупка товара";

  renderUsers(filterUsers(searchInput.value));
}

saveUserBtn.addEventListener("click", async () => {
  if (!selected) return;

  saveStatus.textContent = "Сохраняю…";
  const adminToken = getAdminToken();

  try{
    await api("adminUpdateUser", {
      adminToken,
      cardNumber: selected.cardNumber,
      isVIP: vipToggle.checked,
      vipDiscount: vipDiscount.value === "" ? "" : Number(vipDiscount.value),
      vipNote: vipNote.value || ""
    });

    saveStatus.textContent = "Сохранено ✅";
    await loadUsers(true);
  }catch(err){
    saveStatus.textContent = "Ошибка сохранения: " + (err.message || "unknown");
  }
});

addPurchaseBtn.addEventListener("click", async () => {
  purchaseError.textContent = "";
  if (!selected) return;

  const amount = Number(purchaseAmount.value || 0);
  const type = String(purchaseType.value || "Покупка товара").trim() || "Покупка товара";
  if (!amount || amount <= 0){
    purchaseError.textContent = "Укажи сумму покупки";
    return;
  }

  try{
    const adminToken = getAdminToken();
    await api("adminAddPurchase", {
      adminToken,
      cardNumber: selected.cardNumber,
      amount,
      type
    });

    await loadUsers(true);
    purchaseAmount.value = "";
    purchaseType.value = "Покупка товара";
  }catch(err){
    purchaseError.textContent = err.message || "Ошибка";
  }
});

async function loadUsers(keepSelection = false){
  const adminToken = getAdminToken();
  if (!adminToken){
    showLogin();
    return;
  }

  const res = await api("adminListUsers", { adminToken });
  allUsers = res.users || [];

  const list = filterUsers(searchInput.value);
  renderUsers(list);

  if (keepSelection && selected){
    const still = allUsers.find(u => u.cardNumber === selected.cardNumber);
    if (still) selectUser(still.cardNumber);
  }
}

(async function boot(){
  if (getAdminToken()){
    showApp();
    try{
      await loadUsers();
    }catch(_){
      clearAdminToken();
      showLogin();
    }
  }else{
    showLogin();
  }
})();
