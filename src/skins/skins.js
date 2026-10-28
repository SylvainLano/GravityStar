// The skins of the game, in the order of the selector: each one changes the look of the game, never its physics.
// swatch: the two colors of its round button in the selector.
// The stylized skins also have:
//   style: the materials used for the planets, the star and the asteroids (see looks.js)
//   stars: the background stars (see BackgroundStars.jsx)
//   pixelSize: rendered with big pixels, each pixelSize pixels of the screen wide
//   arrow, debris, sunParticles: colors of the launching arrow, of the explosion debris and of the particles around the star
//     (debris and sunParticles are picked at random between their two colors)
// Their background is drawn by CSS behind the canvas, in styles.css.
// Every skin has a trail: how the trails of the bodies are drawn (see Trail.jsx), with the color of the asteroids' trails
// (the planets' trails take the color of each planet) and, for the candy style, the colors of its dots.
export const skins = [
  {
    id: 'realistic',
    name: 'Realistic',
    swatch: ['#05060a', '#f0a830'],
    trail: { style: 'glow', width: 3, color: '#ffb070' },
  },
  {
    // A homage to the Parodius series of Konami, with original characters (see nekoNebula.js)
    id: 'neko-nebula',
    name: 'Neko Nebula',
    style: 'neko',
    swatch: ['#120a3a', '#ff7ad9'],
    stars: { colors: ['#ffffff', '#ff7ad9', '#7ae8ff', '#ffe066'], size: 1.5, round: false, opacity: 1, stepped: true },
    pixelSize: 1.5,
    arrow: '#ff5fa2',
    debris: ['#ff7ad9', '#ffe066'],
    sunParticles: ['#ffd23f', '#ff9a3c'],
    trail: { style: 'candy', width: 5, color: '#ff7ad9', colors: ['#ff7ad9', '#ffe066', '#7ae8ff', '#ffffff'] },
  },
  {
    id: 'anime',
    name: 'Anime',
    style: 'anime',
    swatch: ['#050a1f', '#ff8a4c'],
    stars: { color: '#ffffff', size: 2, round: true, opacity: 0.9 },
    arrow: '#ff5f6d',
    debris: ['#ff7b3a', '#ffe0a0'],
    sunParticles: ['#ffb347', '#fff1c4'],
    trail: { style: 'glow', width: 3, color: '#ffd9a0' },
  },
  {
    id: 'comic',
    name: 'Comic',
    style: 'cel',
    swatch: ['#252c70', '#ffcf3f'],
    stars: { color: '#ffe9a8', size: 2, round: true, opacity: 0.9 },
    arrow: '#ff4b3e',
    debris: ['#ff7a2e', '#ffd23f'],
    sunParticles: ['#ff8c1a', '#ffe14d'],
    trail: { style: 'ink', width: 5, color: '#ffd23f' },
  },
  {
    id: 'arcade',
    name: 'Arcade',
    style: 'arcade',
    swatch: ['#000000', '#ff3fa4'],
    stars: { color: '#ffffff', size: 1, round: false, opacity: 1, stepped: true },
    pixelSize: 1.5,
    arrow: '#ff3333',
    debris: ['#ff6600', '#ffcc00'],
    sunParticles: ['#ff6600', '#ffff33'],
    trail: { style: 'pixels', width: 3, color: '#ffff33' },
  },
  {
    id: 'pastel',
    name: 'Pastel',
    style: 'pastel',
    swatch: ['#7d889b', '#f6d38c'],
    stars: { color: '#f4efe6', size: 2.5, round: true, opacity: 0.55 },
    arrow: '#e8735a',
    debris: ['#f2c4a0', '#c9d2f0'],
    sunParticles: ['#f6c27a', '#fbe3a6'],
    trail: { style: 'chalk', width: 4, color: '#f4efe6' },
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    style: 'watercolor',
    swatch: ['#f8f5ee', '#4a6fa5'],
    stars: { color: '#4a5a8a', size: 2.5, round: true, opacity: 0.35 },
    arrow: '#c4574f',
    debris: ['#7c7396', '#c39b7a'],
    sunParticles: ['#f0a35e', '#f6d38c'],
    trail: { style: 'wash', width: 8, color: '#4a6fa5' },
  },
];

const storageKey = 'gravity-star-skin';

export function findSkin(id) {
  return skins.find((skin) => skin.id === id);
}

// The skin to start with: the one in the link (?skin=...), else the last one chosen, else the first one
export function initialSkinId() {
  const fromLink = new URLSearchParams(window.location.search).get('skin');
  if (findSkin(fromLink)) return fromLink;
  try {
    const remembered = window.localStorage.getItem(storageKey);
    if (findSkin(remembered)) return remembered;
  } catch {
    // Storage unavailable (private browsing, blocked site data): start with the first skin
  }
  return skins[0].id;
}

// Remember the chosen skin for the next visits, and show it in the link so that it can be shared
export function rememberSkin(id) {
  try {
    window.localStorage.setItem(storageKey, id);
  } catch {
    // Storage unavailable: the choice only lasts until the page is closed
  }
  const url = new URL(window.location.href);
  if (id === skins[0].id) url.searchParams.delete('skin');
  else url.searchParams.set('skin', id);
  window.history.replaceState(null, '', url);
}
