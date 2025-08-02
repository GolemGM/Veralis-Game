document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("event-list");
  if (!container) return;

  try {
    const res = await fetch("https://veralis-backend-production.up.railway.app/api/events");
    const data = await res.json();

    container.innerHTML = "";

    data.forEach(event => {
      const date = new Date(event.timestamp);
      const dateStr = date.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
      const timeStr = date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
      const msg = event.lang_cs || event.lang_en;

      const row = document.createElement("div");
      row.className = "event-row";

      const colDate = document.createElement("div");
      colDate.className = "event-date";
      colDate.textContent = `🕒 ${dateStr} ${timeStr}`;

      const colMsg = document.createElement("div");
      colMsg.className = "event-msg";
      colMsg.textContent = msg;

      row.appendChild(colDate);
      row.appendChild(colMsg);
      container.appendChild(row);
    });

  } catch (err) {
    container.innerHTML = "<div class='event-row'><div class='event-msg'>Nepodařilo se načíst hlášení.</div></div>";
    console.error("Chyba při načítání eventů:", err);
  }
});
