import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import { calculateGravitationalForce } from './physics';
import { useSimulation } from './SimulationClock';
import { useSkin, useStyleLook } from './skins/SkinContext';
import { createPlanetLook, planetColors } from './skins/looks';
import { NekoPlanet } from './skins/NekoNebulaCharacters';
import Trail, { trailDuration } from './Trail';

// Reused on every frame by all planets, to avoid creating new objects
const gravitationalForceVector = new THREE.Vector3();

// trail: the setting of the planets' trails (see Trail.jsx)
const Planet = ({ index, name, size, position, velocity, rotation, onStarCollision, planetTexture, starMass, starSize, mass, planetSizeFactor, shouldCorrectOrbit, starPosition, planets, planetGravityFactor, onPlanetCollision, trail }) => {
  const skin = useSkin();
  const planetRef = useRef(); // Moves along the orbit
  const spinRef = useRef(); // Spins on itself, inside (for Uranus as a character, around its tilted axis)
  const texture = useLoader(THREE.TextureLoader, planetTexture);
  const simulation = useSimulation();
  // Materials of the stylized skins (null for the realistic one)
  const look = useStyleLook(`planet:${name}`, (style, shared) => createPlanetLook(style, { shared, map: texture, name }));

  // Calculate neighbors for this asteroid based on the existing asteroids
  const planetNeighbors = useMemo(() => {
    const data = [];
    for (const planet of planets) {
      if ( planet !== undefined && planet.index !== index ) {
        data.push({
          index: planet.index,
          framesUntilCheck: Math.random()*planets.length, // Calculate based on your logic
        });
      }
    }
    return data;
  }, [index]);
  
  // Move the planet by steps 60 fps steps (at most one at a time, see SimulationClock)
  const advance = (steps) => {
    // Calculate the distance to the star
    const distanceToStar = position.distanceTo(starPosition);

    // Ensure distance is greater than 0 to avoid division by zero
    if (distanceToStar > 0) {
      // Calculate gravitational force using the calculateGravitationalForce function
      const gravitationalForce = calculateGravitationalForce(starMass, position, starPosition, gravitationalForceVector);

      // Update velocity by adding gravitational force
      velocity.addScaledVector(gravitationalForce, steps);

      if (shouldCorrectOrbit) {

        const distance = velocity.length();
        const radius = position.length()
        const angle = Math.asin((distance*steps/2)/radius); // The planet moves by distance*steps this frame

        const newAngle = Math.atan2(position.z, position.x) - angle*2;

        const newX = position.length() * Math.cos(newAngle);
        const newZ = position.length() * Math.sin(newAngle);

        // Point the velocity towards the new position while maintaining the velocity magnitude
        // (computed directly in velocity, to avoid creating vectors on every frame)
        velocity.set(newX, 0, newZ).sub(position).normalize().multiplyScalar(distance);

      } else {
        for (const neighbor of planetNeighbors) {
          const planet = planets.find((planet) => planet.index === neighbor.index);
          if ( planet !== undefined ) {
            // Decrease framesUntilCheck for each neighbor (counted in 60 fps steps)
            neighbor.framesUntilCheck = Math.max(0, neighbor.framesUntilCheck - steps);

            // Check if it's time to perform the distance check
            if (neighbor.framesUntilCheck === 0) {
              const distance = position.distanceTo(planet.position);              
              let framesToWait = Math.max(1, Math.round(distance/(velocity.length()+planet.velocity.length())));
              if (distance < ((size + planet.size) * planetSizeFactor)) {

                // Calculate the relative velocity
                const relativeVelocity = velocity.clone().sub(planet.velocity);

                // Calculate the normal vector pointing from this planet to the other
                const normalVector = planet.position.clone().sub(position).normalize();

                // Calculate the impulse
                const impulse =
                  (2 * relativeVelocity.dot(normalVector)) /
                  (1 / mass + 1 / planet.mass);

                // calculate the impulseVector
                const impulseVector = normalVector.multiplyScalar(impulse);

                // Update the velocities of both planets
                const momentumToAdd1 = impulseVector.clone().divideScalar(mass);
                const momentumToAdd2 = impulseVector.clone().divideScalar(-planet.mass);

                onPlanetCollision(index, momentumToAdd1, planet.index, momentumToAdd2);

                framesToWait = Math.max(1, Math.round((distance+((size + planet.size) * planetSizeFactor))/(velocity.length()+planet.velocity.length())));
                
              } else {
                
                // Calculate gravitational force of the planet using the calculateGravitationalForce function
                const planetGravitationalForce = calculateGravitationalForce(planet.mass, position, planet.position, gravitationalForceVector);
                
                // Update velocity by adding gravitational force
                // (once per check rather than per frame: checks happen at the same pace whatever the frame rate)
                velocity.add(planetGravitationalForce.multiplyScalar(planetGravityFactor));
              
                // increase frequency to check on this planet if its gravity is strong enough
                if ( planetGravitationalForce.length()*planetGravityFactor > 0.0001 ) {
                  framesToWait = Math.max(1, Math.round(framesToWait / planetGravityFactor));
                }

              }

              // Set framesUntilCheck for the next check
              neighbor.framesUntilCheck = framesToWait;
            }
          }
        }
      }

      // Update the planet's position based on the updated velocity
      position.addScaledVector(velocity, steps);

      // Apply self-rotation (spin)
      spinRef.current.rotation.x += rotation.x * steps;
      spinRef.current.rotation.y += rotation.y * steps;
      spinRef.current.rotation.z += rotation.z * steps;

      if (distanceToStar <= Math.abs(starSize-size)) {
        // Notify the parent component about the collision
        onStarCollision(index);
      }

    }
  };

  useFrame(() => {
    const { substeps, stepSize } = simulation.current;
    for (let i = 0; i < substeps; i++) advance(stepSize);
    // Also when nothing moves, so that a game paused from the start shows the planets where they are
    planetRef.current.position.copy(position);
  });

  const radius = size * planetSizeFactor;
  // The keys make React replace the mesh when going to or from the realistic skin: updated in place,
  // the realistic material would be overwritten by the reset of the stylized one
  return (
    <>
      <group ref={planetRef}>
        {look?.character ? (
          <NekoPlanet name={name} radius={radius} look={look.character} spinRef={spinRef} />
        ) : (
          <group ref={spinRef}>
            {look ? (
              <mesh key="stylized" material={look.material}>
                <sphereGeometry args={[radius, 64, 64]} />
                {look.outline && (
                  <mesh material={look.outline}>
                    <sphereGeometry args={[radius, 64, 64]} />
                  </mesh>
                )}
              </mesh>
            ) : (
              <mesh key="realistic" receiveShadow castShadow>
                <sphereGeometry args={[radius, 64, 64]} />
                <meshStandardMaterial map={texture} />
              </mesh>
            )}
          </group>
        )}
      </group>
      {/* The trail, in the scene's coordinates, in the planet's color */}
      {trail > 0 && <Trail target={position} duration={trailDuration(trail)} look={skin.trail} color={planetColors[name] ?? '#ffffff'} />}
    </>
  );
};

export default React.memo(Planet);
