import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

import { calculateGravitationalForce } from './StarScene';

const Planet = ({ index, size, position, velocity, rotation, onStarCollision, planetTexture, starMass, starSize, mass, planetSizeFactor, shouldCorrectOrbit, starPosition, planets, planetGravityFactor, onPlanetCollision }) => {
  const planetRef = useRef();
  const texture = useLoader(THREE.TextureLoader, planetTexture);

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
  
  useFrame(() => {
    // Calculate the direction and distance to the star
    const starPosition = new THREE.Vector3(0, 0, 0); // Star position
    const direction = starPosition.clone().sub(position);
    const distanceToStar = direction.length();

    // Ensure distance is greater than 0 to avoid division by zero
    if (distanceToStar > 0) {
      // Calculate gravitational force using the calculateGravitationalForce function
      const gravitationalForce = calculateGravitationalForce(starMass, position, starPosition);
    
      // Update velocity by adding gravitational force
      velocity.add(gravitationalForce);

      if (shouldCorrectOrbit) {

        const distance = velocity.length();
        const radius = position.length()
        const angle = Math.asin((distance/2)/radius);

        const newAngle = Math.atan2(position.z, position.x) - angle*2;

        const newX = position.length() * Math.cos(newAngle);
        const newZ = position.length() * Math.sin(newAngle);

        const newPosition = new THREE.Vector3(newX,0,newZ);
      
        // Calculate the corrected velocity direction while maintaining the velocity magnitude
        const correctedVelocityDirection = newPosition.clone().sub(position).normalize();
      
        // Keep the magnitude of the velocity vector constant
        const correctedVelocity = correctedVelocityDirection.clone().multiplyScalar(distance);
      
        // Update both velocity and position with corrected values
        velocity.copy(correctedVelocity);

      } else {
        for (const neighbor of planetNeighbors) {
          const planet = planets.find((planet) => planet.index === neighbor.index);
          if ( planet !== undefined ) {
            // Decrease framesUntilCheck for each neighbor
            neighbor.framesUntilCheck = Math.max(0, neighbor.framesUntilCheck - 1);

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
                const planetGravitationalForce = calculateGravitationalForce(planet.mass, position, planet.position);
                
                // Update velocity by adding gravitational force
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
      position.add(velocity);

      planetRef.current.position.copy(position);

      // Apply self-rotation (spin)
      planetRef.current.rotation.x += rotation.x;
      planetRef.current.rotation.y += rotation.y;
      planetRef.current.rotation.z += rotation.z;

      if (distanceToStar <= Math.abs(starSize-size)) {
        // Notify the parent component about the collision
        onStarCollision(index);
      }

    }
  });

  return (
    <mesh ref={planetRef} receiveShadow castShadow>
      <sphereGeometry args={[size * planetSizeFactor, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

export default React.memo(Planet);
