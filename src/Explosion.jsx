import * as THREE from 'three';
import React, { useRef, useLayoutEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import ExplosionParticle from './ExplosionParticle';

const Explosion = ({ index, lights, position, timestamp, terminateExplosion }) => {
  const explosionRef = useRef();
  const explosionDuration = 20000;
  const maxLightIntensity = 3 * Math.PI; // Physical lights need a factor PI to match the former legacy lights
  const flickerSpeed = 0.002;
  const maxParticles = 50;
  const particlesPerFrame = 2; // Adjust this value as needed
  const [active, setActive] = useState(true);
  const [particles, setParticles] = useState([]);
  const lightEntry = useRef(null);

  // Borrow one of the shared explosion lights on mount: a free one, or else the one taken the longest ago
  useLayoutEffect(() => {
    const entry = lights.find((l) => l.owner === null) ?? lights.reduce((oldest, l) => (l.since < oldest.since ? l : oldest));
    entry.owner = index;
    entry.since = timestamp;
    entry.light.position.copy(position);
    entry.light.color.set(0xff8800);
    entry.light.intensity = maxLightIntensity;
    lightEntry.current = entry;

    return () => {
      // Switch the light off and give it back when the explosion ends, unless a newer explosion took it over
      if (entry.owner === index) {
        entry.owner = null;
        entry.light.intensity = 0;
      }
    };
  }, [lights, index, position, timestamp]);

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

        } else if (lightEntry.current && lightEntry.current.owner === index) {
          // Only drive the light while this explosion still owns it
          const explosionLight = lightEntry.current.light;

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
