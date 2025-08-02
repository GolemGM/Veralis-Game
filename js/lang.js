document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang") || "en";
  fetch(`lang/${lang}.json`)
    .then(res => res.json())
    .then(data => {
      // Nastaví title záložky (prohlížeč)
      if (data?.meta?.title) {
        document.title = data.meta.title;
      }

      // Projde všechny prvky s data-i18n a přeloží je
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const value = key.split('.').reduce((o, i) => o?.[i], data);
        if (value) el.innerText = value;
      });
    });
});
