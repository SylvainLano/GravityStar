import * as THREE from 'three';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import { helpers, surfaceVertexShader, rgb, createOutlineMaterial } from './styleMaterials';

// Neko Nebula, a homage to the Parodius series of Konami: flat vivid colors drawn from the real textures,
// sprite lighting with dithered tones, and the planets drawn as characters (an onigiri, a diva, a diver, an octopus,
// a tabby cat, a planet in a straw hat, a sleeper and a pufferfish) around a puffy five-point star wearing sunglasses.
// The designs are original: none of them is taken from the games.

// For each body, pairs of [real color as displayed, flat vivid color replacing it]
export const nekoPalettes = {
  mercury: [['#9a9a9a', '#b8b8d0'], ['#6a6a6a', '#8484a4'], ['#cfcfcf', '#e4e4f4'], ['#3c3c3c', '#5c5c80']],
  venus: [['#e6cc8c', '#ffe08a'], ['#c8a060', '#f5b752'], ['#f4e6c0', '#fff4cc']],
  earth: [['#0a1e50', '#1f4fd1'], ['#1c4a78', '#3a8fe8'], ['#3c5028', '#2fae4a'], ['#8c7850', '#e8c060'], ['#e6e6e6', '#ffffff']],
  mars: [['#b4643c', '#f06a3a'], ['#82462c', '#c0442a'], ['#d29a78', '#ffa070'], ['#50301e', '#8a2c1e']],
  // Jupiter's bands become the fur of an orange tabby cat
  jupiter: [['#f0ebe0', '#fff1d6'], ['#d2b896', '#ffc46b'], ['#ad8462', '#f08a2c'], ['#805c46', '#b5561c']],
  saturn: [['#dcc89a', '#ffe2a0'], ['#bea270', '#f0c070'], ['#9a7e56', '#c8955a']],
  uranus: [['#9fd8de', '#7fe3e8'], ['#7ab8c4', '#4fc3cf'], ['#c8eef0', '#c2f7f7']],
  neptune: [['#3c5cc8', '#3a63e0'], ['#25388c', '#2541a8'], ['#6a8ae0', '#6f9bff'], ['#c4d0f0', '#d6e4ff']],
  asteroid: [['#8a7a6a', '#a08c7c'], ['#5a4c42', '#7a665a'], ['#322a24', '#4e3e36'], ['#b4a696', '#c8b4a0']],
};

// The dark line around the sprites, rather than pure black
export const nekoInk = '#2a0f3a';

const nekoFragmentShader = /* glsl */ `
  uniform sampler2D map;
  uniform float hasMap;
  uniform vec3 baseColor;
  uniform vec3 matchColors[6];
  uniform vec3 outputColors[6];
  uniform int paletteSize;
  uniform sampler2D faceMap;
  uniform float hasFace;
  uniform float faceOnly;
  uniform vec4 faceRect; // Center and half size of the face, in the surface's UV coordinates
  uniform float selfLit;
  uniform float unlit;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vec3 color = baseColor;

    // Flat vivid colors: each pixel of the real texture takes the vivid color paired with the nearest real color
    if (hasMap > 0.5) {
      vec3 source = toSrgb(texture2D(map, vUv, 1.5).rgb);
      float nearest = 1e9;
      for (int i = 0; i < 6; i++) {
        if (i >= paletteSize) break;
        float d = distance(source, matchColors[i]);
        if (d < nearest) {
          nearest = d;
          color = outputColors[i];
        }
      }
    }

    // Face drawn over the front, in pixel art
    if (hasFace > 0.5) {
      vec2 faceUv = (vUv - faceRect.xy) / (2.0 * faceRect.zw) + 0.5;
      vec4 face = vec4(0.0);
      if (faceUv.x >= 0.0 && faceUv.x <= 1.0 && faceUv.y >= 0.0 && faceUv.y <= 1.0) face = texture2D(faceMap, faceUv);
      if (face.a > 0.5) color = face.rgb;
      else if (faceOnly > 0.5) discard;
    }

    if (unlit > 0.5) {
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    // Sprite lighting: always from the upper left of the screen as in the games of the time, rather than from the star,
    // so that the characters stay readable. Four tones, dithered into each other, shadows leaning towards violet.
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize((vec4(normalize(vec3(-0.65, 0.7, 0.45)), 0.0) * viewMatrix).xyz);
    vec3 V = normalize(cameraPosition - vWorldPosition);
    float light = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
    float tone = floor(light * 3.0 + bayer4(gl_FragCoord.xy) * 0.999);
    if (selfLit > 0.5) tone = max(tone, 1.0);

    vec3 darkest = color * vec3(0.42, 0.36, 0.62);
    vec3 shaded = tone < 0.5 ? darkest
                : tone < 1.5 ? color * vec3(0.7, 0.64, 0.86)
                : tone < 2.5 ? color
                : mix(color, vec3(1.0, 0.98, 0.88), 0.4);

    // A small white glint
    if (dot(N, normalize(L + V)) > 0.9975) shaded = vec3(1.0);

    // With the star switched off, everything takes its darkest tone, and the star itself goes dark
    gl_FragColor = vec4(byStarLight(selfLit > 0.5 ? vec3(0.0) : darkest, shaded), 1.0);
  }
`;

// faceRect: center and half size of the face in the surface's UV coordinates. By default, a wide face on the front of a sphere
// (about 115 degrees across), so that it stays readable when the planet is small.
export function createNekoMaterial({ shared, map = null, palette = null, color = '#ffffff', faceMap = null, faceRect = [0.25, 0.5, 0.16, 0.3], faceOnly = false, selfLit = false, unlit = false }) {
  const pairs = palette ?? [];
  const padded = (index) => Array.from({ length: 6 }, (_, i) => rgb(pairs[Math.min(i, pairs.length - 1)]?.[index] ?? '#000000'));
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: map },
      hasMap: { value: map ? 1 : 0 },
      baseColor: { value: rgb(color) },
      matchColors: { value: padded(0) },
      outputColors: { value: padded(1) },
      paletteSize: { value: pairs.length },
      faceMap: { value: faceMap },
      hasFace: { value: faceMap ? 1 : 0 },
      faceOnly: { value: faceOnly ? 1 : 0 },
      faceRect: { value: new THREE.Vector4(...faceRect) },
      selfLit: { value: selfLit ? 1 : 0 },
      unlit: { value: unlit ? 1 : 0 },
      lightPosition: shared.lightPosition,
      starLight: shared.starLight,
      pixelRatio: shared.pixelRatio,
    },
    vertexShader: surfaceVertexShader,
    fragmentShader: helpers + nekoFragmentShader,
    transparent: faceOnly,
  });
}

// Puffy five-point star: an extruded star with wide rounded bevels, smoothed so that its outline holds together
export function createStarGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 1 : 0.5;
    const angle = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  shape.closePath();

  let geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.16, bevelSegments: 5 });
  geometry.center();
  geometry.deleteAttribute('uv');
  geometry.deleteAttribute('normal');
  geometry = mergeVertices(geometry);
  geometry.computeVertexNormals();
  geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2));
  return geometry;
}

// Cat ear: a three-sided cone standing on its base, with one face turned to the front
export function createEarGeometry(radius, height) {
  const geometry = new THREE.ConeGeometry(radius, height, 3, 1, false, Math.PI / 3);
  geometry.translate(0, height / 2, 0);
  return geometry;
}

// Tube along a curve through points, its radius going from startRadius to endRadius
function createTaperedTubeGeometry(points, startRadius, endRadius, tubularSegments = 32, radialSegments = 10) {
  const path = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(path, tubularSegments, 1, radialSegments, false);

  // The tube is built with a radius of 1: bring each ring closer to the path, to the radius it should have
  const position = geometry.attributes.position;
  const point = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    path.getPointAt(t, point);
    const radius = startRadius + (endRadius - startRadius) * t;
    for (let j = 0; j <= radialSegments; j++) {
      const index = i * (radialSegments + 1) + j;
      vertex.fromBufferAttribute(position, index).sub(point).multiplyScalar(radius).add(point);
      position.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
  }
  position.needsUpdate = true;
  return geometry;
}

// Octopus tentacle hanging from the underside of a sphere of radius 1, along +X:
// it tapers from the head to its tip, which curls up
export function createTentacleGeometry() {
  return createTaperedTubeGeometry([
    new THREE.Vector3(0.4, -0.8, 0),
    new THREE.Vector3(0.8, -1.2, 0),
    new THREE.Vector3(1.05, -1.55, 0),
    new THREE.Vector3(1.32, -1.62, 0),
    new THREE.Vector3(1.42, -1.42, 0),
  ], 0.18, 0.04);
}

// Nightcap on top of a head of radius 1: wide at the base, then pointing up and drooping to the side
export const nightcapTip = new THREE.Vector3(1.0, 1.35, 0);
export function createNightcapGeometry() {
  return createTaperedTubeGeometry([
    new THREE.Vector3(0, 0.62, 0),
    new THREE.Vector3(0, 1.1, 0),
    new THREE.Vector3(0.2, 1.5, 0),
    new THREE.Vector3(0.62, 1.62, 0),
    nightcapTip,
  ], 0.8, 0.08, 40, 16);
}

// Pufferfish spines spread evenly over a sphere of radius 1, leaving the face (towards +Z) clear
export function createSpikesGeometry() {
  const up = new THREE.Vector3(0, 1, 0);
  const spikes = [];
  const count = 80;
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const ring = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    const direction = new THREE.Vector3(Math.cos(angle) * ring, y, Math.sin(angle) * ring);
    if (direction.z > 0.5) continue;
    const spike = new THREE.ConeGeometry(0.075, 0.3, 6);
    spike.translate(0, 0.94 + 0.15, 0);
    spike.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, direction));
    spikes.push(spike);
  }
  return mergeGeometries(spikes);
}

// Onigiri (rice ball): a puffy rounded triangle, its texture projected from the front on both sides
export function createOnigiriGeometry() {
  const corners = [0, 1, 2].map((i) => {
    const angle = Math.PI / 2 + (i * Math.PI * 2) / 3;
    return new THREE.Vector2(Math.cos(angle) * 1.05, Math.sin(angle) * 1.05 - 0.1);
  });
  const shape = new THREE.Shape();
  corners.forEach((corner, i) => {
    const before = corner.clone().lerp(corners[(i + 2) % 3], 0.35);
    const after = corner.clone().lerp(corners[(i + 1) % 3], 0.35);
    if (i === 0) shape.moveTo(before.x, before.y);
    else shape.lineTo(before.x, before.y);
    shape.quadraticCurveTo(corner.x, corner.y, after.x, after.y);
  });
  shape.closePath();

  let geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.28, bevelSize: 0.18, bevelSegments: 6, curveSegments: 8 });
  geometry.center();
  geometry.deleteAttribute('uv');
  geometry.deleteAttribute('normal');
  geometry = mergeVertices(geometry);
  geometry.computeVertexNormals();

  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const position = geometry.attributes.position;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = (position.getX(i) - min.x) / (max.x - min.x);
    uv[i * 2 + 1] = (position.getY(i) - min.y) / (max.y - min.y);
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geometry;
}

// Snorkel of the diver: from the mouth, along the right side of a head of radius 1, up above it
export function createSnorkelGeometry() {
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.17, -0.34, 0.96),
    new THREE.Vector3(0.55, -0.36, 0.88),
    new THREE.Vector3(0.95, -0.15, 0.55),
    new THREE.Vector3(1.12, 0.35, 0.3),
    new THREE.Vector3(1.1, 0.95, 0.2),
    new THREE.Vector3(1.02, 1.3, 0.18),
  ]);
  return new THREE.TubeGeometry(path, 40, 0.065, 8, false);
}

// Draws on a small transparent canvas, read without smoothing as pixel art
function createFaceTexture(draw, size = 64) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  draw(canvas.getContext('2d'));
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Cat: tabby "M" on the forehead, amber almond eyes with slit pupils, pink nose, little mouth and whiskers
export function createCatFaceTexture() {
  return createFaceTexture((c) => {
    c.lineCap = 'round';
    c.lineJoin = 'round';

    c.strokeStyle = '#b5561c';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(23, 12);
    c.lineTo(27, 19);
    c.lineTo(32, 13);
    c.lineTo(37, 19);
    c.lineTo(41, 12);
    c.stroke();

    for (const side of [-1, 1]) {
      const x = 32 + side * 10;
      const y = 28;
      c.save();
      c.translate(x, y);
      c.rotate(side * -0.22); // Outer corners up
      c.beginPath();
      c.ellipse(0, 0, 7, 5.5, 0, 0, Math.PI * 2);
      c.fillStyle = '#ffd23a';
      c.fill();
      c.lineWidth = 1.6;
      c.strokeStyle = nekoInk;
      c.stroke();
      c.beginPath();
      c.ellipse(0, 0.3, 1.6, 5, 0, 0, Math.PI * 2);
      c.fillStyle = nekoInk;
      c.fill();
      c.restore();
      c.fillStyle = '#ffffff';
      c.fillRect(x - 4, y - 3, 2, 2);
    }

    c.beginPath();
    c.moveTo(29, 36);
    c.lineTo(35, 36);
    c.lineTo(32, 39.5);
    c.closePath();
    c.fillStyle = '#ff7aa8';
    c.fill();
    c.lineWidth = 1.2;
    c.strokeStyle = nekoInk;
    c.stroke();

    c.strokeStyle = '#5a2410';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(32, 39.5);
    c.quadraticCurveTo(31, 44, 27, 43);
    c.moveTo(32, 39.5);
    c.quadraticCurveTo(33, 44, 37, 43);
    c.stroke();

    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.6;
    for (const side of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        c.beginPath();
        c.moveTo(32 + side * 9, 38 + k * 2.5);
        c.lineTo(32 + side * 31, 34 + k * 6);
        c.stroke();
      }
    }
  });
}

// Octopus: big heavy-lidded eyes with horizontal pupils, like a real octopus, and a puckered mouth
export function createOctopusFaceTexture() {
  return createFaceTexture((c) => {
    c.fillStyle = '#ff9a70';
    for (const [x, y, r] of [[24, 12, 2], [31, 9, 1.5], [39, 13, 2], [45, 18, 1.5], [18, 17, 1.5]]) {
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }

    for (const side of [-1, 1]) {
      const x = 32 + side * 10;
      const y = 28;
      c.save();
      c.beginPath();
      c.arc(x, y, 7, 0, Math.PI * 2);
      c.fillStyle = '#fff7ea';
      c.fill();
      c.clip();
      c.fillStyle = nekoInk;
      c.beginPath();
      c.roundRect(x - 4.5, y - 0.5, 9, 3.4, 1.5);
      c.fill();
      // Heavy upper lid, for a blasé look
      c.fillStyle = '#c0442a';
      c.fillRect(x - 8, y - 8, 16, 6.5);
      c.restore();
      c.lineWidth = 1.6;
      c.strokeStyle = nekoInk;
      c.beginPath();
      c.arc(x, y, 7, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(x - 6.6, y - 1.5);
      c.lineTo(x + 6.6, y - 1.5);
      c.stroke();
      c.fillStyle = '#ffffff';
      c.fillRect(x + 1, y + 0.5, 1.5, 1.5);
    }

    c.beginPath();
    c.arc(32, 43, 3.2, 0, Math.PI * 2);
    c.fillStyle = '#ff8fb0';
    c.fill();
    c.lineWidth = 1.4;
    c.strokeStyle = nekoInk;
    c.stroke();
    c.beginPath();
    c.arc(32, 43, 1.3, 0, Math.PI * 2);
    c.fillStyle = '#5a1a2a';
    c.fill();
  });
}

// Saturn under its hat: half-closed eyes glancing aside and a lopsided smile
export function createSaturnFaceTexture() {
  return createFaceTexture((c) => {
    c.lineCap = 'round';
    for (const side of [-1, 1]) {
      const x = 32 + side * 10;
      const y = 18;
      c.save();
      c.beginPath();
      c.ellipse(x, y, 6, 4.5, 0, 0, Math.PI * 2);
      c.fillStyle = '#fffaf0';
      c.fill();
      c.clip();
      c.fillStyle = nekoInk;
      c.beginPath();
      c.arc(x - 2.5, y + 0.8, 2.6, 0, Math.PI * 2);
      c.fill();
      // Lazy upper lid
      c.fillStyle = '#d9a556';
      c.fillRect(x - 7, y - 6, 14, 5);
      c.restore();
      c.lineWidth = 1.6;
      c.strokeStyle = nekoInk;
      c.beginPath();
      c.ellipse(x, y, 6, 4.5, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.moveTo(x - 5.8, y - 1);
      c.lineTo(x + 5.8, y - 1);
      c.stroke();
    }

    c.lineWidth = 1.8;
    c.strokeStyle = nekoInk;
    c.beginPath();
    c.moveTo(26, 31);
    c.quadraticCurveTo(33, 35, 39, 29);
    c.stroke();
  });
}

// Onigiri, seen from the front: rice grains, a strip of nori at the bottom, and a grumpy face sweating in the heat of the star
export function createOnigiriTexture() {
  return createFaceTexture((c) => {
    c.fillStyle = '#f7f5ef';
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = '#e1dccf';
    let seed = 3;
    for (let i = 0; i < 70; i++) {
      seed = (seed * 16807) % 2147483647;
      const x = seed % 64;
      seed = (seed * 16807) % 2147483647;
      const y = seed % 64;
      c.beginPath();
      c.ellipse(x, y, 1.6, 0.8, (seed % 6) * 0.5, 0, Math.PI * 2);
      c.fill();
    }

    c.fillStyle = '#1d3326';
    c.fillRect(19, 46, 26, 18);
    c.fillStyle = '#33543f';
    for (let x = 20; x < 44; x += 6) c.fillRect(x, 48, 1.5, 14);

    c.lineCap = 'round';
    c.strokeStyle = nekoInk;
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(22, 25);
    c.lineTo(29, 28);
    c.moveTo(42, 25);
    c.lineTo(35, 28);
    c.stroke();
    c.fillStyle = nekoInk;
    for (const x of [26, 38]) {
      c.beginPath();
      c.ellipse(x, 31.5, 1.6, 2.2, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.beginPath();
    c.moveTo(27, 41);
    c.quadraticCurveTo(32, 37, 37, 41);
    c.stroke();

    c.beginPath();
    c.moveTo(45, 18);
    c.quadraticCurveTo(48, 23, 45, 25);
    c.quadraticCurveTo(42, 23, 45, 18);
    c.fillStyle = '#7ad3ff';
    c.fill();
    c.lineWidth = 1;
    c.stroke();
  });
}

// Venus, the diva: heavy eyelids under violet eyeshadow, long lashes sweeping outwards, pouting red lips and a beauty mark
export function createDivaFaceTexture() {
  return createFaceTexture((c) => {
    c.lineCap = 'round';
    for (const side of [-1, 1]) {
      const x = 32 + side * 10;
      const y = 28;
      c.fillStyle = '#9b59d0';
      c.beginPath();
      c.ellipse(x, y - 1, 7, 4.5, 0, Math.PI, Math.PI * 2);
      c.fill();

      // Half-closed eye: only the lower half shows under the lid
      c.save();
      c.beginPath();
      c.ellipse(x, y, 6.5, 4, 0, 0, Math.PI);
      c.clip();
      c.fillStyle = '#fffaf2';
      c.fillRect(x - 7, y, 14, 5);
      c.fillStyle = '#5a2d1a';
      c.beginPath();
      c.arc(x, y, 2.8, 0, Math.PI * 2);
      c.fill();
      c.restore();

      c.strokeStyle = nekoInk;
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(x - 6.5, y);
      c.lineTo(x + 6.5, y);
      c.stroke();
      c.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) {
        const lashX = x + side * (1 + k * 1.8);
        c.beginPath();
        c.moveTo(lashX, y);
        c.lineTo(lashX + side * (1.5 + k * 0.6), y - 3 - k * 0.5);
        c.stroke();
      }
    }

    c.beginPath();
    c.moveTo(25, 42);
    c.quadraticCurveTo(29, 38, 32, 40);
    c.quadraticCurveTo(35, 38, 39, 42);
    c.quadraticCurveTo(32, 48, 25, 42);
    c.fillStyle = '#e0245e';
    c.fill();
    c.strokeStyle = nekoInk;
    c.lineWidth = 1.2;
    c.stroke();
    c.fillStyle = '#ff86a8';
    c.fillRect(29, 43, 3, 1.5);

    c.fillStyle = nekoInk;
    c.beginPath();
    c.arc(41, 37, 1.2, 0, Math.PI * 2);
    c.fill();
  });
}

// Earth, the diver: a diving mask over wide-open eyes, and the mouthpiece of the snorkel
export function createDiverFaceTexture() {
  return createFaceTexture((c) => {
    c.fillStyle = '#1b1b26';
    c.beginPath();
    c.roundRect(12, 18, 40, 19, 7);
    c.fill();
    c.fillStyle = '#a8ecff';
    c.beginPath();
    c.roundRect(14.5, 20.5, 35, 14, 5);
    c.fill();
    c.fillStyle = '#1b1b26';
    c.fillRect(31, 20, 2, 3);

    for (const side of [-1, 1]) {
      const x = 32 + side * 9;
      const y = 27.5;
      c.beginPath();
      c.ellipse(x, y, 4.5, 4.5, 0, 0, Math.PI * 2);
      c.fillStyle = '#ffffff';
      c.fill();
      c.lineWidth = 1.2;
      c.strokeStyle = nekoInk;
      c.stroke();
      c.fillStyle = nekoInk;
      c.beginPath();
      c.arc(x + side * 0.5, y + 0.5, 2, 0, Math.PI * 2);
      c.fill();
    }

    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(17, 30);
    c.lineTo(21, 23);
    c.stroke();

    c.fillStyle = '#ff7a1f';
    c.beginPath();
    c.roundRect(33, 41, 9, 5, 2);
    c.fill();
    c.lineWidth = 1.2;
    c.strokeStyle = nekoInk;
    c.stroke();
  });
}

// Uranus, asleep: closed eyes, mouth ajar and the snot bubble of manga sleepers
export function createSleeperFaceTexture() {
  return createFaceTexture((c) => {
    c.lineCap = 'round';
    c.strokeStyle = nekoInk;
    c.lineWidth = 1.8;
    for (const x of [22, 42]) {
      c.beginPath();
      c.arc(x, 26, 5, 0.15 * Math.PI, 0.85 * Math.PI);
      c.stroke();
    }

    c.beginPath();
    c.ellipse(29, 41, 2.6, 2, 0, 0, Math.PI * 2);
    c.fillStyle = '#5a1a2a';
    c.fill();
    c.lineWidth = 1.2;
    c.stroke();

    c.beginPath();
    c.arc(40, 35, 5.5, 0, Math.PI * 2);
    c.fillStyle = '#d8f8ff';
    c.fill();
    c.lineWidth = 1.2;
    c.strokeStyle = '#4fa8c8';
    c.stroke();
    c.fillStyle = '#ffffff';
    c.fillRect(37.5, 32, 2, 2);
  });
}

// Neptune, the pufferfish: big alarmed eyes with tiny pupils and pursed lips
export function createFuguFaceTexture() {
  return createFaceTexture((c) => {
    for (const side of [-1, 1]) {
      const x = 32 + side * 10;
      const y = 27;
      c.beginPath();
      c.arc(x, y, 7.5, 0, Math.PI * 2);
      c.fillStyle = '#ffffff';
      c.fill();
      c.lineWidth = 1.6;
      c.strokeStyle = nekoInk;
      c.stroke();
      c.fillStyle = nekoInk;
      c.beginPath();
      c.arc(x - side * 0.5, y - 1, 2.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ffffff';
      c.fillRect(x - side * 0.5 - 1.5, y - 2.5, 1.2, 1.2);
    }

    c.beginPath();
    c.ellipse(32, 42, 3.4, 3, 0, 0, Math.PI * 2);
    c.fillStyle = '#ffb3c6';
    c.fill();
    c.lineWidth = 1.4;
    c.strokeStyle = nekoInk;
    c.stroke();
    c.beginPath();
    c.ellipse(32, 42, 1.4, 1.1, 0, 0, Math.PI * 2);
    c.fillStyle = '#5a1a2a';
    c.fill();
  });
}

// Stripes along the nightcap (its tube is mapped with u along its length)
export function createNightcapStripesTexture() {
  return createFaceTexture((c) => {
    for (let x = 0; x < 64; x += 8) {
      c.fillStyle = (x / 8) % 2 === 0 ? '#3b5bdb' : '#f1f3ff';
      c.fillRect(x, 0, 8, 64);
    }
  });
}

// A floating "Z" of sleep, white with an ink outline
export function createSleepZTexture() {
  return createFaceTexture((c) => {
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const z = () => {
      c.beginPath();
      c.moveTo(8, 8);
      c.lineTo(24, 8);
      c.lineTo(8, 24);
      c.lineTo(24, 24);
      c.stroke();
    };
    c.strokeStyle = nekoInk;
    c.lineWidth = 8;
    z();
    c.strokeStyle = '#ffffff';
    c.lineWidth = 4.5;
    z();
  }, 32);
}

// Straw weave for the crown of the hat
export function createStrawTexture() {
  return createFaceTexture((c) => {
    c.fillStyle = '#f0cc78';
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = '#d4a24a';
    for (let y = 0; y < 64; y += 8) {
      for (let x = 0; x < 64; x += 8) {
        if ((x + y) % 16 === 0) c.fillRect(x, y + 3, 7, 1.5);
        else c.fillRect(x + 3, y, 1.5, 7);
      }
    }
  });
}

// Brim of the hat, which is also Saturn's ring: straw bands, the Cassini division as a darker band, an ink edge,
// and a hole in the middle. Drawn for a ring from radius 1 to 1.95, as mapped by THREE.RingGeometry.
export function createBrimTexture() {
  return createFaceTexture((c) => {
    const center = 128;
    const scale = center / 1.95;
    const bands = [[1.95, nekoInk], [1.92, '#f2d27e'], [1.72, '#c8953f'], [1.67, '#f6dc96'], [1.42, '#9e6a2a'], [1.37, '#e8bf68'], [1.06, nekoInk]];
    for (const [radius, color] of bands) {
      c.beginPath();
      c.arc(center, center, radius * scale, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
    }

    // Straw strands across the bands
    c.strokeStyle = '#c8953f';
    c.lineWidth = 1;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 36) {
      c.beginPath();
      c.moveTo(center + Math.cos(angle) * 1.1 * scale, center + Math.sin(angle) * 1.1 * scale);
      c.lineTo(center + Math.cos(angle) * 1.88 * scale, center + Math.sin(angle) * 1.88 * scale);
      c.stroke();
    }

    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.arc(center, center, scale, 0, Math.PI * 2);
    c.fill();
  }, 256);
}

// Star: dark sunglasses with a glint, and a cocky grin
export function createStarFaceTexture() {
  return createFaceTexture((c) => {
    c.lineJoin = 'round';

    const lens = (x) => {
      c.beginPath();
      c.moveTo(x, 20);
      c.lineTo(x + 18, 20);
      c.lineTo(x + 16, 28);
      c.quadraticCurveTo(x + 15, 31, x + 11, 31);
      c.lineTo(x + 6, 31);
      c.quadraticCurveTo(x + 1, 31, x + 1, 27);
      c.closePath();
      c.fill();
    };
    c.fillStyle = '#140a1e';
    lens(12);
    lens(34);
    c.fillRect(28, 21, 8, 2.5);
    c.fillStyle = '#ffffff';
    c.fillRect(15, 22, 5, 1.5);
    c.fillRect(37, 22, 5, 1.5);

    c.beginPath();
    c.moveTo(21, 39);
    c.quadraticCurveTo(33, 52, 44, 37);
    c.quadraticCurveTo(33, 44, 21, 39);
    c.closePath();
    c.fillStyle = '#7a1a2a';
    c.fill();
    c.save();
    c.clip();
    c.fillStyle = '#ffffff';
    c.fillRect(20, 37, 26, 4);
    c.restore();
    c.lineWidth = 1.5;
    c.strokeStyle = nekoInk;
    c.stroke();
  });
}

// The dark line around the sprites
function createNekoOutline(shared) {
  return createOutlineMaterial({ shared, thickness: 1.5, color: nekoInk, lightVariation: false });
}

// Materials of the character drawn for the planet name (mercury... neptune), map being its photo texture
// (see NekoNebulaCharacters.jsx for how each one is put together)
export function createNekoCharacterLook({ shared, map, name }) {
  const outline = createNekoOutline(shared);
  const flat = (color, options = {}) => createNekoMaterial({ shared, color, ...options });
  const planet = (options = {}) => createNekoMaterial({ shared, map, palette: nekoPalettes[name], ...options });

  switch (name) {
    case 'mercury':
      return { body: flat('#f7f5ef', { faceMap: createOnigiriTexture(), faceRect: [0.5, 0.5, 0.5, 0.5] }), outline };
    case 'venus':
      return { body: planet({ faceMap: createDivaFaceTexture() }), pearl: flat('#fdf6ee'), gold: flat('#ffcc33'), outline };
    case 'earth':
      return { body: planet({ faceMap: createDiverFaceTexture() }), strap: flat('#1b1b26'), snorkel: flat('#ffd23f'), outline };
    case 'mars':
      return { body: planet({ faceMap: createOctopusFaceTexture() }), tentacle: flat('#e8553a'), outline };
    case 'jupiter':
      return { head: planet({ faceMap: createCatFaceTexture() }), ear: flat('#f08a2c'), innerEar: flat('#ff8fb0'), outline };
    case 'saturn': {
      const brim = createNekoMaterial({ shared, faceMap: createBrimTexture(), faceRect: [0.5, 0.5, 0.5, 0.5], faceOnly: true });
      brim.side = THREE.DoubleSide;
      return {
        // The face is around the equator, under the brim of the hat
        body: planet({ faceMap: createSaturnFaceTexture(), faceRect: [0.25, 0.42, 0.16, 0.2] }),
        crown: flat('#f0cc78', { faceMap: createStrawTexture(), faceRect: [0.5, 0.5, 0.5, 0.5] }),
        ribbon: flat('#283a9c'),
        brim,
        petal: flat('#ff5fa2'),
        flowerHeart: flat('#ffd23f'),
        outline,
      };
    }
    case 'uranus':
      return {
        body: planet({ faceMap: createSleeperFaceTexture() }),
        cap: flat('#ffffff', { faceMap: createNightcapStripesTexture(), faceRect: [0.5, 0.5, 0.5, 0.5] }),
        capBand: flat('#f6f7ff'),
        sleepZ: createNekoMaterial({ shared, faceMap: createSleepZTexture(), faceRect: [0.5, 0.5, 0.5, 0.5], faceOnly: true, unlit: true }),
        outline,
      };
    case 'neptune':
      return { body: planet({ faceMap: createFuguFaceTexture() }), spikes: flat('#ffe9a8'), fin: flat('#ffb02e'), outline };
    default:
      return null;
  }
}

// The star: a puffy five-point star in sunglasses
export function createNekoStarLook({ shared }) {
  return {
    body: createNekoMaterial({ shared, color: '#ffd23f', selfLit: true }),
    face: createNekoMaterial({ shared, faceMap: createStarFaceTexture(), faceRect: [0.5, 0.5, 0.5, 0.5], faceOnly: true, unlit: true }),
    outline: createNekoOutline(shared),
  };
}

// A copy of the asteroid model in flat colors, with its outline
export function createNekoAsteroidLook({ shared, scene }) {
  const outline = createNekoOutline(shared);
  const asteroid = scene.clone(true);
  const meshes = [];
  asteroid.traverse((object) => { if (object.isMesh) meshes.push(object); });
  for (const mesh of meshes) {
    mesh.material = createNekoMaterial({ shared, map: mesh.material.map, palette: nekoPalettes.asteroid });
    mesh.add(new THREE.Mesh(mesh.geometry, outline));
  }
  return asteroid;
}
