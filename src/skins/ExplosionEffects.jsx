import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useSimulation } from '../SimulationClock';

// What each stylized skin adds to an explosion, on top of its debris: an onomatopoeia for the comic book,
// smudges of chalk for the pastel, splashes of paint for the watercolor, pixel sparks for the arcade, stars and hearts for Neko Nebula, an impact flash for the anime.
// They are sprites of a fixed size on screen, which follow the simulated time, so that they stop during a pause.

// Pictures drawn once on small canvases, shared by every explosion
const textures = new Map();
function canvasTexture(name, size, draw) {
  if (!textures.has(name)) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    draw(canvas.getContext('2d'), size);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.set(name, texture);
  }
  return textures.get(name);
}

const ink = '#0a0820';

// A comic book onomatopoeia in a jagged yellow burst
function wordTexture(word) {
  return canvasTexture(`word:${word}`, 256, (c, size) => {
    const center = size / 2;
    c.beginPath();
    const points = 28;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radius = (i % 2 === 0 ? 0.47 - 0.05 * ((i * 5) % 3) / 2 : 0.33) * size;
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius * 0.8;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.fillStyle = '#ffe14d';
    c.fill();
    c.lineWidth = 6;
    c.strokeStyle = ink;
    c.stroke();

    // The word as large as the burst allows
    let fontSize = 64;
    c.font = `bold ${fontSize}px Impact, 'Arial Black', sans-serif`;
    const width = c.measureText(word).width;
    if (width > size * 0.62) fontSize *= (size * 0.62) / width;
    c.font = `bold ${fontSize}px Impact, 'Arial Black', sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    c.lineWidth = 8;
    c.strokeStyle = ink;
    c.strokeText(word, center, center + 2);
    c.fillStyle = '#ff4b3e';
    c.fillText(word, center, center + 2);
  });
}

// A soft, uneven smudge of chalk, in white so that its sprite gives it a color
function blotTexture() {
  return canvasTexture('blot', 128, (c, size) => {
    let seed = 5;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 9; i++) {
      const x = size * (0.5 + (random() - 0.5) * 0.35);
      const y = size * (0.5 + (random() - 0.5) * 0.35);
      const radius = size * (0.18 + random() * 0.14);
      const gradient = c.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      c.fillStyle = gradient;
      c.beginPath();
      c.arc(x, y, radius, 0, Math.PI * 2);
      c.fill();
    }
  });
}

// A puffy yellow star of Neko Nebula, outlined
function starTexture() {
  return canvasTexture('star', 64, (c, size) => {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const radius = size * (i % 2 === 0 ? 0.42 : 0.2);
      c.lineTo(size / 2 + Math.cos(angle) * radius, size / 2 + Math.sin(angle) * radius);
    }
    c.closePath();
    c.lineJoin = 'round';
    c.lineWidth = 7;
    c.strokeStyle = '#2a0f3a';
    c.stroke();
    c.lineWidth = 3;
    c.strokeStyle = '#ffe066';
    c.stroke();
    c.fillStyle = '#ffe066';
    c.fill();
  });
}

// A pink heart, outlined
function heartTexture() {
  return canvasTexture('heart', 64, (c, size) => {
    const s = size / 64;
    c.beginPath();
    c.moveTo(32 * s, 52 * s);
    c.bezierCurveTo(8 * s, 36 * s, 8 * s, 14 * s, 22 * s, 13 * s);
    c.bezierCurveTo(28 * s, 12.5 * s, 31 * s, 17 * s, 32 * s, 21 * s);
    c.bezierCurveTo(33 * s, 17 * s, 36 * s, 12.5 * s, 42 * s, 13 * s);
    c.bezierCurveTo(56 * s, 14 * s, 56 * s, 36 * s, 32 * s, 52 * s);
    c.closePath();
    c.fillStyle = '#ff7ad9';
    c.fill();
    c.lineWidth = 3.5 * s;
    c.strokeStyle = '#2a0f3a';
    c.stroke();
    c.fillStyle = '#ffffff';
    c.fillRect(18 * s, 19 * s, 5 * s, 4 * s);
  });
}

// The impact frame of an anime: speed lines bursting out of a white-hot core
function impactTexture() {
  return canvasTexture('impact', 256, (c, size) => {
    const center = size / 2;
    let seed = 9;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    c.fillStyle = '#ffffff';
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + random() * 0.1;
      const length = size * (0.3 + random() * 0.2);
      const width = 0.025 + random() * 0.02;
      c.beginPath();
      c.moveTo(center + Math.cos(angle - width) * size * 0.08, center + Math.sin(angle - width) * size * 0.08);
      c.lineTo(center + Math.cos(angle) * length, center + Math.sin(angle) * length);
      c.lineTo(center + Math.cos(angle + width) * size * 0.08, center + Math.sin(angle + width) * size * 0.08);
      c.closePath();
      c.fill();
    }
    const core = c.createRadialGradient(center, center, 0, center, center, size * 0.16);
    core.addColorStop(0, 'rgba(255, 255, 255, 1)');
    core.addColorStop(0.6, 'rgba(255, 255, 255, 0.9)');
    core.addColorStop(1, 'rgba(255, 255, 255, 0)');
    c.fillStyle = core;
    c.fillRect(0, 0, size, size);
  });
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const randomDirection = () => new THREE.Vector3().randomDirection();

// The sprites of each style's effect. Each one has:
//   map, color: its picture (none for a plain square) and its color
//   scale: its size on screen (1 is about two thirds of the screen's height), grow: from and to this factor over its life
//   drift: its motion in world units per 60 fps step, spin: its rotation per step
//   life: how long it lasts in milliseconds, pop: appears with a bounce, blink: flickers at the end
//   overlay: drawn over everything else
const effects = {
  cel: () => [{ map: wordTexture(pick(['BOOM!', 'KRAK!', 'POW!', 'BLAM!', 'KABOOM!'])), scale: 0.3, rotation: (Math.random() - 0.5) * 0.5, life: 1700, pop: true, overlay: true }],
  pastel: () => Array.from({ length: 4 }, () => ({
    map: blotTexture(), color: pick(['#f6d38c', '#f2a07b', '#c9d2f0', '#f4efe6', '#e8735a']),
    scale: 0.1 + Math.random() * 0.08, grow: [0.4, 1.3], rotation: Math.random() * Math.PI * 2,
    offset: randomDirection().multiplyScalar(0.04), life: 2600, opacity: 0.6,
  })),
  // Big blots of paint and a spatter of small drops flying out
  watercolor: () => [
    ...Array.from({ length: 3 }, () => ({
      map: blotTexture(), color: pick(['#e07a5f', '#4a6fa5', '#f2cc8f', '#81b29a']),
      scale: 0.1 + Math.random() * 0.08, grow: [0.5, 1.2], rotation: Math.random() * Math.PI * 2,
      offset: randomDirection().multiplyScalar(0.03), life: 2800, opacity: 0.7,
    })),
    ...Array.from({ length: 8 }, () => ({
      map: blotTexture(), color: pick(['#e07a5f', '#4a6fa5', '#3d405b']),
      scale: 0.012 + Math.random() * 0.012, rotation: Math.random() * Math.PI * 2,
      drift: randomDirection().multiplyScalar(0.004 + Math.random() * 0.004), life: 2200, opacity: 0.85,
    })),
  ],
  arcade: () => Array.from({ length: 16 }, () => ({
    color: pick(['#ffff33', '#ff6600', '#ffffff', '#ff3333']), scale: 0.014,
    drift: randomDirection().multiplyScalar(0.006 + Math.random() * 0.008), life: 600 + Math.random() * 300, blink: true,
  })),
  neko: () => Array.from({ length: 10 }, (_, i) => ({
    map: i % 2 === 0 ? starTexture() : heartTexture(), scale: 0.05 + Math.random() * 0.025,
    drift: randomDirection().multiplyScalar(0.004 + Math.random() * 0.005), spin: (Math.random() - 0.5) * 0.12,
    life: 1200 + Math.random() * 400, pop: true,
  })),
  anime: () => [{ map: impactTexture(), color: '#fff1c4', scale: 0.32, grow: [0.5, 1.4], rotation: Math.random() * Math.PI, life: 450, overlay: true }],
};

// Steps of 60 fps in a simulated millisecond
const stepsPerMillisecond = 60 / 1000;

// style: the skin's style, position: where the explosion happened, timestamp: when, in the simulated time
export function ExplosionEffect({ style, position, timestamp }) {
  const simulation = useSimulation();
  const sprites = useMemo(() => (effects[style]?.() ?? []).map((sprite) => ({
    ...sprite,
    material: new THREE.SpriteMaterial({
      map: sprite.map ?? null,
      color: sprite.color ?? '#ffffff',
      transparent: true,
      depthWrite: false,
      depthTest: !sprite.overlay,
      sizeAttenuation: false,
      rotation: sprite.rotation ?? 0,
      toneMapped: false, // The exact colors of the skin, which the tone mapping of the renderer would wash out
    }),
  })), [style]);
  useEffect(() => () => sprites.forEach((sprite) => sprite.material.dispose()), [sprites]);

  const objects = useRef([]);
  useFrame(() => {
    const time = simulation.current.time - timestamp;
    sprites.forEach((sprite, i) => {
      const object = objects.current[i];
      if (!object) return;
      const progress = time / sprite.life;
      object.visible = progress < 1 && !(sprite.blink && progress > 0.5 && Math.floor(time / 70) % 2 === 1);
      if (!object.visible) return;

      const steps = time * stepsPerMillisecond;
      object.position.copy(position);
      if (sprite.offset) object.position.add(sprite.offset);
      if (sprite.drift) object.position.addScaledVector(sprite.drift, steps);

      // A bounce when it appears (up to 120% of its size, then back), or a steady growth
      let size = sprite.scale;
      if (sprite.pop) size *= progress < 0.08 ? (progress / 0.08) * 1.2 : progress < 0.16 ? 1.2 - (progress - 0.08) / 0.08 * 0.2 : 1;
      if (sprite.grow) size *= sprite.grow[0] + (sprite.grow[1] - sprite.grow[0]) * (1 - (1 - progress) ** 2);
      object.scale.set(size, size, 1);

      sprite.material.rotation = (sprite.rotation ?? 0) + (sprite.spin ?? 0) * steps;
      // Fully visible, then fading out over the last part of its life
      sprite.material.opacity = (sprite.opacity ?? 1) * Math.min(1, (1 - progress) / 0.35);
    });
  });

  return sprites.map((sprite, i) => (
    <sprite key={i} ref={(object) => { objects.current[i] = object; }} material={sprite.material} renderOrder={sprite.overlay ? 2 : 0} visible={false} />
  ));
}
