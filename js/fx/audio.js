// Prozedurale Klänge mit der Web Audio API – keine Audiodateien nötig.
//
// Ambient-Ebenen (Wind, Kaminfeuer, Kirchenhall) blenden je nach Station
// weich über. Einzelklänge: Glockenschlag, Silberglöckchen, Spieldose,
// Eisknacken, Aufsammeln, Festgeläut. Der AudioContext entsteht erst bei
// der ersten Nutzerinteraktion (Autoplay-Regeln der Browser).

const AMBIENCE = {
  warm: { wind: 0, fire: 0.5, hum: 0 },
  mild: { wind: 0.05, fire: 0.08, hum: 0 },
  kalt: { wind: 0.32, fire: 0, hum: 0 },
  eisig: { wind: 0.55, fire: 0, hum: 0 },
};

/** Omas Wiegenlied (eigene Melodie): [Halbtöne über C5, Dauer in Vierteln]. */
const LULLABY = [
  [7, 1], [4, 1], [5, 1], [7, 2], [9, 1], [7, 1], [5, 1], [4, 2],
  [2, 1], [4, 1], [5, 1], [7, 1], [5, 1], [4, 1], [2, 1], [0, 3],
];

/**
 * @param {{getSettings: () => {sound: boolean, volume: number}}} options
 */
export function createAudio({ getSettings }) {
  /** @type {AudioContext|null} */
  let ctx = null;
  let master;
  let layers;
  let noiseBuffer;
  let fireTimer = 0;
  let current = { wind: 0, fire: 0, hum: 0 };

  const enabled = () => Boolean(getSettings().sound);

  function ensureContext() {
    if (ctx || !enabled()) return ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = getSettings().volume ?? 0.6;
    const compressor = ctx.createDynamicsCompressor();
    master.connect(compressor).connect(ctx.destination);
    noiseBuffer = makeNoise(ctx, 4);
    layers = { wind: makeWind(), fire: makeFireBed(), hum: makeHum() };
    applyAmbience(0.1);
    scheduleCrackles();
    return ctx;
  }

  function makeNoise(context, seconds) {
    const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function noiseSource() {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    src.loop = true;
    return src;
  }

  /** Wind: Rauschen durch einen langsam wandernden Bandpass. */
  function makeWind() {
    const src = noiseSource();
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 500;
    band.Q.value = 0.8;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 320;
    lfo.connect(lfoGain).connect(band.frequency);
    const gust = ctx.createOscillator();
    gust.frequency.value = 0.19;
    const gustGain = ctx.createGain();
    gustGain.gain.value = 0.25;
    const out = ctx.createGain();
    out.gain.value = 0;
    const swell = ctx.createGain();
    swell.gain.value = 0.75;
    gust.connect(gustGain).connect(swell.gain);
    src.connect(band).connect(swell).connect(out).connect(master);
    src.start();
    lfo.start();
    gust.start();
    return out;
  }

  /** Kaminfeuer: tiefes, gefiltertes Rauschen als Grundbett. */
  function makeFireBed() {
    const src = noiseSource();
    const low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 280;
    const out = ctx.createGain();
    out.gain.value = 0;
    src.connect(low).connect(out).connect(master);
    src.start();
    return out;
  }

  /** Kirchenhall: leiser, tiefer Orgelton (Quinte). */
  function makeHum() {
    const out = ctx.createGain();
    out.gain.value = 0;
    for (const [freq, level] of [[65.41, 0.5], [98, 0.35], [130.81, 0.18]]) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(out);
      osc.start();
    }
    out.connect(master);
    return out;
  }

  /** Einzelnes Knistern im Feuer. */
  function crackle() {
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const high = ctx.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 1200 + Math.random() * 2500;
    const g = ctx.createGain();
    const level = current.fire * (0.15 + Math.random() * 0.35);
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.06);
    src.connect(high).connect(g).connect(master);
    src.start(t, Math.random() * 3, 0.1);
  }

  function scheduleCrackles() {
    clearTimeout(fireTimer);
    const loop = () => {
      if (ctx && current.fire > 0.01 && ctx.state === 'running') {
        const bursts = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < bursts; i++) setTimeout(crackle, Math.random() * 120);
      }
      fireTimer = setTimeout(loop, 90 + Math.random() * 420);
    };
    loop();
  }

  function applyAmbience(time = 1.5) {
    if (!ctx) return;
    const t = ctx.currentTime;
    layers.wind.gain.setTargetAtTime(current.wind * 0.5, t, time / 3);
    layers.fire.gain.setTargetAtTime(current.fire * 0.35, t, time / 3);
    layers.hum.gain.setTargetAtTime(current.hum * 0.06, t, time / 3);
  }

  // ---------------------------------------------------------------- Einzelklänge

  /** Glocke aus unharmonischen Teiltönen. */
  function bell(fundamental, { when = 0, level = 0.35, decay = 4 } = {}) {
    const t = ctx.currentTime + when;
    const partials = [[0.5, 0.6], [1, 1], [1.19, 0.5], [1.56, 0.4], [2, 0.35], [2.51, 0.2], [3.01, 0.12]];
    for (const [ratio, amp] of partials) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = fundamental * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level * amp, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay * (1.2 - ratio * 0.15));
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + decay * 1.3);
    }
  }

  /** Gezupfter Ton einer Spieldose. */
  function pluck(freq, when, level = 0.18) {
    const t = ctx.currentTime + when;
    for (const [ratio, amp] of [[1, 1], [2, 0.25], [4.2, 0.08]]) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level * amp, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 1.5);
    }
  }

  function musicBox() {
    const beat = 0.34;
    let when = 0;
    for (const [semitone, beats] of LULLABY) {
      pluck(523.25 * 2 ** (semitone / 12), when);
      when += beat * beats;
    }
  }

  function iceCrack() {
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = 900 + i * 700;
      band.Q.value = 2;
      const g = ctx.createGain();
      const start = t + i * 0.07;
      g.gain.setValueAtTime(0.7, start);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      src.connect(band).connect(g).connect(master);
      src.start(start, Math.random(), 0.3);
    }
  }

  const SOUNDS = {
    clock: () => bell(392, { level: 0.12, decay: 2.5 }),
    glocke: () => {
      bell(1568, { level: 0.12, decay: 1.6 });
      bell(1568, { when: 0.35, level: 0.09, decay: 1.6 });
    },
    spieldose: musicBox,
    eis: iceCrack,
    pickup: () => {
      pluck(1318.5, 0, 0.08);
      pluck(1975.5, 0.09, 0.06);
    },
    festgelaeut: () => {
      for (let i = 0; i < 6; i++) {
        bell(i % 2 ? 261.63 : 196, { when: i * 0.9, level: 0.28, decay: 6 });
      }
    },
  };

  // ---------------------------------------------------------------- Öffentlich

  /** Stimmung für eine Station setzen. */
  function setAmbience(station) {
    const base = AMBIENCE[station.climate] ?? AMBIENCE.kalt;
    current = { ...base, hum: station.area === 'kirche' && station.climate === 'mild' ? 1 : 0 };
    if (station.ending) current = { wind: station.climate === 'eisig' ? 0.4 : 0.1, fire: 0, hum: 0 };
    applyAmbience();
  }

  function setTitleAmbience() {
    current = { wind: 0.18, fire: 0, hum: 0 };
    applyAmbience();
  }

  function play(id) {
    if (!enabled()) return;
    ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[id]?.();
  }

  /** Bei Nutzerinteraktion aufrufen: startet bzw. weckt den AudioContext. */
  function unlock() {
    if (!enabled()) return;
    ensureContext();
    if (ctx?.state === 'suspended') ctx.resume();
  }

  /** Nach Änderung der Einstellungen. */
  function update() {
    if (!enabled()) {
      if (ctx && ctx.state === 'running') ctx.suspend();
      return;
    }
    // Ohne aktuelle Nutzergeste (z. B. beim Laden) erst bei der ersten Interaktion starten.
    if (!ctx && navigator.userActivation && !navigator.userActivation.isActive) return;
    ensureContext();
    if (!ctx) return;
    master.gain.setTargetAtTime(getSettings().volume ?? 0.6, ctx.currentTime, 0.05);
    if (ctx.state === 'suspended') ctx.resume();
  }

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (enabled()) ctx.resume();
  });

  return { setAmbience, setTitleAmbience, play, unlock, update, get supported() { return Boolean(window.AudioContext || window.webkitAudioContext); } };
}
