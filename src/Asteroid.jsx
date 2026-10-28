import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { calculateGravitationalForce, frameScale } from './physics';
import { useStyleLook } from './skins/SkinContext';
import { createAsteroidLook } from './skins/looks';

const asteroidModelUrl = './models/meteorite/meteorite.glb';
const asteroidScale = 0.02;

// Reused on every frame by all asteroids, to avoid creating new objects
const gravitationalForceVector = new THREE.Vector3();
const deltaEuler = new THREE.Euler();
const deltaRotation = new THREE.Quaternion();

const Asteroid = ({ index, position, velocity, angularVelocity, active, moving, onStarCollision, starMass, starSize, asteroidMass, asteroids, planets, onAsteroidCollision, onPlanetCollision, planetSizeFactor, asteroidGravityFactor, starPosition, planetGravityFactor }) => {
  const asteroidRef = useRef();

  // The model is loaded once for all asteroids: each one gets a light clone sharing its geometry, material and texture
  // (in the stylized skins, a copy of the model with the skin's materials, made once for all asteroids)
  const { scene } = useLoader(GLTFLoader, asteroidModelUrl);
  const look = useStyleLook('asteroid', (style, shared) => createAsteroidLook(style, { shared, scene }));
  const model = useMemo(() => (look ?? scene).clone(), [look, scene]);

  // Add a state variable for activity
  const [isActive, setIsActive] = useState(active);

  // Calculate neighbors for this asteroid based on the existing asteroids
  const asteroidNeighbors = useMemo(() => {
    const data = [];
    for (const asteroid of asteroids) {
      if ( asteroid !== undefined && asteroid.index < index ) {
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

  useFrame((state, delta) => {
    // Number of 60 fps steps to simulate for this frame
    const steps = frameScale(delta);

    // Update asteroid position based on velocity and active state
    if (isActive && moving) {
      position.addScaledVector(velocity, steps);

      asteroidRef.current.position.copy(position);

      // Calculate the distance to the star
      const distanceToStar = position.distanceTo(starPosition);

      // Ensure distance is greater than 0 to avoid division by zero
      if (distanceToStar > 0) {
        // Calculate gravitational force using the calculateGravitationalForce function
        const gravitationalForce = calculateGravitationalForce(starMass, position, starPosition, gravitationalForceVector);

        // Update velocity by adding gravitational force
        velocity.addScaledVector(gravitationalForce, asteroidGravityFactor * steps);

        // Rotate the asteroid directly based on angular velocity: going through React state would re-render it on every frame
        deltaRotation.setFromEuler(deltaEuler.set(angularVelocity.x * steps, angularVelocity.y * steps, angularVelocity.z * steps, 'XYZ'));
        asteroidRef.current.quaternion.premultiply(deltaRotation);

        if (distanceToStar <= starSize) {
          // Notify the parent component about the collision
          onStarCollision(index);
          setIsActive(false);
        } else {    
          for (const neighbor of asteroidNeighbors) {
            const otherAsteroid = asteroids.find((asteroid) => asteroid.index === neighbor.index);
            if ( otherAsteroid !== undefined ) {
              // Decrease framesUntilCheck for each neighbor
              neighbor.framesUntilCheck = Math.max(0, neighbor.framesUntilCheck - steps);

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
              neighbor.framesUntilCheck = Math.max(0, neighbor.framesUntilCheck - steps);

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
                  const planetGravitationalForce = calculateGravitationalForce(planet.mass, position, planet.position, gravitationalForceVector);
                  
                  // Update velocity by adding gravitational force
                  // (once per check rather than per frame: checks happen at the same pace whatever the frame rate)
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
    } else if (isActive) {
      asteroidRef.current.position.x = position.x;
      asteroidRef.current.position.y = position.y;
      asteroidRef.current.position.z = position.z;
    }
  });

  return (
    <primitive object={model} ref={asteroidRef} scale={asteroidScale} receiveShadow castShadow />
  );
};

// Start loading the model with the rest of the scene, before the first asteroid is launched
useLoader.preload(GLTFLoader, asteroidModelUrl);

export default React.memo(Asteroid);
