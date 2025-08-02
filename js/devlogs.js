document.addEventListener("DOMContentLoaded", () => {
  fetch("https://veralis-backend-production.up.railway.app/api/devlog")
    .then(res => res.json())
    .then(devlogs => {
      const lang = localStorage.getItem("lang") || "cs";
      const tbody = document.querySelector("#devlog-table tbody");
      tbody.innerHTML = "";

      devlogs.forEach(log => {
        const tr = document.createElement("tr");

        // sloupec s datem
        const dateTd = document.createElement("td");
        const date = new Date(log.date).toLocaleDateString();
        dateTd.textContent = date;

        // sloupec s textem
        const logTd = document.createElement("td");
        const text = lang === "cs" ? log.lang_cs : log.lang_en;
        logTd.innerHTML = `🛠️ ${text}`;
        if (log.link) {
          logTd.innerHTML += ` 👉 <a href="${log.link}" target="_blank">--INFO--</a>`;
        }

        tr.appendChild(dateTd);
        tr.appendChild(logTd);
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Chyba načítání devlogů:", err);
    });
});
