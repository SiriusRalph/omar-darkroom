# Omar · la chambre noire 📷

A **demo portfolio** for a fictional street photographer in Casablanca.
The visitor enters a dark room, takes a photo, and walks into a red 3D darkroom.

> Omar is a fictional character. Keep the line "Portfolio de démonstration · personnage fictif" visible.

## How to open it (in VS Code)

1. Open this folder in VS Code (**File → Open Folder…**).
2. Right-click `index.html` → **Open with Live Server**.

> Why Live Server? The 3D room loads the photos from the `images/` folder. Browsers block that
> when you just double-click `index.html`, so we need a tiny local server (same as Query Sara).

## The 3 acts

| Act | What happens | File |
|-----|--------------|------|
| 1. Darkness | A flashlight follows the mouse (on phones it sweeps by itself). One button: "Prendre une photo". | `js/intro.js` |
| 2. The photo | Flash + shutter sound, the portrait develops, then 4 film strips unroll: À propos, Projets, Expérience, Contact. | `js/intro.js` + `css/style.css` |
| 3. The darkroom | A 3D room (three.js). Scrolling moves the camera between 4 stations. | `js/room.js` |

The 4 stations of the darkroom:

| Section | Object | What you can do |
|---------|--------|-----------------|
| À propos | The **enlarger** | It projects Omar's portrait onto the table |
| Expérience | The **3 trays** (Révélateur, Arrêt, Fixateur) | Click a tray: one step of his career |
| Projets | The **clothesline** with 5 blank prints | Click a print: it dips into the tray and the photo develops |
| Contact | The **business card** next to the camera | Copy the e-mail |

## What's in the folder

| File | What it does |
|------|--------------|
| `index.html` | The structure: the intro, then the darkroom |
| `css/style.css` | All the design. Colours are at the top (`--safelight` is the red) |
| `js/data.js` | **All the text** (about, experience, projects, contact). Edit this first |
| `js/intro.js` | Act 1 and Act 2 |
| `js/room.js` | Act 3, the 3D room |
| `images/` | `omar.jpg` (portrait) + one photo per project |

## How to change things

- **Text:** everything is in `js/data.js`. Each sentence has its French and English version side by side:
  `{ fr: "Bonjour", en: "Hello" }`. The FR / EN switch (top right) is handled by `js/i18n.js`;
  the site remembers the visitor's choice and picks English automatically for non-French browsers.
- **Photos:** replace the files in `images/` with real photos (portrait format, about 4:5),
  keeping the same names, or change the `img` paths in `js/data.js`.
  The included photos are simple drawings made for the demo. For real ones, you can use free photos
  from sites like Unsplash or Pexels (check each photo's licence).
- **Red colour:** `--safelight` in `css/style.css`.

## Good to know

- Works on desktop and phone. On phones, the panel sits at the bottom and the 3D view moves up.
- If a device can't show 3D, the site still works with the panel and the buttons.
- three.js is loaded from a CDN (internet needed), version 0.128.0.

## Put it online

Same as Query Sara: push the folder to a GitHub repo, then **Settings → Pages → Branch: main**.
