import * as THREE from 'three';
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import ExplosionParticle from './ExplosionParticle';

const Explosion = ({ index, scene, position, timestamp, terminateExplosion }) => {
  const explosionRef = useRef();
  const explosionDuration = 20000;
  const maxLightIntensity = 3;
  const flickerSpeed = 0.002;
  const maxParticles = 50;
  const particlesPerFrame = 2; // Adjust this value as needed
  const [active, setActive] = useState(true);
  const [particles, setParticles] = useState([]);

  // Create explosion light with variable intensity
  const explosionLight = useMemo(() => {
    const light = new THREE.PointLight(0xff8800, maxLightIntensity, 5, 1); // Color, Intensity, Distance, Decay
    light.position.copy(position);
    light.castShadow = true;
    return light;
  }, [position, timestamp]);

  // Add explosion light to the scene on mount
  useEffect(() => {
    scene.add(explosionLight);

    return () => {
      // Remove explosion light when the component unmounts
      scene.remove(explosionLight);
    };
  }, [explosionLight, scene]);

  // Update explosion light intensity on each frame
  useFrame(() => {
    if (active) {
      const elapsedMilliseconds = Date.now() - timestamp;
      if (elapsedMilliseconds > explosionDuration) {
        terminateExplosion(index);
        setActive(false);
      } else {
        
        if ( maxParticles > particles.length && elapsedMilliseconds%2 == 0 ) {

          const newParticles = [];
          for (let i = 0; i < particlesPerFrame; i++) {
            const velocity = new THREE.Vector3(
              (Math.random() - 0.5) * 0.005,
              (Math.random() - 0.5) * 0.005,
              (Math.random() - 0.5) * 0.005
            );

            newParticles.push(
              <ExplosionParticle
                key={`particle_${timestamp + elapsedMilliseconds + i}`}
                position={position.clone()} // Clone the position for each particle
                velocity={velocity} // Pass the velocity as a prop
                timestamp={timestamp} // Pass the timestamp to make them slowly fade
              />
            );
          }

          setParticles((prevParticles) => [...prevParticles, ...newParticles]);

        } else {

          // Linearly decrease intensity over a quarter of the explosion duration
          const intensity = maxLightIntensity * (1 - elapsedMilliseconds / (explosionDuration / 4));
          // Clamp the intensity to the range [0, maxLightIntensity]
          explosionLight.intensity = Math.max(0, Math.min(maxLightIntensity, intensity));

          // Example: Create a flickering effect for color
          explosionLight.color.setRGB(
            1,
            Math.sin(elapsedMilliseconds * flickerSpeed) / 4 + 0.25,
            0.25
          ); // Change color over time

        }
      }
    }
  });

  return <group ref={explosionRef}>{particles}</group>;
};

export default Explosion;
