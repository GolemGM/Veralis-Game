// auth.js – checks for token, redirects if missing
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "https://golemgm.github.io/Veralis-Promo/login.html";
  }
});
