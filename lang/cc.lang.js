const translations = {
  cs: {
    // Modal – jméno
    enter_name: "Zadejte jméno postavy",
    name_hint: "Písmena, mezery do 30 znaků",
    confirm: "Potvrdit",
    close: "Zavřít",

    // NOVÉ pro modal odchodu
    leave_title:   "Odejít do práce?",
    leave_text:    "Můžete si pročíst víc ze zápisníku, nebo rovnou odejít do práce.",
    leave_confirm: "Odejít",
    leave_cancel:  "Zůstat",
  
    name_success: "Jméno úspěšně zarezervováno. Můžeš zavřít okno.",
    name_exists: "Jméno již existuje, zkuste jiné.",
    name_invalid: "Zadejte platné jméno.",
    name_error: "Chyba serveru, zkuste znovu.",

    // Hrnek – odchod
    cup_text: "Můžete si pročíst víc ze zápisníku, nebo rovnou odejít do práce.",
    cup_leave: "Odejít",
    cup_stay: "Zůstat",
     
    // --- Zápisník ---
    lore_page1: `
      <h3>Dnešní úkoly</h3>
      <p>Tady bych nedával zbytečně moc. Hlavní cíl dnešního dne bude
      zahájení výstavby rozšíření laboratoří o výzkumné křídlo.</p>
      <p>Dodržovat denní rutinu vedenou naším palubním počítačem,
      jsem zvědav, co mi pro dnešek nachystal dalšího.
      Můj Botík mi určitě rád připomene dnešní úkoly.
      Je to můj mazlík, nikdy mě nenechá ve štychu.</p>
    `,

    lore_page2: `
      <h3>Prostředí</h3>
      <p>Jako technik projektu Nemoris se starám o běžné činnosti
      na základně, kterou nám vedení planety přiřadilo.
      Zpracováváme nerosty i organické hmoty a chystáme nové
      zázemí pro projekt Nemoris.</p>
      <p>Moje ubikace jsou blízko hangáru, kde máme muzeum
      starých kolonizačních lodí. Tam rád chodím rozjímat a
      kochat se loděmi, které dokázaly doletět až sem.</p>
    `,

    lore_page3: `
      <h3>Co je Nemoris?</h3>
      <p>Na našem oddělení projektu Nemoris je nás pár stovek,
      každý se stará o něco. Mechanici, výzkumníci, biologové,
      geologové, inženýři, robotičtí specialisté i medici –
      prostě vše, co je třeba k přípravě nouzové evakuace dalších
      generací, kdyby se zase něco pokazilo.</p>
      <p>Původně jsme se na této planetě ocitli při podobné
      situaci. Naše závislost na technologiích zahltila ekologii
      planety odpadovým nanoplastem natolik, že ani nejmodernější
      způsoby sanace nedokázaly zvrátit dopad.</p>
    `,

    lore_page4: `
      <h3>Historie</h3>
      <p>Ve 23. století jsme aktivovali první projekt Nemoris a
      přesunuli civilizaci na planetu Runalis. Je to pro nás ráj –
      původní stavby a technologie zdejší civilizace nás fascinují.</p>
      <p>Ve 24. století ale vypukly rozbroje o využití technologie
      původních. Velká válka přinesla nesmírné ztráty a lidstvo
      stála 80 % populace. Od té doby žijeme v míru a zákaz bojů je
      základním kamenem přežití.</p>
    `
  },

  en: {
  // Modal – name
  enter_name: "Enter character name",
  name_hint: "Letters, spaces up to 30 characters",
  confirm: "Confirm",
  close: "Close",

  // Leave modal
  leave_title:   "Leave for work?",
  leave_text:    "You can read more in the notebook, or head straight to work.",
  leave_confirm: "Leave",
  leave_cancel:  "Stay",

  name_success: "Name successfully reserved. You can close this window.",
  name_exists:  "That name already exists. Try another one.",
  name_invalid: "Please enter a valid name.",
  name_error:   "Server error. Please try again.",

  // Cup – leaving
  cup_text:  "You can read more in the notebook, or go straight to work.",
  cup_leave: "Leave",
  cup_stay:  "Stay",

  // --- Notebook pages (mirrored from CZ) ---
  lore_page1: `
    <h3>Today's tasks</h3>
    <p>Let's not overcomplicate things today. The main goal is to
    start building the extension of the labs — the new research wing.</p>
    <p>Stick to the daily routine guided by our onboard computer.
    I'm curious what else it's got planned for me.
    My little helper <strong>Beepy</strong> will surely remind me of today's tasks.
    It's my buddy and never lets me down.</p>
  `,

  lore_page2: `
    <h3>Environment</h3>
    <p>As a technician of Project Nemoris I take care of routine
    operations at the base assigned to us by the planet’s council.
    We process minerals and organic matter and prepare new facilities
    for Project Nemoris.</p>
    <p>My quarters are near the hangar where we keep a museum of old
    colonization ships. I like to go there to clear my head and admire
    the vessels that managed to reach this world.</p>
  `,

  lore_page3: `
    <h3>What is Nemoris?</h3>
    <p>There are a few hundred of us on the Nemoris team — mechanics,
    researchers, biologists, geologists, engineers, robotics specialists
    and medics — basically everything needed to prepare a contingency
    evacuation for future generations, in case things go wrong again.</p>
    <p>We came to this planet after a similar crisis. Our dependence on
    technology flooded our homeworld’s ecology with waste nanoplastics to
    such an extent that even the most advanced remediation couldn’t reverse
    the damage.</p>
  `,

  lore_page4: `
    <h3>History</h3>
    <p>In the 23rd century we activated the first Nemoris project and
    moved our civilization to the planet Runalis. For us it is a paradise —
    the ancient structures and technology left here are awe-inspiring.</p>
    <p>In the 24th century, disputes broke out about using the full potential
    of the ancients’ technology. A great war followed with terrible losses —
    humanity paid with 80% of its population. Since then we’ve lived in peace;
    the ban on warfare became a cornerstone of survival.</p>
  `
}
};




