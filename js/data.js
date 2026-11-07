// =========================================================
//  Omar · all the text of the site lives here
//  Every sentence has two versions side by side:
//      { fr: "en français", en: "in English" }
//  Change a sentence here and it changes everywhere.
//  ⚠️ Omar is a fictional photographer: this is a DEMO portfolio.
// =========================================================
window.OMAR = {
  name: "Omar",
  city: "Casablanca",
  role: { fr: "Photographe de rue", en: "Street photographer" },
  portrait: "images/omar.jpg",

  // The enlarger (agrandisseur) projects this onto the table
  about: {
    eyebrow: { fr: "l'agrandisseur", en: "the enlarger" },
    title:   { fr: "Bonjour, je suis Omar.", en: "Hi, I'm Omar." },
    text: [
      { fr: "Je photographie Casablanca à pied, très tôt le matin, quand la ville est encore à moitié endormie.",
        en: "I photograph Casablanca on foot, very early in the morning, while the city is still half asleep." },
      { fr: "Je cherche les moments que personne ne regarde : un rayon de lumière dans un derb, un passant seul sur la Corniche, le premier tram de la journée.",
        en: "I look for the moments nobody notices: a ray of light in a derb, a lone walker on the Corniche, the first tram of the day." },
      { fr: "Je travaille surtout en noir et blanc, et je développe encore certains films moi-même, dans ma chambre noire.",
        en: "I mostly work in black and white, and I still develop some of my films myself, in my darkroom." }
    ],
    quote: { fr: "« La lumière du matin ne dure que vingt minutes. Il faut être là. »",
             en: "“Morning light only lasts twenty minutes. You have to be there.”" },
    facts: [
      [{ fr: "Ville", en: "City" },                    "Casablanca"],
      [{ fr: "Spécialité", en: "Speciality" },         { fr: "Photo de rue, noir et blanc", en: "Street photography, black & white" }],
      [{ fr: "Appareil préféré", en: "Favourite camera" }, { fr: "Un vieux 35 mm argentique", en: "An old 35 mm film camera" }],
      [{ fr: "Disponible pour", en: "Available for" }, { fr: "Reportages, éditoriaux, expositions", en: "Reportage, editorials, exhibitions" }]
    ]
  },

  // The three trays of the darkroom = three steps of the career
  experienceIntro: {
    eyebrow: { fr: "les bacs", en: "the trays" },
    title:   { fr: "Trois bains, trois étapes.", en: "Three baths, three steps." },
    text:    { fr: "Un tirage passe du révélateur au fixateur. Mon parcours aussi. Cliquez sur un bac.",
               en: "A print goes from developer to fixer. So did my career. Click a tray." }
  },
  experience: [
    {
      tray:  { fr: "Révélateur", en: "Developer" },
      title: { fr: "Photographe indépendant", en: "Freelance photographer" },
      years: { fr: "2019 – aujourd'hui", en: "2019 – today" },
      text:  { fr: "Reportages pour des magazines et des marques locales, et un travail personnel sur les rues de Casablanca.",
               en: "Reportage for magazines and local brands, and a personal project on the streets of Casablanca." }
    },
    {
      tray:  { fr: "Arrêt", en: "Stop bath" },
      title: { fr: "Assistant photographe en studio", en: "Studio photography assistant" },
      years: "2016 – 2019",
      text:  { fr: "Lumière, tirages, préparation des séances : trois ans à apprendre le métier derrière l'appareil.",
               en: "Lighting, printing, preparing shoots: three years learning the craft behind the camera." }
    },
    {
      tray:  { fr: "Fixateur", en: "Fixer" },
      title: { fr: "Formation en photographie", en: "Photography training" },
      years: "2014 – 2016",
      text:  { fr: "Deux ans de formation, avec une passion qui ne m'a plus quitté : le tirage argentique.",
               en: "Two years of training, and a passion that never left me: darkroom printing." }
    }
  ],

  // The prints on the clothesline = the projects (photo series)
  projectsIntro: {
    eyebrow: { fr: "la corde à linge", en: "the clothesline" },
    title:   { fr: "Cinq tirages à révéler.", en: "Five prints to develop." },
    text:    { fr: "Cliquez sur un tirage blanc : il plonge dans le révélateur, et l'image apparaît.",
               en: "Click a blank print: it dips into the developer, and the image appears." }
  },
  projects: [
    { img: "images/derb-sultan.jpg", year: "2025", place: "Derb Sultan",
      title: { fr: "Derb Sultan, 6 h du matin", en: "Derb Sultan, 6 a.m." },
      text:  { fr: "Une série sur les ruelles au lever du jour, quand la lumière entre par le bout de la rue.",
               en: "A series on the alleys at sunrise, when the light comes in from the end of the street." } },
    { img: "images/corniche.jpg", year: "2024", place: "Aïn Diab",
      title: { fr: "La Corniche en hiver", en: "The Corniche in winter" },
      text:  { fr: "Des promeneurs solitaires face à l'océan, dans la brume des matins d'hiver.",
               en: "Lone walkers facing the ocean, in the mist of winter mornings." } },
    { img: "images/tram.jpg", year: "2024", place: "Boulevard Mohammed V",
      title: { fr: "Le premier tram", en: "The first tram" },
      text:  { fr: "Le mouvement de la ville, capturé avec une pose lente : le tram devient une traînée de lumière.",
               en: "The city in motion, caught with a slow shutter: the tram becomes a trail of light." } },
    { img: "images/marche-central.jpg", year: "2023", place: { fr: "Centre-ville", en: "City centre" },
      title: { fr: "Marché Central", en: "Central Market" },
      text:  { fr: "Les vendeurs, les cagettes et les auvents rayés du plus vieux marché de la ville.",
               en: "The vendors, the crates and the striped awnings of the city's oldest market." } },
    { img: "images/toits-medina.jpg", year: "2023", place: { fr: "Ancienne Médina", en: "Old Medina" },
      title: { fr: "Toits de la Médina", en: "Medina rooftops" },
      text:  { fr: "Paraboles, linge qui sèche et minaret : la vie qui se passe au-dessus des rues.",
               en: "Satellite dishes, drying laundry and a minaret: the life that happens above the streets." } }
  ],

  // The business card on the table
  contact: {
    eyebrow:   { fr: "la carte de visite", en: "the business card" },
    title:     { fr: "On se voit à 6 h ?", en: "Meet me at 6 a.m.?" },
    text:      { fr: "Reportage, exposition, tirage : écrivez-moi. Je réponds en général avant le lever du soleil.",
                 en: "Reportage, exhibition, a print: write to me. I usually answer before sunrise." },
    available: { fr: "Libre pour de nouveaux projets", en: "Open for new projects" },
    email: "omar@example.com",
    instagram: "@omar.photo.demo"
  },

  // Shown at the bottom of the darkroom (keep it: Omar is fictional)
  credit: { fr: "Portfolio de démonstration · personnage fictif · conçu par Sara Bouras",
            en: "Demo portfolio · fictional character · designed by Sara Bouras" },

  // Small words of the interface (buttons, hints…)
  ui: {
    docTitle:   { fr: "Omar · Photographe de rue", en: "Omar · Street photographer" },
    docDesc:    { fr: "Portfolio de démonstration : Omar, photographe de rue à Casablanca. Entrez dans sa chambre noire.",
                  en: "Demo portfolio: Omar, street photographer in Casablanca. Step into his darkroom." },
    introTag:   { fr: "Chambre noire · Casablanca", en: "Darkroom · Casablanca" },
    moveHint:   { fr: "Bougez la souris…", en: "Move your mouse…" },
    shoot:      { fr: "Prendre une photo", en: "Take a picture" },
    caption:    { fr: "Omar · photographe de rue", en: "Omar · street photographer" },
    portraitAlt:{ fr: "Portrait d'Omar, appareil photo à l'œil", en: "Portrait of Omar, camera to his eye" },
    navAbout:   { fr: "À propos", en: "About" },
    navProjects:{ fr: "Projets", en: "Projects" },
    navExperience: { fr: "Expérience", en: "Experience" },
    navContact: { fr: "Contact", en: "Contact" },
    skip:       { fr: "Passer l'intro →", en: "Skip intro →" },
    replay:     { fr: "↺ Revoir l'intro", en: "↺ Replay intro" },
    brandSub:   { fr: "photographe de rue · Casablanca", en: "street photographer · Casablanca" },
    drHint:     { fr: "Faites défiler pour avancer dans la chambre noire", en: "Scroll to move through the darkroom" },
    noWebgl:    { fr: "La 3D n'est pas disponible sur cet appareil : voici la version simple.",
                  en: "3D isn't available on this device: here is the simple version." },
    ariaIntro:  { fr: "Introduction", en: "Introduction" },
    ariaSections: { fr: "Sections", en: "Sections" },
    ariaDarkroom: { fr: "La chambre noire", en: "The darkroom" },
    ariaDrNav:  { fr: "Sections de la chambre noire", en: "Darkroom sections" },
    ariaLang:   { fr: "Langue", en: "Language" },
    developed:  { fr: "révélé", en: "developed" },
    toDevelop:  { fr: "à révéler", en: "to develop" },
    developing: { fr: "révélation…", en: "developing…" },
    countDev:   { fr: "révélés", en: "developed" },
    project:    { fr: "Projet", en: "Project" },
    prev:       { fr: "← Précédent", en: "← Previous" },
    next:       { fr: "Tirage suivant →", en: "Next print →" },
    all:        { fr: "Toutes les séries", en: "All series" },
    developAll: { fr: "Tout révéler", en: "Develop all" },
    copy:       { fr: "Copier l'e-mail", en: "Copy e-mail" },
    copied:     { fr: "Copié ✓", en: "Copied ✓" },
    write:      { fr: "Écrire à Omar", en: "Write to Omar" },
    tipEnlarger:{ fr: "L'agrandisseur", en: "The enlarger" },
    tipCard:    { fr: "La carte de visite", en: "The business card" },
    tipDevelop: { fr: "cliquez pour révéler", en: "click to develop" },
    stamp:      { fr: "OMAR · CASABLANCA · ARGENTIQUE · ", en: "OMAR · CASABLANCA · SHOT ON FILM · " }
  }
};
