// =========================================================
//  Omar · the intro (Act 1 and Act 2)
//  1. Darkness + a flashlight that follows the mouse or finger
//     (dust floats in the beam, Omar's prints hang in the dark)
//  2. "Prendre une photo" → flash → the photo develops
//  3. Film strips unroll → clicking one opens the darkroom
// =========================================================
(function () {
  const $ = (id) => document.getElementById(id);
  const D = window.OMAR;
  const root = document.documentElement;
  const intro = $('intro'), hint = $('hint'), start = $('start');
  const shoot = $('shoot'), flash = $('flash'), polaroid = $('polaroid');
  const strips = $('strips'), skip = $('skip'), redwash = $('redwash');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? Math.min(ms, 150) : ms));

  // ---------- 0. Omar's real prints, hanging in the dark ----------
  const hints = $('hints');
  D.projects.forEach((p, i) => {
    const s = document.createElement('span');
    s.className = 'h-print';
    s.style.left = (8 + i * 18) + '%';
    s.style.setProperty('--rot', ((i % 2 ? 1 : -1) * (1 + (i * 7) % 3)) + 'deg');
    s.style.setProperty('--sway', (4 + i * 0.7) + 's');
    s.style.backgroundImage = `url("${p.img}")`;
    hints.appendChild(s);
  });

  // ---------- 1. The flashlight ----------
  let moved = false, lx = innerWidth / 2, ly = innerHeight / 2;
  function moveLight(x, y) {
    lx = x; ly = y;
    root.style.setProperty('--x', x + 'px');
    root.style.setProperty('--y', y + 'px');
  }
  window.addEventListener('pointermove', (e) => {
    if (intro.hidden) return;
    moved = true;
    moveLight(e.clientX, e.clientY);
    hint.classList.add('gone');
  });

  // ---------- 1b. Dust in the beam ----------
  const dust = $('dust'), dctx = dust.getContext('2d');
  let motes = [];
  function sizeDust() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    dust.width = innerWidth * dpr; dust.height = innerHeight * dpr;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(140, innerWidth * innerHeight / 9000));
    motes = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 6, vy: -2 - Math.random() * 6,
      r: 0.5 + Math.random() * 1.6, p: Math.random() * 6.28
    }));
  }
  sizeDust();
  window.addEventListener('resize', sizeDust);

  // On phones (no mouse), the light sweeps slowly by itself until the first touch
  let t0 = performance.now(), last = t0;
  (function tick(now) {
    requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (intro.hidden) return;
    const t = (now - t0) / 1000;
    if (!moved) {
      moveLight(innerWidth * (0.5 + 0.32 * Math.sin(t * 0.7)), innerHeight * (0.45 + 0.2 * Math.sin(t * 1.1)));
    }
    // the torch flickers a tiny bit, like an old battery
    const flick = reduce ? 0 : Math.sin(t * 13) * 2 + Math.sin(t * 31) * 1.5 + (Math.random() < 0.01 ? -14 : 0);
    root.style.setProperty('--r', (180 + flick) + 'px');

    dctx.clearRect(0, 0, innerWidth, innerHeight);
    if (reduce) return;
    for (const m of motes) {
      m.x += (m.vx + Math.sin(t * 0.8 + m.p) * 5) * dt;
      m.y += m.vy * dt;
      if (m.y < -5) { m.y = innerHeight + 5; m.x = Math.random() * innerWidth; }
      if (m.x < -5) m.x = innerWidth + 5; if (m.x > innerWidth + 5) m.x = -5;
      const d = Math.hypot(m.x - lx, m.y - ly);
      const a = Math.max(0, 1 - d / 220) * (0.55 + 0.45 * Math.sin(t * 2 + m.p));
      if (a <= 0.02) continue;
      dctx.fillStyle = `rgba(255, 238, 214, ${a})`;
      dctx.beginPath(); dctx.arc(m.x, m.y, m.r, 0, 6.283); dctx.fill();
    }
  })(t0);

  // ---------- 2. The shutter sound (made with code, no file) ----------
  function shutterSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.09].forEach((at) => {
        const len = 0.05 * ctx.sampleRate;
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const filter = ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 1800;
        const gain = ctx.createGain(); gain.gain.value = 0.25;
        src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
        src.start(ctx.currentTime + at);
      });
    } catch (e) { /* no sound: not a problem */ }
  }

  // ---------- 3. Take the picture ----------
  let busy = false, frame = 1;
  shoot.addEventListener('click', async () => {
    if (busy) return; busy = true;
    shutterSound();
    frame = frame % 36 + 1;
    $('frameNo').textContent = String(frame).padStart(2, '0');
    flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on');
    start.style.opacity = '0';
    intro.classList.add('shot');
    await wait(250);
    start.hidden = true;
    polaroid.hidden = false;
    void polaroid.offsetWidth;
    polaroid.classList.add('in');
    await wait(500);
    polaroid.classList.add('develop');      // the image appears slowly
    await wait(2300);
    strips.hidden = false;
    void strips.offsetWidth;
    strips.classList.add('out');            // the film strips unroll
    busy = false;
  });

  // ---------- 4. Go into the darkroom ----------
  async function enter(section) {
    redwash.classList.add('on');
    await wait(650);
    intro.hidden = true;
    window.Darkroom.enter(section);
    await wait(100);
    redwash.classList.remove('on');
  }
  strips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) enter(b.dataset.go);
  });
  skip.addEventListener('click', () => enter('about'));

  // ---------- 5. Replay the intro (called from the darkroom) ----------
  window.Intro = {
    replay() {
      intro.hidden = false;
      intro.classList.remove('shot');
      start.hidden = false; start.style.opacity = '';
      polaroid.hidden = true; polaroid.classList.remove('in', 'develop');
      strips.hidden = true; strips.classList.remove('out');
      hint.classList.remove('gone');
      moved = false; t0 = performance.now();
    }
  };
})();
