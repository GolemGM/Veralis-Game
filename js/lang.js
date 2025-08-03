document.addEventListener("DOMContentLoaded", () => {
  const langParam = new URLSearchParams(window.location.search).get("lang");
  const lang = langParam === "cs" ? "cs" : "en";

  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      if (data?.meta?.title) {
        document.title = data.meta.title;
      }

      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const value = key.split('.').reduce((o, i) => o?.[i], data);
        if (value) el.innerText = value;
      });
    });
});
