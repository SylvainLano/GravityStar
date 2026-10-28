// The sounds of the game, made by the browser (Web Audio) rather than read from files.
// Nothing can be heard in space: the realistic skin turns the motion into music instead (a "music of the spheres").
// Each planet holds a note, louder when it comes closer to the camera, and rings it when it passes in front of the star;
// a moving asteroid whistles higher as it goes faster; an impact makes the system rumble.
// The stylized skins, which make no claim to realism, have sound effects in their own style (see sound in skins.js).
// The sound is off when the game starts: it only starts with a click or a key, as browsers require.

const volumeKey = 'gravity-star-volume';
// Volume when the sound is switched on for the first time, or after being cut by sliding the volume down to 0
export const defaultVolume = 0.7;

// Notes of the planets: the ratios of their orbital frequencies, softened (square root) and rounded to the nearest note
// of a pentatonic scale, so that they always sound well together: from G5 for Mercury down to D3 for Neptune
export const planetNotes = {
  mercury: 783.99, venus: 587.33, earth: 523.25, mars: 440, jupiter: 293.66, saturn: 220, uranus: 196, neptune: 146.83,
};

let context = null;
let master = null;
let soundOn = false;
let volume = loadVolume();
let style = 'spheres';
let paused = false;
const planetVoices = new Map(); // Planet name: its held note
const whistles = new Map(); // Asteroid index: its whistle
const noiseBuffers = new WeakMap();

function loadVolume() {
  try {
    const stored = parseFloat(window.localStorage.getItem(volumeKey));
    return Number.isFinite(stored) && stored > 0 ? stored : defaultVolume;
  } catch {
    return defaultVolume; // Storage unavailable
  }
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// The listener, at the camera turning around the star (at the origin): its right, and the direction towards it
// (see setListener; these are only used before the first frame)
const listener = { right: { x: 1, y: 0, z: 0 }, front: { x: 0, y: 0, z: 1 } };
const along = (position, direction) => position.x * direction.x + position.y * direction.y + position.z * direction.z;

// Follows the camera on each frame (see SoundBridge)
export function setListener(camera) {
  const e = camera.matrixWorld.elements;
  listener.right = { x: e[0], y: e[1], z: e[2] };
  const length = camera.position.length() || 1;
  listener.front = { x: camera.position.x / length, y: camera.position.y / length, z: camera.position.z / length };
}

// Where a sound comes from, from -1 (left) to 1 (right), by its place in the scene as the camera sees it
export const panOf = (position) => clamp(along(position, listener.right) / 10, -1, 1);

// ----- Instruments, each playing into out (any audio node) at the time start -----

function playTone(c, out, { type = 'sine', frequency, to, start, duration, attack = 0.005, gain = 0.3, pan = 0 }) {
  const oscillator = c.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
  const amplitude = c.createGain();
  amplitude.gain.setValueAtTime(0.0001, start);
  amplitude.gain.exponentialRampToValueAtTime(gain, start + attack);
  amplitude.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  const panner = c.createStereoPanner();
  panner.pan.value = pan;
  oscillator.connect(amplitude).connect(panner).connect(out);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function noiseOf(c) {
  if (!noiseBuffers.has(c)) {
    const buffer = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    noiseBuffers.set(c, buffer);
  }
  return noiseBuffers.get(c);
}

function playNoise(c, out, { filter = 'lowpass', frequency = 1000, to, q = 1, start, duration, attack = 0.005, gain = 0.3, pan = 0 }) {
  const source = c.createBufferSource();
  source.buffer = noiseOf(c);
  source.loop = true;
  const biquad = c.createBiquadFilter();
  biquad.type = filter;
  biquad.Q.value = q;
  biquad.frequency.setValueAtTime(frequency, start);
  if (to) biquad.frequency.exponentialRampToValueAtTime(to, start + duration);
  const amplitude = c.createGain();
  amplitude.gain.setValueAtTime(0.0001, start);
  amplitude.gain.exponentialRampToValueAtTime(gain, start + attack);
  amplitude.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  const panner = c.createStereoPanner();
  panner.pan.value = pan;
  source.connect(biquad).connect(amplitude).connect(panner).connect(out);
  source.start(start);
  source.stop(start + duration + 0.05);
}

// A bell: partials out of tune with each other, the high ones dying first
function playBell(c, out, { frequency, start, duration, gain, pan = 0 }) {
  [[1, 1], [2.76, 0.45], [5.4, 0.2], [8.93, 0.1]].forEach(([ratio, level], i) => {
    playTone(c, out, { frequency: frequency * ratio, start, duration: duration / (1 + i), attack: 0.003, gain: gain * level, pan });
  });
}

// A marimba: a round note and its fourth harmonic, short-lived
function playMarimba(c, out, { frequency, start, duration = 0.9, gain, pan = 0 }) {
  playTone(c, out, { frequency, start, duration, attack: 0.004, gain, pan });
  playTone(c, out, { frequency: frequency * 4, start, duration: duration * 0.18, attack: 0.002, gain: gain * 0.35, pan });
}

// Notes one after the other, every step seconds
function playArpeggio(c, out, { frequencies, step, type, start, gain, pan = 0 }) {
  frequencies.forEach((frequency, i) => playTone(c, out, { type, frequency, start: start + i * step, duration: step * 1.6, gain, pan }));
}

// ----- What each style plays for each event -----
// launch: an asteroid is thrown; impact: it hits a planet; crash: two asteroids collide; star: something falls into the star;
// pass (realistic only): a planet passes in front of the star.
// strength goes from 0 to 1, pan from -1 to 1, note is the planet's note.

export const effects = {
  spheres: {
    launch: (c, out, t, { strength, pan }) => playTone(c, out, { frequency: 220, to: 330 + 220 * strength, start: t, duration: 0.6, attack: 0.1, gain: 0.07, pan }),
    impact: (c, out, t, { strength, pan, note = 220 }) => {
      playTone(c, out, { frequency: note / 2, start: t, duration: 2.8, attack: 0.03, gain: 0.3 * strength, pan });
      playNoise(c, out, { filter: 'lowpass', frequency: 150, start: t, duration: 1.6, attack: 0.03, gain: 0.35 * strength, pan });
    },
    crash: (c, out, t, { pan }) => {
      playTone(c, out, { frequency: 1318.5, start: t, duration: 0.25, gain: 0.05, pan });
      playTone(c, out, { frequency: 1760, start: t + 0.08, duration: 0.25, gain: 0.04, pan });
    },
    star: (c, out, t, { strength, pan }) => {
      playBell(c, out, { frequency: 1568, start: t, duration: 2.5, gain: 0.05 + 0.08 * strength, pan });
      playTone(c, out, { frequency: 1568, to: 196, start: t, duration: 2.2, attack: 0.05, gain: 0.03, pan });
    },
    pass: (c, out, t, { note, pan, gain }) => playBell(c, out, { frequency: note, start: t, duration: 3.5, gain: 0.1 * gain, pan }),
  },

  // Comic book: a whoosh, a BOOM with punch, a crack, a sizzle
  comic: {
    launch: (c, out, t, { strength, pan }) => playNoise(c, out, { filter: 'bandpass', frequency: 400, to: 2200, q: 2, start: t, duration: 0.35, attack: 0.05, gain: 0.25 + 0.2 * strength, pan }),
    impact: (c, out, t, { strength, pan }) => {
      playTone(c, out, { frequency: 150, to: 40, start: t, duration: 0.6, gain: 0.6 * strength, pan });
      playNoise(c, out, { filter: 'lowpass', frequency: 1200, to: 150, start: t, duration: 0.5, gain: 0.45 * strength, pan });
    },
    crash: (c, out, t, { pan }) => {
      playNoise(c, out, { filter: 'highpass', frequency: 1500, start: t, duration: 0.15, gain: 0.35, pan });
      playTone(c, out, { type: 'square', frequency: 300, to: 120, start: t, duration: 0.1, gain: 0.12, pan });
    },
    star: (c, out, t, { strength, pan }) => {
      playNoise(c, out, { filter: 'highpass', frequency: 2500, start: t, duration: 1.2, attack: 0.02, gain: 0.2 + 0.15 * strength, pan });
      playTone(c, out, { frequency: 1500, to: 200, start: t, duration: 0.8, gain: 0.08, pan });
    },
  },

  // Arcade: the square waves and noise of 8-bit consoles
  chip: {
    launch: (c, out, t, { pan }) => playArpeggio(c, out, { frequencies: [523.25, 659.25, 783.99, 1046.5], step: 0.04, type: 'square', start: t, gain: 0.08, pan }),
    impact: (c, out, t, { strength, pan }) => {
      playNoise(c, out, { filter: 'lowpass', frequency: 4000, to: 200, q: 0.5, start: t, duration: 0.55, gain: 0.4 * strength, pan });
      playTone(c, out, { type: 'square', frequency: 110, to: 55, start: t, duration: 0.3, gain: 0.12 * strength, pan });
    },
    crash: (c, out, t, { pan }) => playArpeggio(c, out, { frequencies: [880, 659.25], step: 0.05, type: 'square', start: t, gain: 0.08, pan }),
    star: (c, out, t, { pan }) => playTone(c, out, { type: 'square', frequency: 1200, to: 100, start: t, duration: 0.6, gain: 0.08, pan }),
  },

  // Neko Nebula: the same consoles, cuter: a pew, a boing, a pop, a little mew
  neko: {
    launch: (c, out, t, { pan }) => playTone(c, out, { type: 'square', frequency: 1800, to: 600, start: t, duration: 0.15, gain: 0.07, pan }),
    impact: (c, out, t, { strength, pan }) => {
      playTone(c, out, { frequency: 180, to: 520, start: t, duration: 0.18, gain: 0.35 * strength, pan });
      playTone(c, out, { frequency: 520, to: 260, start: t + 0.18, duration: 0.35, gain: 0.3 * strength, pan });
      playNoise(c, out, { filter: 'lowpass', frequency: 2500, to: 300, start: t, duration: 0.3, gain: 0.2 * strength, pan });
    },
    crash: (c, out, t, { pan }) => playTone(c, out, { frequency: 900, to: 1700, start: t, duration: 0.09, gain: 0.12, pan }),
    star: (c, out, t, { pan }) => {
      // A short "mew": a sawtooth sliding down through a vowel-like filter
      const tone = c.createGain();
      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(700, t + 0.45);
      filter.Q.value = 3;
      tone.connect(filter).connect(out);
      playTone(c, tone, { type: 'sawtooth', frequency: 700, to: 420, start: t, duration: 0.45, attack: 0.04, gain: 0.25, pan });
    },
  },

  // Anime: a sharp whistle, a crystal-clear hit, a "shing", a shimmer
  anime: {
    launch: (c, out, t, { strength, pan }) => playTone(c, out, { frequency: 600, to: 1800 + 1200 * strength, start: t, duration: 0.3, attack: 0.03, gain: 0.07, pan }),
    impact: (c, out, t, { strength, pan }) => {
      playBell(c, out, { frequency: 1046.5, start: t, duration: 1.4, gain: 0.25 * strength, pan });
      playNoise(c, out, { filter: 'highpass', frequency: 3000, start: t, duration: 0.25, gain: 0.25 * strength, pan });
      playTone(c, out, { frequency: 90, to: 45, start: t, duration: 0.5, gain: 0.35 * strength, pan });
    },
    crash: (c, out, t, { pan }) => playNoise(c, out, { filter: 'bandpass', frequency: 5000, q: 4, start: t, duration: 0.35, gain: 0.3, pan }),
    star: (c, out, t, { pan }) => playArpeggio(c, out, { frequencies: [1318.5, 1568, 2093, 2637], step: 0.06, type: 'sine', start: t, gain: 0.06, pan }),
  },

  // Pastel and watercolor: soft wooden notes
  soft: {
    launch: (c, out, t, { pan }) => playMarimba(c, out, { frequency: 659.25, start: t, gain: 0.15, pan }),
    impact: (c, out, t, { strength, pan }) => {
      playMarimba(c, out, { frequency: 110, start: t, duration: 1.4, gain: 0.45 * strength, pan });
      playNoise(c, out, { filter: 'lowpass', frequency: 400, start: t, duration: 0.6, gain: 0.15 * strength, pan });
    },
    crash: (c, out, t, { pan }) => {
      playMarimba(c, out, { frequency: 880, start: t, gain: 0.12, pan });
      playMarimba(c, out, { frequency: 659.25, start: t + 0.09, gain: 0.1, pan });
    },
    star: (c, out, t, { pan }) => [783.99, 659.25, 523.25, 392].forEach((frequency, i) => playMarimba(c, out, { frequency, start: t + i * 0.12, gain: 0.12, pan })),
  },
};

// ----- Controls -----

export function isSoundOn() {
  return soundOn;
}

// Switches the sound on or off: to be called from a click or a key, the only moments browsers let it start
export function setSoundOn(on) {
  soundOn = on;
  if (on && !context) {
    context = new AudioContext();
    // A compressor keeps loud moments (many impacts at once) from distorting
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.ratio.value = 6;
    master = context.createGain();
    master.gain.value = volume;
    master.connect(compressor).connect(context.destination);
  }
  if (!context) return;
  if (on) {
    context.resume();
  } else {
    stopHeldSounds();
    context.suspend();
  }
}

export function getVolume() {
  return volume;
}

// Volume when the sound is on, above 0 and up to 1 (the sound is cut with setSoundOn), remembered for the next visits
export function setVolume(value) {
  volume = value;
  try {
    window.localStorage.setItem(volumeKey, String(value));
  } catch {
    // Storage unavailable: the volume only lasts until the page is closed
  }
  if (master) master.gain.setTargetAtTime(value, context.currentTime, 0.05);
}

// The sound style of the current skin (see sound in skins.js)
export function setSoundStyle(value) {
  if (value !== style) stopHeldSounds();
  style = value;
}

// The held sounds (notes of the planets, whistles) fade out during a pause
export function setSoundPaused(value) {
  paused = value;
}

const playing = () => soundOn && context && context.state === 'running';

// Plays an event of the game (see effects) in the style of the current skin
export function playSound(event, { strength = 1, pan = 0, note } = {}) {
  if (!playing()) return;
  effects[style]?.[event]?.(context, master, context.currentTime, { strength: clamp(strength, 0.2, 1), pan, note });
}

function stopHeldSounds() {
  for (const voices of [planetVoices, whistles]) {
    for (const voice of voices.values()) voice.oscillator.stop();
    voices.clear();
  }
}

// A held note, its loudness and place changed smoothly
function heldVoice(frequency) {
  const oscillator = context.createOscillator();
  oscillator.frequency.value = frequency;
  const gain = context.createGain();
  gain.gain.value = 0;
  const panner = context.createStereoPanner();
  oscillator.connect(gain).connect(panner).connect(master);
  oscillator.start();
  return { oscillator, gain, panner };
}

// Brings the held sounds of a group (planets or asteroids) up to date: wanted maps each one's key to its
// frequency, loudness and pan, and the ones no longer wanted fade out and stop
function updateHeld(voices, wanted) {
  const now = context.currentTime;
  for (const [key, { frequency, gain, pan }] of wanted) {
    if (!voices.has(key)) voices.set(key, heldVoice(frequency));
    const voice = voices.get(key);
    voice.oscillator.frequency.setTargetAtTime(frequency, now, 0.1);
    voice.gain.gain.setTargetAtTime(gain, now, 0.25);
    voice.panner.pan.setTargetAtTime(pan, now, 0.1);
  }
  for (const [key, voice] of voices) {
    if (wanted.has(key)) continue;
    voice.gain.gain.setTargetAtTime(0, now, 0.2);
    voice.oscillator.stop(now + 1);
    voices.delete(key);
  }
}

const lastX = new Map(); // Planet name: where it was from left to right, to hear it pass in front of the star

// The music of the spheres, on each frame: the planets (as in the game's state), the asteroids, and the camera's position
export function updateSpheres(planets, asteroids, cameraPosition) {
  if (!playing() || style !== 'spheres') return;
  const wantedPlanets = new Map();
  const wantedWhistles = new Map();
  if (!paused) {
    for (const planet of planets) {
      const note = planetNotes[planet.name];
      if (!note) continue;
      // From left to right, and towards the camera, as the camera sees it
      const x = along(planet.position, listener.right);
      const z = along(planet.position, listener.front);
      // Louder when it comes closer to the camera
      const closeness = clamp(6 / planet.position.distanceTo(cameraPosition), 0, 1);
      wantedPlanets.set(planet.name, { frequency: note, gain: 0.008 + 0.022 * closeness, pan: panOf(planet.position) });
      // It passes in front of the star, between the star and the camera: it rings its note
      const before = lastX.get(planet.name);
      if (z > 0 && before !== undefined && Math.sign(x) !== Math.sign(before)) {
        effects.spheres.pass(context, master, context.currentTime, { note, pan: panOf(planet.position), gain: 0.4 + 0.6 * closeness });
      }
      lastX.set(planet.name, x);
    }
    // Each moving asteroid whistles, an octave higher for every 0.008 of speed
    for (const asteroid of asteroids) {
      if (!asteroid.moving) continue;
      const frequency = clamp(196 * 2 ** (asteroid.velocity.length() / 0.008), 196, 1760);
      wantedWhistles.set(asteroid.index, { frequency, gain: 0.02, pan: panOf(asteroid.position) });
    }
  }
  updateHeld(planetVoices, wantedPlanets);
  updateHeld(whistles, wantedWhistles);
}
