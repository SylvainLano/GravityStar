// The achievements: nothing tells how to unlock them, the board only shows their silhouettes until then
// (icons with a shape of their own: emojis drawn as keys, like ⏩, give square silhouettes).
// Their text is only seen once they are unlocked. They are remembered by the browser, from one visit to the next.
export const achievements = [
  { id: 'yeet', icon: '☄️', name: 'Yeet', text: 'Your first rock is out there. No take-backs.' },
  { id: 'sun-snack', icon: '🔥', name: 'Sun Snack', text: 'The star ate your asteroid. It says thanks.' },
  { id: 'fender-bender', icon: '💥', name: 'Fender Bender', text: 'Two rocks, one fate. Swap insurance details.' },
  { id: 'bullseye', icon: '🎯', name: 'Bullseye', text: 'Planets: 0. You: 1.' },
  { id: 'houston', icon: '🌍', name: 'Houston, We Have a Problem', text: 'You hit the Earth. Somewhere, an insurer is crying.' },
  { id: 'nosy', icon: '🔍', name: 'Nosy Neighbor', text: "Reading a planet's private files. Classy." },
  { id: 'music', icon: '🎵', name: 'Music of the Spheres', text: 'The planets were humming all along.' },
  { id: 'fashion', icon: '👗', name: 'Fashion Victim', text: 'Seven outfits. Same old Solar System.' },
  { id: 'birds-eye', icon: '🦅', name: "Bird's-Eye View", text: 'Orbits look so much tidier from up here.' },
  { id: 'reroll', icon: '🎲', name: 'Reroll', text: "If at first you don't succeed, reroll the universe." },
  { id: 'fast-forward', icon: '⌛', name: 'Fast Forward', text: 'Years fly by. Literally.' },
  { id: 'sunburn', icon: '☀️', name: 'Sunburn', text: 'A planet got too close to the star. They never listen.' },
  { id: 'bon-voyage', icon: '🧳', name: 'Bon Voyage', text: 'A planet packed its bags and left. Pluto sends its regards.' },
  { id: 'ghost', icon: '👻', name: 'Now You See Me', text: 'Where did all the buttons go? Oh, H.' },
  { id: 'bumper-cars', icon: '🎳', name: 'Bumper Cars', text: 'Two planets collided. Premiums just went up.' },
  { id: 'wrong-way', icon: '🌀', name: 'Wrong Way', text: "A planet turns the wrong way round. It's not lost, it's creative." },
  { id: 'completionist', icon: '🏆', name: 'Completionist', text: 'Every planet has been hit at least once. Eight bruises.' },
  { id: 'empty-nest', icon: '🏚️', name: 'Empty Nest', text: 'No planet left. Peace and quiet at last.' },
  { id: 'sorry-newton', icon: '🙃', name: 'Sorry, Newton', text: 'An asteroid that falls upwards. Gravity is more of a suggestion.' },
  { id: 'zen', icon: '🧘', name: 'Zen', text: 'Ten minutes of the game without throwing a thing. Who are you?' },
];

const unlockedKey = 'gravity-star-achievements';

// Storage that may be unavailable (private browsing...): then everything only lasts until the page is closed
function load(key) {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(key)) ?? []);
  } catch {
    return new Set();
  }
}
function save(key, set) {
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Storage unavailable
  }
}

const unlocked = load(unlockedKey);
const listeners = new Set();

export const getUnlocked = () => new Set(unlocked);

// Unlocks an achievement, once: the listeners (the interface) are told
export function unlock(id) {
  if (unlocked.has(id)) return;
  const achievement = achievements.find((entry) => entry.id === id);
  if (!achievement) return;
  unlocked.add(id);
  save(unlockedKey, unlocked);
  for (const listener of listeners) listener(achievement);
}

// Calls listener(achievement) on each new achievement; returns the function that stops it
export function onUnlock(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Collections remembered across visits (the skins worn, the planets hit): the achievement comes once one is complete
const collections = new Map();
export function collect(collection, item, size, id) {
  const key = `gravity-star-${collection}`;
  if (!collections.has(key)) collections.set(key, load(key));
  const items = collections.get(key);
  if (!items.has(item)) {
    items.add(item);
    save(key, items);
  }
  if (items.size >= size) unlock(id);
}
