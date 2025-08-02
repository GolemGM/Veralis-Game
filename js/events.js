document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("event-list");
  if (!container) return;

  try {
    const res = await fetch("https://veralis-backend-production.up.railway.app/api/events");
    const data = await res.json();

    container.innerHTML = "";

    data.forEach(event => {
      const time = new Date(event.timestamp).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
      const msg = event.lang_cs || event.lang_en;
      const div = document.createElement("div");
      div.className = "event-entry";
      div.textContent = `🕒 ${time} – ${msg}`;
      container.appendChild(div);
    });

  } catch (err) {
    container.innerHTML = "<div class='event-entry'>Nepodařilo se načíst hlášení.</div>";
    console.error("Chyba při načítání eventů:", err);
  }
});
