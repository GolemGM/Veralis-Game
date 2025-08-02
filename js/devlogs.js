document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("devlog-list");
  if (!container) return;

  try {
    const res = await fetch("https://veralis-backend-production.up.railway.app/api/devlogs");
    const data = await res.json();

    container.innerHTML = "";

    data.forEach(devlog => {
      const dateStr = new Date(devlog.date).toLocaleDateString("cs-CZ", {
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
        ? `${devlog.lang_cs} 👉 <a href="${devlog.link}" target="_blank">--INFO--</a>`
        : devlog.lang_cs;

      row.appendChild(colDate);
      row.appendChild(colMsg);
      container.appendChild(row);
    });

  } catch (err) {
    console.error("Chyba při načítání devlogů:", err);
  }
});
