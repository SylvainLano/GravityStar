// The skins of the game, in the order of the selector: each one changes the look of the game, never its physics.
// swatch: the two colors of its round button in the selector.
export const skins = [
  { id: 'realistic', name: 'Realistic', swatch: ['#05060a', '#f0a830'] },
];

const storageKey = 'gravity-star-skin';

function findSkin(id) {
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
