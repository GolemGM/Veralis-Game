    /* ---------- Jazyk ---------- */
    function setLanguage(lang) {
      document.querySelectorAll('.lang').forEach(el => {
        const key = el.dataset.key;
        if (translations[lang] && translations[lang][key]) el.innerHTML = translations[lang][key];
      });
    }

function detectLang() {
  // 1) ?lang=en|cs z URL (Starbridge by měl posílat ?lang=xx)
  const urlLang = new URLSearchParams(location.search).get("lang");
  if (urlLang && translations[urlLang]) return urlLang;

  // 2) localStorage (volba hráče / minulé sezení)
  const saved = localStorage.getItem("lang");
  if (saved && translations[saved]) return saved;

  // 3) navigator.* (pro 1. návštěvu bez ?lang)
  const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
  if (nav.startsWith("cs")) return "cs";
  if (nav.startsWith("en")) return "en";

  // 4) fallback
  return "cs";
}

let currentLang = detectLang();
document.documentElement.setAttribute("lang", currentLang); // <html lang="…">
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
    // zóny a textové plochy v knize
    const zoneTurnLeft  = document.getElementById("zone-turn-left");
    const zoneTurnRight = document.getElementById("zone-turn-right");
    const leftBox  = document.querySelector(".cc-left");
    const rightBox = document.querySelector(".cc-right");

// zapnout debug rámečky – až sedí geometrie, dej na false
const BOOK_DEBUG = false;
if (BOOK_DEBUG && ccBook) ccBook.classList.add("debug");
    /* ---------- Stav hry (jen jednou!) ---------- */
    let ccStage = 0;       // 0 = začátek, 1 = jméno OK, 2 = hotovo
    let bookVisited = false;

/* ---------- Stage aplikace + F5 ---------- */
function applyStage(stage) {
  ccStage = stage;

  if (ccStage === 0) {
    ccBg.src = "images/bg_with_stamps.jpg";
    ccBg.useMap = "#map-with-stamps";
    // jistota: nic klikacího navíc
    zoneBook.removeAttribute("href");
    zoneBook.removeAttribute("title");
    zoneCup.removeAttribute("href");
    zoneCup.removeAttribute("title");

  } else if (ccStage === 1) {
    ccBg.src = "images/bg_without_stamps.jpg";
    ccBg.useMap = "#map-without-stamps";

    // kniha MUSÍ být aktivní
    zoneBook.setAttribute("href", "#");
    zoneBook.setAttribute("title", "book");

    // hrnek zamknout, odemkne se po zavření knihy
    zoneCup.removeAttribute("href");
    zoneCup.removeAttribute("title");

    // obnova po F5 – pokud už knihu někdy zavřel, odemkni hrnek hned
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

    /* ---------- SVG záře pro aktivní prvky ---------- */
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
      if (area.id === "zone-cup" && !bookVisited) return; // hrnek zamčený = bez záře
      const nums = area.coords.split(",").map(Number);
      const pts = [];
      for (let i=0;i<nums.length;i+=2) pts.push(`${nums[i]},${nums[i+1]}`);
      hoverPoly.setAttribute("points", pts.join(" "));
      hoverSvg.style.display = "block";
    }
    function clearHighlight(){ hoverSvg.style.display = "none"; }

    // hover jen pro aktivní prvky
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

    /* ---------- Pomocné funkce ---------- */
function openModal(type){
  ccModal.classList.remove("hidden");
  document.body.classList.add("blurred");
  modalFeedback.textContent = "";

  // 🔧 pokaždé při otevření modalu zruš „zašednutí“ confirmu
  modalConfirm.disabled = false;
  modalConfirm.style.opacity = "";

  const heading = ccModal.querySelector("h2");
  const instr   = document.getElementById("modal-instructions");

  // reset speciální pozice textu
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

    // 🔧 text instrukce dej do slotu (tam, kde bývá input)
    instr.classList.add("in-slot");
  }
}




    function closeModal(){ 
  ccModal.classList.add("hidden"); 
  document.body.classList.remove("blurred"); 
  document.getElementById("cc-overlay").classList.add("hidden"); // ⬅️ přidáno
}
    function openBook(){ 
  ccBook.classList.remove("hidden"); 
  document.body.classList.add("blurred"); 
  document.getElementById("cc-overlay").classList.remove("hidden"); // ⬅️ přidáno
}
function closeBook() {
  ccBook.classList.add("hidden");
  document.body.classList.remove("blurred");
  document.getElementById("cc-overlay").classList.add("hidden"); // ⬅️ přidáno
  bookVisited = true;
  localStorage.setItem("ccBookVisited", "true");
  enableCup();

  fetch("/api/character/book-visited", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visited: true })
  }).catch(()=>{});
}


    function enableCup(){
      zoneCup.setAttribute("href", "#");
      zoneCup.setAttribute("title", "cup");
    }

// --- Stránkování obsahu v zápisníku (lang.js texty) ---
let pageIndex = 0;

function renderBookPages() {
  const left  = document.querySelector(".cc-page.cc-left");
  const right = document.querySelector(".cc-page.cc-right");

  // klíče v lang.js: lore_page1, lore_page2, lore_page3...
  const leftKey  = "lore_page" + (pageIndex*2 + 1);
  const rightKey = "lore_page" + (pageIndex*2 + 2);

  left.innerHTML  = translations[currentLang][leftKey]  || "";
  right.innerHTML = translations[currentLang][rightKey] || "";
}

// první vykreslení po otevření knihy
renderBookPages();

// spočítá nejvyšší dostupný index dvojstrany podle klíčů lore_pageN v translations
function getLastSpreadIndex() {
  let i = 1;
  while (translations[currentLang]["lore_page" + i]) i++;
  const lastPage = i - 1;             // poslední existující stránka
  return Math.max(0, Math.ceil(lastPage / 2) - 1); // poslední dvojstrana (0-based)
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

// Přepiš render tak, aby i zamykal navigaci:
function renderBookPages() {
  const leftKey  = "lore_page" + (pageIndex*2 + 1);
  const rightKey = "lore_page" + (pageIndex*2 + 2);
  leftBox.innerHTML  = translations[currentLang][leftKey]  || "";
  rightBox.innerHTML = translations[currentLang][rightKey] || "";
  lockNav();
}
renderBookPages();

// Handlery na rohy jen mění index a překreslí:
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
      if (action === "name") {
        const val = nameInput.value.trim();
        if (!val) { modalFeedback.textContent = translations[currentLang].name_hint; modalFeedback.style.color="#ff6868"; return; }

        try {
          const res = await fetch("/api/character/create",{
            method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ name:val })
          });
          const data = await res.json();
          if (data.error === "exists") {
            modalFeedback.textContent = translations[currentLang].name_exists; modalFeedback.style.color="#ff6868";
} else if (data.status === "ok") {
  modalFeedback.textContent = translations[currentLang].name_success;
  // Ulož a aplikuj stage 1
  localStorage.setItem("ccStage", "1");
  applyStage(1);

  // 🔽 Přidané – confirm zneaktivnit
  modalConfirm.disabled = true;
  modalConfirm.style.opacity = "0.5";
} else {
  modalFeedback.textContent = "Server error.";
  modalFeedback.style.color = "#ff6868";
}
        } catch {
          modalFeedback.textContent = translations[currentLang].name_error; modalFeedback.style.color="#ff6868";
        }
      } else {
        // leave
        const res = await fetch("/api/character/cc-complete",{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({}) });
        const data = await res.json();
        if (data.redirect) window.location.href = data.redirect;
      }
    });
    modalCancel.addEventListener("click", closeModal);

(async function initCc(){
  try {
    const r = await fetch("/api/character/status");
    const s = await r.json();
    if (typeof s.cc_stage === "number") {
      localStorage.setItem("ccStage", String(s.cc_stage));
      if (s.cc_stage === 1 && s.book_visited) localStorage.setItem("ccBookVisited","true");
      applyStage(s.cc_stage);
      return;
    }
    throw new Error("bad");
  } catch {
    const saved = parseInt(localStorage.getItem("ccStage") || "0", 10);
    applyStage(saved);
  }
})();
