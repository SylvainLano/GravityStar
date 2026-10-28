import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';

import { frameScale } from './physics';

const ExplosionParticle = ({ position, velocity, timestamp }) => {
  const particleRef = useRef();

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
  const particleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: randomColor,
        transparent: true,
        opacity: 1.0, // Start fully visible
      }),
    [randomColor]
  );
  const particleGeometry = useMemo(() => new THREE.SphereGeometry(0.01, 3, 3), []);

  useFrame((state, delta) => {
    // Update particle position based on velocity (per 60 fps step)
    if (velocity) {
      particleRef.current.position.addScaledVector(velocity, frameScale(delta));
    }
    // Calculate elapsed time since the timestamp
    const elapsedMilliseconds = Date.now() - timestamp;
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
