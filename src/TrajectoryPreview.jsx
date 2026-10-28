import React, { useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { predictTrajectory } from './physics';
import { rgb } from './skins/styleMaterials';

// Length of the prediction (15 seconds at the normal speed), and a dot every few steps
const maxSteps = 900;
const stepsPerDot = 6;
const maxDots = Math.ceil(maxSteps / stepsPerDot) + 1;

// Reused on every frame, to avoid creating new objects
const launchVelocity = new THREE.Vector3();

// While aiming, dots show where the asteroid will go once released, fading along the way.
// The last dot is bigger when the path ends on the star or a planet.
// getLaunchVelocity(aim, target) gives the velocity the asteroid will be thrown at.
const TrajectoryPreview = ({ aim, getLaunchVelocity, planets, starPosition, starMass, starSize, asteroidGravityFactor, planetGravityFactor, planetSizeFactor, color }) => {
  const geometry = useMemo(() => {
    const dots = new THREE.BufferGeometry();
    dots.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxDots * 3), 3));
    dots.setAttribute('dotIndex', new THREE.BufferAttribute(Float32Array.from({ length: maxDots }, (_, i) => i), 1));
    dots.setDrawRange(0, 0);
    return dots;
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Vector3(1, 0, 0) },
      pixelRatio: { value: 1 },
      hitDot: { value: -1 }, // Index of the dot on a body, -1 when the path hits nothing
    },
    vertexShader: /* glsl */ `
      uniform float pixelRatio;
      uniform float hitDot;
      attribute float dotIndex;
      varying float vAlpha;
      void main() {
        bool hit = abs(dotIndex - hitDot) < 0.5;
        vAlpha = hit ? 1.0 : 1.0 - 0.85 * dotIndex / ${maxDots.toFixed(1)};
        gl_PointSize = (hit ? 8.0 : 3.5) * pixelRatio;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 color;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(color, vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false, // Drawn over the scene, as the arrow: the dot of an impact on the star is inside it
  }), []);

  useLayoutEffect(() => { material.uniforms.color.value.copy(rgb(color)); }, [material, color]);
  const dpr = useThree((state) => state.viewport.dpr);
  useLayoutEffect(() => { material.uniforms.pixelRatio.value = dpr; }, [material, dpr]);

  useFrame(() => {
    const { active, origin, velocity } = aim.current;
    if (!active || velocity.lengthSq() === 0) {
      geometry.setDrawRange(0, 0);
      return;
    }
    const positions = geometry.attributes.position;
    const { count, hit } = predictTrajectory({
      origin,
      velocity: getLaunchVelocity(aim.current, launchVelocity),
      planets,
      starPosition,
      starMass,
      starSize,
      asteroidGravityFactor,
      planetGravityFactor,
      planetSizeFactor,
      maxSteps,
      every: stepsPerDot,
      points: positions.array,
    });
    positions.needsUpdate = true;
    geometry.setDrawRange(0, count);
    material.uniforms.hitDot.value = hit ? count - 1 : -1;
  });

  // Never culled: its bounds change on every frame
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={1} />;
};

export default TrajectoryPreview;
