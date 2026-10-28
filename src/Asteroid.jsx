import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { calculateGravitationalForce, asteroidCollisionDistance } from './physics';
import { useSimulation } from './SimulationClock';
import { useSkin, useStyleLook } from './skins/SkinContext';
import { createAsteroidLook } from './skins/looks';
import Trail, { trailDuration } from './Trail';

const asteroidModelUrl = './models/meteorite/meteorite.glb';
const asteroidScale = 0.02;

// Reused on every frame by all asteroids, to avoid creating new objects
const gravitationalForceVector = new THREE.Vector3();
const deltaEuler = new THREE.Euler();
const deltaRotation = new THREE.Quaternion();

// trail: the setting of the asteroids' trails (see Trail.jsx)
const Asteroid = ({ index, position, velocity, angularVelocity, active, moving, onStarCollision, starMass, starSize, asteroidMass, asteroids, planets, onAsteroidCollision, onPlanetCollision, planetSizeFactor, asteroidGravityFactor, starPosition, planetGravityFactor, trail }) => {
  const asteroidRef = useRef();
  const simulation = useSimulation();
  const skin = useSkin();

  // The model is loaded once for all asteroids: each one gets a light clone sharing its geometry, material and texture
  // (in the stylized skins, a copy of the model with the skin's materials, made once for all asteroids)
  const { scene } = useLoader(GLTFLoader, asteroidModelUrl);
  const look = useStyleLook('asteroid', (style, shared) => createAsteroidLook(style, { shared, scene }));
  const model = useMemo(() => (look ?? scene).clone(), [look, scene]);

  // False once it has hit something: it stops moving, until the scene removes it
  const [isActive, setIsActive] = useState(active);

  // The asteroids this one checks for collisions: the older ones (each pair is checked by its newer asteroid).
  // Each neighbor is checked again only once it could have come close (framesUntilCheck), the first time at random,
  // so that the checks are spread over the frames.
  const asteroidNeighbors = useMemo(() => {
    const data = [];
    for (const asteroid of asteroids) {
      if ( asteroid !== undefined && asteroid.index < index ) {
        data.push({
          index: asteroid.index,
          framesUntilCheck: Math.random()*asteroids.length,
        });
      }
    }
    return data;
  }, [index]);

  // The planets, checked for collisions and pulling the asteroid, in the same way
  const planetNeighbors = useMemo(() => {
    const data = [];
    for (const planet of planets) {
      if ( planet !== undefined ) {
        data.push({
          index: planet.index,
          framesUntilCheck: Math.random()*planets.length,
        });
      }
    }
    return data;
  }, [index]);

  // Move the asteroid by steps 60 fps steps (at most one at a time, see SimulationClock).
  // Returns false once it has hit something, so that it stops there.
  const advance = (steps) => {
    position.addScaledVector(velocity, steps);

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
        return false;
      }

      for (const neighbor of asteroidNeighbors) {
        const otherAsteroid = asteroids.find((asteroid) => asteroid.index === neighbor.index);
        if ( otherAsteroid !== undefined ) {
          // Decrease framesUntilCheck for each neighbor
          neighbor.framesUntilCheck = Math.max(0, neighbor.framesUntilCheck - steps);

          // Check if it's time to perform the distance check
          if (neighbor.framesUntilCheck === 0) {
            const distance = position.distanceTo(otherAsteroid.position);
            if (distance < asteroidCollisionDistance) {
              // The explosion halfway between them
              const halfwayPosition = position.clone().lerp(otherAsteroid.position, 0.5);
              onAsteroidCollision(index, neighbor.index, halfwayPosition);
              setIsActive(false);
              return false;
            }
            // Next check: not before they could have met, at their speeds
            neighbor.framesUntilCheck = Math.max(1, Math.round(distance/(velocity.length()+otherAsteroid.velocity.length())));
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

              // The explosion where the asteroid is; where it hits the planet, from the planet's center, sets the spin
              const explosionPosition = position.clone();
              const relativePosition = position.clone().sub(planet.position);

              // The planet takes a share of the relative velocity: more than the masses would give (with their cube
              // roots), for impacts that show, but less than all of it, so that it never leaves faster than the asteroid
              // came (50% for an asteroid as heavy as the planet, 13% for Jupiter hit by one Earth mass)
              const relativeVelocity = velocity.clone().sub(planet.velocity);
              const massRatio = Math.cbrt(asteroidMass / planet.mass);
              const momentumChange = relativeVelocity.clone().multiplyScalar(massRatio / (1 + massRatio));

              // Calculate angular momentum change
              const angularMomentumChange = relativePosition.clone().cross(momentumChange);

              onPlanetCollision(index, neighbor.index, explosionPosition, momentumChange, angularMomentumChange);
              setIsActive(false);
              return false;
            }

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
    return true;
  };

  useFrame(() => {
    if (!isActive) return;
    // Update asteroid position based on velocity
    if (moving) {
      const { substeps, stepSize } = simulation.current;
      for (let i = 0; i < substeps; i++) {
        if (!advance(stepSize)) break;
      }
    }
    // Also while it waits to be launched or the game is paused (its model is replaced when the skin changes)
    asteroidRef.current.position.copy(position);
  });

  return (
    <>
      <primitive object={model} ref={asteroidRef} scale={asteroidScale} receiveShadow castShadow />
      {/* The trail, once launched, in the scene's coordinates */}
      {moving && trail > 0 && <Trail target={position} duration={trailDuration(trail)} look={skin.trail} color={skin.trail.color} />}
    </>
  );
};

// Start loading the model with the rest of the scene, before the first asteroid is launched
useLoader.preload(GLTFLoader, asteroidModelUrl);

export default React.memo(Asteroid);
