import * as THREE from 'three';

import { createSurfaceMaterial, createOutlineMaterial, createHaloMaterial } from './styleMaterials';
import { createNekoCharacterLook, createNekoStarLook, createNekoAsteroidLook } from './nekoNebula';

// Materials of the stylized looks (cel, pastel, watercolor, anime, arcade or neko), one function per kind of element.
// shared holds the uniforms shared by every stylized material (see createSharedUniforms).
// The neko style (Neko Nebula) draws the planets and the star as characters: their looks then only hold character,
// the materials of the character (see NekoNebulaCharacters.jsx).

// Color of each planet's atmosphere, for the rim light of the anime style
const rimColors = {
  mercury: '#c9c2b8', venus: '#ffd9a0', earth: '#5ab8ff', mars: '#ff9f80',
  jupiter: '#a8865a', saturn: '#e6d3a0', uranus: '#9ff0f0', neptune: '#7aa8ff',
};

// Ink lines, in screen pixels: brush-like for the comic book, thin and even for the anime, none for the other styles
function createStyleOutline(style, shared, thickness, lightVariation = true) {
  if (style === 'cel') return createOutlineMaterial({ shared, thickness, color: '#0a0820', lightVariation });
  if (style === 'anime') return createOutlineMaterial({ shared, thickness: thickness * 0.5, color: '#0b0f2a', lightVariation: false });
  return null;
}

// A planet named name (mercury... neptune), drawn with its photo texture map
export function createPlanetLook(style, { shared, map, name }) {
  // The stylized shaders read the texture as displayed colors
  map.colorSpace = THREE.SRGBColorSpace;
  if (style === 'neko') return { character: createNekoCharacterLook({ shared, map, name }) };
  return {
    material: createSurfaceMaterial(style, { map, shared, rimColor: rimColors[name] ?? '#ffffff' }),
    outline: createStyleOutline(style, shared, 2),
  };
}

// The star, lit by itself. halo is drawn on a square facing the camera, haloSize times the star's radius wide.
export function createSunLook(style, { shared, map }) {
  if (style === 'neko') return { character: createNekoStarLook({ shared }) };
  // A copy of the texture: the realistic star keeps the colors it always had, with a texture that isn't converted from sRGB
  const sunMap = map.clone();
  sunMap.colorSpace = THREE.SRGBColorSpace;
  return {
    material: createSurfaceMaterial(style, { map: sunMap, shared, emissive: true }),
    outline: createStyleOutline(style, shared, 2, false),
    halo: style === 'pastel' || style === 'anime' || style === 'watercolor' ? createHaloMaterial(style, { shared }) : null,
    haloSize: { anime: 10, watercolor: 4.5 }[style] ?? 5.7,
  };
}

// A copy of the asteroid model with the style's materials, each with its own texture, and their outlines
export function createAsteroidLook(style, { shared, scene }) {
  if (style === 'neko') return createNekoAsteroidLook({ shared, scene });
  const asteroid = scene.clone(true);
  const meshes = [];
  asteroid.traverse((object) => { if (object.isMesh) meshes.push(object); });
  for (const mesh of meshes) {
    mesh.material = createSurfaceMaterial(style, { map: mesh.material.map, shared });
    const outline = createStyleOutline(style, shared, 1.6);
    if (outline) mesh.add(new THREE.Mesh(mesh.geometry, outline));
  }
  return asteroid;
}
