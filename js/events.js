document.addEventListener("DOMContentLoaded", () => {
  const lang = localStorage.getItem("lang") || "en";

  fetch("https://veralis-backend-production.up.railway.app/api/events")
    .then(res => res.json())
    .then(events => {
      const container = document.getElementById("event-list");
      if (!container) return;

      container.innerHTML = "";

      events.forEach(event => {
        const text = lang === "cs" ? event.lang_cs : event.lang_en;
        const time = formatTime(event.time);
        const entry = document.createElement("div");
        entry.classList.add("event-entry");
        entry.innerText = `🕒 ${time} – ${text}`;
        container.appendChild(entry);
      });
    })
    .catch(err => {
      console.error("Failed to load events:", err);
    });

  function formatTime(timeStr) {
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeStr;
    }
  }
});
