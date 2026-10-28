// The skins of the game, in the order of the selector: each one changes the look of the game, never its physics.
// swatch: the two colors of its round button in the selector.
// The stylized skins also have:
//   style: the materials used for the planets, the star and the asteroids (see looks.js)
//   stars: the background stars (see BackgroundStars.jsx)
//   pixelSize: rendered with big pixels, each pixelSize pixels of the screen wide
//   arrow, debris, sunParticles: colors of the launching arrow, of the explosion debris and of the particles around the star
//     (debris and sunParticles are picked at random between their two colors)
// Their background is drawn by CSS behind the canvas, in styles.css.
export const skins = [
  { id: 'realistic', name: 'Realistic', swatch: ['#05060a', '#f0a830'] },
  {
    id: 'comic',
    name: 'Comic',
    style: 'cel',
    swatch: ['#252c70', '#ffcf3f'],
    stars: { color: '#ffe9a8', size: 2, round: true, opacity: 0.9 },
    arrow: '#ff4b3e',
    debris: ['#ff7a2e', '#ffd23f'],
    sunParticles: ['#ff8c1a', '#ffe14d'],
  },
  {
    id: 'pastel',
    name: 'Pastel',
    style: 'pastel',
    swatch: ['#efe6d3', '#8f9ad6'],
    stars: { color: '#3e4470', size: 3, round: true, opacity: 0.45 },
    arrow: '#c4574f',
    debris: ['#7c7396', '#c39b7a'],
    sunParticles: ['#f0a35e', '#f6d38c'],
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
