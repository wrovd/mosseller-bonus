// assets/auth.js (полностью)

const tokenKey = "mosseller_token";

function setToken(t) { localStorage.setItem(tokenKey, t); }
function getToken() { return localStorage.getItem(tokenKey); }
function clearToken() { localStorage.removeItem(tokenKey); }

const tabs = document.querySelectorAll(".tab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginError = document.getElementById("loginError");
const registerError = document.getElementById("registerError");

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const t = btn.dataset.tab;
    loginForm.classList.toggle("hidden", t !== "login");
    registerForm.classList.toggle("hidden", t !== "register");

    loginError.textContent = "";
    registerError.textContent = "";
  });
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const fd = new FormData(loginForm);
  const email = String(fd.get("email") || "").trim();
  const password = String(fd.get("password") || "");

  try {
    const data = await api("login", { email, password });
    setToken(data.token);
    window.location.href = "app.html";
  } catch (err) {
    loginError.textContent = err.message || "Ошибка входа";
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  registerError.textContent = "";

  const consent = document.getElementById("consentCheckbox");
  if (!consent || !consent.checked) {
    registerError.textContent = "Необходимо согласие на обработку персональных данных";
    return;
  }

  const fd = new FormData(registerForm);
  const firstName = String(fd.get("firstName") || "").trim();
  const lastName = String(fd.get("lastName") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const password = String(fd.get("password") || "");

  try {
    const data = await api("register", { firstName, lastName, email, password });
    setToken(data.token);
    window.location.href = "app.html";
  } catch (err) {
    registerError.textContent = err.message || "Ошибка регистрации";
  }
});

// auto-redirect if already logged
(async function () {
  const t = getToken();
  if (!t) return;

  try {
    await api("me", { token: t });
    window.location.href = "app.html";
  } catch (_) {
    clearToken();
  }
})();
