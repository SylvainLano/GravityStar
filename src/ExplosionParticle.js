import * as THREE from 'three';
import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const ExplosionParticle = ({ position, velocity, timestamp }) => {
  const particleRef = useRef();
  const [opacity, setOpacity] = useState(1.0); // Initialize opacity to 1 (fully visible)

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
  const particleMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: randomColor,
        transparent: true,
        opacity: opacity, // Set opacity here
      }),
    [randomColor, opacity]
  );
  const particleGeometry = useMemo(() => new THREE.SphereGeometry(0.01, 3, 3), []);

  useFrame(() => {
    // Update particle position based on velocity
    if (velocity) {
      particleRef.current.position.add(velocity);
    }
    // Calculate elapsed time since the timestamp
    const elapsedMilliseconds = Date.now() - timestamp;
    const fadeDuration = 20000; // 20 seconds in milliseconds

    // Gradually reduce the opacity over the specified duration
    if (elapsedMilliseconds < fadeDuration) {
      const newOpacity = 1.0 - elapsedMilliseconds / fadeDuration;
      setOpacity(newOpacity);
    } else {
      // Ensure opacity is 0 when the fade duration is exceeded
      setOpacity(0);
    }
  });

  return (
    <mesh ref={particleRef} position={position} material={particleMaterial}>
      <primitive object={particleGeometry} />
    </mesh>
  );
};

export default ExplosionParticle;
