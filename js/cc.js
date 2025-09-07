// === Backend API base (Railway) ===
const API_BASE = "https://veralis-backend-production.up.railway.app";

// Lehký wrapper, ať nepíšeme pořád celé URL
function api(path, init = {}) {
  const headers = init.headers ? { ...init.headers } : {};
  if (init.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // ⚡ bez credentials – cookies teď nepotřebujeme
  return fetch(`${API_BASE}${path}`, { ...init, headers });
}

/* ---------- Jazyk ---------- */
function setLanguage(lang) {
  document.querySelectorAll('.lang').forEach(el => {
    const key = el.dataset.key;
    if (translations[lang] && translations[lang][key]) el.innerHTML = translations[lang][key];
  });
}

function detectLang() {
  const urlLang = new URLSearchParams(location.search).get("lang");
  if (urlLang && translations[urlLang]) return urlLang;

  const saved = localStorage.getItem("lang");
  if (saved && translations[saved]) return saved;

  const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  if (nav.startsWith("cs")) return "cs";
  if (nav.startsWith("en")) return "en";

  return "cs";
}

let currentLang = detectLang();
document.documentElement.setAttribute("lang", currentLang);
localStorage.setItem("lang", currentLang);
setLanguage(currentLang);

/* ---------- Elements ---------- */
const ccTable = document.getElementById("cc-table");
const ccBg    = document.getElementById("cc-bg");
const zoneTags= document.getElementById("zone-tags");
const zoneBook= document.getElementById("zone-book");
const zoneCup = document.getElementById("zone-cup");

const ccModal = document.getElementById("cc-modal");
const modalConfirm = document.getElementById("modal-confirm");
const modalCancel  = document.getElementById("modal-cancel");
const modalFeedback= document.getElementById("modal-feedback");
const nameInput    = document.getElementById("name-input");

const ccBook   = document.getElementById("cc-book");
const bookmark = document.getElementById("bookmark");
const zoneTurnLeft  = document.getElementById("zone-turn-left");
const zoneTurnRight = document.getElementById("zone-turn-right");
const leftBox  = document.querySelector(".cc-left");
const rightBox = document.querySelector(".cc-right");

const BOOK_DEBUG = false;
if (BOOK_DEBUG && ccBook) ccBook.classList.add("debug");

/* ---------- Stav hry ---------- */
let ccStage = 0;       
let bookVisited = false;

/* ---------- Stage ---------- */
function applyStage(stage) {
  ccStage = stage;

  if (ccStage === 0) {
    ccBg.src = "images/bg_with_stamps.jpg";
    ccBg.useMap = "#map-with-stamps";
    zoneBook.removeAttribute("href");
    zoneBook.removeAttribute("title");
    zoneCup.removeAttribute("href");
    zoneCup.removeAttribute("title");

  } else if (ccStage === 1) {
    ccBg.src = "images/bg_without_stamps.jpg";
    ccBg.useMap = "#map-without-stamps";

    zoneBook.setAttribute("href", "#");
    zoneBook.setAttribute("title", "book");

    zoneCup.removeAttribute("href");
    zoneCup.removeAttribute("title");

    bookVisited = JSON.parse(localStorage.getItem("ccBookVisited") || "false");
    if (bookVisited) {
      zoneCup.setAttribute("href", "#");
      zoneCup.setAttribute("title", "cup");
    }

  } else if (ccStage >= 2) {
    window.location.href = "/game.html";
  }
}

(function initCcLocal(){
  const saved = parseInt(localStorage.getItem("ccStage") || "0", 10);
  applyStage(saved);
})();

/* ---------- SVG záře ---------- */
const svgns = "http://www.w3.org/2000/svg";
const hoverSvg = document.createElementNS(svgns,"svg");
hoverSvg.setAttribute("viewBox","0 0 1600 900");
Object.assign(hoverSvg.style,{
  position:"absolute", top:"0", left:"0", width:"100%", height:"100%",
  pointerEvents:"none", zIndex:"5", display:"none"
});
const hoverPoly = document.createElementNS(svgns,"polygon");
hoverPoly.setAttribute("fill","rgba(0,200,255,0.25)");
hoverPoly.setAttribute("stroke","rgba(0,200,255,0.9)");
hoverPoly.setAttribute("stroke-width","2");
hoverSvg.appendChild(hoverPoly);
ccTable.appendChild(hoverSvg);

function setHighlight(area){
  if (!area) return;
  if (area.id === "zone-cup" && !bookVisited) return;
  const nums = area.coords.split(",").map(Number);
  const pts = [];
  for (let i=0;i<nums.length;i+=2) pts.push(`${nums[i]},${nums[i+1]}`);
  hoverPoly.setAttribute("points", pts.join(" "));
  hoverSvg.style.display = "block";
}
function clearHighlight(){ hoverSvg.style.display = "none"; }

zoneTags.addEventListener("mouseenter", ()=> setHighlight(zoneTags));
zoneTags.addEventListener("mouseleave", clearHighlight);
zoneBook.addEventListener("mouseenter", ()=> setHighlight(zoneBook));
zoneBook.addEventListener("mouseleave", clearHighlight);
zoneBook.addEventListener("click", (e)=>{ 
  e.preventDefault(); 
  e.stopPropagation(); 
  if (ccStage===1) openBook(); 
});
zoneCup .addEventListener("mouseenter", ()=> setHighlight(zoneCup));
zoneCup .addEventListener("mouseleave", clearHighlight);

/* ---------- Modal ---------- */
function openModal(type){
  ccModal.classList.remove("hidden");
  document.body.classList.add("blurred");
  modalFeedback.textContent = "";
  modalConfirm.disabled = false;
  modalConfirm.style.opacity = "";

  const heading = ccModal.querySelector("h2");
  const instr   = document.getElementById("modal-instructions");
  instr.classList.remove("in-slot");

  if (type === "name") {
    heading.textContent = translations[currentLang]?.enter_name || "Zadejte jméno postavy";
    instr.textContent   = translations[currentLang]?.name_hint  || "Písmena, mezery do 30 znaků";
    nameInput.classList.remove("hidden");
    modalConfirm.dataset.action = "name";
    modalConfirm.textContent = translations[currentLang]?.confirm || "Potvrdit";
    modalCancel.textContent  = translations[currentLang]?.close   || "Zavřít";

  } else if (type === "leave") {
    heading.textContent = translations[currentLang]?.leave_title || "Odejít do práce?";
    instr.textContent   = translations[currentLang]?.leave_text  || "Můžete si pročíst víc ze zápisníku, nebo rovnou odejít do práce.";
    nameInput.classList.add("hidden");
    modalConfirm.dataset.action = "leave";
    modalConfirm.textContent = translations[currentLang]?.leave_confirm || "Odejít";
    modalCancel.textContent  = translations[currentLang]?.leave_cancel  || "Zůstat";
    instr.classList.add("in-slot");
  }
}

function closeModal(){ 
  ccModal.classList.add("hidden"); 
  document.body.classList.remove("blurred"); 
  document.getElementById("cc-overlay").classList.add("hidden");
}
function openBook(){ 
  ccBook.classList.remove("hidden"); 
  document.body.classList.add("blurred"); 
  document.getElementById("cc-overlay").classList.remove("hidden");
}
function closeBook() {
  ccBook.classList.add("hidden");
  document.body.classList.remove("blurred");
  document.getElementById("cc-overlay").classList.add("hidden");
  bookVisited = true;
  localStorage.setItem("ccBookVisited", "true");
  enableCup();

  const charId = localStorage.getItem("ccId");
  if (charId) {
    api("/api/cc/notebook", {
      method: "POST",
      body: JSON.stringify({ charId })
    }).catch(() => {});
  }
}

function enableCup() {
  zoneCup.setAttribute("href", "#");
  zoneCup.setAttribute("title", "cup");
}

let pageIndex = 0;

function getLastSpreadIndex() {
  let i = 1;
  while (translations[currentLang]["lore_page" + i]) i++;
  const lastPage = i - 1;
  return Math.max(0, Math.ceil(lastPage / 2) - 1);
}

function lockNav() {
  const last = getLastSpreadIndex();
  if (zoneTurnLeft) {
    zoneTurnLeft.style.pointerEvents = pageIndex === 0 ? "none" : "auto";
    zoneTurnLeft.style.opacity       = pageIndex === 0 ? 0.35  : 1;
  }
  if (zoneTurnRight) {
    const atEnd = pageIndex >= last;
    zoneTurnRight.style.pointerEvents = atEnd ? "none" : "auto";
    zoneTurnRight.style.opacity       = atEnd ? 0.35  : 1;
  }
}

function renderBookPages() {
  const leftKey  = "lore_page" + (pageIndex*2 + 1);
  const rightKey = "lore_page" + (pageIndex*2 + 2);
  leftBox.innerHTML  = translations[currentLang][leftKey]  || "";
  rightBox.innerHTML = translations[currentLang][rightKey] || "";
  lockNav();
}
renderBookPages();

if (zoneTurnLeft)  zoneTurnLeft.addEventListener("click",  (e)=>{ 
  e.stopPropagation(); 
  if (pageIndex > 0) { pageIndex--; renderBookPages(); }
});
if (zoneTurnRight) zoneTurnRight.addEventListener("click", (e)=>{ 
  e.stopPropagation(); 
  if (pageIndex < getLastSpreadIndex()) { pageIndex++; renderBookPages(); }
});

/* ---------- Kliky ---------- */
zoneTags.addEventListener("click", ()=> { 
  if (ccStage===0) openModal("name"); 
});

zoneCup.addEventListener("click", ()=> { 
  if (ccStage===1 && bookVisited) openModal("leave"); 
});

bookmark.addEventListener("click", closeBook);

/* ---------- Modal akce ---------- */
modalConfirm.addEventListener("click", async ()=>{
  const action = modalConfirm.dataset.action;
  const charId = localStorage.getItem("ccId");

  if (action === "name") {
    const val = nameInput.value.trim();
    if (!val) {
  modalFeedback.classList.remove("success");
  modalFeedback.classList.add("error");
  modalFeedback.textContent = translations[currentLang].name_hint;
  return;
}

    try {
      const res = await api("/api/cc/name", {
        method: "POST",
        body: JSON.stringify({ charId, name: val })
      });
      const data = await res.json();

if (data.error === "NAME_TAKEN") {
  modalFeedback.classList.remove("success");
  modalFeedback.classList.add("error");
  modalFeedback.textContent = translations[currentLang].name_exists;
} else if (data.ok) {
  modalFeedback.classList.remove("error");
  modalFeedback.classList.add("success");
  modalFeedback.textContent = translations[currentLang].name_success;

  localStorage.setItem("ccStage", "1");
  applyStage(1);
  modalConfirm.disabled = true;
  modalConfirm.style.opacity = "0.5";
} else {
  modalFeedback.classList.remove("success");
  modalFeedback.classList.add("error");
  modalFeedback.textContent = "Server error.";
}
 } catch {
  modalFeedback.classList.remove("success");
  modalFeedback.classList.add("error");
  modalFeedback.textContent = translations[currentLang].name_error;
}

  } else if (action === "leave") {
    if (!charId) return;
    const res = await api("/api/cc/finish", {
      method: "POST",
      body: JSON.stringify({ charId })
    });
    const data = await res.json();
    if (data.ok) window.location.href = "/game.html";
  }
});
modalCancel.addEventListener("click", closeModal);

/* ---------- Init CC ---------- */
(async function initCc(){
  try {
    // init (vytvoří nový řádek a vrátí id)
    const r = await api("/api/cc/init", { method: "POST", body: JSON.stringify({}) });
    const s = await r.json();

    if (s.ok && s.character) {
      localStorage.setItem("ccId", s.character.id);
      localStorage.setItem("ccStage", "0");
      applyStage(0);
    } else {
      throw new Error("bad");
    }
  } catch {
    const saved = parseInt(localStorage.getItem("ccStage") || "0", 10);
    applyStage(saved);
  }
})();
