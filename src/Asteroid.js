import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Quaternion } from 'three';

import { calculateGravitationalForce } from './StarScene';


const Asteroid = ({ index, position, velocity, angularVelocity, active, moving, onStarCollision, gltf, starMass, starSize, asteroidMass, asteroids, planets, onAsteroidCollision, onPlanetCollision, planetSizeFactor, asteroidGravityFactor, starPosition, planetGravityFactor }) => {
  const asteroidRef = useRef();

  // Add a state variable for activity
  const [isActive, setIsActive] = useState(active);

  // Quaternion for asteroid's rotation
  const [rotationQuaternion, setRotationQuaternion] = useState(new THREE.Quaternion());

  // Calculate neighbors for this asteroid based on the existing asteroids
  const asteroidNeighbors = useMemo(() => {
    const data = [];
    for (const asteroid of asteroids) {
      if ( asteroid !== undefined && asteroid.index < index && asteroid.gltf ) {
        data.push({
          index: asteroid.index,
          framesUntilCheck: Math.random()*asteroids.length, // Calculate based on your logic
        });
      }
    }
    return data;
  }, [index]);

  // Calculate neighbors for this asteroid based on the existing asteroids
  const planetNeighbors = useMemo(() => {
    const data = [];
    for (const planet of planets) {
      if ( planet !== undefined ) {
        data.push({
          index: planet.index,
          framesUntilCheck: Math.random()*planets.length, // Calculate based on your logic
        });
      }
    }
    return data;
  }, [index]);

  useFrame(() => {
    // Update asteroid position based on velocity and active state
    if (isActive && moving && gltf) {
      position.add(velocity);

      asteroidRef.current.position.copy(position);

      // Calculate the direction and distance to the star
      const starPosition = new THREE.Vector3(0, 0, 0); // Star position
      const direction = starPosition.clone().sub(position);
      const distanceToStar = direction.length();

      // Ensure distance is greater than 0 to avoid division by zero
      if (distanceToStar > 0) {
        // Calculate gravitational force using the calculateGravitationalForce function
        const gravitationalForce = calculateGravitationalForce(starMass, position, starPosition);
        
        // Update velocity by adding gravitational force
        velocity.add(gravitationalForce.multiplyScalar(asteroidGravityFactor));

        // Update rotationQuaternion based on angular velocity
        const deltaRotation = new Quaternion()
          .setFromEuler(
            new THREE.Euler(
              angularVelocity.x,
              angularVelocity.y,
              angularVelocity.z,
              'XYZ'
            )
          )
          .multiply(rotationQuaternion);
        setRotationQuaternion(deltaRotation);

        // Apply rotationQuaternion to asteroid's rotation
        asteroidRef.current.quaternion.copy(rotationQuaternion);

        if (distanceToStar <= starSize) {
          // Notify the parent component about the collision
          onStarCollision(index);
          setIsActive(false);
        } else {    
          for (const neighbor of asteroidNeighbors) {
            const otherAsteroid = asteroids.find((asteroid) => asteroid.index === neighbor.index);
            if ( otherAsteroid !== undefined ) {
              // Decrease framesUntilCheck for each neighbor
              neighbor.framesUntilCheck = Math.max(0, neighbor.framesUntilCheck - 1);

              // Check if it's time to perform the distance check
              if (neighbor.framesUntilCheck === 0) {
                const distance = position.distanceTo(otherAsteroid.position);
                if (distance < 0.15) {
                  const halfwayPosition = new THREE.Vector3();
                  halfwayPosition.copy(position).add(otherAsteroid.position).multiplyScalar(0.5);
                  onAsteroidCollision(index, neighbor.index, halfwayPosition);
                  setIsActive(false);
                } else {
                  // Set framesUntilCheck for the next check
                  neighbor.framesUntilCheck = Math.max(1, Math.round(distance/(velocity.length()+otherAsteroid.velocity.length()))); // Calculate based on your logic
                }
              }
            }
          }  
          for (const neighbor of planetNeighbors) {
            const planet = planets.find((planet) => planet.index === neighbor.index);
            if ( planet !== undefined ) {
              // Decrease framesUntilCheck for each neighbor
              neighbor.framesUntilCheck = Math.max(0, neighbor.framesUntilCheck - 1);

              // Check if it's time to perform the distance check
              if (neighbor.framesUntilCheck === 0) {
                const distance = position.distanceTo(planet.position);
                if (distance < (0.1 + (planet.size * planetSizeFactor))) {

                  const relativePosition = new THREE.Vector3().copy(position).sub(planet.position);
                  const explosionPosition = new THREE.Vector3().copy(relativePosition).add(planet.position);

                  const relativeVelocity = velocity.clone().sub(planet.velocity);
                  const momentumChange = relativeVelocity.clone().multiplyScalar(Math.cbrt(asteroidMass)/Math.cbrt(planet.mass));
                                    
                  // Calculate angular momentum change
                  const angularMomentumChange = relativePosition.clone().cross(momentumChange);

                  onPlanetCollision(index, neighbor.index, explosionPosition, momentumChange, angularMomentumChange);
                  setIsActive(false);
                } else {
                  
                  // Calculate gravitational force of the planet using the calculateGravitationalForce function
                  const planetGravitationalForce = calculateGravitationalForce(planet.mass, position, planet.position);
                  
                  // Update velocity by adding gravitational force
                  velocity.add(planetGravitationalForce.multiplyScalar(asteroidGravityFactor*planetGravityFactor));

                  let framesToWait = Math.max(1, Math.round(distance/(velocity.length()+planet.velocity.length())));

                  // increase frequency to check on this planet if its gravity is strong enough
                  if ( planetGravitationalForce.length()*asteroidGravityFactor*planetGravityFactor > 0.0001 ) {
                    framesToWait = Math.max(1, Math.round(framesToWait / planetGravityFactor));
                  }

                  // Set framesUntilCheck for the next check
                  neighbor.framesUntilCheck = framesToWait;

                }
              }
            }
          }
        }
      }
    } else if (isActive && gltf) {
      asteroidRef.current.position.x = position.x;
      asteroidRef.current.position.y = position.y;
      asteroidRef.current.position.z = position.z;
    }
  });

  return (
    // Render the loaded model only if gltf is not null
    gltf ? <primitive object={gltf.scene.clone()} ref={asteroidRef} receiveShadow castShadow /> : null
  );
};

export default React.memo(Asteroid);
