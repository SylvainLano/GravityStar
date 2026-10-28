import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

import { useSimulation } from './SimulationClock';
import { useSkin } from './skins/SkinContext';

// timestamp: when the explosion started, in the simulated time (see SimulationClock)
const ExplosionParticle = ({ position, velocity, timestamp }) => {
  const particleRef = useRef();
  const simulation = useSimulation();
  const skin = useSkin();

  // Create a random color within the specified range
  const randomColor = useMemo(() => {
    const minColor = new THREE.Color(0x1e1e1e); // Dark gray
    const maxColor = new THREE.Color(0x584532); // Brown
    const randomR = Math.random() * (maxColor.r - minColor.r) + minColor.r;
    const randomG = Math.random() * (maxColor.g - minColor.g) + minColor.g;
    const randomB = Math.random() * (maxColor.b - minColor.b) + minColor.b;
    return new THREE.Color(randomR, randomG, randomB);
  }, []);

  // Create particle material and mesh
  // The material is created once and faded directly (React frees it when the particle is removed)
  // (in the stylized skins, flat colors of the skin that the explosion's light doesn't change)
  const particleMaterial = useMemo(() => {
    if (skin.debris) {
      const [from, to] = skin.debris;
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color(from).lerp(new THREE.Color(to), Math.random()),
        transparent: true,
        opacity: 1.0,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: randomColor,
      transparent: true,
      opacity: 1.0, // Start fully visible
    });
  }, [randomColor, skin]);
  const particleGeometry = useMemo(() => new THREE.SphereGeometry(0.01, 3, 3), []);

  useFrame(() => {
    // Update particle position based on velocity (per 60 fps step)
    if (velocity) {
      particleRef.current.position.addScaledVector(velocity, simulation.current.steps);
    }
    // Calculate elapsed time since the timestamp
    const elapsedMilliseconds = simulation.current.time - timestamp;
    const fadeDuration = 20000; // 20 seconds in milliseconds

    // Gradually reduce the opacity over the specified duration
    if (elapsedMilliseconds < fadeDuration) {
      particleMaterial.opacity = 1.0 - elapsedMilliseconds / fadeDuration;
    } else {
      // Ensure opacity is 0 when the fade duration is exceeded
      particleMaterial.opacity = 0;
    }
  });

  return (
    <mesh ref={particleRef} position={position} material={particleMaterial}>
      <primitive object={particleGeometry} />
    </mesh>
  );
};

export default ExplosionParticle;
