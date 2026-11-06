// =========================================================
//  Omar · the 3D darkroom (Act 3), drawn with three.js
//
//  The room has 4 "stations", and scrolling moves the camera
//  from one to the next:
//    0. about      → the enlarger projects Omar's portrait
//    1. experience → three trays (Révélateur, Arrêt, Fixateur)
//    2. projects   → prints on a clothesline: click one to develop it
//    3. contact    → a business card next to a camera
//  The text for each station is shown in the side panel.
//
//  To feel alive: dust in the air, a flickering safelight,
//  rippling trays, wet prints that drip, a darkroom timer.
// =========================================================
(function () {
  const D = window.OMAR;
  const L = window.I18N.L, U = window.I18N.ui;
  const ORDER = ['about', 'experience', 'projects', 'contact'];
  const $ = (id) => document.getElementById(id);
  const darkroom = $('darkroom'), host = $('gl'), panel = $('panel');
  const nav = $('drNav'), hint = $('drHint'), bar = $('drBar'), tip = $('tip');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- state ----------
  let built = false, webgl = true;
  let progress = 0, target = 0;           // 0 = about … 3 = contact
  let current = null;                      // section shown in the panel
  let selectedProject = null, selectedTray = null, developing = null;
  const developed = D.projects.map(() => false);
  let busyPrint = false;

  // three.js objects
  let renderer, scene, camera, clock, raycaster, pointer;
  const clickables = [];
  const prints = [];                       // { group, plane, tex, canvas, img, hang, alpha, anim, hover, wet }
  const trays = [];                        // { liquid, base, glow, label }
  const drops = [];                        // falling drips
  const films = [];                        // film strips hanging at the ends of the line
  let cone, projection, enlargerLight, safe1, lamp, halo, dust, dustBase, timerHand, led, card;

  // Camera stations: where the camera is (p) and what it looks at (t)
  const STATIONS = [
    { p: [-4.4, 3.2, 3.5], t: [-4.4, 1.7, -0.3] },
    { p: [0.35, 3.0, 3.1],  t: [0.35, 1.05, 0.0] },
    { p: [0, 3.0, 5.9],     t: [0, 2.55, -1.6] },
    { p: [4.6, 2.3, 2.5],   t: [4.6, 1.05, 0.25] }
  ];
  const TRAY_X = [-0.9, 0.35, 1.6], TRAY_Z = 0.25;
  const PRINT_X = [-3.2, -1.6, 0, 1.6, 3.2], LINE_Y = 3.3, LINE_Z = -1.6;
  const TRAY_COLORS = ['#c8923f', '#c4372d', '#1c1a18'];   // same colours as the panel

  // A soft round dot, used for dust and glows
  function glowTexture(inner, outer) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, inner); g.addColorStop(1, outer);
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  // =========================================================
  //  Building the room
  // =========================================================
  function build() {
    built = true;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
      webgl = false;
      darkroom.classList.add('no-webgl');
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    host.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0302);
    scene.fog = new THREE.Fog(0x0a0302, 9, 22);
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2(0, 0);

    // --- lights: almost everything is lit by red safelights ---
    scene.add(new THREE.AmbientLight(0x3a0a06, 1.0));
    safe1 = new THREE.PointLight(0xff2a14, 2.2, 22, 1.6); safe1.position.set(5.6, 3.9, -2.5); scene.add(safe1);
    const safe2 = new THREE.PointLight(0xff3a20, 1.2, 16, 1.8); safe2.position.set(-3.5, 4, 2); scene.add(safe2);
    const safe3 = new THREE.PointLight(0xff3020, 0.9, 12, 2);   safe3.position.set(0, 3.5, 3);  scene.add(safe3);

    const mat = (c, extra) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.85 }, extra || {}));
    const box = (w, h, d, c, x, y, z, extra) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, extra));
      m.position.set(x, y, z); scene.add(m); return m;
    };
    const cyl = (r, h, c, x, y, z, extra) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), mat(c, extra));
      m.position.set(x, y, z); scene.add(m); return m;
    };

    // --- the room ---
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat(0x140b09));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(30, 9), mat(0x1d1210));
    back.position.set(0, 4.5, -3); scene.add(back);
    [-8, 8].forEach((x) => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(20, 9), mat(0x180e0c));
      w.position.set(x, 4.5, 4); w.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(w);
    });
    // the safelight lamp on the wall (it glows, and flickers a little)
    lamp = box(0.7, 0.45, 0.12, 0xff2a14, 5.6, 4.1, -2.92, { emissive: 0xff2a14, emissiveIntensity: 1.4 });
    box(0.03, 1.2, 0.03, 0x2a1d18, 5.6, 4.9, -2.95);                       // its cable
    halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture('rgba(255,70,40,0.9)', 'rgba(255,40,20,0)'),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    halo.scale.set(2.6, 2.0, 1); halo.position.set(5.6, 4.1, -2.85); scene.add(halo);

    // a shelf with bottles of chemicals
    box(5, 0.08, 0.5, 0x2a1d18, -2.5, 4.3, -2.75);
    [-4.4, -3.9, -3.3, -2.6, -1.9, -1.2].forEach((x, i) => {
      const h = 0.5 + (i % 3) * 0.15;
      cyl(0.14 + (i % 2) * 0.05, h, [0x3a2620, 0x2a1a14, 0x4a2a20][i % 3], x, 4.34 + h / 2, -2.72, { roughness: 0.3, metalness: 0.2 });
      box(0.2, 0.12, 0.01, 0xcfc4b4, x, 4.34 + h * 0.45, -2.55 + (i % 2) * 0.04);  // paper label
    });

    // the darkroom timer on the wall, with a sweeping hand
    const face = document.createElement('canvas'); face.width = face.height = 256;
    const fx = face.getContext('2d');
    fx.fillStyle = '#16100d'; fx.beginPath(); fx.arc(128, 128, 124, 0, 6.283); fx.fill();
    fx.strokeStyle = '#c9f2c0'; fx.lineCap = 'round';
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * 6.283, r1 = i % 5 ? 104 : 92;
      fx.lineWidth = i % 5 ? 2 : 5;
      fx.beginPath(); fx.moveTo(128 + Math.sin(a) * r1, 128 - Math.cos(a) * r1);
      fx.lineTo(128 + Math.sin(a) * 114, 128 - Math.cos(a) * 114); fx.stroke();
    }
    fx.fillStyle = '#c9f2c0'; fx.font = '700 26px Archivo, sans-serif'; fx.textAlign = 'center';
    fx.fillText('SEC', 128, 178);
    const faceTex = new THREE.CanvasTexture(face); faceTex.encoding = THREE.sRGBEncoding;
    const timer = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40),
      new THREE.MeshStandardMaterial({ map: faceTex, emissive: 0xffffff, emissiveMap: faceTex, emissiveIntensity: 0.5, roughness: 0.6 }));
    timer.position.set(2.7, 4.35, -2.97); scene.add(timer);
    cyl(0.45, 0.06, 0x2a2420, 2.7, 4.35, -3.0).rotation.x = Math.PI / 2;
    timerHand = new THREE.Group(); timerHand.position.set(2.7, 4.35, -2.95); scene.add(timerHand);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.34, 0.01),
      new THREE.MeshBasicMaterial({ color: 0xff5a3a }));
    hand.position.y = 0.14; timerHand.add(hand);

    // --- the table ---
    box(13, 0.12, 2.6, 0x2a1d18, 0, 0.94, 0);
    [[-6.2, -1.1], [6.2, -1.1], [-6.2, 1.1], [6.2, 1.1]].forEach(([x, z]) => box(0.12, 0.88, 0.12, 0x1d1410, x, 0.44, z));

    // ===== 0. The enlarger (About) =====
    const EX = -4.4;
    const tag = (m, kind, i) => { m.userData = { kind, i }; clickables.push(m); return m; };
    tag(box(1.7, 0.05, 1.5, 0x1b1b1b, EX, 1.025, -0.1), 'about');
    tag(cyl(0.05, 2.1, 0x8a8a8a, EX, 2.05, -0.78, { metalness: 0.6, roughness: 0.35 }), 'about');
    tag(box(0.12, 0.12, 0.45, 0x333333, EX, 2.75, -0.6), 'about');
    tag(box(0.7, 0.55, 0.7, 0x222222, EX, 2.75, -0.32), 'about');
    tag(cyl(0.13, 0.22, 0x111111, EX, 2.37, -0.32), 'about');
    // the cone of light and the projected portrait
    cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.7, 1.2, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xfff0d0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    cone.position.set(EX, 1.66, -0.2); scene.add(cone);
    const portrait = new THREE.TextureLoader().load(D.portrait);
    portrait.encoding = THREE.sRGBEncoding;
    projection = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.18), new THREE.MeshBasicMaterial({ map: portrait, transparent: true, opacity: 0 }));
    projection.rotation.x = -Math.PI / 2; projection.position.set(EX, 1.056, -0.08); scene.add(projection);
    enlargerLight = new THREE.PointLight(0xffe2b0, 0, 4, 2); enlargerLight.position.set(EX, 1.8, -0.1); scene.add(enlargerLight);

    // ===== 1. The trays (Experience) =====
    TRAY_X.forEach((x, i) => {
      const z = TRAY_Z;
      tag(box(1.05, 0.03, 0.72, 0xcfc9c0, x, 1.015, z), 'tray', i);
      tag(box(1.05, 0.1, 0.03, 0xcfc9c0, x, 1.06, z - 0.36), 'tray', i);
      tag(box(1.05, 0.1, 0.03, 0xcfc9c0, x, 1.06, z + 0.36), 'tray', i);
      tag(box(0.03, 0.1, 0.72, 0xcfc9c0, x - 0.52, 1.06, z), 'tray', i);
      tag(box(0.03, 0.1, 0.72, 0xcfc9c0, x + 0.52, 1.06, z), 'tray', i);
      // the liquid has many small squares so it can ripple
      const geo = new THREE.PlaneGeometry(1.0, 0.68, 24, 16);
      const liquid = new THREE.Mesh(geo, mat(0x2b0c08, { roughness: 0.12, metalness: 0.35, emissive: 0xff3a20, emissiveIntensity: 0 }));
      liquid.rotation.x = -Math.PI / 2; liquid.position.set(x, 1.065, z); scene.add(liquid); tag(liquid, 'tray', i);
      const label = textSprite(1.1, 0.26);
      label.position.set(x, 1.48, z - 0.1); scene.add(label);
      trays.push({ liquid, base: geo.attributes.position.array.slice(), glow: 0, label, phase: i * 2.1 });
    });

    // ===== 2. The clothesline and the prints (Projects) =====
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 8.8, 6), mat(0x8a7a6a));
    line.rotation.z = Math.PI / 2; line.position.set(0, LINE_Y, LINE_Z); scene.add(line);
    D.projects.forEach((p, i) => {
      const group = new THREE.Group();
      group.position.set(PRINT_X[i], LINE_Y, LINE_Z);
      const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 320;
      const tex = new THREE.CanvasTexture(canvas); tex.encoding = THREE.sRGBEncoding;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 1.12),
        new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.22, roughness: 0.9, side: THREE.DoubleSide })
      );
      plane.position.y = -0.62; group.add(plane); tag(plane, 'print', i);
      const peg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.05), mat(0x8a6a4a)); peg.position.y = -0.04; group.add(peg);
      scene.add(group);
      const pr = { group, plane, tex, canvas, img: null, hang: group.position.clone(), alpha: 0, anim: null, phase: i * 1.3, hover: 0, wet: 0, nextDrop: 0 };
      const img = new Image();
      img.onload = () => { pr.img = img; drawPrint(pr); };
      img.src = p.img;
      prints.push(pr);
      drawPrint(pr);
    });
    // two developed film strips drying at the ends of the line
    [-4.05, 4.05].forEach((x, i) => {
      const c = filmCanvas(i);
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
      const g = new THREE.Group(); g.position.set(x, LINE_Y, LINE_Z);
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 1.7),
        new THREE.MeshStandardMaterial({ map: t, emissive: 0xffaa66, emissiveMap: t, emissiveIntensity: 0.25, roughness: 0.4, side: THREE.DoubleSide, transparent: true }));
      strip.position.y = -0.88; g.add(strip);
      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.05), mat(0x555555, { metalness: 0.7, roughness: 0.3 }));
      clip.position.y = -0.03; g.add(clip);
      scene.add(g); films.push({ g, phase: i * 2 + 0.5 });
    });

    // the drips that fall from wet prints (a small pool of reusable drops)
    const dropGeo = new THREE.SphereGeometry(0.016, 8, 6);
    const dropMat = new THREE.MeshStandardMaterial({ color: 0x5a1a10, roughness: 0.1, metalness: 0.4, emissive: 0xff4a2a, emissiveIntensity: 0.4 });
    for (let i = 0; i < 24; i++) {
      const m = new THREE.Mesh(dropGeo, dropMat); m.visible = false; scene.add(m);
      drops.push({ m, vy: 0, alive: false });
    }

    // ===== 3. The camera and the business card (Contact) =====
    tag(box(0.75, 0.46, 0.32, 0x151515, 5.25, 1.23, -0.25), 'contact');
    tag(box(0.75, 0.05, 0.32, 0x3a3a3a, 5.25, 1.48, -0.25, { metalness: 0.6, roughness: 0.35 }), 'contact');
    tag(box(0.22, 0.12, 0.2, 0x252525, 5.25, 1.56, -0.25), 'contact');
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 28), mat(0x0d0d0d, { roughness: 0.25, metalness: 0.5 }));
    lens.rotation.x = Math.PI / 2; lens.position.set(5.25, 1.21, 0.05); scene.add(lens); tag(lens, 'contact');
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.12, 28), new THREE.MeshStandardMaterial({ color: 0x0a1020, roughness: 0.05, metalness: 0.9 }));
    glass.position.set(5.25, 1.21, 0.201); scene.add(glass);
    led = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3020 }));
    led.position.set(5.52, 1.4, -0.08); scene.add(led);
    const cardTex = new THREE.CanvasTexture(document.createElement('canvas')); cardTex.encoding = THREE.sRGBEncoding;
    card = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.52),
      new THREE.MeshStandardMaterial({ map: cardTex, emissive: 0xffffff, emissiveMap: cardTex, emissiveIntensity: 0.35, roughness: 0.8 }));
    card.rotation.set(-Math.PI / 2, 0, 0.12); card.position.set(4.45, 1.007, 0.45); scene.add(card); tag(card, 'contact');
    // film canisters lying around
    [[3.7, 0.1], [3.95, -0.25]].forEach(([x, z]) => {
      cyl(0.08, 0.2, 0x3a3a3a, x, 1.1, z, { metalness: 0.5, roughness: 0.4 });
      cyl(0.085, 0.03, 0x111111, x, 1.215, z);
    });

    // ===== Dust floating in the red air =====
    const N = 420, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = 0.4 + Math.random() * 4.8;
      pos[i * 3 + 2] = -2.8 + Math.random() * 6.5;
    }
    dustBase = pos.slice();
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    dust = new THREE.Points(dg, new THREE.PointsMaterial({
      size: 0.045, map: glowTexture('rgba(255,200,180,1)', 'rgba(255,120,90,0)'),
      transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffb8a0
    }));
    scene.add(dust);

    drawTexts();
    // canvas text needs the web fonts: load them, then draw again
    if (document.fonts && document.fonts.load) {
      Promise.all(['84px "Mrs Saint Delafield"', '900 84px Archivo', '600 23px Archivo']
        .map((f) => document.fonts.load(f))).then(drawTexts).catch(() => {});
    }

    // --- events on the 3D view ---
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
    host.addEventListener('pointerup', onPointerUp);
    host.addEventListener('pointerleave', () => { hovered = null; tip.classList.remove('on'); });
    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(loop);
  }

  // A text label floating in 3D (a "sprite"); its text is drawn by drawTexts()
  function textSprite(w, h) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 120;
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    s.scale.set(w, h, 1); s.userData.canvas = c; return s;
  }
  function drawLabel(sprite, text) {
    const c = sprite.userData.canvas, x = c.getContext('2d');
    x.clearRect(0, 0, 512, 120);
    x.font = '104px "Mrs Saint Delafield", cursive';
    x.fillStyle = '#fff1ea'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 8;
    x.fillText(text, 256, 68);
    sprite.material.map.needsUpdate = true;
  }

  // The business card, drawn on a canvas
  function drawCard() {
    const c = card.material.map.image; c.width = 512; c.height = 296;
    const x = c.getContext('2d');
    x.fillStyle = '#efe7dc'; x.fillRect(0, 0, 512, 296);
    x.fillStyle = '#c4837d'; x.fillRect(0, 0, 14, 296);               // rose edge
    x.fillStyle = '#1c1a18';
    if ('fontStretch' in x) x.fontStretch = 'condensed';
    x.font = '900 84px Archivo, "Arial Narrow", sans-serif'; x.fillText(D.name.toUpperCase(), 40, 104);
    if ('fontStretch' in x) x.fontStretch = 'normal';
    x.fillStyle = '#c4837d'; x.font = '54px "Mrs Saint Delafield", cursive';
    x.fillText(L(D.role).toLowerCase(), 170, 138);
    x.fillStyle = '#1c1a18'; x.font = '600 23px Archivo, sans-serif';
    x.fillText(D.contact.email, 42, 222);
    x.fillStyle = '#6b6159'; x.fillText(D.contact.instagram + '  ·  ' + D.city.toUpperCase(), 42, 258);
    card.material.map.needsUpdate = true;
  }

  // Everything in 3D that has words (redrawn when the language changes)
  function drawTexts() {
    if (!renderer) return;
    trays.forEach((tr, i) => drawLabel(tr.label, L(D.experience[i].tray)));
    drawCard();
  }

  // A strip of developed negatives
  function filmCanvas(seed) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 420;
    const x = c.getContext('2d');
    x.fillStyle = 'rgba(40,22,12,0.92)'; x.fillRect(0, 0, 64, 420);
    x.fillStyle = 'rgba(230,210,180,0.75)';
    for (let y = 6; y < 420; y += 16) { x.fillRect(4, y, 6, 9); x.fillRect(54, y, 6, 9); }
    for (let f = 0; f < 5; f++) {
      const y = 10 + f * 82;
      const g = x.createLinearGradient(0, y, 0, y + 72);
      const a = 0.25 + ((f * 37 + seed * 13) % 50) / 100;
      g.addColorStop(0, `rgba(217,163,91,${a})`); g.addColorStop(1, `rgba(120,70,30,${a * 0.6})`);
      x.fillStyle = g; x.fillRect(14, y, 36, 72);
    }
    return c;
  }

  // A print: blank paper, with the photo appearing as alpha goes 0 → 1
  function drawPrint(pr) {
    const x = pr.canvas.getContext('2d'), W = 256, H = 320, m = 14;
    x.globalAlpha = 1; x.fillStyle = '#efe8dd'; x.fillRect(0, 0, W, H);
    if (pr.img && pr.alpha > 0) {
      x.globalAlpha = pr.alpha;
      x.drawImage(pr.img, m, m, W - 2 * m, H - 2 * m);
      x.globalAlpha = 1;
    }
    pr.tex.needsUpdate = true;
  }

  // =========================================================
  //  Developing a print: lift → into the tray → appear → back on the line
  // =========================================================
  function develop(i) {
    if (!webgl) { developed[i] = true; selectedProject = i; render(true); return; }
    if (developed[i]) { selectedProject = i; render(true); return; }
    if (busyPrint) return;
    busyPrint = true; developing = i; selectedProject = null;
    render(false);
    const pr = prints[i];
    const tx = TRAY_X[0], tz = TRAY_Z - 0.62, flat = -Math.PI / 2;
    const H = pr.hang;
    const keys = [
      { p: [H.x, H.y, H.z], r: 0, t: 0 },
      { p: [H.x * 0.7, 2.4, -0.6], r: -0.8, t: 0.5 },
      { p: [tx, 1.6, tz], r: flat, t: 0.6 },
      { p: [tx, 1.085, tz], r: flat, t: 0.35, dev: false },
      { p: [tx, 1.085, tz], r: flat, t: 2.4, dev: true },
      { p: [tx, 1.6, tz], r: flat, t: 0.35 },
      { p: [H.x, H.y, H.z], r: 0, t: 1.0 }
    ];
    if (reduce) keys.forEach((k) => (k.t = Math.min(k.t, 0.2)));
    pr.anim = { keys, k: 1, time: 0, done: () => {
      developed[i] = true; selectedProject = i; busyPrint = false; developing = null;
      pr.wet = 40;                        // it drips for a while
      render(true);
    } };
    trays[0].glow = 1;
  }

  function stepPrint(pr, dt) {
    const a = pr.anim;
    a.time += dt;
    const k1 = a.keys[a.k - 1], k2 = a.keys[a.k];
    let f = Math.min(1, a.time / k2.t);
    const s = f * f * (3 - 2 * f);
    pr.group.position.set(
      k1.p[0] + (k2.p[0] - k1.p[0]) * s,
      k1.p[1] + (k2.p[1] - k1.p[1]) * s,
      k1.p[2] + (k2.p[2] - k1.p[2]) * s
    );
    pr.group.rotation.x = k1.r + (k2.r - k1.r) * s;
    pr.group.rotation.z = 0;
    if (k2.dev) { pr.alpha = f; drawPrint(pr); trays[0].glow = Math.max(trays[0].glow, 0.6); }
    if (f >= 1) {
      a.k++; a.time = 0;
      if (a.k >= a.keys.length) { pr.anim = null; pr.alpha = 1; drawPrint(pr); a.done(); }
    }
  }

  function spawnDrop(x, y, z) {
    const d = drops.find((d) => !d.alive); if (!d) return;
    d.alive = true; d.vy = 0; d.m.visible = true; d.m.scale.set(1, 1.4, 1);
    d.m.position.set(x, y, z);
  }

  // =========================================================
  //  The side panel (HTML)
  // =========================================================
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const T = (v) => esc(L(v));

  // The top of each panel: the object in handwriting, then "N°2 — Experience"
  const NAV_KEYS = ['navAbout', 'navExperience', 'navProjects', 'navContact'];
  function head(eyebrow, extra) {
    const n = ORDER.indexOf(current);
    return `<div class="p-head"><span class="p-script">${T(eyebrow)}</span>`
      + `<span class="p-sec">N°${n + 1} — ${esc(U(NAV_KEYS[n]))}${extra || ''}</span></div>`;
  }

  function render(animate) {
    const s = current;
    let h = '';
    if (s === 'about') {
      const a = D.about;
      h = head(a.eyebrow) + `<h2>${T(a.title)}</h2>`
        + a.text.map((t) => `<p>${T(t)}</p>`).join('')
        + `<blockquote>${T(a.quote)}</blockquote>`
        + `<dl class="facts">${a.facts.map(([k, v]) => `<div><dt>${T(k)}</dt><dd>${T(v)}</dd></div>`).join('')}</dl>`;
    }
    if (s === 'experience') {
      const e0 = D.experienceIntro;
      h = head(e0.eyebrow) + `<h2>${T(e0.title)}</h2><p>${T(e0.text)}</p><ol class="timeline">`
        + D.experience.map((e, i) => `<li style="--c:${TRAY_COLORS[i]}"><button type="button" class="item" data-tray="${i}" aria-expanded="${selectedTray === i}">
            <span class="tl-top"><span class="tag">${T(e.tray)}</span><small>${T(e.years)}</small></span>
            <b>${T(e.title)}</b>
            <span class="tl-more"><span>${T(e.text)}</span></span></button></li>`).join('') + '</ol>';
    }
    if (s === 'projects') {
      const total = D.projects.length, done = developed.filter(Boolean).length;
      if (selectedProject !== null && developed[selectedProject]) {
        const i = selectedProject, p = D.projects[i];
        const next = (i + 1) % total, prev = (i - 1 + total) % total;
        h = head(D.projectsIntro.eyebrow, ` · ${i + 1}/${total}`)
          + `<h2>${T(p.title)}</h2><p class="note">${T(p.place)} · ${esc(p.year)}</p>
          <figure class="pshot"><img class="dev-img" src="${esc(p.img)}" alt="${T(p.title)}" width="640" height="800"><span class="shot-no">${String(i + 1).padStart(2, '0')}A</span></figure>
          <p>${T(p.text)}</p>
          <div class="row"><button type="button" class="btn alt" data-print="${prev}">${esc(U('prev'))}</button>
          <button type="button" class="btn" data-print="${next}">${esc(U('next'))}</button>
          <button type="button" class="link" data-all="1">${esc(U('all'))}</button></div>`;
      } else {
        const pi = D.projectsIntro;
        h = head(pi.eyebrow) + `<h2>${T(pi.title)}</h2><p>${T(pi.text)}</p>
          <div class="meter"><span style="width:${done / total * 100}%"></span></div>
          <p class="note">${done}/${total} ${esc(U('countDev'))}</p>
          <div class="sheet">`
          + D.projects.map((p, i) => {
            const state = developed[i] ? 'dev' : developing === i ? 'busy' : '';
            const label = developed[i] ? U('developed') : developing === i ? U('developing') : U('toDevelop');
            return `<button type="button" class="frame ${state}" data-print="${i}" aria-label="${T(p.title)} · ${esc(label)}">
              <span class="f-img" style="background-image:url('${esc(p.img)}')"></span>
              <span class="f-no">${String(i + 1).padStart(2, '0')}</span>
              <span class="f-t">${T(p.title)}</span><span class="f-s">${esc(label)}</span></button>`;
          }).join('') + '</div>';
      }
    }
    if (s === 'contact') {
      const c = D.contact;
      h = head(c.eyebrow) + `<h2>${T(c.title)}</h2>
        <p class="avail">${T(c.available)}</p>
        <p>${T(c.text)}</p>
        <p class="mail" id="mail">${esc(c.email)}</p>
        <div class="row"><button type="button" class="btn" id="copyMail">${esc(U('copy'))}</button>
        <a class="btn alt" href="mailto:${esc(c.email)}">${esc(U('write'))}</a></div>
        <p class="note">Instagram · ${esc(c.instagram)}</p>`;
    }
    panel.innerHTML = h;
    [...panel.children].forEach((el, i) => el.style.setProperty('--i', i));
    if (animate) { panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); }
    nav.querySelectorAll('[data-go]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.go === s)));
  }

  panel.addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.tray !== undefined) { selectTray(+t.dataset.tray); }
    if (t.dataset.print !== undefined) { develop(+t.dataset.print); }
    if (t.dataset.all) { selectedProject = null; render(true); }
    if (t.id === 'copyMail') {
      const mail = D.contact.email;
      navigator.clipboard.writeText(mail).then(() => { t.textContent = U('copied'); })
        .catch(() => { const r = document.createRange(); r.selectNodeContents($('mail')); getSelection().removeAllRanges(); getSelection().addRange(r); });
    }
  });

  function selectTray(i) {
    selectedTray = selectedTray === i && current === 'experience' ? null : i;
    if (trays[i]) trays[i].glow = 1;
    render(false);
  }

  // When the language changes: redraw the panel and the words in 3D
  document.addEventListener('langchange', () => {
    $('credit').textContent = L(D.credit);
    drawTexts();
    if (current) render(true);
  });

  // =========================================================
  //  Navigation: scroll, keys, nav buttons
  // =========================================================
  function goTo(section) { target = ORDER.indexOf(section); hint.classList.add('gone'); }
  nav.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) goTo(b.dataset.go); });

  let snapTimer = null;
  function nudge(amount) {
    target = Math.max(0, Math.min(3, target + amount));
    hint.classList.add('gone');
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => { target = Math.round(target); }, 450);
  }
  darkroom.addEventListener('wheel', (e) => {
    if (panel.contains(e.target) && panel.scrollHeight > panel.clientHeight) return; // let the panel scroll
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
    nudge(dy * 0.0016);
  }, { passive: false });
  let touchY = null;
  host.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  host.addEventListener('touchmove', (e) => {
    if (touchY === null) return;
    const y = e.touches[0].clientY; nudge((touchY - y) * 0.006); touchY = y;
  }, { passive: true });
  host.addEventListener('touchend', () => { touchY = null; });
  window.addEventListener('keydown', (e) => {
    if (darkroom.hidden) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key)) { target = Math.min(3, Math.round(target) + 1); hint.classList.add('gone'); }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { target = Math.max(0, Math.round(target) - 1); }
  });

  // Clicking objects in the room
  let downAt = null, hovered = null;
  function pick(e) {
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(clickables, false)[0];
    return hit ? hit.object.userData : null;
  }
  function tipText(u) {
    if (u.kind === 'about') return U('tipEnlarger');
    if (u.kind === 'contact') return U('tipCard');
    if (u.kind === 'tray') return L(D.experience[u.i].tray) + ' · ' + L(D.experience[u.i].years);
    if (u.kind === 'print') return L(D.projects[u.i].title) + (developed[u.i] ? '' : ' · ' + U('tipDevelop'));
    return '';
  }
  function onPointerMove(e) {
    if (!renderer) return;
    hovered = pick(e);
    host.classList.toggle('hover', !!hovered);
    if (hovered && e.pointerType !== 'touch') {
      tip.textContent = tipText(hovered);
      tip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`;
      tip.classList.add('on');
    } else tip.classList.remove('on');
  }
  function onPointerUp(e) {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
    const u = pick(e); if (!u) return;
    if (u.kind === 'about') goTo('about');
    if (u.kind === 'contact') goTo('contact');
    if (u.kind === 'tray') { goTo('experience'); selectedTray = null; selectTray(u.i); }
    if (u.kind === 'print') { goTo('projects'); develop(u.i); }
  }

  // =========================================================
  //  Camera + animation loop
  // =========================================================
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), lookAt = new THREE.Vector3();
  let k = 1; // distance factor (bigger on tall phone screens)

  function resize() {
    if (!renderer) return;
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 1 ? 60 : 45;
    k = camera.aspect < 1 ? Math.min(1.9, 0.95 / camera.aspect) : 1;
    scene.fog.near = 9 * k; scene.fog.far = 22 * k;
    // shift the picture away from the panel (left on desktop, up on phones)
    if (w > 760) camera.setViewOffset(w, h, w * 0.14, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.22, w, h);
    camera.updateProjectionMatrix();
  }

  function stationAt(prog) {
    const i = Math.min(2, Math.floor(prog)), f0 = prog - i;
    const f = f0 * f0 * (3 - 2 * f0);
    const a = STATIONS[i], b = STATIONS[i + 1];
    vA.set(...a.t).lerp(vB.set(...b.t), f); lookAt.copy(vA);
    vA.set(...a.p).lerp(vB.set(...b.p), f);
    vA.sub(lookAt).multiplyScalar(k).add(lookAt);
    return vA;
  }

  function loop() {
    requestAnimationFrame(loop);
    if (darkroom.hidden) return;
    const rdt = Math.min(clock.getDelta(), 0.25), dt = Math.min(rdt, 0.05), t = clock.elapsedTime;
    const live = reduce ? 0 : 1;

    progress += (target - progress) * Math.min(1, rdt * (reduce ? 20 : 3.5));
    const sec = ORDER[Math.round(progress)];
    if (sec !== current) { current = sec; render(true); }
    bar.style.transform = `scaleX(${(progress + 1) / 4})`;

    // the camera breathes a little, like someone holding it
    const pos = stationAt(progress);
    camera.position.copy(pos);
    camera.position.x += pointer.x * 0.12 + Math.sin(t * 0.5) * 0.04 * live;
    camera.position.y += pointer.y * 0.08 + Math.sin(t * 0.7) * 0.025 * live;
    camera.lookAt(lookAt);

    // the safelight flickers (an old bulb)
    const flick = live * (Math.sin(t * 7.3) * 0.05 + Math.sin(t * 17.1) * 0.04 + (Math.random() < 0.004 ? -0.5 : 0));
    safe1.intensity = 2.2 * (1 + flick);
    lamp.material.emissiveIntensity = 1.4 * (1 + flick);
    halo.material.opacity = 0.55 * (1 + flick * 1.5);

    // enlarger light: on when we are near "about"
    const about = Math.max(0, 1 - Math.abs(progress) * 1.6);
    cone.material.opacity = (0.16 + Math.sin(t * 9) * 0.01 * live) * about;
    projection.material.opacity = about;
    enlargerLight.intensity = 0.9 * about;

    // the timer's hand sweeps once a minute; the camera LED blinks
    timerHand.rotation.z = -t * Math.PI * 2 / 60;
    led.visible = Math.sin(t * 3) > -0.2;

    // prints sway gently on the line, lift when hovered, and drip when wet
    prints.forEach((pr, i) => {
      const isHover = hovered && hovered.kind === 'print' && hovered.i === i;
      pr.hover += ((isHover ? 1 : 0) - pr.hover) * Math.min(1, rdt * 8);
      if (pr.anim) stepPrint(pr, rdt);
      else {
        pr.group.rotation.z = Math.sin(t * 0.9 + pr.phase) * 0.035 * live;
        pr.group.position.z = pr.hang.z + pr.hover * 0.18;
      }
      pr.plane.material.emissiveIntensity = 0.22 + pr.hover * 0.22;
      if (pr.wet > 0 && !pr.anim) {
        pr.wet -= rdt; pr.nextDrop -= rdt;
        if (pr.nextDrop <= 0 && live) {
          spawnDrop(pr.group.position.x + (Math.random() - 0.5) * 0.7, LINE_Y - 1.2, pr.group.position.z);
          pr.nextDrop = 0.4 + Math.random() * 1.6 + (40 - pr.wet) * 0.05;
        }
      }
    });
    films.forEach((f) => { f.g.rotation.z = Math.sin(t * 0.8 + f.phase) * 0.05 * live; });
    drops.forEach((d) => {
      if (!d.alive) return;
      d.vy -= 9.8 * dt; d.m.position.y += d.vy * dt;
      if (d.m.position.y < 0.02) { d.alive = false; d.m.visible = false; }
    });

    // trays: the liquid ripples, more when it was just used
    trays.forEach((tr) => {
      tr.glow = Math.max(0, tr.glow - dt * 0.8);
      tr.liquid.material.emissiveIntensity = 0.35 * tr.glow;
      if (!live) return;
      const p = tr.liquid.geometry.attributes.position, b = tr.base, amp = 0.003 + 0.014 * tr.glow;
      for (let v = 0; v < p.count; v++) {
        const x = b[v * 3], y = b[v * 3 + 1], r = Math.hypot(x, y);
        p.array[v * 3 + 2] = amp * Math.sin(r * 26 - t * 4 + tr.phase) + 0.002 * Math.sin(x * 9 + t * 1.3);
      }
      p.needsUpdate = true; tr.liquid.geometry.computeVertexNormals();
    });

    // dust drifts slowly
    if (live) {
      const p = dust.geometry.attributes.position.array;
      for (let i = 0; i < p.length; i += 3) {
        p[i] = dustBase[i] + Math.sin(t * 0.13 + i) * 0.25;
        p[i + 1] = dustBase[i + 1] + Math.sin(t * 0.21 + i * 0.7) * 0.18;
        p[i + 2] = dustBase[i + 2] + Math.cos(t * 0.11 + i * 1.3) * 0.2;
      }
      dust.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  // =========================================================
  //  Public: enter the darkroom at a section
  // =========================================================
  window.Darkroom = {
    enter(section) {
      darkroom.hidden = false;
      $('credit').textContent = L(D.credit);
      if (!built) build();
      const i = Math.max(0, ORDER.indexOf(section));
      target = i;
      progress = Math.max(0, i - 0.4);
      current = null;
      if (!webgl) { current = ORDER[i]; render(true); }
      resize();
    }
  };
  // Without 3D, the nav buttons still switch the panel
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b && !webgl) { current = b.dataset.go; render(true); }
  });
  $('replay').addEventListener('click', () => { darkroom.hidden = true; tip.classList.remove('on'); window.Intro.replay(); });
})();
