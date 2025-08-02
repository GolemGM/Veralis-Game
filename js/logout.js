// logout.js – clears token and redirects
function logout() {
  localStorage.removeItem("token");
  window.location.href = "https://golemgm.github.io/Veralis-Promo/login.html";
}
