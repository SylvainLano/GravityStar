import React, { useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { rgb } from './styleMaterials';

const count = 700;
const distance = 60; // From the camera in the game, which they follow (see Sky in StarScene.jsx)

// Background stars of the stylized skins, drawn as points of a fixed size on screen.
// colors: several colors spread at random among the stars, instead of a single color.
// round: round points rather than square pixels. stepped: twinkling in a few steps, as on old consoles.
function BackgroundStars({ color, colors, size, round, opacity, stepped = false }) {
  // The same random stars for every skin
  const geometry = useMemo(() => {
    let seed = 7;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const positions = new Float32Array(count * 3);
    const twinkles = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      const z = random() * 2 - 1;
      const r = Math.sqrt(1 - z * z);
      positions.set([distance * r * Math.cos(angle), distance * z, distance * r * Math.sin(angle)], i * 3);
      // Phase and speed of the twinkling: a period between 5 and 25 seconds, as the realistic stars
      twinkles.set([random() * Math.PI * 2, (Math.PI * 2) / (5 + random() * 20)], i * 2);
    }
    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('twinkle', new THREE.BufferAttribute(twinkles, 2));
    starsGeometry.setAttribute('starColor', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return starsGeometry;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      size: { value: 2 },
      round: { value: 1 },
      opacity: { value: 1 },
      stepped: { value: 0 },
      time: { value: 0 },
      pixelRatio: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float size;
      uniform float pixelRatio;
      uniform float time;
      uniform float stepped;
      attribute vec3 starColor;
      attribute vec2 twinkle;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        vColor = starColor;
        vGlow = 0.65 + 0.35 * sin(time * twinkle.y + twinkle.x);
        if (stepped > 0.5) vGlow = ceil(vGlow * 3.0) / 3.0;
        gl_PointSize = max(1.0, size * pixelRatio);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float round;
      uniform float opacity;
      varying vec3 vColor;
      varying float vGlow;
      void main() {
        if (round > 0.5 && length(gl_PointCoord - 0.5) > 0.5) discard;
        gl_FragColor = vec4(vColor, opacity * vGlow);
      }
    `,
    transparent: true,
    depthWrite: false,
  }), []);

  useLayoutEffect(() => {
    const palette = (colors ?? [color]).map(rgb);
    const starColors = geometry.attributes.starColor;
    let seed = 11;
    for (let i = 0; i < starColors.count; i++) {
      seed = (seed * 16807) % 2147483647;
      const starColor = palette[seed % palette.length];
      starColors.setXYZ(i, starColor.x, starColor.y, starColor.z);
    }
    starColors.needsUpdate = true;
    material.uniforms.size.value = size;
    material.uniforms.round.value = round ? 1 : 0;
    material.uniforms.opacity.value = opacity;
    material.uniforms.stepped.value = stepped ? 1 : 0;
  }, [geometry, material, color, colors, size, round, opacity, stepped]);

  // Points keep the same size on screen whatever the pixel ratio
  const dpr = useThree((state) => state.viewport.dpr);
  useLayoutEffect(() => { material.uniforms.pixelRatio.value = dpr; }, [material, dpr]);

  useFrame(({ clock }) => { material.uniforms.time.value = clock.getElapsedTime(); });

  return <points geometry={geometry} material={material} />;
}

export default BackgroundStars;
