document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("devlog-list");
  if (!container) return;

  const lang = new URLSearchParams(window.location.search).get("lang") === "cs" ? "cs" : "en";
  const field = lang === "cs" ? "lang_cs" : "lang_en";

  try {
    const res = await fetch("https://veralis-backend-production.up.railway.app/api/devlogs");
    const data = await res.json();

    container.innerHTML = "";

    data.forEach(devlog => {
      const dateStr = new Date(devlog.date).toLocaleDateString(lang === "cs" ? "cs-CZ" : "en-GB", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });

      const row = document.createElement("div");
      row.className = "event-row";

      const colDate = document.createElement("div");
      colDate.className = "event-date";
      colDate.textContent = dateStr;

      const colMsg = document.createElement("div");
      colMsg.className = "event-msg";

      colMsg.innerHTML = devlog.link
        ? `${devlog[field]} 👉 <a href="${devlog.link}" target="_blank">--INFO--</a>`
        : devlog[field];

      row.appendChild(colDate);
      row.appendChild(colMsg);
      container.appendChild(row);
    });

  } catch (err) {
    console.error("Chyba při načítání devlogů:", err);
  }
});
