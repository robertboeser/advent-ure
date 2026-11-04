// Schneefall auf einem Canvas: drei Parallax-Ebenen, Wind, Dichte je Stimmung.

const LAYERS = [
  { size: [0.8, 1.6], speed: [18, 30], alpha: 0.45, sway: 10 },
  { size: [1.6, 2.6], speed: [30, 50], alpha: 0.7, sway: 18 },
  { size: [2.6, 4.2], speed: [55, 80], alpha: 0.9, sway: 26 },
];

/** Anzahl Flocken je 1 000 000 px² Bildfläche. */
export const DENSITY = {
  none: 0,
  window: 25,
  light: 110,
  normal: 190,
  heavy: 330,
  storm: 480,
};

const rand = (min, max) => min + Math.random() * (max - min);

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{reducedMotion: () => boolean}} options
 */
export function createSnow(canvas, { reducedMotion }) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let flakes = [];
  let target = 0;
  let golden = false;
  let windBias = 0;
  let raf = 0;
  let last = 0;
  let enabled = true;
  let density = 'normal';

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    updateTarget();
    if (!raf) drawStatic();
  }

  function updateTarget() {
    target = Math.round(((DENSITY[density] ?? DENSITY.normal) * width * height) / 1_000_000);
    if (reducedMotion()) target = Math.min(target, 60);
  }

  function makeFlake(anywhere = false) {
    const layerIndex = Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2;
    const layer = LAYERS[layerIndex];
    return {
      x: rand(-20, width + 20),
      y: anywhere ? rand(-10, height) : rand(-40, -5),
      r: rand(...layer.size),
      vy: rand(...layer.speed),
      sway: layer.sway * rand(0.6, 1.2),
      phase: rand(0, Math.PI * 2),
      freq: rand(0.4, 1.1),
      alpha: layer.alpha * rand(0.7, 1),
      layer: layerIndex,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const color = golden ? '255, 222, 150' : '255, 255, 255';
    for (const f of flakes) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${color}, ${f.alpha})`;
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Bei reduzierter Bewegung: ein ruhiges Standbild. */
  function drawStatic() {
    if (!reducedMotion()) return;
    flakes = Array.from({ length: target }, () => makeFlake(true));
    draw();
  }

  function step(now) {
    raf = requestAnimationFrame(step);
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    const t = now / 1000;
    const wind = Math.sin(t * 0.13) * 14 + Math.sin(t * 0.41) * 6 + windBias;

    // Langsam zur Zieldichte hin wachsen oder ausdünnen.
    const alive = flakes.reduce((n, f) => n + (f.fading ? 0 : 1), 0);
    if (alive < target) {
      const add = Math.min(target - alive, Math.ceil(target * dt * 0.6) + 1);
      for (let i = 0; i < add; i++) flakes.push(makeFlake(alive < target * 0.3));
    }

    // Überzählige Flocken blenden sanft aus, statt erst unten zu verschwinden.
    let surplus = alive - target;
    for (let i = 0; i < flakes.length && surplus > 0; i++) {
      if (!flakes[i].fading) {
        flakes[i].fading = true;
        surplus--;
      }
    }
    for (let i = flakes.length - 1; i >= 0; i--) {
      const f = flakes[i];
      if (f.fading) {
        f.alpha -= dt * 0.9;
        if (f.alpha <= 0) {
          flakes.splice(i, 1);
          continue;
        }
      }
      f.phase += f.freq * dt;
      f.y += f.vy * dt;
      f.x += (wind * (0.5 + f.layer * 0.35) + Math.sin(f.phase) * f.sway) * dt;
      const out = f.y > height + 10 || f.x < -40 || f.x > width + 40;
      if (out) {
        if (f.fading) flakes.splice(i, 1);
        else {
          Object.assign(f, makeFlake());
          if (f.x < 0 && wind > 0) f.x = rand(-20, width * 0.8);
        }
      }
    }
    draw();
  }

  function start() {
    if (raf || !enabled || reducedMotion()) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  /**
   * @param {{density?: keyof DENSITY, golden?: boolean, wind?: number}} mode
   */
  function setMode(mode) {
    density = mode.density ?? 'normal';
    golden = Boolean(mode.golden);
    windBias = mode.wind ?? 0;
    updateTarget();
    if (reducedMotion()) drawStatic();
  }

  function setEnabled(value) {
    enabled = value;
    canvas.hidden = !value;
    if (value) start();
    else {
      stop();
      ctx.clearRect(0, 0, width, height);
    }
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  resize();
  start();

  return { setMode, setEnabled, refresh: () => { stop(); resize(); start(); } };
}
